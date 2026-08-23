import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { AnchorHTMLAttributes } from 'react'

vi.mock('next/link', () => ({
    default: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a href={href} {...rest}>{children}</a>
    ),
}))

import { Pagination } from './Pagination'
import type { ISearchParams } from '@/shared/model'

const info = (over: Partial<{ total_pages: number; prev: boolean; next: boolean }> = {}) => ({
    total_items: 100,
    total_pages: 5,
    prev: true,
    next: true,
    ...over,
})

const renderPagination = async (currentPage: number, currentParams?: ISearchParams, over = {}) =>
    render(await Pagination({
        currentPage,
        baseUrl: '/crm',
        paginationInfo: info(over),
        currentParams,
    }))

const hrefOf = (name: string) => screen.getByRole('link', { name }).getAttribute('href') as string

describe('Pagination', () => {
    describe('given active filters in the current params', () => {
        it('when a page number is rendered, then its link keeps the filters', async () => {
            await renderPagination(2, { name_contains: 'John', status: 'new', page: '2' })

            const href = hrefOf('3')
            expect(href).toContain('name_contains=John')
            expect(href).toContain('status=new')
            expect(href).toContain('page=3')
        })

        it('when the prev/next arrows are rendered, then they keep the filters too', async () => {
            await renderPagination(2, { name_contains: 'John', page: '2' })

            expect(hrefOf('<')).toContain('name_contains=John')
            expect(hrefOf('<')).toContain('page=1')
            expect(hrefOf('>')).toContain('name_contains=John')
            expect(hrefOf('>')).toContain('page=3')
        })

        it('then sorting is preserved as well', async () => {
            await renderPagination(1, { order: '-id', my: 'true', page: '1' })

            const href = hrefOf('2')
            expect(href).toContain('order=-id')
            expect(href).toContain('my=true')
        })
    })

    describe('given a row is expanded (orderId in params)', () => {
        it('when moving to another page, then orderId is dropped', async () => {
            await renderPagination(1, { orderId: '42', name_contains: 'John', page: '1' })

            const href = hrefOf('2')
            expect(href).not.toContain('orderId')
            expect(href).toContain('name_contains=John')
        })
    })

    describe('given no params are passed at all', () => {
        it('then links still carry the page number', async () => {
            await renderPagination(1)

            expect(hrefOf('2')).toContain('page=2')
        })
    })
})
