import { describe, it, expect } from 'vitest'
import { orderingToggle } from './orderingParamsToggle'

describe('orderingToggle', () => {
  // ── initial activation (no current ordering) ─────────────────────────────────

  it('returns the field name when param is empty (first click → asc)', () => {
    expect(orderingToggle('', 'name')).toBe('name')
  })

  it('returns the field when param is a different field (switch field → asc)', () => {
    expect(orderingToggle('email', 'name')).toBe('name')
  })

  it('returns the field when param is the negative of a different field', () => {
    expect(orderingToggle('-email', 'name')).toBe('name')
  })

  // ── toggling asc → desc ───────────────────────────────────────────────────────

  it('prepends "-" when currently sorted asc on the same field (asc → desc)', () => {
    expect(orderingToggle('name', 'name')).toBe('-name')
  })

  it('prepends "-" for a numeric field (asc → desc)', () => {
    expect(orderingToggle('age_eq', 'age_eq')).toBe('-age_eq')
  })

  // ── toggling desc → asc ───────────────────────────────────────────────────────

  it('removes "-" when currently sorted desc on the same field (desc → asc)', () => {
    expect(orderingToggle('-name', 'name')).toBe('name')
  })

  it('removes "-" for created_at (desc → asc)', () => {
    expect(orderingToggle('-created_at', 'created_at')).toBe('created_at')
  })

  // ── multi-cycle consistency ──────────────────────────────────────────────────

  it('cycles correctly through none → asc → desc → asc', () => {
    const field = 'status'
    const step1 = orderingToggle('', field)         // → 'status'
    const step2 = orderingToggle(step1, field)       // → '-status'
    const step3 = orderingToggle(step2, field)       // → 'status'

    expect(step1).toBe('status')
    expect(step2).toBe('-status')
    expect(step3).toBe('status')
  })

  // ── switching fields mid-sort ────────────────────────────────────────────────

  it('resets to asc for the new field when currently sorting desc on a different field', () => {
    // User was on -name, now clicks "email"
    expect(orderingToggle('-name', 'email')).toBe('email')
  })

  it('resets to asc for the new field when currently sorting asc on a different field', () => {
    expect(orderingToggle('name', 'email')).toBe('email')
  })

  // ── edge: field with existing "-" prefix in its name ────────────────────────

  it('handles field names that contain underscores', () => {
    expect(orderingToggle('created_at', 'created_at')).toBe('-created_at')
    expect(orderingToggle('-created_at', 'created_at')).toBe('created_at')
  })

  // ── OrderTable integration: params.order starts as '' (no sort) ─────────────

  it('first sort click (params.order is empty string) returns field', () => {
    expect(orderingToggle('', 'course')).toBe('course')
  })
})
