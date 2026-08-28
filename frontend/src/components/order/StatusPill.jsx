import { statusLabel, statusTone } from '../../lib/orders'

export default function StatusPill({ status }) {
  return <span className={`status status-${statusTone(status)}`}>{statusLabel(status)}</span>
}
