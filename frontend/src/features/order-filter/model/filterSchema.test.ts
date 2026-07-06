import { describe, it, expect } from 'vitest'
import { filterSchema } from './filterSchema'

describe('filterSchema', () => {
  describe('group validation', () => {
    it('accepts a numeric group id', () => {
      const result = filterSchema.safeParse({ group: '1' })
      expect(result.success).toBe(true)
    })

    it('accepts a multi-digit group id', () => {
      const result = filterSchema.safeParse({ group: '42' })
      expect(result.success).toBe(true)
    })

    it('accepts an empty string (the "All groups" default option)', () => {
      const result = filterSchema.safeParse({ group: '' })
      expect(result.success).toBe(true)
    })

    it('accepts a missing group (no filter applied)', () => {
      const result = filterSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('rejects a non-numeric group id', () => {
      const result = filterSchema.safeParse({ group: 'abc' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'group')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Group must be a valid id')
      }
    })

    it('rejects a decimal group id', () => {
      const result = filterSchema.safeParse({ group: '1.5' })
      expect(result.success).toBe(false)
    })
  })
})
