import { describe, it, expect } from 'vitest'
import { loginSchema } from './loginSchema'

describe('loginSchema', () => {
  describe('valid input', () => {
    it('accepts valid email and password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: 'abcd' })
      expect(result.success).toBe(true)
    })

    it('accepts password exactly 4 characters', () => {
      const result = loginSchema.safeParse({ email: 'a@b.co', password: '1234' })
      expect(result.success).toBe(true)
    })

    it('accepts long password', () => {
      const result = loginSchema.safeParse({ email: 'test@test.org', password: 'averylongpassword123' })
      expect(result.success).toBe(true)
    })
  })

  describe('email validation', () => {
    it('rejects missing email', () => {
      const result = loginSchema.safeParse({ password: 'abcd' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid email format — no @', () => {
      const result = loginSchema.safeParse({ email: 'notanemail', password: 'abcd' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailError = result.error.issues.find(i => i.path[0] === 'email')
        expect(emailError).toBeDefined()
        expect(emailError?.message).toBe('Incorrect email format')
      }
    })

    it('rejects invalid email format — missing domain', () => {
      const result = loginSchema.safeParse({ email: 'user@', password: 'abcd' })
      expect(result.success).toBe(false)
    })

    it('rejects empty string as email', () => {
      const result = loginSchema.safeParse({ email: '', password: 'abcd' })
      expect(result.success).toBe(false)
    })
  })

  describe('password validation', () => {
    it('rejects missing password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com' })
      expect(result.success).toBe(false)
    })

    it('rejects password shorter than 4 characters', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: 'abc' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const pwdError = result.error.issues.find(i => i.path[0] === 'password')
        expect(pwdError).toBeDefined()
        expect(pwdError?.message).toBe('The password must be at least 4 characters')
      }
    })

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: '' })
      expect(result.success).toBe(false)
    })
  })
})
