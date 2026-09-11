import { describe, it, expect } from 'vitest'
import { userCreateSchema } from './userCreateSchema'

describe('userCreateSchema', () => {
  describe('valid input', () => {
    it('accepts valid email, name and surname', () => {
      const result = userCreateSchema.safeParse({
        email: 'user@example.com',
        name: 'John',
        surname: 'Doe',
      })
      expect(result.success).toBe(true)
    })

    it('accepts name of exactly 1 character', () => {
      const result = userCreateSchema.safeParse({ email: 'a@b.com', name: 'J', surname: 'Doe' })
      expect(result.success).toBe(true)
    })

    it('accepts name of exactly 20 characters', () => {
      const result = userCreateSchema.safeParse({ email: 'a@b.com', name: 'A'.repeat(20), surname: 'Doe' })
      expect(result.success).toBe(true)
    })

    it('accepts surname of exactly 1 character', () => {
      const result = userCreateSchema.safeParse({ email: 'a@b.com', name: 'John', surname: 'D' })
      expect(result.success).toBe(true)
    })

    it('accepts surname of exactly 50 characters', () => {
      const result = userCreateSchema.safeParse({ email: 'a@b.com', name: 'John', surname: 'D'.repeat(50) })
      expect(result.success).toBe(true)
    })
  })

  describe('email validation', () => {
    it('rejects missing email', () => {
      const result = userCreateSchema.safeParse({ name: 'John', surname: 'Doe' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const result = userCreateSchema.safeParse({ email: 'not-valid', name: 'John', surname: 'Doe' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'email')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Incorrect email format')
      }
    })

    it('rejects empty email', () => {
      const result = userCreateSchema.safeParse({ email: '', name: 'John', surname: 'Doe' })
      expect(result.success).toBe(false)
    })

    // 64 + "@" + 85-char domain = exactly 150 characters
    const email150 = 'a'.repeat(64) + '@' + 'b'.repeat(63) + '.' + 'c'.repeat(17) + '.com'
    const email151 = 'a'.repeat(64) + '@' + 'b'.repeat(63) + '.' + 'c'.repeat(18) + '.com'

    it('accepts email of exactly 150 characters', () => {
      expect(email150).toHaveLength(150)
      const result = userCreateSchema.safeParse({ email: email150, name: 'John', surname: 'Doe' })
      expect(result.success).toBe(true)
    })

    it('rejects email longer than 150 characters', () => {
      expect(email151).toHaveLength(151)
      const result = userCreateSchema.safeParse({ email: email151, name: 'John', surname: 'Doe' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'email')
        expect(err?.message).toBe('Email max 150 chars')
      }
    })
  })

  describe('name validation', () => {
    it('rejects empty name', () => {
      const result = userCreateSchema.safeParse({ email: 'a@b.com', name: '', surname: 'Doe' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'name')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Name is required')
      }
    })

    it('rejects missing name', () => {
      const result = userCreateSchema.safeParse({ email: 'a@b.com', surname: 'Doe' })
      expect(result.success).toBe(false)
    })

    it('rejects name longer than 20 characters', () => {
      const result = userCreateSchema.safeParse({ email: 'a@b.com', name: 'A'.repeat(21), surname: 'Doe' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'name')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Name max 20 chars')
      }
    })
  })

  describe('surname validation', () => {
    it('rejects empty surname', () => {
      const result = userCreateSchema.safeParse({ email: 'a@b.com', name: 'John', surname: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'surname')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Surname is required')
      }
    })

    it('rejects missing surname', () => {
      const result = userCreateSchema.safeParse({ email: 'a@b.com', name: 'John' })
      expect(result.success).toBe(false)
    })

    it('rejects surname longer than 50 characters', () => {
      const result = userCreateSchema.safeParse({ email: 'a@b.com', name: 'John', surname: 'D'.repeat(51) })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'surname')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Surname max 50 chars')
      }
    })
  })
})
