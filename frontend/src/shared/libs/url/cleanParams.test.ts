// TDD-style unit tests for cleanParams.
import { describe, it, expect } from 'vitest'
import { cleanParams } from './cleanParams'

describe('cleanParams', () => {
  it('serialises a single non-empty param', () => {
    expect(cleanParams({ page: '1' })).toBe('page=1')
  })

  it('serialises multiple non-empty params', () => {
    const result = cleanParams({ page: '2', order: 'name' })
    // URLSearchParams order follows insertion order
    expect(result).toBe('page=2&order=name')
  })

  it('removes params that are undefined', () => {
    const result = cleanParams({ page: '1', order: undefined })
    expect(result).toBe('page=1')
    expect(result).not.toContain('order')
  })

  it('removes params that are null', () => {
    // ISearchParams fields are string|undefined, but null can arrive at runtime
    const result = cleanParams({ page: '1', order: null as unknown as undefined })
    expect(result).toBe('page=1')
    expect(result).not.toContain('order')
  })

  it('removes params that are empty strings', () => {
    const result = cleanParams({ page: '1', name_contains: '' })
    expect(result).toBe('page=1')
    expect(result).not.toContain('name_contains')
  })

  it('returns an empty string when all params are empty/undefined', () => {
    expect(cleanParams({ page: undefined, order: '' })).toBe('')
  })

  it('returns an empty string for an empty object', () => {
    expect(cleanParams({})).toBe('')
  })

  it('percent-encodes special characters', () => {
    const result = cleanParams({ name_contains: 'hello world' })
    expect(result).toBe('name_contains=hello+world')
  })

  it('keeps every field that has a non-empty value', () => {
    const result = cleanParams({
      page: '3',
      order: '-created_at',
      status: 'New',
      course: '',
      age_eq: undefined,
    })
    expect(result).toBe('page=3&order=-created_at&status=New')
  })
})
