// BDD-style behaviour spec for the AddGroupForm client component.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const groupCreateAction = vi.fn()
vi.mock('../model/groupCreateAction', () => ({
  groupCreateAction: (...args: unknown[]) => groupCreateAction(...args),
}))

import { AddGroupForm } from './AddGroupForm'

describe('AddGroupForm', () => {
  beforeEach(() => {
    groupCreateAction.mockReset()
  })

  describe('given a valid group name', () => {
    it('when the user submits, then the action is called with the trimmed name', async () => {
      groupCreateAction.mockResolvedValue({ error: null })

      render(<AddGroupForm />)
      await userEvent.type(screen.getByPlaceholderText(/new group name/i), '  Beta  ')
      await userEvent.click(screen.getByRole('button', { name: /add group/i }))

      await waitFor(() => expect(groupCreateAction).toHaveBeenCalledWith('Beta'))
    })
  })

  describe('given an empty name', () => {
    it('when the user submits, then a validation error shows and the action is not called', async () => {
      render(<AddGroupForm />)
      await userEvent.click(screen.getByRole('button', { name: /add group/i }))

      expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument()
      expect(groupCreateAction).not.toHaveBeenCalled()
    })
  })

  describe('given the action returns an error', () => {
    it('when the user submits, then the error message is rendered', async () => {
      groupCreateAction.mockResolvedValue({ error: 'Group already exists' })

      render(<AddGroupForm />)
      await userEvent.type(screen.getByPlaceholderText(/new group name/i), 'Existing')
      await userEvent.click(screen.getByRole('button', { name: /add group/i }))

      await waitFor(() =>
        expect(screen.getByText(/group already exists/i)).toBeInTheDocument()
      )
    })
  })
})
