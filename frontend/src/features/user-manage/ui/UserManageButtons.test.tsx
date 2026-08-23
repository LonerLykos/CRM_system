// BDD-style behaviour spec for the UserManageButtons client component.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// --- Mock the concrete actions module ---
// UserManageButtons.tsx imports from '@/features/user-manage' (barrel) which
// re-exports from './model/userManageActions'. Mocking the barrel via @/ alias
// does not intercept because Vitest resolves the component's import to the
// concrete file. Mocking the relative concrete file does work.
const restorePasswordActionMock = vi.fn()
const banToggleActionMock = vi.fn()

vi.mock('../model/userManageActions', () => ({
    restorePasswordAction: (...args: unknown[]) => restorePasswordActionMock(...args),
    banToggleAction: (...args: unknown[]) => banToggleActionMock(...args),
}))

import { UserManageButtons } from './UserManageButtons'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Stub navigator.clipboard.writeText for the current test. */
const stubClipboard = () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true,
        writable: true,
    })
    return writeText
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('UserManageButtons', () => {
    beforeEach(() => {
        restorePasswordActionMock.mockReset()
        banToggleActionMock.mockReset()
    })

    // ── Conditional button rendering ─────────────────────────────────────────

    describe('given an inactive, non-banned user', () => {
        it('when rendered, then Activate and Ban buttons are shown', () => {
            render(<UserManageButtons pk={1} isActive={false} isBanned={false} />)

            expect(screen.getByRole('button', { name: /activate/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /ban/i })).toBeInTheDocument()
            expect(screen.queryByRole('button', { name: /recovery password/i })).not.toBeInTheDocument()
            expect(screen.queryByRole('button', { name: /unban/i })).not.toBeInTheDocument()
        })
    })

    describe('given an active, non-banned user', () => {
        it('when rendered, then Recovery password and Ban buttons are shown', () => {
            render(<UserManageButtons pk={2} isActive={true} isBanned={false} />)

            expect(screen.getByRole('button', { name: /recovery password/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /ban/i })).toBeInTheDocument()
            expect(screen.queryByRole('button', { name: /^activate$/i })).not.toBeInTheDocument()
        })
    })

    describe('given a banned user', () => {
        it('when rendered, then Unban button is shown instead of Ban', () => {
            render(<UserManageButtons pk={3} isActive={true} isBanned={true} />)

            expect(screen.getByRole('button', { name: /unban/i })).toBeInTheDocument()
            expect(screen.queryByRole('button', { name: /^ban$/i })).not.toBeInTheDocument()
        })
    })

    // ── Activate → restorePasswordAction + clipboard ─────────────────────────

    describe('given an inactive user', () => {
        it('when the user clicks Activate, then restorePasswordAction is called with pk and the link is copied to clipboard', async () => {
            const writeText = stubClipboard()
            restorePasswordActionMock.mockResolvedValue({
                ok: true,
                link: 'https://example.com/activate/abc',
            })

            render(<UserManageButtons pk={42} isActive={false} isBanned={false} />)
            await userEvent.click(screen.getByRole('button', { name: /activate/i }))

            await waitFor(() =>
                expect(restorePasswordActionMock).toHaveBeenCalledWith(42)
            )
            await waitFor(() =>
                expect(writeText).toHaveBeenCalledWith('https://example.com/activate/abc')
            )
        })
    })

    describe('given an inactive user and a successful restore', () => {
        it('when activate completes, then "Link copied!" feedback is rendered', async () => {
            stubClipboard()
            restorePasswordActionMock.mockResolvedValue({
                ok: true,
                link: 'https://example.com/activate/abc',
            })

            render(<UserManageButtons pk={42} isActive={false} isBanned={false} />)
            await userEvent.click(screen.getByRole('button', { name: /activate/i }))

            await waitFor(() =>
                expect(screen.getByText(/link copied!/i)).toBeInTheDocument()
            )
        })
    })

    // ── Recovery password → restorePasswordAction + clipboard ────────────────

    describe('given an active user', () => {
        it('when the user clicks Recovery password, then restorePasswordAction is called with pk and link is copied', async () => {
            const writeText = stubClipboard()
            restorePasswordActionMock.mockResolvedValue({
                ok: true,
                link: 'https://example.com/reset/xyz',
            })

            render(<UserManageButtons pk={7} isActive={true} isBanned={false} />)
            await userEvent.click(screen.getByRole('button', { name: /recovery password/i }))

            await waitFor(() =>
                expect(restorePasswordActionMock).toHaveBeenCalledWith(7)
            )
            await waitFor(() =>
                expect(writeText).toHaveBeenCalledWith('https://example.com/reset/xyz')
            )
        })
    })

    // ── restorePasswordAction error ───────────────────────────────────────────

    describe('given the restorePasswordAction returns an error', () => {
        it('when the user clicks Activate, then the error message is displayed', async () => {
            restorePasswordActionMock.mockResolvedValue({
                ok: false,
                error: 'Activation failed',
            })

            render(<UserManageButtons pk={5} isActive={false} isBanned={false} />)
            await userEvent.click(screen.getByRole('button', { name: /activate/i }))

            await waitFor(() =>
                expect(screen.getByText(/activation failed/i)).toBeInTheDocument()
            )
        })
    })

    // ── Ban button ────────────────────────────────────────────────────────────

    describe('given an active, non-banned user', () => {
        it('when the user clicks Ban, then banToggleAction is called with pk', async () => {
            banToggleActionMock.mockResolvedValue({ ok: true })

            render(<UserManageButtons pk={10} isActive={true} isBanned={false} />)
            await userEvent.click(screen.getByRole('button', { name: /^ban$/i }))

            await waitFor(() =>
                expect(banToggleActionMock).toHaveBeenCalledWith(10)
            )
        })
    })

    // ── Unban button ──────────────────────────────────────────────────────────

    describe('given a banned user', () => {
        it('when the user clicks Unban, then banToggleAction is called with pk', async () => {
            banToggleActionMock.mockResolvedValue({ ok: true })

            render(<UserManageButtons pk={11} isActive={true} isBanned={true} />)
            await userEvent.click(screen.getByRole('button', { name: /unban/i }))

            await waitFor(() =>
                expect(banToggleActionMock).toHaveBeenCalledWith(11)
            )
        })
    })

    // ── banToggleAction error ─────────────────────────────────────────────────

    describe('given banToggleAction returns an error', () => {
        it('when the user clicks Ban, then the error message is displayed', async () => {
            banToggleActionMock.mockResolvedValue({
                ok: false,
                error: 'Ban failed',
            })

            render(<UserManageButtons pk={12} isActive={true} isBanned={false} />)
            await userEvent.click(screen.getByRole('button', { name: /^ban$/i }))

            await waitFor(() =>
                expect(screen.getByText(/ban failed/i)).toBeInTheDocument()
            )
        })
    })

    // ── Clipboard fallback (no clipboard API) ─────────────────────────────────

    describe('given the clipboard API is unavailable and restore succeeds', () => {
        it('when Activate is clicked, then the link text is shown with a Copy button fallback', async () => {
            Object.defineProperty(navigator, 'clipboard', {
                value: {
                    writeText: vi.fn().mockRejectedValue(new Error('No clipboard')),
                },
                configurable: true,
                writable: true,
            })

            restorePasswordActionMock.mockResolvedValue({
                ok: true,
                link: 'https://example.com/activate/fallback',
            })

            render(<UserManageButtons pk={99} isActive={false} isBanned={false} />)
            await userEvent.click(screen.getByRole('button', { name: /activate/i }))

            await waitFor(() =>
                expect(screen.getByText('https://example.com/activate/fallback')).toBeInTheDocument()
            )
            expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument()
        })
    })
})
