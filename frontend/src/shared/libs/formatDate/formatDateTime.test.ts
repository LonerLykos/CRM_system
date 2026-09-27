import { describe, it, expect } from 'vitest'
import { formatDateTime } from './formatDateTime'

describe('formatDateTime', () => {
  const iso = '2026-09-27T21:30:00Z'

  it('formats date and time in UTC by default', () => {
    const result = formatDateTime(iso)
    expect(result).toContain('September')
    expect(result).toContain('2026')
    expect(result).toContain('21:30')
  })

  it('formats in the requested time zone', () => {
    expect(formatDateTime(iso, 'Europe/Kyiv')).toContain('00:30')
    expect(formatDateTime(iso, 'Europe/Kyiv')).toContain('September 28')
  })

  it('returns a dash for an empty value', () => {
    expect(formatDateTime('')).toBe('—')
  })

  it('returns a dash for an unparsable value', () => {
    expect(formatDateTime('not-a-date')).toBe('—')
  })
})
