// Behaviour spec for the groupCreateAction server action.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { createGroupMock, getGroupsMock } = vi.hoisted(() => ({
    createGroupMock: vi.fn(),
    getGroupsMock: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/entities/crm', () => ({
    crmService: {
        createGroup: (...args: unknown[]) => createGroupMock(...args),
        getGroups: (...args: unknown[]) => getGroupsMock(...args),
    },
}))

import { groupCreateAction } from './groupCreateAction'

const duplicate = {
    ok: false,
    status: 400,
    result: null,
    error: { statusText: 'Bad Request', name: ['Group with this name already exists'] },
}

describe('groupCreateAction', () => {
    beforeEach(() => {
        createGroupMock.mockReset()
        getGroupsMock.mockReset()
    })

    describe('given the group was created', () => {
        it('then it is returned as new', async () => {
            createGroupMock.mockResolvedValue({ ok: true, status: 201, result: { id: 3, name: 'Sep' }, error: null })

            const res = await groupCreateAction('Sep')

            expect(res).toEqual({ group: { id: 3, name: 'Sep' } })
            expect(getGroupsMock).not.toHaveBeenCalled()
        })
    })

    describe('given someone else already created that group', () => {
        it('then the existing one is pulled from the server and marked as existing', async () => {
            createGroupMock.mockResolvedValue(duplicate)
            getGroupsMock.mockResolvedValue({
                ok: true, status: 200, error: null,
                result: [{ id: 1, name: 'Other' }, { id: 9, name: 'Sep' }],
            })

            const res = await groupCreateAction(' Sep ')

            expect(res).toEqual({ group: { id: 9, name: 'Sep' }, existing: true })
        })
    })

    describe('given the group cannot be found after the error', () => {
        it('then the server message is returned', async () => {
            createGroupMock.mockResolvedValue(duplicate)
            getGroupsMock.mockResolvedValue({ ok: true, status: 200, error: null, result: [{ id: 1, name: 'Other' }] })

            const res = await groupCreateAction('Sep')

            expect(res.group).toBeUndefined()
            expect(res.error).toBe('Group with this name already exists')
        })
    })

    describe('given the server is down', () => {
        it('then no extra request is made', async () => {
            createGroupMock.mockResolvedValue({ ok: false, status: 500, result: null, error: { statusText: 'Server Error' } })

            const res = await groupCreateAction('Sep')

            expect(res).toEqual({ error: 'The server is not responding' })
            expect(getGroupsMock).not.toHaveBeenCalled()
        })
    })
})
