// BDD-style behaviour spec for the CommentForm client component.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const commentActionMock = vi.fn()
vi.mock('../model/commentAction', () => ({
    commentAction: (...args: unknown[]) => commentActionMock(...args),
}))

import { CommentForm } from './CommentForm'

const params = { orderId: '7' }

/** An action that stays in flight until the returned resolve() is called. */
const deferred = () => {
    let release: (value: unknown) => void = () => {}
    const promise = new Promise((resolve) => { release = resolve })
    return { promise, release: () => release({ ok: true, at: 1 }) }
}

describe('CommentForm', () => {
    beforeEach(() => {
        commentActionMock.mockReset()
    })

    describe('given an empty field', () => {
        it('then the button is disabled and a click sends nothing', async () => {
            render(<CommentForm params={params} />)
            const button = screen.getByRole('button', { name: /add comment/i })

            expect(button).toBeDisabled()
            await userEvent.click(button)

            expect(commentActionMock).not.toHaveBeenCalled()
        })

        it('then whitespace alone does not enable it', async () => {
            render(<CommentForm params={params} />)
            await userEvent.type(screen.getByPlaceholderText(/write a comment/i), '   ')

            expect(screen.getByRole('button', { name: /add comment/i })).toBeDisabled()
        })
    })

    describe('given a comment is being sent', () => {
        it('then the button shows Adding… and a second click is ignored', async () => {
            const { promise, release } = deferred()
            commentActionMock.mockReturnValue(promise)

            render(<CommentForm params={params} />)
            await userEvent.type(screen.getByPlaceholderText(/write a comment/i), 'Call back')
            await userEvent.click(screen.getByRole('button', { name: /add comment/i }))

            const pendingButton = await screen.findByRole('button', { name: /adding/i })
            expect(pendingButton).toBeDisabled()

            await userEvent.click(pendingButton)
            expect(commentActionMock).toHaveBeenCalledTimes(1)

            release()
            await waitFor(() =>
                expect(screen.getByPlaceholderText(/write a comment/i)).toHaveValue('')
            )
        })
    })

    describe('given the server rejects the comment', () => {
        it('then the message is shown in the form and the text is kept', async () => {
            commentActionMock.mockResolvedValue({ ok: false, error: 'Failed to add comment' })

            render(<CommentForm params={params} />)
            await userEvent.type(screen.getByPlaceholderText(/write a comment/i), 'Keep me')
            await userEvent.click(screen.getByRole('button', { name: /add comment/i }))

            expect(await screen.findByRole('alert')).toHaveTextContent('Failed to add comment')
            expect(screen.getByPlaceholderText(/write a comment/i)).toHaveValue('Keep me')
        })
    })

    describe('given the order belongs to someone else', () => {
        it('then the form is locked', async () => {
            render(<CommentForm params={params} disabled />)

            expect(screen.getByPlaceholderText(/write a comment/i)).toBeDisabled()
            expect(screen.getByRole('button', { name: /add comment/i })).toBeDisabled()
        })
    })
})
