import { describe, it, expect } from 'vitest'
import { sortDirection } from './sortState'
import { columns } from '../config/columns'

describe('sortDirection', () => {
  describe('given no ordering', () => {
    it('then no column is marked', () => {
      expect(sortDirection(undefined, 'name')).toBeNull()
      expect(sortDirection('', 'name')).toBeNull()
    })
  })

  describe('given a column is sorted', () => {
    it('then it reports the direction', () => {
      expect(sortDirection('name', 'name')).toBe('asc')
      expect(sortDirection('-name', 'name')).toBe('desc')
    })
  })

  describe('given names that contain each other', () => {
    it('then only the sorted column is marked', () => {
      expect(sortDirection('surname', 'name')).toBeNull()
      expect(sortDirection('-surname', 'name')).toBeNull()
      expect(sortDirection('course_format', 'course')).toBeNull()
      expect(sortDirection('course_type', 'course')).toBeNull()
      expect(sortDirection('already_paid', 'id')).toBeNull()
      expect(sortDirection('manager', 'age')).toBeNull()
      expect(sortDirection('name', 'surname')).toBeNull()
    })
  })

  describe('given every column in turn', () => {
    it('then exactly one column is ever marked', () => {
      for (const {key} of columns) {
        const marked = columns.filter(({key: other}) => sortDirection(key, other) !== null)
        expect(marked.map(c => c.key)).toEqual([key])

        const markedDesc = columns.filter(({key: other}) => sortDirection(`-${key}`, other) !== null)
        expect(markedDesc.map(c => c.key)).toEqual([key])
      }
    })
  })
})
