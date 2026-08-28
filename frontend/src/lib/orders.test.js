import { describe, it, expect } from 'vitest'
import {
  DELIVERY_FEE, formatRWF, formatAddress,
  statusLabel, statusTone, orderRef, isInProgress,
  TIMELINE_STAGES, stageDate, formatDate,
} from './orders'

describe('formatRWF', () => {
  it('groups thousands and appends the unit', () => {
    expect(formatRWF(42000)).toBe('42,000 RWF')
  })
  it('treats null and undefined as zero', () => {
    expect(formatRWF(null)).toBe('0 RWF')
    expect(formatRWF(undefined)).toBe('0 RWF')
  })
})

describe('formatAddress', () => {
  it('joins street, sector, district, province in that order', () => {
    expect(formatAddress({
      street: 'KK 15 Ave', sector: 'Gikondo',
      district: 'Kicukiro', province: 'Kigali City',
    })).toBe('KK 15 Ave, Gikondo, Kicukiro, Kigali City')
  })

  it('drops empty parts instead of leaving a stray comma', () => {
    // The old page rendered "Gikondo, Kigali, , Rwanda".
    expect(formatAddress({ sector: 'Gikondo', province: 'Kigali City' }))
      .toBe('Gikondo, Kigali City')
  })

  it('returns an empty string for an empty or missing address', () => {
    expect(formatAddress({})).toBe('')
    expect(formatAddress(undefined)).toBe('')
  })

  it('ignores whitespace-only fields', () => {
    expect(formatAddress({ street: '   ', sector: 'Gikondo' })).toBe('Gikondo')
  })
})

describe('statusLabel', () => {
  it('renames the enum for customers', () => {
    expect(statusLabel('paid')).toBe('Preparing')
    expect(statusLabel('processing')).toBe('Preparing')
    expect(statusLabel('shipped')).toBe('On the way')
    expect(statusLabel('delivered')).toBe('Delivered')
    expect(statusLabel('pending')).toBe('Awaiting payment')
  })
  it('falls back readably on an unknown status', () => {
    expect(statusLabel('weird')).toBe('Weird')
  })
})

describe('statusTone', () => {
  it('maps colour to meaning, not to status name', () => {
    // Previously Paid and Delivered were both green, so the badge said nothing.
    expect(statusTone('paid')).toBe('amber')
    expect(statusTone('shipped')).toBe('sky')
    expect(statusTone('delivered')).toBe('moss')
    expect(statusTone('cancelled')).toBe('rose')
  })

  it('falls back to neutral for unpaid, refunded and unknown', () => {
    expect(statusTone('pending')).toBe('neutral')
    expect(statusTone('refunded')).toBe('neutral')
    expect(statusTone('nonsense')).toBe('neutral')
  })
})

describe('orderRef', () => {
  it('is the last 8 characters of the id, uppercased', () => {
    expect(orderRef({ _id: '65f1a2b3c4d5e676ffba25' })).toBe('#76FFBA25')
  })
})

describe('isInProgress', () => {
  it('is true while the customer is waiting for something', () => {
    expect(isInProgress({ status: 'paid' })).toBe(true)
    expect(isInProgress({ status: 'processing' })).toBe(true)
    expect(isInProgress({ status: 'shipped' })).toBe(true)
  })
  it('excludes unpaid, finished and cancelled orders', () => {
    // An unpaid order is not "in progress" — no work is happening on it.
    expect(isInProgress({ status: 'pending' })).toBe(false)
    expect(isInProgress({ status: 'delivered' })).toBe(false)
    expect(isInProgress({ status: 'cancelled' })).toBe(false)
  })
})

describe('DELIVERY_FEE', () => {
  it('matches the backend constant', () => {
    expect(DELIVERY_FEE).toBe(2000)
  })
})

describe('TIMELINE_STAGES', () => {
  it('is the four customer-facing stages, in order', () => {
    expect(TIMELINE_STAGES.map((s) => s.key)).toEqual(['placed', 'packed', 'out', 'done'])
  })
})

describe('stageDate', () => {
  const placed = TIMELINE_STAGES[0]
  const done = TIMELINE_STAGES[3]

  it('returns null when the order has no history at all', () => {
    expect(stageDate({}, placed)).toBeNull()
    expect(stageDate(undefined, placed)).toBeNull()
  })

  it('returns the date of the entry that completes the stage', () => {
    const order = { statusHistory: [
      { status: 'pending', at: '2026-08-01T10:00:00Z' },
      { status: 'paid', at: '2026-08-02T10:00:00Z' },
    ] }
    expect(stageDate(order, placed).toISOString()).toBe('2026-08-02T10:00:00.000Z')
  })

  it('returns null for a stage that has not happened', () => {
    const order = { statusHistory: [{ status: 'paid', at: '2026-08-02T10:00:00Z' }] }
    expect(stageDate(order, done)).toBeNull()
  })

  it('reads chronologically, not in array order', () => {
    // Both entries satisfy "placed". The earlier one must win even though it
    // is second in the array — otherwise a stage reports a later event's date.
    const order = { statusHistory: [
      { status: 'shipped', at: '2026-08-05T10:00:00Z' },
      { status: 'paid', at: '2026-08-02T10:00:00Z' },
    ] }
    expect(stageDate(order, placed).toISOString()).toBe('2026-08-02T10:00:00.000Z')
  })

  it('ignores entries with no timestamp rather than throwing', () => {
    const order = { statusHistory: [{ status: 'paid' }, { status: 'paid', at: '2026-08-02T10:00:00Z' }] }
    expect(stageDate(order, placed).toISOString()).toBe('2026-08-02T10:00:00.000Z')
  })
})

describe('formatDate', () => {
  it('renders a readable day, month and year', () => {
    expect(formatDate('2026-08-27T10:00:00Z')).toBe('27 August 2026')
  })
  it('returns an empty string for nothing', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
  })
})
