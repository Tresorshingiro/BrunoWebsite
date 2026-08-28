import { useState } from 'react'
import { orderRef } from '../../lib/orders'

export default function OrderRef({ order, onDark = false }) {
  const [copied, setCopied] = useState(false)
  const ref = orderRef(order)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ref)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard is unavailable over plain http and in some browsers.
      // The reference is visible either way, so fail quietly.
    }
  }

  return (
    <span className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm ${
      onDark ? 'border-ink-100/20 text-ink-100/75' : 'border-ink-950/15 text-ink-600'
    }`}>
      Order <b className={onDark ? 'text-ink-50' : 'text-ink-900'}>{ref}</b>
      <button
        type="button" onClick={copy}
        className={`text-xs font-semibold ${onDark ? 'text-brand-300' : 'text-brand-600'}`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </span>
  )
}
