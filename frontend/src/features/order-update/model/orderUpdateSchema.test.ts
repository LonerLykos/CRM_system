import { describe, it, expect } from 'vitest'
import { orderUpdateSchema } from './orderUpdateSchema'

describe('orderUpdateSchema', () => {
  describe('valid input', () => {
    it('accepts all fields empty (nullish)', () => {
      const result = orderUpdateSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('accepts all fields as empty strings (emptyToNull → nullish)', () => {
      const result = orderUpdateSchema.safeParse({
        name: '', surname: '', email: '', phone: '',
        age: '', course: '', course_format: '', course_type: '',
        sum: '', already_paid: '', status: '', group: '',
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid full payload', () => {
      const result = orderUpdateSchema.safeParse({
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '+380671234567',
        age: '25',
        course: 'nodejs',
        course_format: 'Online',
        course_type: 'PRO',
        sum: '1000',
        already_paid: '500',
        status: 'In Work',
        group: 'group1',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('name validation', () => {
    it('rejects name longer than 25 characters', () => {
      const result = orderUpdateSchema.safeParse({ name: 'A'.repeat(26) })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'name')
        expect(err).toBeDefined()
        expect(err?.message).toContain('25')
      }
    })

    it('accepts name exactly 25 characters', () => {
      const result = orderUpdateSchema.safeParse({ name: 'A'.repeat(25) })
      expect(result.success).toBe(true)
    })
  })

  describe('surname validation', () => {
    it('rejects surname longer than 50 characters', () => {
      const result = orderUpdateSchema.safeParse({ surname: 'B'.repeat(51) })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'surname')
        expect(err).toBeDefined()
        expect(err?.message).toContain('50')
      }
    })

    it('accepts surname exactly 50 characters', () => {
      const result = orderUpdateSchema.safeParse({ surname: 'B'.repeat(50) })
      expect(result.success).toBe(true)
    })
  })

  describe('email validation', () => {
    it('rejects invalid email', () => {
      const result = orderUpdateSchema.safeParse({ email: 'not-an-email' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'email')
        expect(err).toBeDefined()
      }
    })

    it('accepts valid email', () => {
      const result = orderUpdateSchema.safeParse({ email: 'valid@test.com' })
      expect(result.success).toBe(true)
    })
  })

  describe('phone validation', () => {
    it('rejects invalid phone number', () => {
      const result = orderUpdateSchema.safeParse({ phone: '123' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'phone')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Invalid phone format')
      }
    })

    it('accepts valid international phone number', () => {
      const result = orderUpdateSchema.safeParse({ phone: '+380671234567' })
      expect(result.success).toBe(true)
    })

    it('accepts UA national format (no +) and normalizes to E.164', () => {
      const result = orderUpdateSchema.safeParse({ phone: '0991122345' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.phone).toBe('+380991122345')
      }
    })

    it('accepts international format with the leading + omitted', () => {
      const result = orderUpdateSchema.safeParse({ phone: '380991122345' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.phone).toBe('+380991122345')
      }
    })

    it('strips spaces and separators before validating', () => {
      const result = orderUpdateSchema.safeParse({ phone: '+38 (099) 112-23-45' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.phone).toBe('+380991122345')
      }
    })

    it('accepts empty string (emptyToNull → null → nullish)', () => {
      const result = orderUpdateSchema.safeParse({ phone: '' })
      expect(result.success).toBe(true)
    })
  })

  describe('age validation', () => {
    it('rejects age greater than 100', () => {
      const result = orderUpdateSchema.safeParse({ age: '101' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'age')
        expect(err).toBeDefined()
        expect(err?.message).toBe('Age must be at most 100')
      }
    })

    it('rejects non-positive age', () => {
      const result = orderUpdateSchema.safeParse({ age: '0' })
      expect(result.success).toBe(false)
    })

    it('rejects negative age', () => {
      const result = orderUpdateSchema.safeParse({ age: '-1' })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer age', () => {
      const result = orderUpdateSchema.safeParse({ age: '25.5' })
      expect(result.success).toBe(false)
    })

    it('accepts age 100', () => {
      const result = orderUpdateSchema.safeParse({ age: '100' })
      expect(result.success).toBe(true)
    })

    it('accepts age 1', () => {
      const result = orderUpdateSchema.safeParse({ age: '1' })
      expect(result.success).toBe(true)
    })
  })

  describe('sum and already_paid validation', () => {
    it('rejects negative sum', () => {
      const result = orderUpdateSchema.safeParse({ sum: '-1' })
      expect(result.success).toBe(false)
    })

    it('rejects negative already_paid', () => {
      const result = orderUpdateSchema.safeParse({ already_paid: '-1' })
      expect(result.success).toBe(false)
    })

    it('accepts zero sum', () => {
      const result = orderUpdateSchema.safeParse({ sum: '0' })
      expect(result.success).toBe(true)
    })

    it('accepts zero already_paid', () => {
      const result = orderUpdateSchema.safeParse({ already_paid: '0' })
      expect(result.success).toBe(true)
    })
  })

  describe('cross-field: already_paid <= sum', () => {
    it('rejects already_paid greater than sum', () => {
      const result = orderUpdateSchema.safeParse({ sum: '500', already_paid: '600' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const err = result.error.issues.find(i => i.path[0] === 'already_paid')
        expect(err).toBeDefined()
        expect(err?.message).toContain('Already paid cannot be greater than sum')
      }
    })

    it('accepts already_paid equal to sum', () => {
      const result = orderUpdateSchema.safeParse({ sum: '500', already_paid: '500' })
      expect(result.success).toBe(true)
    })

    it('accepts already_paid less than sum', () => {
      const result = orderUpdateSchema.safeParse({ sum: '1000', already_paid: '200' })
      expect(result.success).toBe(true)
    })

    it('skips cross-field check when sum is null', () => {
      const result = orderUpdateSchema.safeParse({ sum: '', already_paid: '999' })
      expect(result.success).toBe(true)
    })

    it('skips cross-field check when already_paid is null', () => {
      const result = orderUpdateSchema.safeParse({ sum: '100', already_paid: '' })
      expect(result.success).toBe(true)
    })
  })

  describe('transformations', () => {
    it('transforms course to UPPERCASE', () => {
      const result = orderUpdateSchema.safeParse({ course: 'nodejs' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.course).toBe('NODEJS')
      }
    })

    it('transforms course_format to lowercase', () => {
      const result = orderUpdateSchema.safeParse({ course_format: 'ONLINE' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.course_format).toBe('online')
      }
    })

    it('transforms course_type to lowercase', () => {
      const result = orderUpdateSchema.safeParse({ course_type: 'PRO' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.course_type).toBe('pro')
      }
    })

    it('transforms status to lowercase', () => {
      const result = orderUpdateSchema.safeParse({ status: 'In Work' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('in work')
      }
    })

    it('transforms empty string fields to null', () => {
      const result = orderUpdateSchema.safeParse({ name: '', surname: '' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBeNull()
        expect(result.data.surname).toBeNull()
      }
    })

    it('transforms whitespace-only string to null', () => {
      const result = orderUpdateSchema.safeParse({ name: '   ' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBeNull()
      }
    })
  })
})
