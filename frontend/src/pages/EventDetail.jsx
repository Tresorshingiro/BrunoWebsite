import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MapPin, Clock, CalendarDays, X } from 'lucide-react'
import { eventsApi } from '../lib/api'
import { cldResize, cldSrcSet } from '../lib/images'
import Reveal from '../components/Reveal'
import ClipWords from '../components/ClipWords'

/* ─────────────────────────────────────────────────────────────────────────
   EVENT DETAIL

   The page reads differently either side of the date: an upcoming event
   leads with registration, a past one leads with what happened. Sections
   whose data is absent (recording, gallery) are not rendered at all —
   never a heading with an empty player under it.
   ───────────────────────────────────────────────────────────────────────── */

function formatDate(d) {
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function getEmbedUrl(url) {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [others, setOthers] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    setLoading(true)
    eventsApi
      .getById(id)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!event) return
    const past = new Date(event.date) < new Date()
    const load = past ? eventsApi.getPast() : eventsApi.getUpcoming()
    load
      .then((list) => setOthers((Array.isArray(list) ? list : []).filter((e) => e._id !== id).slice(0, 3)))
      .catch(() => setOthers([]))
  }, [event, id])

  // Escape closes the lightbox.
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => e.key === 'Escape' && setLightbox(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  if (loading) {
    return (
      <div className="bg-ink-950 pt-32 md:pt-44 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
          <div className="h-4 w-28 bg-ink-800 rounded animate-pulse" />
          <div className="h-12 w-3/4 bg-ink-800 rounded animate-pulse" />
          <div className="h-6 w-1/2 bg-ink-800/70 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="bg-ink-950 text-ink-100 pt-32 md:pt-44 pb-24 text-center">
        <p className="text-ink-100/70">Event not found.</p>
        <Link to="/events" className="link-more mt-4 justify-center">
          Back to events <ArrowRight size={15} className="arw" />
        </Link>
      </div>
    )
  }

  const isPast = new Date(event.date) < new Date()
  const online = event.type === 'online'
  const embedUrl = getEmbedUrl(event.videoUrl)
  const gallery = event.gallery || []
  const date = formatDate(event.date)

  return (
    <div>
      {/* ── HEAD ───────────────────────────────────────────────────────── */}
      <header className="on-dark canvas relative bg-ink-950 text-ink-100 overflow-hidden pt-32 pb-12 md:pt-44 md:pb-16">
        <div
          aria-hidden="true"
          className="full pointer-events-none absolute"
          style={{
            right: '-18%',
            top: '-38%',
            width: '62vw',
            height: '62vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(31,70,60,.5) 0%, transparent 62%)',
          }}
        />
        <Link
          to="/events"
          className="wide relative z-10 inline-flex items-center gap-2 text-sm font-medium text-ink-100/60 hover:text-brand-300 transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back to events
        </Link>

        <div className="wide relative z-10 flex flex-wrap gap-1.5 mb-5">
          {isPast && <span className="badge b-past">This event has passed</span>}
          <span className={`badge ${online ? 'b-online' : 'b-inperson'}`}>
            {online ? 'Online' : 'In person'}
          </span>
        </div>

        <h1 className="wide relative z-10 font-serif text-4xl md:text-5xl font-semibold leading-[1.07] tracking-tight max-w-[20ch]">
          <ClipWords text={event.title} selfStart />
        </h1>

        <div className="wide relative z-10 flex flex-wrap gap-x-7 gap-y-3 mt-7 text-ink-100/70">
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={15} className="text-brand-300 shrink-0" />
            {date}
            {event.time && ` · ${event.time}`}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin size={15} className="text-brand-300 shrink-0" />
            {event.location}
          </span>
        </div>

        {!isPast && event.registrationLink && (
          <div className="wide relative z-10 mt-8">
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent"
            >
              Reserve a seat <ArrowRight size={16} className="arw" />
            </a>
          </div>
        )}
      </header>

      {/* ── HERO IMAGE — breaks out to the wide track ──────────────────── */}
      {event.image && (
        <div className="canvas bg-ink-100 pt-10 md:pt-14">
          <figure className="wide m-0">
            <img
              src={cldResize(event.image, 1000)}
              srcSet={cldSrcSet(event.image, 1000)}
              alt=""
              loading="eager"
              decoding="async"
              fetchpriority="high"
              className="w-full rounded-card aspect-[16/9] object-cover"
            />
          </figure>
        </div>
      )}

      {/* ── DESCRIPTION ────────────────────────────────────────────────── */}
      <section className="canvas bg-ink-100 pt-10 md:pt-14 pb-12 md:pb-16">
        <Reveal>
          <h2 className="font-serif text-3xl font-semibold text-ink-950 mb-6">
            {isPast ? 'What happened' : 'About this event'}
          </h2>
          <div className="post-body">
            {event.description
              .split(/\n{2,}/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>
        </Reveal>
      </section>

      {/* ── RECORDING — only when there is one ─────────────────────────── */}
      {embedUrl && (
        <section className="canvas bg-ink-50 py-12 md:py-16">
          <Reveal className="wide">
            <h2 className="font-serif text-3xl font-semibold text-ink-950 mb-6">
              {isPast ? 'Watch the recording' : 'Preview'}
            </h2>
          </Reveal>
          <Reveal className="wide">
            <div className="ev-player">
              <iframe
                src={embedUrl}
                title={`${event.title} — video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </Reveal>
        </section>
      )}

      {/* ── GALLERY — only when there are photographs ──────────────────── */}
      {gallery.length > 0 && (
        <section className="canvas bg-ink-100 py-12 md:py-16">
          <Reveal className="wide">
            <h2 className="font-serif text-3xl font-semibold text-ink-950 mb-6">
              {isPast ? 'From the evening' : 'Gallery'}
            </h2>
          </Reveal>
          <Reveal className="wide">
            <div className="ev-tiles">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className="ev-tile"
                  onClick={() => setLightbox(src)}
                  aria-label={`Open photograph ${i + 1}`}
                >
                  <img
                    src={cldResize(src, 400)}
                    srcSet={cldSrcSet(src, 400)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ── NEXT STEPS ─────────────────────────────────────────────────── */}
      <section className="canvas bg-ink-50 py-12 md:py-16 stage">
        <Reveal className="wide">
          <h2 className="font-serif text-3xl font-semibold text-ink-950 mb-2">
            {isPast ? 'Missed it?' : 'Before you come'}
          </h2>
          <p className="text-ink-600 mb-8">
            {isPast
              ? 'Three ways to pick up where this left off.'
              : 'Three things worth knowing.'}
          </p>
        </Reveal>
        <Reveal className="wide">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Read the book',
                body: 'Everything Bruno reads from, plus the study half that follows it.',
                to: '/books',
                cta: 'My Forgiveness Story',
              },
              {
                title: isPast ? 'Come to the next one' : 'See what else is on',
                body: 'Readings happen every few months, and subscribers hear the date first.',
                to: '/events',
                cta: 'All events',
              },
              {
                title: 'Host one yourself',
                body: 'Bruno speaks at churches, schools, and community gatherings across the region.',
                to: '/contact',
                cta: 'Invite Bruno to speak',
              },
            ].map((step) => (
              <div
                key={step.title}
                className="bk-lift border border-ink-950/[.14] rounded-card p-6 bg-white/50"
              >
                <h3 className="font-serif text-xl font-semibold text-ink-950 mb-2">{step.title}</h3>
                <p className="text-ink-600 leading-relaxed mb-4">{step.body}</p>
                <Link to={step.to} className="link-more">
                  {step.cta} <ArrowRight size={15} className="arw" />
                </Link>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── MORE EVENTS ────────────────────────────────────────────────── */}
      {others.length > 0 && (
        <section className="bg-ink-100 band">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal className="mb-8">
              <p className="eyebrow">Also on</p>
              <h2 className="section-heading mt-4 mb-0">
                {isPast ? 'Other past events' : 'Other upcoming events'}
              </h2>
            </Reveal>
            <div className={`ev-rows ${isPast ? 'is-past' : ''}`}>
              {others.map((ev) => {
                const d = new Date(ev.date)
                return (
                  <Reveal as="div" key={ev._id}>
                    <Link to={`/events/${ev._id}`} className="ev-row group stage">
                      <div className="ev-date">
                        <div className="m">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div className="d">{String(d.getDate()).padStart(2, '0')}</div>
                        <div className="y">{d.getFullYear()}</div>
                      </div>
                      <div className="ev-media">
                        {ev.image && (
                          <img
                            src={cldResize(ev.image, 260)}
                            srcSet={cldSrcSet(ev.image, 260)}
                            alt=""
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-semibold text-ink-950 leading-tight transition-colors group-hover:text-brand-700">
                          {ev.title}
                        </h3>
                        <div className="ev-where mt-2">
                          <span>
                            <MapPin size={14} className="text-brand-600 shrink-0" />
                            {ev.location}
                          </span>
                          {ev.time && (
                            <span>
                              <Clock size={14} className="text-brand-600 shrink-0" />
                              {ev.time}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ev-go">
                        <span className="btn-secondary">
                          View <ArrowRight size={15} className="arw" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── LIGHTBOX ───────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photograph"
          className="fixed inset-0 z-[70] bg-ink-950/92 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute top-5 right-5 w-11 h-11 grid place-items-center rounded-full border border-ink-100/25 text-ink-100 hover:border-brand-300 hover:text-brand-300 transition-colors"
          >
            <X size={19} />
          </button>
          <img
            src={cldResize(lightbox, 1400)}
            alt=""
            className="max-w-full max-h-[86vh] rounded-card"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
