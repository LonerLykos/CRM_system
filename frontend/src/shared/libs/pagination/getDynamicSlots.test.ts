// TDD-style unit tests for the pagination slot algorithm.
import { describe, it, expect } from 'vitest'
import { getDynamicSlots } from './getDynamicSlots'

describe('getDynamicSlots', () => {
  it('returns every page when total fits within max_slots', () => {
    expect(getDynamicSlots(5, 1, 9)).toEqual([1, 2, 3, 4, 5])
  })

  it('shows a trailing ellipsis when near the start', () => {
    expect(getDynamicSlots(20, 1, 9)).toEqual([1, 2, 3, 4, 5, 6, 7, '...', 20])
  })

  it('shows a leading ellipsis when near the end', () => {
    expect(getDynamicSlots(20, 20, 9)).toEqual([1, '...', 14, 15, 16, 17, 18, 19, 20])
  })

  it('shows both ellipses when in the middle', () => {
    expect(getDynamicSlots(20, 10, 9)).toEqual([1, '...', 8, 9, 10, 11, 12, '...', 20])
  })
})
