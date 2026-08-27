import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { contactApi } from '../lib/api'
import Reveal from '../components/Reveal'
import ClipWords from '../components/ClipWords'
import { useHeroLoad } from '../hooks/useMotion'
import toast from 'react-hot-toast'

/* ─────────────────────────────────────────────────────────────────────────
   The Contact model accepts name, email, subject and message — nothing more.
   Rather than add columns for a handful of speaking questions, the enquiry
   type and the event details are folded into those four fields on submit, so
   Bruno still gets one readable email and the backend is untouched.
   ───────────────────────────────────────────────────────────────────────── */

const KINDS = [
  { id: 'general', label: 'General' },
  { id: 'speaking', label: 'Speaking invitation' },
  { id: 'order', label: 'Book order' },
  { id: 'media', label: 'Press & media' },
]

const FORMATS = [
  'Not sure yet',
  'Keynote (30–45 min)',
  'Workshop',
  'Reading & Q&A',
  'Panel or interview',
]

const PROMPTS = {
  general: "Tell Bruno what's on your mind…",
  speaking: 'Anything else he should know about the event or the audience…',
  order: 'Which title, how many copies, and where they need to go…',
  media: 'Publication, deadline, and what you need from him…',
}

const empty = {
  name: '',
  email: '',
  org: '',
  message: '',
  evdate: '',
  evsize: '',
  evplace: '',
  evformat: FORMATS[0],
}

