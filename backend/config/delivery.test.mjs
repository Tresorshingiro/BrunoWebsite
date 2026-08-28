import { describe, it, expect } from 'vitest'
import delivery from './delivery.js'

const { DELIVERY_FEE, computeTotals } = delivery

describe('computeTotals', () => {
  it('charges the flat fee for standard delivery', () => {
    const r = computeTotals([{ price: 20000, quantity: 2 }], 'standard')
    expect(r).toEqual({ subtotal: 40000, deliveryFee: 2000, total: 42000 })
  })

  it('charges nothing for collection', () => {
    const r = computeTotals([{ price: 20000, quantity: 2 }], 'collect')
    expect(r).toEqual({ subtotal: 40000, deliveryFee: 0, total: 40000 })
  })

  it('sums multiple line items', () => {
    const r = computeTotals(
      [{ price: 20000, quantity: 1 }, { price: 15000, quantity: 3 }],
      'standard'
    )
    expect(r.subtotal).toBe(65000)
    expect(r.total).toBe(67000)
  })

  it('defaults an unknown method to standard rather than free', () => {
    // A typo or a tampered payload must never silently zero the fee.
    expect(computeTotals([{ price: 1000, quantity: 1 }], 'nonsense').deliveryFee)
      .toBe(DELIVERY_FEE)
  })

  it('rejects an empty basket', () => {
    expect(() => computeTotals([], 'standard')).toThrow(/empty/i)
  })

  it('rejects a non-positive price', () => {
    expect(() => computeTotals([{ price: 0, quantity: 1 }], 'standard'))
      .toThrow(/price/i)
  })

  it('rejects a non-positive quantity', () => {
    expect(() => computeTotals([{ price: 100, quantity: 0 }], 'standard'))
      .toThrow(/quantity/i)
  })

  it('rejects a fractional price', () => {
    // RWF has no minor unit. A fractional price is bad data, not something to
    // round away quietly — quantity is already held to the same standard.
    expect(() => computeTotals([{ price: 333.5, quantity: 3 }], 'standard'))
      .toThrow(/price/i)
  })
})
