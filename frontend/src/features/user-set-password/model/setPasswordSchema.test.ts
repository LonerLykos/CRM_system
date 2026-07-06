import { describe, it, expect } from 'vitest'
import { setPasswordSchema } from './setPasswordSchema'

describe('setPasswordSchema', () => {
  describe('valid input', () => {
    it('accepts matching passwords with 8+ characters including letters', () => {
      const result = setPasswordSchema.safeParse({ password: 'abcd1234', confirmPassword: 'abcd1234' })
      expect(result.success).toBe(true)
    })

    it('accepts password exactly 8 characters', () => {
      const result = setPasswordSchema.safeParse({ password: 'abcdefg1', confirmPassword: 'abcdefg1' })
      expect(result.success).toBe(true)
    })

    it('accepts password longer than 8 characters', () => {
      const result = setPasswordSchema.safeParse({ password: 'supersecurepassword1', confirmPassword: 'supersecurepassword1' })
      expect(result.success).toBe(true)
    })

    it('accepts password that is all letters (no numeric-only restriction hit)', () => {
      const result = setPasswordSchema.safeParse({ password: 'abcdefgh', confirmPassword: 'abcdefgh' })
      expect(result.success).toBe(true)
    })
  })

  describe('password length validation', () => {
    it('rejects password shorter than 8 characters', () => {
      const result = setPasswordSchema.safeParse({ password: 'abc1234', confirmPassword: 'abc1234' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'password')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Password must be at least 8 characters')
      }
    })

    it('rejects empty password', () => {
      const result = setPasswordSchema.safeParse({ password: '', confirmPassword: '' })
      expect(result.success).toBe(false)
    })

    it('rejects missing password', () => {
      const result = setPasswordSchema.safeParse({ confirmPassword: 'abcd1234' })
      expect(result.success).toBe(false)
    })
  })

  describe('password numeric-only restriction', () => {
    it('rejects entirely numeric password', () => {
      const result = setPasswordSchema.safeParse({ password: '12345678', confirmPassword: '12345678' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'password')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Password cannot be entirely numeric')
      }
    })

    it('accepts password with mixed numeric and letter characters', () => {
      const result = setPasswordSchema.safeParse({ password: '1234567a', confirmPassword: '1234567a' })
      expect(result.success).toBe(true)
    })
  })

  describe('confirmPassword match validation', () => {
    it('rejects when confirmPassword does not match password', () => {
      const result = setPasswordSchema.safeParse({ password: 'abcd1234', confirmPassword: 'abcd5678' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'confirmPassword')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Passwords do not match')
      }
    })

    it('rejects when confirmPassword is empty and password is valid', () => {
      const result = setPasswordSchema.safeParse({ password: 'abcd1234', confirmPassword: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'confirmPassword')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Passwords do not match')
      }
    })

    it('rejects missing confirmPassword', () => {
      const result = setPasswordSchema.safeParse({ password: 'abcd1234' })
      expect(result.success).toBe(false)
    })

    it('error is placed on confirmPassword path', () => {
      const result = setPasswordSchema.safeParse({ password: 'abcd1234', confirmPassword: 'wrong' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('confirmPassword')
        expect(paths).not.toContain('password')
      }
    })
  })
})
