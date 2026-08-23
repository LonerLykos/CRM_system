import { describe, it, expect } from 'vitest'
import { extractApiError } from './extractApiError'

const FALLBACK = 'Failed to create user'

describe('extractApiError', () => {
    describe('given a DRF field error', () => {
        it('when the field is mentioned in the message, then the message is returned untouched', () => {
            const error = { statusText: 'Bad Request', email: ['User with this email already exists'] }
            expect(extractApiError(error, FALLBACK)).toBe('User with this email already exists')
        })

        it('when the message does not name the field, then the field name is prefixed', () => {
            const error = { statusText: 'Bad Request', name: ['This field is required.'] }
            expect(extractApiError(error, FALLBACK)).toBe('Name: This field is required.')
        })

        it('when the value is a bare string rather than a list, then it is still read', () => {
            const error = { statusText: 'Bad Request', surname: 'Too long' }
            expect(extractApiError(error, FALLBACK)).toBe('Surname: Too long')
        })

        it('when the field name is snake_case, then it is humanised', () => {
            const error = { already_paid: ['Must be a number.'] }
            expect(extractApiError(error, FALLBACK)).toBe('Already paid: Must be a number.')
        })
    })

    describe('given several error keys', () => {
        it('then detail wins over field errors', () => {
            const error = { detail: 'Not authorised', email: ['Already exists'] }
            expect(extractApiError(error, FALLBACK)).toBe('Not authorised')
        })

        it('then non_field_errors wins over a named field and keeps no prefix', () => {
            const error = { email: ['Already exists'], non_field_errors: ['Something is off'] }
            expect(extractApiError(error, FALLBACK)).toBe('Something is off')
        })
    })

    describe('given nothing usable', () => {
        it('when the error is null, then the fallback is returned', () => {
            expect(extractApiError(null, FALLBACK)).toBe(FALLBACK)
        })

        it('when only statusText is present, then statusText is returned', () => {
            expect(extractApiError({ statusText: 'Bad Request' }, FALLBACK)).toBe('Bad Request')
        })

        it('when the field lists are empty, then the fallback is returned', () => {
            expect(extractApiError({ email: [] }, FALLBACK)).toBe(FALLBACK)
        })

        it('when a value is blank, then it is skipped in favour of the next key', () => {
            const error = { email: ['   '], name: ['Required'] }
            expect(extractApiError(error, FALLBACK)).toBe('Name: Required')
        })
    })
})
