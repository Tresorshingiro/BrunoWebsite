import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { eventsApi } from '../lib/api'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function getEmbedUrl(url) {
  if (!url) return null
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return null
}

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    eventsApi.getById(id)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="h-8 bg-ink-100 rounded w-48 mb-6 animate-pulse" />
        <div className="h-64 bg-ink-100 rounded-2xl animate-pulse mb-6" />
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-4 bg-ink-100 rounded animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-500 mb-4">Event not found.</p>
        <Link to="/events" className="text-brand-600 hover:underline">← Back to Events</Link>
      </div>
    )
  }

  const isPast = new Date(event.date) < new Date()
  const embedUrl = getEmbedUrl(event.videoUrl)

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <Link to="/events" className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-sm font-medium mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Events
        </Link>

        {/* Hero image */}
        {event.image && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img src={event.image} alt={event.title} className="w-full h-64 md:h-80 object-cover" />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              isPast ? 'bg-ink-100 text-ink-600' : 'bg-brand-50 text-brand-700'
            }`}>
              {isPast ? 'Past Event' : 'Upcoming'}
            </span>
            <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              event.type === 'online' ? 'bg-teal-50 text-teal-700' : 'bg-brand-50 text-brand-700'
            }`}>
              {event.type === 'online' ? 'Online' : 'In Person'}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-ink-900 mb-4">{event.title}</h1>

          <div className="flex flex-col sm:flex-row gap-4 text-ink-600">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {event.time}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="prose prose-ink max-w-none mb-10">
            <p className="text-ink-700 text-lg leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {/* Register button (upcoming only) */}
        {!isPast && event.registrationLink && (
          <div className="mb-10">
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Register for this Event
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        )}

        {/* Video embed */}
        {embedUrl && (
          <div className="mb-10">
            <h2 className="font-serif text-xl text-ink-900 mb-4">{isPast ? 'Event Recording' : 'Preview'}</h2>
            <div className="relative rounded-2xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={embedUrl}
                title="Event video"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Photo gallery */}
        {event.gallery?.length > 0 && (
          <div className="mb-10">
            <h2 className="font-serif text-xl text-ink-900 mb-4">{isPast ? 'Event Photos' : 'Gallery'}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {event.gallery.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(i)}
                  className="block rounded-xl overflow-hidden aspect-square focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <img src={img} alt={`Event photo ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {lightbox > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1) }}
              className="absolute left-4 text-white/70 hover:text-white"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {lightbox < event.gallery.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1) }}
              className="absolute right-4 text-white/70 hover:text-white"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <img
            src={event.gallery[lightbox]}
            alt=""
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
