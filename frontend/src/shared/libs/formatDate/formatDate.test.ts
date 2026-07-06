// TDD-style unit tests for formatDate.
import { describe, it, expect } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  // ── valid ISO strings ────────────────────────────────────────────────────────

  it('formats a known UTC date to en-US long month, 2-digit day, full year', () => {
    // "June 11, 2026" — the exact en-US Intl output
    expect(formatDate('2026-06-11T00:00:00.000Z')).toBe('June 11, 2026')
  })

  it('formats the first day of the year correctly', () => {
    expect(formatDate('2025-01-01T00:00:00.000Z')).toBe('January 01, 2025')
  })

  it('formats a date with a single-digit day using 2-digit padding', () => {
    const result = formatDate('2024-03-05T12:00:00.000Z')
    // day should always be 2-digit: "05"
    expect(result).toMatch(/\d{2},/)
  })

  // formatDate pins Intl to timeZone: 'UTC', so a late-UTC timestamp does not
  // roll over into the next day in positive-offset locales.
  it('formats December 31st in UTC regardless of the local timezone', () => {
    expect(formatDate('2023-12-31T23:59:59.000Z')).toBe('December 31, 2023')
  })

  it('formats a date-only string (no time component)', () => {
    // new Date('2026-06-11') is midnight UTC; local TZ may shift a day — tested loosely
    const result = formatDate('2026-06-11')
    expect(result).toMatch(/\w+ \d{2}, 2026/)
  })

  // ── invalid / empty inputs ───────────────────────────────────────────────────

  it('returns em-dash for an empty string', () => {
    expect(formatDate('')).toBe('—')
  })

  it('returns em-dash for a null-ish coercion (empty falsy)', () => {
    // The guard is `if (!isoString)` — an empty string is falsy
    expect(formatDate('')).toBe('—')
  })

  // formatDate guards against Invalid Date (isNaN check) and returns the
  // em-dash fallback instead of throwing a RangeError.
  it('returns em-dash for an invalid date string instead of throwing', () => {
    expect(() => formatDate('not-a-date')).not.toThrow()
    expect(formatDate('not-a-date')).toBe('—')
  })
})
