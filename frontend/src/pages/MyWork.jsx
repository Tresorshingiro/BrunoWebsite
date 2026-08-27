import { Link } from 'react-router-dom'
import { ArrowRight, ArrowDown } from 'lucide-react'
import Reveal from '../components/Reveal'
import Book3D from '../components/Book3D'
import ClipWords from '../components/ClipWords'
import { useHeroLoad, usePointerTilt } from '../hooks/useMotion'

const ROLES = [
  { tag: 'Author', name: 'My Forgiveness Story', href: '#author' },
  { tag: 'Publisher', name: 'Vitalreadings', href: '#publisher' },
  { tag: 'Ministry', name: 'Ellel Rwanda', href: '#ministry' },
]

const BOOK_META = [
  ['Published', '2024'],
  ['Genre', 'Memoir · Faith'],
  ['Publisher', 'Vitalreadings'],
  ['Price', '20,000 RWF'],
]

const TOPICS = [
  'Forgiveness & reconciliation',
  'Healing from trauma',
  'Faith & restoration',
  'Genocide awareness',
  'Community healing',
  'Christian discipleship',
  'Personal transformation',
  'Rwanda & resilience',
]

const FORMATS = [
  { name: 'Keynote', body: 'A 30–45 minute talk built around the testimony, adapted to your audience.' },
  { name: 'Workshop', body: 'A longer, participatory session on the practical work of forgiveness.' },
  { name: 'Reading & Q&A', body: 'Readings from the book followed by open conversation and signing.' },
]

/**
 * Logo plate that leans toward the pointer.
 *
 * Both plates are white on purpose: each logo file carries its own baked-in
 * background (Vitalreadings navy, Ellel white), so a coloured plate leaves a
 * visible rectangle around the mark. White lets them sit as logos rather than
 * as pasted images, and keeps the pair reading as a matched set.
 */
function OrgPlate({ src, alt, role }) {
  const ref = usePointerTilt({ max: 7 })
  return (
    <div ref={ref} className="stage">
      <div
        className="relative aspect-[16/9] rounded-card grid place-items-center overflow-hidden p-10 bg-white border border-ink-950/10 shadow-[0_2px_10px_rgba(18,22,21,.05)]"
        style={{
          transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
          transition: 'transform .45s var(--ease), box-shadow .45s var(--ease)',
        }}
      >
        <span className="absolute left-4 top-4 text-[.62rem] uppercase tracking-[.2em] text-ink-500">
          {role}
        </span>
        <img src={src} alt={alt} className="max-h-full max-w-full object-contain" loading="lazy" />
      </div>
    </div>
  )
}

