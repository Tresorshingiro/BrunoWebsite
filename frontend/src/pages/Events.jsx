import { useEffect, useState } from 'react'
import { eventsApi } from '../lib/api'

function formatDate(d) {
  const date = new Date(d)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsApi
      .getUpcoming()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <header className="text-center mb-12">
          <h1 className="section-heading">Event Calendar</h1>
          <p className="text-ink-600 max-w-2xl mx-auto">
            Readings, talks, and events with Bruno Iradukunda.
          </p>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-ink-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-ink-50 rounded-2xl">
            <p className="text-ink-600">No upcoming events at the moment.</p>
            <p className="text-ink-500 text-sm mt-2">Check back later or get in touch.</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {events.map((event) => (
              <li
                key={event._id}
                className="flex flex-col sm:flex-row gap-4 p-6 rounded-xl border border-ink-100 bg-white hover:shadow-md transition-shadow"
              >
                {event.image && (
                  <img
                    src={event.image}
                    alt=""
                    className="w-full sm:w-48 h-36 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-brand-600 uppercase tracking-wide">
                    {event.type === 'online' ? 'Online' : 'In person'}
                  </span>
                  <h2 className="font-serif text-xl text-ink-900 mt-1">{event.title}</h2>
                  <p className="text-ink-600 text-sm mt-1">{formatDate(event.date)} · {event.time}</p>
                  <p className="text-ink-600 mt-2">{event.location}</p>
                  {event.description && (
                    <p className="text-ink-600 text-sm mt-2 line-clamp-2">{event.description}</p>
                  )}
                  {event.registrationLink && (
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-brand-600 font-medium hover:underline"
                    >
                      Register →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
