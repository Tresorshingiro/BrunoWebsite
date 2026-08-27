import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '../components/Reveal'
import ClipWords from '../components/ClipWords'
import { useHeroLoad, useParallax, useScrollProgress } from '../hooks/useMotion'

/* ─────────────────────────────────────────────────────────────────────────
   DRAFT COPY — the first-person passages below are written *as Bruno* but
   are not verified quotations. They should be read and approved by him
   before this page is published.
   Every biographical fact here (degrees, illustration work, IBBY, Ellel,
   Vitalreadings, the 2024 book) is carried over from the previous version
   of this page — nothing new has been asserted.
   ───────────────────────────────────────────────────────────────────────── */

const FACTS = [
  ['Based in', 'Kigali, Rwanda'],
  ['Studied', 'Theology · Information Science'],
  ['Published', 'My Forgiveness Story, 2024'],
  ['Also known for', 'Illustration & children’s books'],
  ['Recognition', 'International Board on Books for Young People (IBBY)'],
  ['Speaks at', 'Churches, conferences, universities'],
]

const TIMELINE = [
  {
    year: '1994',
    title: 'A childhood interrupted',
    body: 'The Genocide Against the Tutsi takes members of Bruno’s family. What follows is not a story of instant recovery — it is years of carrying something with no obvious way to put it down.',
  },
  {
    year: 'The years after',
    title: 'Drawing before writing',
    body: 'Long before he was known as a memoirist, Bruno worked as an illustrator and artist, including children’s books such as La Troisième Perle and I Love You — work later recognised by the International Board on Books for Young People.',
  },
  {
    year: 'Study',
    title: 'Theology and information science',
    body: 'Two degrees that sound unrelated and are not: one supplies the spiritual depth of the writing, the other the structured research behind it. It is why the memoir is also a study.',
  },
  {
    year: 'Ministry',
    title: 'Ellel Ministries Rwanda',
    body: 'As an associate team member, Bruno began walking alongside individuals through prayer and teaching — practising in private what he would later say from a stage.',
  },
  {
    year: 'Publishing',
    title: 'Co-founding Vitalreadings',
    body: 'A Rwandan publishing house for stories of faith, resilience, and restoration — built on the conviction that these books should not have to leave the region to be taken seriously.',
  },
  {
    year: '2024',
    title: 'My Forgiveness Story',
    body: 'Part memoir, part in-depth study of the theme. The book traces the road from the trauma of 1994 to spiritual and emotional peace, without pretending the road was short.',
  },
  {
    year: 'Today',
    title: 'The message travels',
    body: 'Speaking in more than ten nations at churches, conferences, universities, and community gatherings — and still writing.',
  },
]

const COMMITMENTS = [
  { tag: 'Grace', title: 'Wounds are not final', body: 'Believing in the transformative power of God’s grace to heal even the deepest wounds and restore broken lives.' },
  { tag: 'Healing', title: 'Space to recover', body: 'Creating room where individuals and communities can find emotional, spiritual, and relational restoration.' },
  { tag: 'Hope', title: 'Nothing too broken', body: 'Insisting that no situation is beyond repair and no pain too deep for God’s redemptive power.' },
  { tag: 'Reconciliation', title: 'Bridges over distance', body: 'Building understanding between divided hearts and communities, one honest conversation at a time.' },
  { tag: 'Empowerment', title: 'Tools, not just words', body: 'Equipping people with the courage and the practical means to break cycles of pain and become agents of change.' },
  { tag: 'Impact', title: 'Beyond one room', body: 'Reaching individuals, families, and communities around the world with a message that changes how they live.' },
]

