import { describe, it, expect } from 'vitest'
import { commentSchema } from './commentSchema'

describe('commentSchema', () => {
  describe('valid input', () => {
    it('accepts a comment with 1 character', () => {
      const result = commentSchema.safeParse({ comment: 'A' })
      expect(result.success).toBe(true)
    })

    it('accepts a longer comment', () => {
      const result = commentSchema.safeParse({ comment: 'This is a valid comment.' })
      expect(result.success).toBe(true)
    })
  })

  describe('comment validation', () => {
    it('rejects empty string', () => {
      const result = commentSchema.safeParse({ comment: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'comment')
        expect(err).toBeDefined()
        expect(err?.message).toBe('The comment must have at least 1 characters')
      }
    })

    it('rejects a whitespace-only comment', () => {
      const result = commentSchema.safeParse({ comment: '   ' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('The comment must have at least 1 characters')
      }
    })

    it('trims surrounding whitespace from the comment', () => {
      const result = commentSchema.safeParse({ comment: '  Call back tomorrow  ' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.comment).toBe('Call back tomorrow')
      }
    })

    it('rejects missing comment field', () => {
      const result = commentSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('rejects null as comment', () => {
      const result = commentSchema.safeParse({ comment: null })
      expect(result.success).toBe(false)
    })
  })
})
