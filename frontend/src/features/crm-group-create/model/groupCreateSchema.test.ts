import { describe, it, expect } from 'vitest'
import { groupCreateSchema } from './groupCreateSchema'

describe('groupCreateSchema', () => {
  describe('valid input', () => {
    it('accepts a group name with 1 character', () => {
      const result = groupCreateSchema.safeParse({ name: 'A' })
      expect(result.success).toBe(true)
    })

    it('accepts a group name with exactly 100 characters', () => {
      const result = groupCreateSchema.safeParse({ name: 'A'.repeat(100) })
      expect(result.success).toBe(true)
    })

    it('accepts a typical group name', () => {
      const result = groupCreateSchema.safeParse({ name: 'Group Alpha 2024' })
      expect(result.success).toBe(true)
    })
  })

  describe('name min length validation', () => {
    it('rejects empty name', () => {
      const result = groupCreateSchema.safeParse({ name: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'name')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Group name cannot be empty')
      }
    })

    it('rejects missing name', () => {
      const result = groupCreateSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('name max length validation', () => {
    it('rejects name longer than 100 characters', () => {
      const result = groupCreateSchema.safeParse({ name: 'A'.repeat(101) })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'name')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Group name must be at most 100 characters')
      }
    })
  })
})
