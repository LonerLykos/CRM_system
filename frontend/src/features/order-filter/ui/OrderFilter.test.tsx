// BDD-style behaviour spec for the OrderFilter client component.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// --- Mock next/navigation ---
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
    usePathname: () => '/crm',
    useRouter: () => ({ replace: mockReplace }),
    useSearchParams: () => new URLSearchParams(),
}))

// --- Mock use-debounce: pass the callback through synchronously (no delay) ---
vi.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: (...args: unknown[]) => unknown) => fn,
}))

// --- Mock ExportButton (irrelevant to filter behaviour) ---
vi.mock('@/features/order-export', () => ({
    ExportButton: () => <a href="/api/orders/export">Export Excel</a>,
}))

import { OrderFilter } from './OrderFilter'
import type { ISearchParams } from '@/shared/model'
import type { IChoicesResponse, IGroupResponse } from '@/entities/crm'

// ── Fixtures ─────────────────────────────────────────────────────────────────
// IChoicesResponse keys match the backend response AND the filterSet keys
// (course / course_type / course_format / status), so those fields render as
// <select> dropdowns. The group field renders an "All groups" <select> driven
// by the groups array (option value = group id). The remaining filterSet keys
// render as text <input>s.
const emptyParams: ISearchParams = {}

const choices: IChoicesResponse = {
    course: {
        FS: 'Fullstack',
        QACX: 'QA Complex',
        JCX: 'Java Complex',
        JSCX: 'JavaScript Complex',
        FE: 'Frontend',
        PCX: 'Python Complex',
    },
    course_type: {
        pro: 'Pro',
        minimal: 'Minimal',
        premium: 'Premium',
        incubator: 'Incubator',
        vip: 'VIP',
    },
    course_format: {
        static: 'Static',
        online: 'Online',
    },
    status: {
        new: 'New',
        in_work: 'In Work',
        agree: 'Agree',
        disagree: 'Disagree',
        dubbing: 'Dubbing',
    },
}

const groups: IGroupResponse[] = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const renderFilter = (params: ISearchParams = emptyParams) =>
    render(<OrderFilter params={params} choices={choices} groups={groups} />)

