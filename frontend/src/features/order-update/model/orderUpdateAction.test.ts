// Behaviour spec for the orderUpdateAction server action (used via useActionState).
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { RedirectSignal, updateOrderMock } = vi.hoisted(() => ({
    RedirectSignal: class RedirectSignal extends Error {
        constructor(public url: string) {
            super(`redirect: ${url}`)
        }
    },
    updateOrderMock: vi.fn(),
}))

// next's redirect() throws to abort the action — keep that contract.
vi.mock('next/navigation', () => ({
    redirect: (url: string) => {
        throw new RedirectSignal(url)
    },
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/entities/order', () => ({
    orderService: { updateOrder: (...args: unknown[]) => updateOrderMock(...args) },
}))

import { orderUpdateAction, type OrderUpdateState } from './orderUpdateAction'

// ── Helpers ──────────────────────────────────────────────────────────────────

const ORIGINAL: Record<string, string> = {
    name: 'Old', surname: 'Doe', email: 'old@test.com', phone: '', age: '30',
    course: '', course_format: '', course_type: '', status: '', group: '',
    sum: '', already_paid: '',
}

/** Submits the whole form: the stored values overridden by `changes`. */
const submit = (changes: Record<string, string>, prevState: OrderUpdateState = null) => {
    const formData = new FormData()
    formData.set('params', JSON.stringify({ orderId: '7', update_order: '7' }))
    formData.set('__original', JSON.stringify(ORIGINAL))
    for (const [key, value] of Object.entries({ ...ORIGINAL, ...changes })) {
        formData.set(key, value)
    }
    return orderUpdateAction(prevState, formData)
}

const redirectOf = async (pending: Promise<unknown>) => {
    const thrown = await pending.catch((e: unknown) => e)
    expect(thrown).toBeInstanceOf(RedirectSignal)
    return (thrown as InstanceType<typeof RedirectSignal>).url
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('orderUpdateAction', () => {
    beforeEach(() => {
        updateOrderMock.mockReset()
    })

    describe('given the backend rejects a field', () => {
        it('then the field message is returned instead of the bare "Bad Request", with the typed values', async () => {
            updateOrderMock.mockResolvedValue({
                ok: false,
                status: 400,
                result: null,
                error: { statusText: 'Bad Request', email: ['Enter a valid email address.'] },
            })

            const state = await submit({ email: 'new@test.com', surname: 'Typed' })

            expect(state?.error).toBe('Enter a valid email address.')
            expect(state?.values.email).toBe('new@test.com')
            expect(state?.values.surname).toBe('Typed')
            expect(state?.values).not.toHaveProperty('params')
            expect(state?.values).not.toHaveProperty('__original')
        })
    })

    describe('given client-side validation fails', () => {
        it('then the message is returned and no request is sent', async () => {
            const state = await submit({ surname: 'S'.repeat(51) })

            expect(state?.error).toBe('The surname must be at most 50 characters')
            expect(state?.values.surname).toBe('S'.repeat(51))
            expect(updateOrderMock).not.toHaveBeenCalled()
        })
    })

    describe('given only already_paid is filled while the sum is empty', () => {
        it('then the payment is refused before any request', async () => {
            const state = await submit({ already_paid: '5000' })

            expect(state?.error).toBe('Already paid cannot be set without a sum')
            expect(state?.values.already_paid).toBe('5000')
            expect(updateOrderMock).not.toHaveBeenCalled()
        })
    })

    describe('given the server is unreachable', () => {
        it('then a readable message is returned', async () => {
            updateOrderMock.mockResolvedValue({
                ok: false, status: 500, result: null, error: { statusText: 'Network Error' },
            })

            const state = await submit({ name: 'New' })

            expect(state?.error).toBe('The server is not responding')
        })
    })

    describe('given two rejected submits in a row', () => {
        it('then attempt grows so the form remounts with the latest values', async () => {
            const first = await submit({ surname: 'S'.repeat(51) })
            const second = await submit({ surname: 'S'.repeat(52) }, first)

            expect(first?.attempt).toBe(1)
            expect(second?.attempt).toBe(2)
            expect(second?.values.surname).toBe('S'.repeat(52))
        })
    })

    describe('given the update succeeds', () => {
        it('then only the changed field is sent and the modal is closed', async () => {
            updateOrderMock.mockResolvedValue({ ok: true, status: 200, result: {}, error: null })

            const url = await redirectOf(submit({ name: 'New' }))

            expect(updateOrderMock).toHaveBeenCalledWith('7', { name: 'New' })
            expect(url).toBe('/crm?orderId=7')
        })
    })

    describe('given nothing was changed', () => {
        it('then the modal closes without a request', async () => {
            const url = await redirectOf(submit({}))

            expect(updateOrderMock).not.toHaveBeenCalled()
            expect(url).not.toContain('update_order')
        })
    })
})
