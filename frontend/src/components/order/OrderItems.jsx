import { formatRWF } from '../../lib/orders'
import { cldResize } from '../../lib/images'

export default function OrderItems({ order }) {
  /* "Paid" is a factual claim about money, so only say it when money was
     received and kept. A refunded order says so; anything not yet settled is
     just a total. */
  const totalLabel =
    order.status === 'refunded' ? 'Refunded'
      : ['paid', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'Paid'
      : 'Total'

  return (
    <>
      {(order.items || []).map((item, i) => (
        <div key={i} className="grid grid-cols-[52px_minmax(0,1fr)_auto] gap-4 items-center py-3 border-b border-ink-950/[.14] last:border-b-0">
          {item.coverImage
            ? <img src={cldResize(item.coverImage, 104)} alt="" className="aspect-[2/3] w-full object-cover rounded-edge" />
            : <div className="aspect-[2/3] w-full rounded-edge bg-brand-900" />}
          <div className="min-w-0">
            <div className="font-semibold text-ink-900 truncate">{item.title}</div>
            <div className="text-sm text-ink-500">
              Paperback · qty {item.quantity}{order.signed ? ' · signed' : ''}
            </div>
          </div>
          <div className="font-semibold text-ink-900 whitespace-nowrap">
            {formatRWF(item.price * item.quantity)}
          </div>
        </div>
      ))}

      <div className="pt-3">
        <div className="flex justify-between py-1 text-sm">
          <span className="text-ink-600">Subtotal</span>
          <span className="font-semibold">{formatRWF(order.subtotal)}</span>
        </div>
        <div className="flex justify-between py-1 text-sm">
          <span className="text-ink-600">
            {order.deliveryMethod === 'collect' ? 'Collection' : 'Standard delivery'}
          </span>
          <span className="font-semibold">
            {order.deliveryFee ? formatRWF(order.deliveryFee) : 'Free'}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-ink-950/[.14]">
        <span className="font-semibold text-sm">
          {totalLabel}
        </span>
        <span className="font-serif text-2xl text-ink-900">{formatRWF(order.totalAmount)}</span>
      </div>
    </>
  )
}