export default function MyWork() {
  const loaded = useHeroLoad()

  return (
    <div className={loaded ? 'loaded' : undefined}>
      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="on-dark relative bg-ink-950 text-ink-100 overflow-hidden pt-32 pb-12 md:pt-44 md:pb-20">
        <div
          className="absolute pointer-events-none"
          style={{
            right: '-14%',
            top: '-30%',
            width: '58vw',
            height: '58vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(31,70,60,.5) 0%, transparent 62%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6">
          <p className="eyebrow hero-fade">My work &amp; ministry</p>
          <h1 className="font-serif font-semibold tracking-tight text-[clamp(2.25rem,5.6vw,4.4rem)] leading-[1.02] mt-5 max-w-[16ch]">
            <ClipWords text="One message, carried three" />
            <ClipWords text="different ways" offset={4} accent />
          </h1>
          <p className="hero-fade text-[1.1875rem] leading-relaxed text-ink-200/70 max-w-[52ch] mt-8" data-d="2">
            Author, publisher, ministry partner. They look like separate jobs and
            they are not — each one is a different route to the same place: that
            healing after harm is possible, and that someone should say so out loud.
          </p>
        </div>
      </section>

      {/* ── ROLE INDEX ─────────────────────────────────────────────────── */}
      <section className="bg-ink-950 pb-12 md:pb-20" aria-label="Roles">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 border-t border-ink-100/15">
            {ROLES.map(({ tag, name, href }, i) => (
              <Reveal key={tag} delay={i || undefined}>
                <a
                  href={href}
                  className="index-item group block pt-6 pr-6 pb-6 md:pb-0 border-t border-transparent -mt-px transition-colors duration-300 ease-ease hover:border-brand-300"
                >
                  <p className="text-[.68rem] uppercase tracking-[.2em] text-ink-400 mb-2">{tag}</p>
                  <p className="font-serif text-[1.35rem] text-ink-100 flex items-center gap-2">
                    {name}
                    <ArrowDown className="w-4 h-4 text-brand-300 opacity-0 -translate-x-1.5 transition-all duration-300 ease-ease group-hover:opacity-100 group-hover:translate-x-0" />
                  </p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUTHOR — the lead role ─────────────────────────────────────── */}
      <section id="author" className="bg-ink-100 band scroll-mt-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 grid lg:grid-cols-[.8fr_1fr] gap-10 lg:gap-20 items-center">
          <Reveal>
            <Book3D />
          </Reveal>

          <Reveal delay={1}>
            <p className="eyebrow">Author</p>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.06] tracking-tight text-ink-950 font-semibold mt-4 max-w-[18ch]">
              The book that started the conversation
            </h2>
            <div className="prose-custom text-[1.1875rem] leading-[1.75] max-w-[64ch] mt-6 space-y-4">
              <p>
                A memoir published in 2024, tracing the road from the trauma of the
                1994 Genocide Against the Tutsi to spiritual and emotional peace —
                and, alongside it, a careful study of what forgiveness actually asks
                of a person.
              </p>
              <p>
                It is more than a personal account. It is an invitation to anyone
                held by pain or bitterness to discover that forgiveness is not only
                possible; it is the way out.
              </p>
            </div>

            <dl className="flex flex-wrap gap-x-8 gap-y-3 border-y border-ink-950/15 py-4 my-8">
              {BOOK_META.map(([term, value]) => (
                <div key={term}>
                  <dt className="text-[.66rem] uppercase tracking-[.16em] text-ink-500 mb-1">
                    {term}
                  </dt>
                  <dd className="m-0 font-semibold text-[.9rem] text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap gap-3">
              <Link to="/books" className="btn-primary">
                Explore the book <ArrowRight className="w-4 h-4 arw" />
              </Link>
              <Link to="/books" className="btn-secondary">
                Read the first chapter
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PUBLISHER + MINISTRY ───────────────────────────────────────── */}
      <section className="bg-ink-50 band">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <Reveal className="mb-10 md:mb-14">
            <p className="eyebrow">Beyond the page</p>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.06] tracking-tight text-ink-950 font-semibold mt-4 max-w-[18ch]">
              Two organisations doing the same work
            </h2>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <Reveal>
              <article id="publisher" className="flex flex-col h-full scroll-mt-24">
                <OrgPlate
                  src="/images/vital_logo.jpeg"
                  alt="Vitalreadings Publishers logo"
                  role="Co-founder"
                />
                <h3 className="font-serif text-[clamp(1.5rem,2.2vw,1.9rem)] leading-snug text-ink-950 mt-6 mb-1">
                  Vitalreadings Publishers
                </h3>
                <p className="text-[.78rem] uppercase tracking-[.14em] text-brand-600 font-semibold mb-4">
                  Publishing
                </p>
                <p className="text-[1.0625rem] leading-[1.7] text-ink-700 max-w-[46ch] mb-4">
                  A publishing house built on the conviction that stories of faith,
                  resilience, and restoration deserve a proper readership — and should
                  not have to leave the region to be taken seriously.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] text-ink-700 max-w-[46ch] mb-6">
                  As co-founder, Bruno works to bring life-changing books to readers
                  well beyond Rwanda.
                </p>
                <a
                  href="https://vitalreadings.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-more mt-auto self-start"
                >
                  Visit Vitalreadings <ArrowRight className="w-4 h-4 arw" />
                </a>
              </article>
            </Reveal>

            <Reveal delay={1}>
              <article id="ministry" className="flex flex-col h-full scroll-mt-24">
                <OrgPlate
                  src="/images/ellel_logo.png"
                  alt="Ellel Ministries Rwanda logo"
                  role="Associate team member"
                />
                <h3 className="font-serif text-[clamp(1.5rem,2.2vw,1.9rem)] leading-snug text-ink-950 mt-6 mb-1">
                  Ellel Ministries Rwanda
                </h3>
                <p className="text-[.78rem] uppercase tracking-[.14em] text-brand-600 font-semibold mb-4">
                  Healing &amp; restoration
                </p>
                <p className="text-[1.0625rem] leading-[1.7] text-ink-700 max-w-[46ch] mb-4">
                  Through prayer, teaching, and personal ministry, Bruno walks
                  alongside individuals on their own route toward emotional and
                  spiritual wholeness.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] text-ink-700 max-w-[46ch] mb-6">
                  It is the quietest part of the work and, in his account, the part
                  that keeps the writing honest.
                </p>
                <Link to="/contact" className="link-more mt-auto self-start">
                  About Ellel Rwanda <ArrowRight className="w-4 h-4 arw" />
                </Link>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── QUOTE ──────────────────────────────────────────────────────── */}
      <section className="on-dark bg-brand-900 band text-center">
        <Reveal className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <blockquote className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.16] tracking-tight text-ink-100 max-w-[22ch] mx-auto">
            Stories cross every border — of culture, language, and{' '}
            <em className="text-brand-300">pain.</em>
          </blockquote>
          <cite className="block not-italic text-[.78rem] uppercase tracking-[.2em] text-ink-100/55 mt-8">
            Bruno Iradukunda
          </cite>
        </Reveal>
      </section>

      {/* ── SPEAKING ───────────────────────────────────────────────────── */}
      <section id="speaking" className="on-dark bg-ink-950 band scroll-mt-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start mb-12 md:mb-20">
            <Reveal>
              <p className="eyebrow">Speaking</p>
              <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.06] tracking-tight text-ink-100 font-semibold mt-4 max-w-[16ch]">
                Available for speaking engagements
              </h2>
              <p className="text-[1.1875rem] leading-[1.72] text-ink-200/72 max-w-[44ch] mt-6 mb-8">
                Bruno has spoken in more than ten nations at churches, conferences,
                universities, and community gatherings. He speaks from experience
                rather than theory, and is comfortable with rooms where the subject
                is difficult.
              </p>
              <Link to="/contact" className="btn-accent">
                Check availability <ArrowRight className="w-4 h-4 arw" />
              </Link>
            </Reveal>

            <Reveal delay={1}>
              <h3 className="text-[.72rem] font-semibold uppercase tracking-[.2em] text-ink-400 mb-5">
                Topics
              </h3>
              <ul className="flex flex-wrap gap-2">
                {TOPICS.map((topic, i) => (
                  <li
                    key={topic}
                    className="chip-in text-sm px-4 py-2 rounded-full border border-ink-100/15 text-ink-200/80 transition-colors duration-300 ease-ease hover:border-brand-300 hover:text-brand-300 hover:bg-brand-300/[.07]"
                    style={{ '--chip-d': `${i * 60}ms` }}
                  >
                    {topic}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal>
            <h3 className="text-[.72rem] font-semibold uppercase tracking-[.2em] text-ink-400 mb-5">
              Formats
            </h3>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-x-8 lg:gap-x-14 border-t border-ink-100/15">
            {FORMATS.map(({ name, body }, i) => (
              <Reveal
                key={name}
                variant="reveal-3d"
                delay={i || undefined}
                className="group stage"
              >
                <div className="py-6 transition-transform duration-500 ease-ease [transform:translateZ(0px)] group-hover:[transform:translateZ(30px)]">
                  <h4 className="font-serif text-[1.2rem] text-ink-100 mb-2">{name}</h4>
                  <p className="text-[.98rem] leading-relaxed text-ink-300 m-0 max-w-[34ch]">
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="flex flex-wrap gap-3 mt-10 md:mt-14">
            <Link to="/contact" className="btn-ghost">
              Request a speaker pack
            </Link>
            <Link to="/events" className="btn-ghost">
              See past events
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-ink-50 band text-center">
        <Reveal className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <p className="eyebrow justify-center">Next</p>
          <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.06] tracking-tight text-ink-950 font-semibold max-w-[20ch] mx-auto mt-4">
            Where would you like to begin?
          </h2>
          <p className="text-[1.1875rem] leading-relaxed text-ink-700 max-w-[48ch] mx-auto mt-5 mb-9">
            Read the book, come to an event, or write to Bruno directly.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/books" className="btn-primary">
              Read the book <ArrowRight className="w-4 h-4 arw" />
            </Link>
            <Link to="/events" className="btn-secondary">
              Upcoming events
            </Link>
            <Link to="/contact" className="btn-secondary">
              Get in touch
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
