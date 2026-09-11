// BDD-style behaviour spec for the OrderUpdateFields client form.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const orderUpdateActionMock = vi.fn()
vi.mock('../model/orderUpdateAction', () => ({
    orderUpdateAction: (...args: unknown[]) => orderUpdateActionMock(...args),
}))

// The group picker talks to the server on its own; a hidden input stands in.
vi.mock('@/features/crm-group-create', () => ({
    GroupSelect: ({ name = 'group', defaultGroupId = '' }: { name?: string; defaultGroupId?: number | '' }) => (
        <input type="hidden" name={name} value={String(defaultGroupId)} readOnly />
    ),
}))

import { OrderUpdateFields } from './OrderUpdateFields'
import type { IChoicesResponse } from '@/entities/crm'

// ── Fixtures ─────────────────────────────────────────────────────────────────

const choices: IChoicesResponse = {
    course: { FS: 'Fullstack' },
    course_type: { pro: 'Pro' },
    course_format: { online: 'Online' },
    status: { new: 'New', in_work: 'In Work', agree: 'Agree' },
}

const original = {
    name: 'Old', surname: 'Doe', email: '', phone: '', age: 30,
    course: '', course_format: '', course_type: '', status: 'in_work', group: '',
    sum: '', already_paid: '',
}

/** An action that rejects the submit and echoes back what was sent (like the real one). */
const rejectWith = (message: string) =>
    async (prev: { attempt: number } | null, formData: FormData) => ({
        error: message,
        values: Object.fromEntries(
            [...formData.entries()]
                .filter(([key]) => key !== 'params' && key !== '__original')
                .map(([key, value]) => [key, String(value)]),
        ),
        attempt: (prev?.attempt ?? 0) + 1,
    })

const renderForm = () =>
    render(
        <OrderUpdateFields
            params={{ update_order: '7' }}
            original={original}
            choices={choices}
            groups={[]}
            defaultGroupName=""
        />,
    )

// ── Tests ────────────────────────────────────────────────────────────────────

describe('OrderUpdateFields', () => {
    beforeEach(() => {
        orderUpdateActionMock.mockReset()
    })

    describe('given a freshly opened modal', () => {
        it('then the fields show the stored order', () => {
            renderForm()

            expect(screen.getByLabelText('Surname')).toHaveValue('Doe')
            expect(screen.getByLabelText('Status')).toHaveValue('in_work')
            expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        })
    })

    describe('given the server rejects the update', () => {
        it('then its message is shown inside the modal form', async () => {
            orderUpdateActionMock.mockImplementation(
                rejectWith('Surname: Ensure this field has no more than 25 characters.'),
            )
            renderForm()

            await userEvent.click(screen.getByRole('button', { name: 'Update' }))

            const alert = await screen.findByRole('alert')
            expect(alert).toHaveTextContent('Ensure this field has no more than 25 characters.')
            expect(alert.closest('form')).not.toBeNull()
        })

        it('then what the manager typed and picked stays in the fields', async () => {
            orderUpdateActionMock.mockImplementation(rejectWith('Update failed'))
            renderForm()

            const surname = screen.getByLabelText('Surname')
            await userEvent.clear(surname)
            await userEvent.type(surname, 'Typed')
            await userEvent.selectOptions(screen.getByLabelText('Status'), 'agree')
            await userEvent.click(screen.getByRole('button', { name: 'Update' }))

            await screen.findByRole('alert')
            expect(screen.getByLabelText('Surname')).toHaveValue('Typed')
            expect(screen.getByLabelText('Status')).toHaveValue('agree')
        })
    })
})
