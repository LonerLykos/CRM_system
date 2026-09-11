// BDD-style behaviour spec for the GroupSelect client component.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const groupCreateActionMock = vi.fn()
vi.mock('../model/groupCreateAction', () => ({
    groupCreateAction: (...args: unknown[]) => groupCreateActionMock(...args),
}))

import { GroupSelect } from './GroupSelect'

// ── Helpers ──────────────────────────────────────────────────────────────────

const searchInput = () => screen.getByPlaceholderText(/search or create a group/i)
const addButton = () => screen.getByRole('button', { name: /add group/i })
const selectedId = (container: HTMLElement) =>
    (container.querySelector('input[type="hidden"]') as HTMLInputElement).value

// ── Tests ────────────────────────────────────────────────────────────────────

describe('GroupSelect', () => {
    beforeEach(() => {
        groupCreateActionMock.mockReset()
    })

    describe('given only "group a" exists', () => {
        it('when "Group A" is typed, then it can be added as a separate group', async () => {
            const { container } = render(<GroupSelect groups={[{ id: 1, name: 'group a' }]} />)

            await userEvent.type(searchInput(), 'Group A')

            expect(addButton()).toBeEnabled()
            expect(selectedId(container)).toBe('')
        })

        it('when exactly "group a" is typed, then it is selected and Add is disabled', async () => {
            const { container } = render(<GroupSelect groups={[{ id: 1, name: 'group a' }]} />)

            await userEvent.type(searchInput(), 'group a')

            expect(addButton()).toBeDisabled()
            expect(selectedId(container)).toBe('1')
        })

        it('when "GROUP" is typed, then the search still offers "group a"', async () => {
            render(<GroupSelect groups={[{ id: 1, name: 'group a' }]} />)

            await userEvent.type(searchInput(), 'GROUP')

            expect(screen.getByText('group a')).toBeInTheDocument()
        })
    })

    describe('given a new name is added', () => {
        it('then the group is created with the name as typed and selected', async () => {
            groupCreateActionMock.mockResolvedValue({ group: { id: 5, name: 'Group B' } })
            const { container } = render(<GroupSelect groups={[]} />)

            await userEvent.type(searchInput(), 'Group B')
            await userEvent.click(addButton())

            expect(groupCreateActionMock).toHaveBeenCalledWith('Group B')
            expect(await screen.findByText('Group “Group B” created')).toBeInTheDocument()
            expect(selectedId(container)).toBe('5')
        })

        it('when the server rejects it as a duplicate, then the message is shown and nothing is selected', async () => {
            groupCreateActionMock.mockResolvedValue({ error: 'Group with this name already exists' })
            const { container } = render(<GroupSelect groups={[]} />)

            await userEvent.type(searchInput(), 'Group B')
            await userEvent.click(addButton())

            expect(await screen.findByText('Group with this name already exists')).toBeInTheDocument()
            expect(selectedId(container)).toBe('')
        })
    })
})