export default function About() {
  const loaded = useHeroLoad()
  const portraitRef = useParallax(0.06)
  const timelineRef = useScrollProgress()

  return (
    <div className={loaded ? 'loaded' : undefined}>
      {/* ── HERO — the mission statement, promoted from mid-page ────────── */}
      <section className="on-dark relative bg-ink-950 text-ink-100 overflow-hidden pt-32 pb-16 md:pt-44 md:pb-28">
        {/* Aqua glow, bottom-right */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: '-12%',
            bottom: '-40%',
            width: '60vw',
            height: '60vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(31,70,60,.55) 0%, transparent 62%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.25fr_.75fr] gap-10 lg:gap-20 items-center">
          <div>
            <p className="eyebrow hero-fade">About Bruno</p>
            <h1 className="font-serif font-semibold tracking-tight text-[clamp(2.25rem,5.6vw,4.4rem)] leading-[1.02] mt-5">
              <ClipWords
                text="To help people rise beyond hatred and pain, and become a better version of themselves through"
              />
              <ClipWords text="forgiveness." offset={16} accent />
            </h1>
            <p className="hero-fade text-[1.1875rem] leading-relaxed text-ink-200/70 max-w-[46ch] mt-8" data-d="2">
              That sentence is the whole of it. Everything below — the books, the
              publishing house, the ministry, the talks — is one attempt after
              another to make it true for somebody.
            </p>
          </div>

          <figure className="hero-fade m-0" data-d="3">
            <div className="overflow-hidden rounded-card shadow-[0_30px_70px_rgba(0,0,0,.45)]">
              <img
                ref={portraitRef}
                src="/images/bruno-standing.png"
                alt="Portrait of Bruno Iradukunda"
                className="w-full aspect-[4/5] object-cover object-top"
                style={{
                  filter: 'grayscale(1) contrast(1.05)',
                  transform: 'translateY(calc(var(--py, 0px) * -1)) scale(1.06)',
                }}
              />
            </div>
            <figcaption className="text-[.72rem] uppercase tracking-[.16em] text-ink-400 mt-4">
              Kigali, Rwanda
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── IN HIS WORDS — prose + facts rail ──────────────────────────── */}
      <section className="bg-ink-100 band">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.35fr_.65fr] gap-10 lg:gap-20 items-start">
          <Reveal>
            <p className="eyebrow">In his words</p>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.06] tracking-tight text-ink-950 font-semibold mt-4">
              I was not always
              <br />
              going to forgive
            </h2>
            <div className="prose-custom text-[1.1875rem] leading-[1.75] max-w-[64ch] mt-7 space-y-5">
              <p>
                My name is Bruno Iradukunda. I am an author, a speaker, and an
                advocate for forgiveness, healing, and reconciliation — but none of
                those words were true of me for a long time.
              </p>
              <p>
                My life was shaped by personal loss during the 1994 Genocide Against
                the Tutsi. What that leaves behind is not simply grief. It is a
                weight you carry into every room, every relationship, every ordinary
                morning, and it does not lift because time passes.
              </p>
              <p>
                Through faith and the grace of God, that history became the beginning
                of a calling rather than the end of a life. I write and speak now
                because I have met too many people who assume healing is for other
                people — and I do not believe that is true.
              </p>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <dl className="border-t border-ink-950/15">
              {FACTS.map(([term, value], i) => (
                <div
                  key={term}
                  className="fact-row py-4 border-b border-ink-950/15"
                  style={{ '--fact-d': `${i * 80}ms` }}
                >
                  <dt className="text-[.68rem] uppercase tracking-[.18em] text-ink-500 mb-1">
                    {term}
                  </dt>
                  <dd className="m-0 font-medium text-[.98rem] text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── TIMELINE — spine draws downward with scroll ─────────────────── */}
      <section className="bg-ink-50 band">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <Reveal className="mb-10 md:mb-16">
            <p className="eyebrow">The long version</p>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.06] tracking-tight text-ink-950 font-semibold mt-4 max-w-[18ch]">
              How the story actually went
            </h2>
          </Reveal>

          <div ref={timelineRef} className="tl">
            {TIMELINE.map(({ year, title, body }, i) => (
              <Reveal key={title} delay={(i % 3) || undefined} className="tl-item">
                <div className="tl-year">{year}</div>
                <div className="tl-body">
                  <h3 className="font-serif text-[1.3rem] leading-snug text-ink-950 mb-2">
                    {title}
                  </h3>
                  <p className="text-[1.0625rem] leading-[1.7] text-ink-700 m-0 max-w-[58ch]">
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMITMENTS ────────────────────────────────────────────────── */}
      <section className="bg-ink-100 band">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <Reveal className="mb-10 md:mb-16">
            <p className="eyebrow">What guides the work</p>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.06] tracking-tight text-ink-950 font-semibold mt-4 max-w-[20ch]">
              Six commitments, held at once
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-14">
            {COMMITMENTS.map(({ tag, title, body }, i) => (
              <Reveal
                key={tag}
                variant="reveal-3d"
                delay={(i % 3) || undefined}
                className="group stage"
              >
                <article className="py-7 border-b border-ink-950/15 transition-[transform,border-color] duration-500 ease-ease group-hover:border-brand-600 [transform:translateZ(0px)] group-hover:[transform:translateZ(28px)]">
                  <p className="text-[.68rem] uppercase tracking-[.2em] font-semibold text-brand-600 mb-3">
                    {tag}
                  </p>
                  <h3 className="font-serif text-[1.25rem] leading-snug text-ink-950 mb-2">
                    {title}
                  </h3>
                  <p className="text-[1.02rem] leading-[1.68] text-ink-700 m-0 max-w-[38ch]">
                    {body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ──────────────────────────────────────────────────────── */}
      <section className="on-dark bg-brand-900 band text-center">
        <Reveal className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <blockquote className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.16] tracking-tight text-ink-100 max-w-[22ch] mx-auto">
            Forgiveness is not something you feel. It is something you{' '}
            <em className="text-brand-300">decide</em>, and then keep deciding.
          </blockquote>
          <cite className="block not-italic text-[.78rem] uppercase tracking-[.2em] text-ink-100/55 mt-8">
            Bruno Iradukunda
          </cite>
        </Reveal>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-ink-50 band text-center">
        <Reveal className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <p className="eyebrow justify-center">Next</p>
          <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.06] tracking-tight text-ink-950 font-semibold max-w-[20ch] mx-auto mt-4">
            Start with the book
          </h2>
          <p className="text-[1.1875rem] leading-relaxed text-ink-700 max-w-[48ch] mx-auto mt-5 mb-9">
            Or come to an event, or write to Bruno directly — whichever feels like
            the right first step.
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