export default function Contact() {
  const loaded = useHeroLoad()
  const [kind, setKind] = useState('general')
  const [form, setForm] = useState(empty)
  const [sending, setSending] = useState(false)

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please add your name, email, and a message.')
      return
    }

    const kindLabel = KINDS.find((k) => k.id === kind)?.label || 'General'
    const subject = form.org.trim() ? `${kindLabel} — ${form.org.trim()}` : kindLabel

    // Structured answers ride along at the top of the message so the email is
    // readable without a template on the backend.
    let message = form.message.trim()
    if (kind === 'speaking') {
      const details = [
        form.evdate && `Date: ${form.evdate}`,
        form.evplace.trim() && `Location: ${form.evplace.trim()}`,
        form.evsize.trim() && `Expected audience: ${form.evsize.trim()}`,
        form.evformat && `Format: ${form.evformat}`,
      ].filter(Boolean)
      if (details.length) message = `${details.join('\n')}\n\n${message}`
    }
    if (form.org.trim()) message = `Organisation: ${form.org.trim()}\n${message}`

    setSending(true)
    try {
      await contactApi.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        subject,
        message,
      })
      toast.success("Message sent. Bruno usually replies within two business days.")
      setForm(empty)
      setKind('general')
    } catch (err) {
      toast.error(err.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  const speaking = kind === 'speaking'

  return (
    <div className={loaded ? 'loaded' : undefined}>
      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="on-dark relative bg-ink-950 text-ink-100 overflow-hidden pt-32 pb-14 md:pt-44 md:pb-20">
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
          <p className="eyebrow hero-fade">Contact</p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight max-w-[15ch] mt-5">
            <ClipWords text="Write to Bruno" />
            <ClipWords text="directly" offset={3} accent />
          </h1>
          <p className="hero-fade text-lg text-ink-100/70 leading-relaxed max-w-[52ch] mt-7" data-d="2">
            Speaking invitations, questions about the book, or simply your own story —
            all of it reaches the same inbox, and he reads it himself.
          </p>
        </div>
      </section>

      {/* ── FORM + DETAILS ─────────────────────────────────────────────── */}
      <section className="bg-ink-100 band">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)] gap-12 lg:gap-20 items-start">
          <Reveal>
            <p className="eyebrow">Send a message</p>
            <h2 className="section-heading mt-4 mb-0">What&apos;s this about?</h2>

            <div className="flex flex-wrap gap-2 mt-7 mb-8" role="group" aria-label="Type of enquiry">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className="kind"
                  aria-pressed={kind === k.id}
                  onClick={() => setKind(k.id)}
                >
                  {k.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="fld-pair">
                <div className="fld">
                  <label htmlFor="name">Your name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={set}
                    placeholder="Jane Uwase"
                  />
                </div>
                <div className="fld">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={set}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="fld">
                <label htmlFor="org">
                  Organisation <span className="font-normal text-ink-400">(optional)</span>
                </label>
                <input
                  id="org"
                  name="org"
                  type="text"
                  value={form.org}
                  onChange={set}
                  placeholder="Church, school, company…"
                />
              </div>

              {/* Only for speaking invitations. */}
              <div className={`fld-extra ${speaking ? 'is-open' : ''}`} aria-hidden={!speaking}>
                <div>
                  <p className="fld-hint mb-4 mt-0">
                    These four answers let Bruno reply with a yes or no instead of five
                    follow-up questions.
                  </p>
                  <div className="fld-pair">
                    <div className="fld">
                      <label htmlFor="evdate">Date of the event</label>
                      <input
                        id="evdate"
                        name="evdate"
                        type="date"
                        value={form.evdate}
                        onChange={set}
                        tabIndex={speaking ? 0 : -1}
                      />
                    </div>
                    <div className="fld">
                      <label htmlFor="evsize">Expected audience</label>
                      <input
                        id="evsize"
                        name="evsize"
                        type="text"
                        value={form.evsize}
                        onChange={set}
                        placeholder="About 80 people"
                        tabIndex={speaking ? 0 : -1}
                      />
                    </div>
                  </div>
                  <div className="fld-pair">
                    <div className="fld">
                      <label htmlFor="evplace">Location</label>
                      <input
                        id="evplace"
                        name="evplace"
                        type="text"
                        value={form.evplace}
                        onChange={set}
                        placeholder="Kigali, Rwanda"
                        tabIndex={speaking ? 0 : -1}
                      />
                    </div>
                    <div className="fld">
                      <label htmlFor="evformat">Format</label>
                      <select
                        id="evformat"
                        name="evformat"
                        value={form.evformat}
                        onChange={set}
                        tabIndex={speaking ? 0 : -1}
                      >
                        {FORMATS.map((f) => (
                          <option key={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="fld">
                <label htmlFor="message">Your message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={form.message}
                  onChange={set}
                  placeholder={PROMPTS[kind]}
                />
                <p className="fld-hint">However long or short you like.</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6">
                <button type="submit" disabled={sending} className="btn-primary disabled:opacity-50">
                  {sending ? 'Sending…' : 'Send message'}
                  {!sending && <ArrowRight size={16} className="arw" />}
                </button>
                <span className="text-sm text-ink-500">
                  Usually answered within two business days.
                </span>
              </div>
            </form>
          </Reveal>

          {/* ── DETAILS ──────────────────────────────────────────────── */}
          <Reveal delay={1}>
            <p className="eyebrow">Or reach him another way</p>
            <div className="mt-7">
              <div className="detail">
                <h3>Email</h3>
                <a href="mailto:iradukundabruno2034@gmail.com" className="break-anywhere">
                  iradukundabruno2034@gmail.com
                </a>
                <p className="small">Best for anything detailed.</p>
              </div>
              <div className="detail">
                <h3>Phone &amp; WhatsApp</h3>
                <a href="tel:+250784642822">+250 784 642 822</a>
                <p className="small">Weekdays, 9:00–17:00 CAT.</p>
              </div>
              <div className="detail">
                <h3>Where he is</h3>
                <p className="text-ink-700">Kigali, Rwanda</p>
                <p className="small">
                  Available to travel for events, in the region and beyond.
                </p>
              </div>
              <div className="detail">
                <h3>Publishing enquiries</h3>
                <p className="text-ink-700">
                  For manuscript submissions and rights, contact{' '}
                  <a
                    href="https://vitalreadings.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vitalreadings Publishers
                  </a>{' '}
                  directly.
                </p>
              </div>
              <div className="detail">
                <h3>Speaking</h3>
                <p className="text-ink-700">
                  Formats, topics, and what he covers are set out on{' '}
                  <Link to="/my-work">My Work</Link>.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
