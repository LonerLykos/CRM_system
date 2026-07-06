// TDD-style unit tests for rebuildParams.
import { describe, it, expect } from 'vitest'
import { rebuildParams } from './rebuildParams'
import type { ISearchParams } from '@/shared/model'

describe('rebuildParams', () => {
  // ── basic merging ────────────────────────────────────────────────────────────

  it('returns serialised params when patch introduces a new key', () => {
    const result = rebuildParams({ page: '1' }, { order: 'name' })
    expect(result).toBe('page=1&order=name')
  })

  it('patch value overwrites the existing key', () => {
    const result = rebuildParams({ page: '1', order: 'name' }, { order: '-name' })
    expect(result).toBe('page=1&order=-name')
  })

  it('preserves params not mentioned in the patch', () => {
    const base: ISearchParams = { page: '2', status: 'New', order: 'name' }
    const result = rebuildParams(base, { status: 'In work' })
    expect(result).toContain('status=In+work')
    expect(result).toContain('page=2')
    expect(result).toContain('order=name')
  })

  // ── orderId toggle ───────────────────────────────────────────────────────────

  it('removes orderId when same orderId is passed in the patch (toggle close)', () => {
    const base: ISearchParams = { orderId: '42', page: '1' }
    const result = rebuildParams(base, { orderId: '42' })
    expect(result).not.toContain('orderId')
  })

  it('keeps orderId when a different orderId is passed', () => {
    const base: ISearchParams = { orderId: '42', page: '1' }
    const result = rebuildParams(base, { orderId: '99' })
    expect(result).toContain('orderId=99')
    expect(result).not.toContain('orderId=42')
  })

  it('adds orderId when none existed before', () => {
    const result = rebuildParams({ page: '1' }, { orderId: '7' })
    expect(result).toContain('orderId=7')
  })

  // ── page-changing strips orderId ─────────────────────────────────────────────

  it('removes orderId when patch changes the page', () => {
    const base: ISearchParams = { page: '1', orderId: '5' }
    const result = rebuildParams(base, { page: '2' })
    expect(result).not.toContain('orderId')
    expect(result).toContain('page=2')
  })

  it('keeps orderId when patch does NOT change the page', () => {
    const base: ISearchParams = { page: '1', orderId: '5', order: 'name' }
    const result = rebuildParams(base, { order: '-name' })
    expect(result).toContain('orderId=5')
  })

  // ── error clearing ───────────────────────────────────────────────────────────

  it('removes the error key when the patch does not contain error', () => {
    const base: ISearchParams = { page: '1', error: 'some_error' }
    const result = rebuildParams(base, { order: 'name' })
    expect(result).not.toContain('error')
  })

  it('keeps the error key when the patch explicitly sets error', () => {
    const base: ISearchParams = { page: '1' }
    const result = rebuildParams(base, { error: 'auth_failed' })
    expect(result).toContain('error=auth_failed')
  })

  it('does NOT strip error when patch is only an error key', () => {
    // 'error' in newValue → skip removal branch
    const result = rebuildParams({ page: '1' }, { error: 'bad' })
    expect(result).toContain('error=bad')
  })

  // ── empty / cleaning ─────────────────────────────────────────────────────────

  it('omits keys with empty-string values from both base and patch', () => {
    const result = rebuildParams({ page: '1', order: '' }, { status: '' })
    expect(result).toBe('page=1')
  })

  it('returns empty string when all merged values are empty', () => {
    expect(rebuildParams({ page: '' }, { order: '' })).toBe('')
  })

  // ── empty patch ──────────────────────────────────────────────────────────────

  it('with empty patch keeps error in base (patch has length 0, skip error removal)', () => {
    // Object.keys({}).length === 0 → error-removal branch is skipped
    const base: ISearchParams = { page: '1', error: 'oops' }
    const result = rebuildParams(base, {})
    expect(result).toContain('error=oops')
    expect(result).toContain('page=1')
  })
})
