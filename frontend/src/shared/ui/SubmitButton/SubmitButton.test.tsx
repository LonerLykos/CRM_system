import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubmitButton } from './SubmitButton'

const deferred = () => {
    let resolve!: () => void
    const promise = new Promise<void>((r) => {
        resolve = r
    })
    return { promise, resolve }
}

describe('SubmitButton', () => {
    describe('given a form whose action is still running', () => {
        it('when the user clicks repeatedly, then the action fires only once', async () => {
            const pending = deferred()
            const action = vi.fn(() => pending.promise)

            render(
                <form action={action}>
                    <SubmitButton pendingLabel="Adding…">Add comment</SubmitButton>
                </form>,
            )

            const button = screen.getByRole('button')
            await userEvent.click(button)
            await waitFor(() => expect(button).toBeDisabled())

            await userEvent.click(button)
            await userEvent.click(button)

            expect(action).toHaveBeenCalledTimes(1)

            await act(async () => {
                pending.resolve()
                await pending.promise
            })
        })

        it('then the pending label is shown while it runs', async () => {
            const pending = deferred()
            const action = vi.fn(() => pending.promise)

            render(
                <form action={action}>
                    <SubmitButton pendingLabel="Adding…">Add comment</SubmitButton>
                </form>,
            )

            await userEvent.click(screen.getByRole('button'))
            await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Adding…'))

            await act(async () => {
                pending.resolve()
                await pending.promise
            })

            await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Add comment'))
        })
    })

    describe('given the form is idle', () => {
        it('then the button is enabled and shows its normal label', () => {
            render(
                <form action={vi.fn()}>
                    <SubmitButton>Add comment</SubmitButton>
                </form>,
            )

            const button = screen.getByRole('button')
            expect(button).toBeEnabled()
            expect(button).toHaveTextContent('Add comment')
        })

        it('when disabled is passed for another reason, then it stays disabled', async () => {
            const action = vi.fn()
            render(
                <form action={action}>
                    <SubmitButton disabled>Add comment</SubmitButton>
                </form>,
            )

            const button = screen.getByRole('button')
            expect(button).toBeDisabled()

            await userEvent.click(button)
            expect(action).not.toHaveBeenCalled()
        })
    })
})
