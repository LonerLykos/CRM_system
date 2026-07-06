// BDD-style behaviour spec for the UserCreateModal client component.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// --- Mock the underlying action module (barrel re-exports from here) ---
// UserCreateModal.tsx imports userCreateAction from '@/features/user-create'
// which re-exports from './model/userCreateAction'. Mocking the concrete
// module file intercepts it at both call sites (barrel + direct import).
const userCreateActionMock = vi.fn()
vi.mock('../model/userCreateAction', () => ({
    userCreateAction: (...args: unknown[]) => userCreateActionMock(...args),
}))

import { UserCreateModal } from './UserCreateModal'

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Opens the modal by clicking the CREATE button (outer toggle, uppercase text).
 */
const openModal = async () => {
    // The outer toggle button has exact text "CREATE" (uppercase).
    // We use exact: true to avoid matching the form's "Create" submit button.
    await userEvent.click(screen.getByRole('button', { name: 'CREATE' }))
}

/**
 * Fills in the three required fields of the Create Manager form.
 */
const fillForm = async (email = 'manager@example.com', name = 'Alice', surname = 'Smith') => {
    await userEvent.type(screen.getByPlaceholderText(/manager@example\.com/i), email)
    await userEvent.type(screen.getByPlaceholderText(/first name/i), name)
    await userEvent.type(screen.getByPlaceholderText(/last name/i), surname)
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('UserCreateModal', () => {
    beforeEach(() => {
        userCreateActionMock.mockReset()
    })

    // ── Modal open / close ───────────────────────────────────────────────────

    describe('given the modal is closed initially', () => {
        it('when the user clicks CREATE, then the modal opens and shows the form', async () => {
            render(<UserCreateModal />)

            expect(screen.queryByText(/create manager/i)).not.toBeInTheDocument()
            await openModal()
            expect(screen.getByText(/create manager/i)).toBeInTheDocument()
        })
    })

    describe('given the modal is open', () => {
        it('when the user clicks the close (✕) button, then the modal disappears', async () => {
            render(<UserCreateModal />)
            await openModal()

            await userEvent.click(screen.getByRole('button', { name: '✕' }))

            expect(screen.queryByText(/create manager/i)).not.toBeInTheDocument()
        })
    })

    describe('given the modal is open', () => {
        it('when the user clicks the backdrop overlay, then the modal disappears', async () => {
            render(<UserCreateModal />)
            await openModal()

            // The overlay is the outer div that wraps the modal card.
            // The component renders: <div onClick={handleClose}><div onClick={stopPropagation}>...</div></div>
            // We find the close button's parent (modal card), then its parent (overlay),
            // and click the overlay directly. In jsdom layout doesn't exist so we fire
            // the click event programmatically on the overlay element.
            const closeBtn = screen.getByRole('button', { name: '✕' })
            const modalCard = closeBtn.closest('div')!
            const overlay = modalCard.parentElement!
            await userEvent.click(overlay)

            expect(screen.queryByText(/create manager/i)).not.toBeInTheDocument()
        })
    })

    // ── Valid submission ─────────────────────────────────────────────────────

    describe('given the modal is open and the user fills in valid data', () => {
        it('when the form is submitted, then the action is called and the success view shows', async () => {
            userCreateActionMock.mockResolvedValue({
                ok: true,
                link: 'https://example.com/activate/abc123',
                details: 'Manager created successfully',
            })

            render(<UserCreateModal />)
            await openModal()
            await fillForm()
            await userEvent.click(screen.getByRole('button', { name: 'Create' }))

            await waitFor(() =>
                expect(screen.getByText(/activation link/i)).toBeInTheDocument()
            )
            expect(screen.getByText('https://example.com/activate/abc123')).toBeInTheDocument()
            expect(screen.getByText(/manager created successfully/i)).toBeInTheDocument()
        })
    })

    // ── Server-side error ────────────────────────────────────────────────────

    describe('given the action returns an error', () => {
        it('when the form is submitted, then the error message is rendered inside the form', async () => {
            userCreateActionMock.mockResolvedValue({
                ok: false,
                error: 'Email already exists',
            })

            render(<UserCreateModal />)
            await openModal()
            await fillForm()
            await userEvent.click(screen.getByRole('button', { name: 'Create' }))

            await waitFor(() =>
                expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
            )
        })
    })

    // ── Copy link ────────────────────────────────────────────────────────────

    describe('given the success state is shown with an activation link', () => {
        it('when the user clicks Copy link, then clipboard.writeText is called with the link', async () => {
            const writeText = vi.fn().mockResolvedValue(undefined)
            Object.defineProperty(navigator, 'clipboard', {
                value: { writeText },
                configurable: true,
                writable: true,
            })

            userCreateActionMock.mockResolvedValue({
                ok: true,
                link: 'https://example.com/activate/xyz',
                details: 'Done',
            })

            render(<UserCreateModal />)
            await openModal()
            await fillForm()
            await userEvent.click(screen.getByRole('button', { name: 'Create' }))

            await waitFor(() => screen.getByRole('button', { name: /copy link/i }))
            await userEvent.click(screen.getByRole('button', { name: /copy link/i }))

            expect(writeText).toHaveBeenCalledWith('https://example.com/activate/xyz')
            await waitFor(() =>
                expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument()
            )
        })
    })

    // ── Done button closes modal ─────────────────────────────────────────────

    describe('given the success state is shown', () => {
        it('when the user clicks Done, then the modal closes', async () => {
            userCreateActionMock.mockResolvedValue({
                ok: true,
                link: 'https://example.com/activate/done',
                details: 'All good',
            })

            render(<UserCreateModal />)
            await openModal()
            await fillForm()
            await userEvent.click(screen.getByRole('button', { name: 'Create' }))

            await waitFor(() => screen.getByRole('button', { name: /done/i }))
            await userEvent.click(screen.getByRole('button', { name: /done/i }))

            expect(screen.queryByText(/create manager/i)).not.toBeInTheDocument()
        })
    })
})
