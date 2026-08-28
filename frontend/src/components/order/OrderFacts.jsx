import { formatAddress, formatDate } from '../../lib/orders'

const METHOD_NAMES = {
  momo: 'MTN Mobile Money',
  airtel: 'Airtel Money',
  card: 'Card',
  bank: 'Bank transfer',
}

function Card({ title, children }) {
  return (
    <div className="bg-ink-50 border border-ink-950/[.14] rounded-card p-5 md:p-7">
      <h2 className="font-serif text-xl text-ink-900 mb-4">{title}</h2>
      <dl>{children}</dl>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <>
      <dt className="text-[.68rem] uppercase tracking-[.16em] text-ink-500 mb-1.5">{label}</dt>
      <dd className="m-0 mb-4 last:mb-0 text-[.95rem] text-ink-800">{children}</dd>
    </>
  )
}

export default function OrderFacts({ order }) {
  const address = formatAddress(order.shippingAddress)
  const collecting = order.deliveryMethod === 'collect'

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Card title={collecting ? 'Collection' : 'Delivering to'}>
        <Row label={collecting ? 'Arrangement' : 'Address'}>
          {collecting
            ? <>Pick up in person — we will call to arrange a time.</>
            : <>{order.customerName}{address && <><br />{address}</>}</>}
        </Row>
        <Row label="Phone">{order.customerPhone}</Row>
      </Card>

      <Card title="Paid with">
        <Row label="Method">{METHOD_NAMES[order.paymentMethod] || '—'}</Row>
        <Row label="Date">{formatDate(order.createdAt)}</Row>
      </Card>
    </div>
  )
}
