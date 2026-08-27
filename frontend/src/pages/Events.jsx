import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Clock, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { eventsApi, subscribeApi } from '../lib/api'
import { cldResize, cldSrcSet } from '../lib/images'
import Reveal from '../components/Reveal'
import ClipWords from '../components/ClipWords'
import { useHeroLoad, usePointerTilt } from '../hooks/useMotion'
import toast from 'react-hot-toast'

const FORMATS = [
  { name: 'Keynote', body: 'A 30–45 minute talk built around the testimony, adapted to your audience.' },
  { name: 'Workshop', body: 'A longer, participatory session on the practical work of forgiveness.' },
  { name: 'Reading & Q&A', body: 'Readings from the book, open conversation, and signing afterwards.' },
]

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const dayKey = (d) => {
  const date = new Date(d)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

const parts = (d) => {
  const date = new Date(d)
  return {
    m: date.toLocaleDateString('en-US', { month: 'short' }),
    d: String(date.getDate()).padStart(2, '0'),
    y: date.getFullYear(),
    full: date.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }),
  }
}

/* ── One event row. The date block leans out on hover; the photo tilts. ──── */
function EventRow({ event, past, delay }) {
  const mediaRef = usePointerTilt({ max: 6 })
  const p = parts(event.date)
  const online = event.type === 'online'

  return (
    <Reveal as="div" delay={delay}>
      <Link to={`/events/${event._id}`} className="ev-row group stage">
        <div className="ev-date">
          <div className="m">{p.m}</div>
          <div className="d">{p.d}</div>
          <div className="y">{p.y}</div>
        </div>

        <div ref={mediaRef} className="ev-media">
          {event.image && (
            <img
              src={cldResize(event.image, 260)}
              srcSet={cldSrcSet(event.image, 260)}
              alt=""
              loading="lazy"
              decoding="async"
            />
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <span className={`badge ${online ? 'b-online' : 'b-inperson'}`}>
              {online ? 'Online' : 'In person'}
            </span>
            {past && <span className="badge b-past">Past</span>}
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-semibold text-ink-950 leading-tight transition-colors group-hover:text-brand-700">
            {event.title}
          </h3>
          <div className="ev-where mt-2.5 mb-2">
            <span>
              <MapPin size={14} className="text-brand-600 shrink-0" />
              {event.location}
            </span>
            {event.time && (
              <span>
                <Clock size={14} className="text-brand-600 shrink-0" />
                {event.time}
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-ink-600 leading-relaxed max-w-[48ch] line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        <div className="ev-go">
          <span className={past ? 'btn-secondary' : 'btn-primary'}>
            {past ? 'View details' : 'View event'} <ArrowRight size={15} className="arw" />
          </span>
        </div>
      </Link>
    </Reveal>
  )
}

/* ── Month calendar ───────────────────────────────────────────────────────
   Kept at the owner's request. The risk with a month grid on a site with a
   handful of events a year is that an empty month reads as a broken feature,
   so a quiet month says so in words and the grid stays calm. */
function MonthCalendar({ events }) {
  const today = new Date()
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [turn, setTurn] = useState(0)

  const year = view.getFullYear()
  const month = view.getMonth()

  const byDay = useMemo(() => {
    const map = new Map()
    events.forEach((ev) => {
      const key = dayKey(ev.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(ev)
    })
    return map
  }, [events])

  const move = (delta) => {
    setView(new Date(year, month + delta, 1))
    setTurn((t) => t + 1)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const monthEvents = events.filter((ev) => {
    const d = new Date(ev.date)
    return d.getFullYear() === year && d.getMonth() === month
  })

  return (
    <div className="cal">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="font-serif text-2xl md:text-3xl font-semibold text-ink-950">
          {MONTHS[month]} <span className="text-ink-400">{year}</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous month"
            className="w-10 h-10 grid place-items-center rounded-edge border border-ink-950/[.14] text-ink-600 hover:border-brand-600 hover:text-brand-700 transition-colors"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => {
              setView(new Date(today.getFullYear(), today.getMonth(), 1))
              setTurn((t) => t + 1)
            }}
            className="px-3 h-10 rounded-edge border border-ink-950/[.14] text-sm font-semibold text-ink-600 hover:border-brand-600 hover:text-brand-700 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next month"
            className="w-10 h-10 grid place-items-center rounded-edge border border-ink-950/[.14] text-ink-600 hover:border-brand-600 hover:text-brand-700 transition-colors"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DOW.map((d) => (
          <div key={d} className="cal-dow">
            {d}
          </div>
        ))}
      </div>

      {/* keyed so React remounts the grid and the flip animation replays */}
      <div key={turn} className="cal-grid is-turning">
        {cells.map((day, i) => {
          if (!day) return <div key={`b${i}`} className="cal-cell is-blank" />
          const key = `${year}-${month}-${day}`
          const dayEvents = byDay.get(key) || []
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day

          const cellInner = (
            <>
              <span className="cal-num">{day}</span>
              {dayEvents.length > 0 && (
                <span className="cal-dot">
                  {dayEvents.slice(0, 4).map((ev) => (
                    <i
                      key={ev._id}
                      className={new Date(ev.date) < today ? 'is-past' : undefined}
                    />
                  ))}
                </span>
              )}
            </>
          )

          if (dayEvents.length === 0) {
            return (
              <div key={key} className={`cal-cell ${isToday ? 'is-today' : ''}`}>
                {cellInner}
              </div>
            )
          }

          return (
            <Link
              key={key}
              to={`/events/${dayEvents[0]._id}`}
              title={dayEvents.map((e) => e.title).join(' · ')}
              className={`cal-cell has-events ${isToday ? 'is-today' : ''}`}
            >
              {cellInner}
            </Link>
          )
        })}
      </div>

      {monthEvents.length === 0 ? (
        <p className="cal-quiet">Nothing scheduled in {MONTHS[month]}.</p>
      ) : (
        <ul className="mt-6 border-t border-ink-950/[.14]">
          {monthEvents.map((ev) => {
            const p = parts(ev.date)
            return (
              <li key={ev._id} className="border-b border-ink-950/[.14]">
                <Link
                  to={`/events/${ev._id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3.5 group"
                >
                  <span className="text-[.7rem] font-semibold uppercase tracking-[.16em] text-brand-600 w-16">
                    {p.m} {p.d}
                  </span>
                  <span className="font-serif text-lg text-ink-900 group-hover:text-brand-700 transition-colors">
                    {ev.title}
                  </span>
                  <span className="text-sm text-ink-500 ml-auto">{ev.location}</span>
                  <ArrowRight size={15} className="text-brand-600 arw" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ── Notify band ─────────────────────────────────────────────────────────── */
function Notify() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await subscribeApi.subscribe(email.trim())
      setDone(true)
      setEmail('')
      toast.success("You're on the list.")
    } catch (err) {
      toast.error(err.message || 'Could not subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="notify" className="bg-ink-50 band scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <Reveal>
          <p className="eyebrow">Never miss one</p>
          <h2 className="section-heading mt-4 mb-0">Hear about events before they fill up</h2>
          <p className="text-lg text-ink-600 leading-relaxed max-w-[44ch] mt-5">
            Rooms are usually small. Subscribers get the date as soon as it&apos;s
            confirmed, which is often a week before it goes on the site.
          </p>
        </Reveal>
        <Reveal delay={1}>
          {done ? (
            <div className="border border-brand-600/30 bg-white/60 rounded-card px-6 py-7">
              <p className="font-serif text-xl text-ink-900 mb-1.5">You&apos;re on the list.</p>
              <p className="text-ink-600">We&apos;ll email you as soon as a date is set.</p>
            </div>
          ) : (
            <>
              <form onSubmit={submit} className="flex flex-wrap gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  aria-label="Email address"
                  className="flex-1 min-w-[240px] bg-white/65 border border-ink-950/[.14] rounded-edge px-4 py-3.5 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-colors"
                />
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  {loading ? 'Adding…' : 'Notify me'}
                  {!loading && <ArrowRight size={16} className="arw" />}
                </button>
              </form>
              <p className="text-sm text-ink-500 mt-4">
                Unsubscribe in one click. Your address is never shared.
              </p>
            </>
          )}
        </Reveal>
      </div>
    </section>
  )
}

export default function Events() {
  const loaded = useHeroLoad()

  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('upcoming')

  useEffect(() => {
    Promise.all([
      eventsApi.getUpcoming().catch(() => []),
      eventsApi.getPast().catch(() => []),
    ])
      .then(([u, p]) => {
        setUpcoming(Array.isArray(u) ? u : [])
        setPast(Array.isArray(p) ? p : [])
      })
      .finally(() => setLoading(false))
  }, [])

  const all = useMemo(() => [...upcoming, ...past], [upcoming, past])

  const TABS = [
    { id: 'upcoming', label: 'Upcoming', n: upcoming.length },
    { id: 'past', label: 'Past', n: past.length },
    { id: 'calendar', label: 'Calendar', n: null },
  ]

  return (
    <div className={loaded ? 'loaded' : undefined}>
      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="on-dark relative bg-ink-950 text-ink-100 overflow-hidden pt-32 pb-10 md:pt-44 md:pb-12">
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            right: '-14%',
            top: '-30%',
            width: '58vw',
            height: '58vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(31,70,60,.5) 0%, transparent 62%)',
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <p className="eyebrow hero-fade">Events</p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight max-w-[15ch] mt-5">
            <ClipWords text="Come and hear it" />
            <ClipWords text="in person" offset={4} accent />
          </h1>
          <p className="hero-fade text-lg text-ink-100/70 leading-relaxed max-w-[54ch] mt-7" data-d="2">
            Readings, talks, and conversations — at churches, libraries, universities,
            and online. Copies of the book are available at every in-person event, and
            Bruno usually stays afterwards to sign them.
          </p>
        </div>
      </section>

      {/* ── TABS ───────────────────────────────────────────────────────── */}
      <section className="on-dark bg-ink-950 pb-8 md:pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            role="tablist"
            aria-label="Filter events"
            className="flex flex-wrap gap-2 items-center border-t border-ink-100/15 pt-6"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className="pill"
              >
                {t.label}
                {t.n !== null && <span className="opacity-60 ml-1.5 text-[.78rem]">{t.n}</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIST ───────────────────────────────────────────────────────── */}
      <section className="bg-ink-100 band">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="space-y-8">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-8 items-center">
                  <div className="w-[100px] h-[92px] bg-ink-200/60 rounded-card animate-pulse shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-24 bg-ink-200/50 rounded animate-pulse" />
                    <div className="h-7 w-2/3 bg-ink-200/60 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : tab === 'calendar' ? (
            <MonthCalendar events={all} />
          ) : tab === 'upcoming' ? (
            upcoming.length > 0 ? (
              <div className="ev-rows">
                {upcoming.map((ev, i) => (
                  <EventRow key={ev._id} event={ev} delay={i < 3 ? i : undefined} />
                ))}
              </div>
            ) : (
              <div className="ev-empty">
                <div className="w-11 h-11 mx-auto mb-6 rounded-full border border-ink-950/[.14] grid place-items-center">
                  <CalendarDays size={18} className="text-brand-600" />
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-ink-950 mb-3">
                  Nothing scheduled just now
                </h3>
                <p className="text-lg text-ink-600 leading-relaxed max-w-[46ch] mx-auto mb-8">
                  Bruno is between engagements. Leave your email and you&apos;ll hear the
                  moment a date is set — or invite him to speak at your own event.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a href="#notify" className="btn-primary">
                    Notify me <ArrowRight size={16} className="arw" />
                  </a>
                  <a href="#booking" className="btn-secondary">
                    Invite Bruno to speak
                  </a>
                </div>
              </div>
            )
          ) : past.length > 0 ? (
            <div className="ev-rows is-past">
              {past.map((ev, i) => (
                <EventRow key={ev._id} event={ev} past delay={i < 3 ? i : undefined} />
              ))}
            </div>
          ) : (
            <p className="text-center text-ink-500">No past events on record yet.</p>
          )}
        </div>
      </section>

      <Notify />

      {/* ── BOOKING ────────────────────────────────────────────────────── */}
      <section id="booking" className="on-dark bg-ink-950 text-ink-50 band scroll-mt-24 stage">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-16">
          <Reveal>
            <p className="eyebrow">Invitations</p>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold leading-tight mt-4">
              Want Bruno at
              <br />
              your event?
            </h2>
            <p className="text-lg text-ink-50/70 leading-relaxed max-w-[46ch] mt-5 mb-8">
              He speaks at churches, conferences, universities, and community
              gatherings — in Rwanda and beyond. Tell him the date, the room, and
              who&apos;ll be in it.
            </p>
            <Link to="/contact" className="btn-accent">
              Check availability <ArrowRight size={16} className="arw" />
            </Link>
          </Reveal>

          <Reveal delay={1}>
            <p className="text-[.72rem] uppercase tracking-[.2em] text-ink-50/45 mb-5">
              What he can do
            </p>
            <div className="grid gap-3">
              {FORMATS.map((f) => (
                <div
                  key={f.name}
                  className="bk-lift border border-ink-100/15 rounded-card p-5 hover:border-brand-300/40"
                >
                  <h3 className="font-serif text-xl font-semibold text-ink-50 mb-1.5">{f.name}</h3>
                  <p className="text-ink-50/65 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
