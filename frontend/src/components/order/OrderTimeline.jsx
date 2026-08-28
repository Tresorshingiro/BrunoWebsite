import { Check } from 'lucide-react'
import { TIMELINE_STAGES, stageDate, formatDate } from '../../lib/orders'

/* Copy for stages that have not happened yet. Once a stage completes we print
   its real date from statusHistory instead — never a guess. */
const PENDING_COPY = {
  placed: 'As soon as payment is confirmed.',
  packed: 'Within a day or two — signing adds a little time.',
  out: 'The courier will call before arriving.',
  done: 'We will mark this once it reaches you.',
}

export default function OrderTimeline({ order }) {
  return (
    <div>
      {TIMELINE_STAGES.map((stage) => {
        const at = stageDate(order, stage)
        return (
          <div key={stage.key} className={`tstep ${at ? 'tstep-done' : ''}`}>
            <span className="tdot">
              {at && <Check className="w-3 h-3 text-ink-50" strokeWidth={3} />}
            </span>
            <div>
              <h3 className={`font-sans text-base font-semibold ${at ? 'text-brand-900' : 'text-ink-900'}`}>
                {stage.title}
              </h3>
              <p className="text-sm text-ink-600 mt-0.5">
                {at ? formatDate(at) : PENDING_COPY[stage.key]}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