// Several <select>s render (course/type/format/status/group). Pick the group
// one by the option it uniquely contains.
const getGroupSelect = () =>
    screen
        .getAllByRole('combobox')
        .find((el) => within(el).queryByRole('option', { name: 'Alpha' })) as HTMLSelectElement

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OrderFilter', () => {
    beforeEach(() => {
        mockReplace.mockReset()
    })

    // ── Text inputs ───────────────────────────────────────────────────────────

    describe('given an empty filter state', () => {
        it('when the user types in the Name field, then replace is called with name_contains in the query', async () => {
            renderFilter()
            const nameInput = screen.getByPlaceholderText('Name...')
            await userEvent.type(nameInput, 'Jo')

            const lastCall = mockReplace.mock.calls.at(-1)![0] as string
            expect(lastCall).toContain('name_contains=Jo')
            expect(lastCall).toContain('page=1')
        })

        it('when the user types in the Surname field, then replace is called with surname_contains', async () => {
            renderFilter()
            const input = screen.getByPlaceholderText('Surname...')
            await userEvent.type(input, 'Doe')

            const lastCall = mockReplace.mock.calls.at(-1)![0] as string
            expect(lastCall).toContain('surname_contains=Doe')
            expect(lastCall).toContain('page=1')
        })

        it('when the user types in the Email field, then replace is called with email_contains', async () => {
            renderFilter()
            const input = screen.getByPlaceholderText('Email...')
            await userEvent.type(input, 'test@')

            const lastCall = mockReplace.mock.calls.at(-1)![0] as string
            expect(lastCall).toContain('email_contains=test')
        })
    })

    // ── Choice selects (course/status/...) ──────────────────────────────────────

    describe('given choices are provided', () => {
        it('then the Course field renders as a <select> populated from choices.course', () => {
            renderFilter()
            const courseSelect = screen
                .getAllByRole('combobox')
                .find((el) => within(el).queryByRole('option', { name: 'Fullstack' }))
            expect(courseSelect).toBeTruthy()
            expect(within(courseSelect!).getByRole('option', { name: 'QA Complex' })).toBeInTheDocument()
        })

        it('when the user picks a status, then replace is called with the status param', async () => {
            renderFilter()
            const statusSelect = screen
                .getAllByRole('combobox')
                .find((el) => within(el).queryByRole('option', { name: 'Dubbing' })) as HTMLSelectElement
            await userEvent.selectOptions(statusSelect, 'in_work')

            const lastCall = mockReplace.mock.calls.at(-1)![0] as string
            expect(lastCall).toContain('status=in_work')
            expect(lastCall).toContain('page=1')
        })
    })

    // ── Select — groups ───────────────────────────────────────────────────────

    describe('given groups are provided', () => {
        it('when the user selects a group, then replace is called with the group id', async () => {
            renderFilter()
            await userEvent.selectOptions(getGroupSelect(), '1')

            const lastCall = mockReplace.mock.calls.at(-1)![0] as string
            expect(lastCall).toContain('group=1')
            expect(lastCall).toContain('page=1')
        })

        it('when the user selects a different group, then replace is called with the new group id', async () => {
            renderFilter()
            await userEvent.selectOptions(getGroupSelect(), '2')

            const lastCall = mockReplace.mock.calls.at(-1)![0] as string
            expect(lastCall).toContain('group=2')
        })
    })

    // ── My checkbox ───────────────────────────────────────────────────────────

    describe('given the My checkbox is unchecked', () => {
        it('when the user checks it, then replace is called with my=true', async () => {
            renderFilter()
            const checkbox = screen.getByRole('checkbox')
            await userEvent.click(checkbox)

            expect(mockReplace).toHaveBeenCalledTimes(1)
            const url = mockReplace.mock.calls[0][0] as string
            expect(url).toContain('my=true')
            expect(url).toContain('page=1')
        })
    })

    describe('given the My checkbox starts checked (params.my=true)', () => {
        it('when the user unchecks it, then replace is called without the my param', async () => {
            renderFilter({ my: 'true' })
            const checkbox = screen.getByRole('checkbox')
            await userEvent.click(checkbox)

            const url = mockReplace.mock.calls[0][0] as string
            expect(url).not.toContain('my=true')
            expect(url).toContain('page=1')
        })
    })

    // ── Reset button ──────────────────────────────────────────────────────────

    describe('given active filters in params', () => {
        it('when the user clicks Reset filters, then replace is called with only navigation keys and page=1', async () => {
            renderFilter({
                name_contains: 'John',
                status: 'new',
                my: 'true',
                page: '3',
                order: '-id',
            })
            await userEvent.click(screen.getByRole('button', { name: /reset filters/i }))

            expect(mockReplace).toHaveBeenCalledTimes(1)
            const url = mockReplace.mock.calls[0][0] as string

            expect(url).toContain('order=-id')
            expect(url).not.toContain('name_contains')
            expect(url).not.toContain('status')
            expect(url).not.toContain('my=true')
            expect(url).toContain('page=1')
        })
    })

    describe('given no active filters', () => {
        it('when the user clicks Reset filters, then replace is called with page=1', async () => {
            renderFilter()
            await userEvent.click(screen.getByRole('button', { name: /reset filters/i }))

            const url = mockReplace.mock.calls[0][0] as string
            expect(url).toContain('page=1')
        })
    })

    describe('given navigation key orderId is set', () => {
        it('when the user clicks Reset filters, then orderId is preserved', async () => {
            renderFilter({ orderId: '42', name_contains: 'Alice' })
            await userEvent.click(screen.getByRole('button', { name: /reset filters/i }))

            const url = mockReplace.mock.calls[0][0] as string
            expect(url).toContain('orderId=42')
            expect(url).not.toContain('name_contains')
        })
    })

    // ── Date inputs ───────────────────────────────────────────────────────────

    describe('given the Created before date filter', () => {
        it('when the user changes the date, then replace is called with created_at_lte', async () => {
            renderFilter()
            const dateInput = screen.getByTitle('Created before')
            await userEvent.type(dateInput, '2024-01-15')

            const lastCall = mockReplace.mock.calls.at(-1)![0] as string
            expect(lastCall).toContain('created_at_lte=')
        })
    })

    describe('given the Created after date filter', () => {
        it('when the user changes the date, then replace is called with created_at_gte', async () => {
            renderFilter()
            const dateInput = screen.getByTitle('Created after')
            await userEvent.type(dateInput, '2024-01-01')

            const lastCall = mockReplace.mock.calls.at(-1)![0] as string
            expect(lastCall).toContain('created_at_gte=')
        })
    })

    // ── Pre-populated params reflected in inputs ───────────────────────────────

    describe('given params contain name_contains', () => {
        it('when rendered, then the Name input is pre-filled with the param value', () => {
            renderFilter({ name_contains: 'Alice' })
            const nameInput = screen.getByPlaceholderText('Name...')
            expect((nameInput as HTMLInputElement).defaultValue).toBe('Alice')
        })
    })
})
