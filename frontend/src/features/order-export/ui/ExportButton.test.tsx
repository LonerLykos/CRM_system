// BDD-style behaviour spec for the ExportButton client component.
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ExportButton } from './ExportButton'

const exportQuery = () =>
    new URL(screen.getByRole('link').getAttribute('href')!, 'http://localhost').searchParams

describe('ExportButton', () => {
    describe('given a group is selected in the filter', () => {
        it('then the export link carries the same group id', () => {
            render(<ExportButton params={{ group: '3' }} />)

            expect(exportQuery().get('group')).toBe('3')
        })
    })

    describe('given several filters and a sort', () => {
        it('then every one of them is forwarded to the export', () => {
            render(
                <ExportButton
                    params={{
                        name_contains: 'Jo',
                        status: 'new',
                        group: '2',
                        created_at_gte: '2031-05-17',
                        created_at_lte: '2031-05-17',
                        my: 'true',
                        order: '-id',
                    }}
                />,
            )

            const query = exportQuery()
            expect(query.get('name_contains')).toBe('Jo')
            expect(query.get('status')).toBe('new')
            expect(query.get('group')).toBe('2')
            expect(query.get('created_at_gte')).toBe('2031-05-17')
            expect(query.get('created_at_lte')).toBe('2031-05-17')
            expect(query.get('my')).toBe('true')
            expect(query.get('order')).toBe('-id')
        })
    })

    describe('given page / modal state in the URL', () => {
        it('then navigation-only keys are not sent to the export', () => {
            render(
                <ExportButton
                    params={{ page: '4', orderId: '9', update_order: '9', error: 'x', status: 'agree' }}
                />,
            )

            const query = exportQuery()
            expect(query.get('status')).toBe('agree')
            expect(query.has('page')).toBe(false)
            expect(query.has('orderId')).toBe(false)
            expect(query.has('update_order')).toBe(false)
            expect(query.has('error')).toBe(false)
        })
    })

    describe('given no filters', () => {
        it('then the link points at the bare export route', () => {
            render(<ExportButton params={{}} />)

            expect(screen.getByRole('link')).toHaveAttribute('href', '/api/orders/export')
        })
    })
})
