import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CommentTime } from './CommentTime'
import { formatDateTime } from '@/shared/libs'

describe('CommentTime', () => {
  const iso = '2026-09-27T21:30:00Z'

  it('keeps the machine-readable timestamp in the markup', () => {
    render(<CommentTime iso={iso} />)
    expect(screen.getByText(/2026/)).toHaveAttribute('datetime', iso)
  })

  it('shows the time in the reader own time zone', async () => {
    render(<CommentTime iso={iso} />)
    const local = formatDateTime(iso, Intl.DateTimeFormat().resolvedOptions().timeZone)
    await waitFor(() => expect(screen.getByText(local)).toBeInTheDocument())
  })
})
