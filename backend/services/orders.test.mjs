import { describe, it, expect, vi, beforeEach } from 'vitest'
import ordersModule from './orders.js'

vi.mock('./orderEmail.js', () => ({ sendOrderConfirmation: vi.fn() }))

const { assertPaymentMatches, markOrderPaid } = ordersModule

const goodOrder = () => ({
  _id: 'order-1',
  txRef: 'BRUNO-123-ABCDEF',
  totalAmount: 42000,
  status: 'pending',
  statusHistory: [],
  save: vi.fn().mockResolvedValue(undefined),
})

const goodFlw = () => ({
  status: 'successful',
  currency: 'RWF',
  amount: 42000,
  tx_ref: 'BRUNO-123-ABCDEF',
  id: 987654,
  payment_type: 'mobilemoneyrw',
})

describe('assertPaymentMatches', () => {
  it('passes when everything lines up', () => {
    expect(() => assertPaymentMatches(goodOrder(), goodFlw())).not.toThrow()
  })

  it('rejects a transaction that did not succeed', () => {
    expect(() => assertPaymentMatches(goodOrder(), { ...goodFlw(), status: 'failed' }))
      .toThrow(/status/i)
  })

  it('rejects a different currency', () => {
    // Guards against an account misconfigured to present USD.
    expect(() => assertPaymentMatches(goodOrder(), { ...goodFlw(), currency: 'USD' }))
      .toThrow(/currency/i)
  })

  it('rejects a mismatched tx_ref', () => {
    expect(() => assertPaymentMatches(goodOrder(), { ...goodFlw(), tx_ref: 'BRUNO-999-ZZZZZZ' }))
      .toThrow(/reference/i)
  })

  it('rejects an underpayment', () => {
    // The whole point: paying 100 must never settle a 42,000 order.
    expect(() => assertPaymentMatches(goodOrder(), { ...goodFlw(), amount: 100 }))
      .toThrow(/amount/i)
  })

  it('accepts an overpayment', () => {
    expect(() => assertPaymentMatches(goodOrder(), { ...goodFlw(), amount: 50000 }))
      .not.toThrow()
  })

  it('rejects a response with no amount at all', () => {
    // Number(undefined) is NaN and NaN < x is false — this must not pass.
    const flw = goodFlw()
    delete flw.amount
    expect(() => assertPaymentMatches(goodOrder(), flw)).toThrow(/not a number/i)
  })

  it('rejects a non-numeric amount', () => {
    expect(() => assertPaymentMatches(goodOrder(), { ...goodFlw(), amount: 'lots' }))
      .toThrow(/not a number/i)
  })

  it('compares against this order total, not a fixed number', () => {
    // Catches a hardcoded threshold: 42000 would satisfy a literal 42000 check
    // but must be rejected against an order that actually costs 90000.
    const order = { ...goodOrder(), totalAmount: 90000 }
    expect(() => assertPaymentMatches(order, goodFlw())).toThrow(/amount/i)
  })
})

describe('markOrderPaid', () => {
  let order
  beforeEach(() => { order = goodOrder() })

  it('marks a pending order paid and records history', async () => {
    await markOrderPaid(order, goodFlw())
    expect(order.status).toBe('paid')
    expect(order.flwTransactionId).toBe('987654')
    expect(order.statusHistory).toHaveLength(1)
    expect(order.statusHistory[0].status).toBe('paid')
    expect(order.save).toHaveBeenCalledOnce()
  })

  it('is idempotent — the webhook and the browser callback both arrive', async () => {
    await markOrderPaid(order, goodFlw())
    order.save.mockClear()
    await markOrderPaid(order, goodFlw())
    expect(order.status).toBe('paid')
    expect(order.statusHistory).toHaveLength(1)
    expect(order.save).not.toHaveBeenCalled()
  })

  it('leaves the order pending when verification fails', async () => {
    await expect(markOrderPaid(order, { ...goodFlw(), amount: 1 })).rejects.toThrow(/amount/i)
    expect(order.status).toBe('pending')
    expect(order.save).not.toHaveBeenCalled()
  })
})
