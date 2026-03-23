import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventsApi } from '../lib/api'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatShortDate(d) {
  const date = new Date(d)
  return {
    day: date.toLocaleDateString('en-US', { day: '2-digit' }),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    year: date.getFullYear(),
  }
}

function CalendarBadge({ date }) {
  const { day, month, year } = formatShortDate(date)
  return (
    <div className="flex-shrink-0 w-16 text-center">
      <div className="bg-brand-600 text-white text-xs font-bold uppercase tracking-wider py-1 rounded-t-lg">{month}</div>
      <div className="bg-white border border-t-0 border-ink-200 rounded-b-lg py-1">
        <span className="block text-2xl font-bold text-ink-900 leading-none">{day}</span>
        <span className="block text-xs text-ink-400">{year}</span>
      </div>
    </div>
  )
}

function UpcomingCard({ event }) {
  return (
    <div className="flex gap-4 sm:gap-6 p-5 sm:p-6 bg-white rounded-2xl border border-ink-100 hover:shadow-md transition-shadow">
      <CalendarBadge date={event.date} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            event.type === 'online' ? 'bg-teal-50 text-teal-700' : 'bg-brand-50 text-brand-700'
          }`}>
            {event.type === 'online' ? 'Online' : 'In Person'}
          </span>
        </div>
        <h2 className="font-serif text-xl text-ink-900 leading-snug mb-1">{event.title}</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-ink-500 mb-2">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {event.time}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </span>
        </div>
        {event.description && (
          <p className="text-ink-600 text-sm leading-relaxed line-clamp-2 mb-3">{event.description}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/events/${event._id}`}
            className="inline-flex items-center gap-1.5 border border-brand-600 text-brand-600 hover:bg-brand-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            More Info
          </Link>
          {event.registrationLink && (
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Register Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function PastCard({ event }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden hover:shadow-md transition-shadow">
      {event.image ? (
        <div className="relative">
          <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              event.type === 'online' ? 'bg-teal-600 text-white' : 'bg-brand-600 text-white'
            }`}>
              {event.type === 'online' ? 'Online' : 'In Person'}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-br from-ink-100 to-ink-200 flex items-center justify-center">
          <svg className="w-10 h-10 text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className="p-5">
        <p className="text-xs text-ink-400 mb-1">{formatDate(event.date)}</p>
        <h3 className="font-serif text-lg text-ink-900 leading-snug mb-2">{event.title}</h3>
        <p className="text-ink-500 text-sm flex items-center gap-1.5 mb-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location}
        </p>
        {event.description && (
          <p className="text-ink-600 text-sm leading-relaxed line-clamp-2 mb-3">{event.description}</p>
        )}
        <Link
          to={`/events/${event._id}`}
          className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-medium"
        >
          View Details
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

// Full calendar with inline events
function MonthCalendar({ upcoming, past }) {
  const allEvents = [...upcoming, ...past]
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))
  const goToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))

  // Map events by date key
  const eventsByDate = {}
  allEvents.forEach((ev) => {
    const d = new Date(ev.date)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!eventsByDate[key]) eventsByDate[key] = []
    eventsByDate[key].push(ev)
  })

  // Build grid: pad start with nulls, fill days
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  // Pad end to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <div className="overflow-x-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 min-w-[560px]">
        <div className="flex items-center gap-2">
          <button type="button" onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-ink-100 transition-colors">
            <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button type="button" onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-ink-100 transition-colors">
            <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button type="button" onClick={goToday}
            className="px-3 py-1.5 text-sm border border-ink-200 rounded-lg hover:bg-ink-50 text-ink-600 transition-colors">
            Today
          </button>
        </div>
        <h3 className="font-serif text-xl text-ink-900">{monthName}</h3>
        <div className="w-32" />
      </div>

      {/* Calendar grid */}
      <div className="min-w-[560px] border border-ink-200 rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-ink-50 border-b border-ink-200">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-ink-500 py-2.5 border-r border-ink-200 last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-ink-200 last:border-b-0">
            {week.map((day, di) => {
              if (!day) {
                return (
                  <div key={`e-${wi}-${di}`}
                    className="min-h-[90px] bg-ink-50/50 border-r border-ink-200 last:border-r-0" />
                )
              }
              const key = `${year}-${month}-${day}`
              const evs = eventsByDate[key] || []
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

              return (
                <div key={day}
                  className="min-h-[90px] p-1.5 border-r border-ink-200 last:border-r-0 bg-white align-top">
                  {/* Day number */}
                  <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                    isToday
                      ? 'bg-brand-600 text-white'
                      : 'text-ink-500'
                  }`}>
                    {day}
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5">
                    {evs.map((ev) => {
                      const isPastEv = new Date(ev.date) < new Date()
                      return (
                        <Link
                          key={ev._id}
                          to={`/events/${ev._id}`}
                          className={`block w-full text-left px-1.5 py-0.5 rounded text-xs leading-tight truncate transition-opacity hover:opacity-80 ${
                            isPastEv
                              ? 'bg-ink-200 text-ink-700'
                              : 'bg-brand-600 text-white'
                          }`}
                          title={`${ev.title} — ${ev.location}`}
                        >
                          <span className="font-medium truncate block">{ev.title}</span>
                          <span className="opacity-75 truncate block">{ev.location}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brand-600 inline-block" /> Upcoming
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-ink-300 inline-block" /> Past
        </span>
      </div>
    </div>
  )
}

const TABS = ['Upcoming', 'Past', 'Calendar']

export default function Events() {
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Upcoming')

  useEffect(() => {
    Promise.all([
      eventsApi.getUpcoming().catch(() => []),
      eventsApi.getPast().catch(() => []),
    ]).then(([u, p]) => {
      setUpcoming(u)
      setPast(p)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="section-heading">Events</h1>
          <p className="text-ink-600 max-w-2xl mx-auto">
            Join Bruno at readings, talks, and speaking engagements around the world.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 bg-ink-100 p-1 rounded-xl mb-8 w-fit mx-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              {tab}
              {tab === 'Upcoming' && !loading && upcoming.length > 0 && (
                <span className="ml-1.5 bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded-full">{upcoming.length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-ink-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Upcoming tab */}
            {activeTab === 'Upcoming' && (
              upcoming.length === 0 ? (
                <div className="text-center py-14 bg-ink-50 rounded-2xl border border-dashed border-ink-200">
                  <div className="w-12 h-12 bg-ink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-ink-600 font-medium">No upcoming events right now</p>
                  <p className="text-ink-400 text-sm mt-1">Check back soon or invite Bruno to speak at your event.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {upcoming.map((ev) => <li key={ev._id}><UpcomingCard event={ev} /></li>)}
                </ul>
              )
            )}

            {/* Past tab */}
            {activeTab === 'Past' && (
              past.length === 0 ? (
                <div className="text-center py-14 bg-ink-50 rounded-2xl border border-dashed border-ink-200">
                  <p className="text-ink-600 font-medium">No past events yet</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {past.map((ev) => <PastCard key={ev._id} event={ev} />)}
                </div>
              )
            )}

            {/* Calendar tab */}
            {activeTab === 'Calendar' && (
              <div className="bg-white rounded-2xl border border-ink-100 p-6">
                <MonthCalendar upcoming={upcoming} past={past} />
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-ink-900 to-ink-800 rounded-2xl px-6 py-10 text-center text-white">
          <h3 className="font-serif text-2xl mb-2">Want Bruno to speak at your event?</h3>
          <p className="text-ink-300 text-sm mb-6 max-w-md mx-auto">
            Bruno speaks at churches, conferences, universities, and community events on topics of forgiveness, healing, and hope.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Get in Touch
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  )
}
