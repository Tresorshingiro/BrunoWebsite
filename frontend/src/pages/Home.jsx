import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Mic, ArrowRight, Quote } from 'lucide-react'
import { blogApi } from '../lib/api'
import AnimateOnScroll from '../components/AnimateOnScroll'
import Reveal from '../components/Reveal'
import Book3D from '../components/Book3D'
import ReachMap from '../components/ReachMap'
import { useParallax, useCountUp } from '../hooks/useMotion'

/* ── Content for the sections adapted from the mockup ──────────────────────
   Biographical copy that changes roughly once a year; kept here rather than
   behind an admin CRUD screen. */

const ROLES = [
  {
    tag: 'Author',
    title: 'Writing',
    body: 'A memoir and an ongoing body of essays on faith, memory, and the practical work of healing after harm.',
  },
  {
    tag: 'Publisher',
    title: 'Vitalreadings',
    body: 'Co-founder of a Rwandan publishing house bringing stories of resilience and restoration to readers beyond the region.',
  },
  {
    tag: 'Ministry',
    title: 'Ellel Rwanda',
    body: 'Walking alongside individuals through prayer and teaching, living out the message the books describe.',
  },
]

const TOPICS = [
  'Forgiveness & reconciliation',
  'Healing from trauma',
  'Faith & restoration',
  'Genocide awareness',
  'Community healing',
  'Rwanda & resilience',
]

// ── Stat pill ────────────────────────────────────────────────────────────────
// Splits "30+" into a number to animate and a suffix to keep. Anything that
// isn't digit-led (or reduced-motion) renders as-is — the value is never hidden
// behind the animation.
function StatItem({ value, label }) {
  const match = String(value).match(/^(\d+)(.*)$/)
  const [ref, count] = useCountUp(match ? Number(match[1]) : 0)

  return (
    <div ref={ref} className="text-center md:text-left">
      <p className="font-serif text-3xl md:text-4xl font-semibold text-white leading-none tabular-nums">
        {match ? `${count}${match[2]}` : value}
      </p>
      <p className="text-ink-400 text-xs uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Home() {
  const [latestPosts, setLatestPosts] = useState([])
  const [expanded, setExpanded] = useState(false)

  // Depth / 3D
  const heroMobileRef = useParallax(0.15)
  const heroDesktopRef = useParallax(0.15)

  useEffect(() => {
    blogApi
      .getPublished({ limit: 4 })
      .then((data) => setLatestPosts(Array.isArray(data?.posts) ? data.posts : []))
      .catch(() => setLatestPosts([]))
  }, [])

  const featuredPost = latestPosts[0]
  const sidePosts = latestPosts.slice(1, 4)

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-ink-950 text-white overflow-hidden">

        {/* ── MOBILE: full-bleed portrait background ── */}
        <div ref={heroMobileRef} className="absolute inset-0 md:hidden" style={{ transform: 'translateY(var(--py, 0px))' }} aria-hidden="true">
          <img
            src="/images/bruno-portrait.png"
            alt=""
            className="w-full h-full object-cover object-[60%_20%] opacity-55 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-ink-950/50 to-ink-950/10" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-ink-950 to-transparent" />
        </div>

        {/* ── DESKTOP: proper split layout ── */}
        <div ref={heroDesktopRef} className="hidden md:block absolute inset-0" style={{ transform: 'translateY(var(--py, 0px))' }} aria-hidden="true">
          {/* Right panel: portrait in its own contained area */}
          <div className="absolute right-0 top-0 bottom-0 w-[52%]">
            <img
              src="/images/bruno-portrait.png"
              alt=""
              className="w-full h-full object-cover object-[50%_12%] animate-fade-in"
              style={{ opacity: 0.75 }}
            />
            {/* Dark overlay to pull white bg toward ink */}
            <div className="absolute inset-0 bg-ink-950/35" />
            {/* Left edge blends into the dark left panel */}
            <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-ink-950 to-transparent" />
            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
          </div>
          {/* Left panel: solid dark */}
          <div className="absolute left-0 top-0 bottom-0 w-[52%] bg-gradient-to-r from-ink-950 via-ink-950 to-transparent" />
        </div>

        {/* ── CONTENT (both breakpoints) ── */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 md:py-32 min-h-screen flex items-end md:items-center">
          <div className="max-w-lg w-full mb-10 md:mb-0">

            {/* Eyebrow */}
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both', opacity: 0 }}>
              <div className="inline-flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-brand-400 text-xs font-semibold uppercase tracking-[0.18em]">
                  Author · Speaker · Forgiveness Advocate
                </span>
              </div>
            </div>

            {/* Name */}
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both', opacity: 0 }}>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-semibold leading-[1.05] tracking-tight text-white mb-5">
                Bruno
                <br />
                <span className="text-ink-200">Iradukunda</span>
              </h1>
            </div>

            {/* Gold rule */}
            <div className="animate-fade-in mb-6" style={{ animationDelay: '350ms', animationFillMode: 'both', opacity: 0 }}>
              <div className="flex items-center gap-3">
                <span className="block h-px w-12 bg-brand-500" />
                <span className="block h-px w-20 bg-ink-700" />
              </div>
            </div>

            {/* Tagline */}
            <div className="animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both', opacity: 0 }}>
              {/* P1 — always visible */}
              <p className="text-lg md:text-xl text-ink-200 leading-relaxed mb-3">
                A son of God called to share a message of forgiveness, healing, and hope.
              </p>

              {/* Expanded content — hidden on mobile until toggled, always visible on md+ */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out md:overflow-visible md:max-h-none ${
                  expanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 md:opacity-100'
                }`}
              >
                <p className="text-base md:text-lg text-ink-300 leading-relaxed mb-2">
                  A Rwandan author and speaker whose journey was shaped by the wounds and lessons following the 1994 Genocide Against the Tutsi.
                </p>
                <p className="text-base md:text-lg text-ink-300 leading-relaxed mb-3">
                  His testimony of radical forgiveness has resonated across more than 10 nations — offering audiences a path from pain and hatred to freedom and purpose.
                </p>
              </div>

              {/* Read more / less toggle — mobile only */}
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="md:hidden mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors cursor-pointer group"
              >
                <span>{expanded ? 'Read less' : 'Read more'}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : 'group-hover:translate-y-0.5'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* CTA buttons */}
            <div
              className="animate-fade-in-up flex flex-col gap-3"
              style={{ animationDelay: '500ms', animationFillMode: 'both', opacity: 0 }}
            >
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                <Link to="/about" className="btn-primary gap-2 cursor-pointer justify-center">
                  Read My Story <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/books" className="inline-flex items-center justify-center gap-2 px-4 sm:px-7 py-3.5 rounded-lg font-semibold border border-white/30 text-white hover:bg-white/10 transition-colors text-sm cursor-pointer">
                  <BookOpen className="w-4 h-4" /> Discover the Book
                </Link>
              </div>
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg font-semibold border border-white/20 text-ink-300 hover:text-white hover:border-white/40 transition-colors text-sm cursor-pointer sm:w-fit">
                <Mic className="w-4 h-4" /> Invite Me to Speak
              </Link>
            </div>

            {/* Stats */}
            <div
              className="animate-fade-in-up mt-12 pt-8 border-t border-ink-800 grid grid-cols-3 gap-6"
              style={{ animationDelay: '650ms', animationFillMode: 'both', opacity: 0 }}
            >
              <StatItem value="1" label="Published Book" />
              <StatItem value="10+" label="Nations Reached" />
              <StatItem value="30+" label="Speaking Events" />
            </div>
          </div>
        </div>

        {/* Floating quote card — desktop only, bottom-right */}
        <div
          className="hidden lg:block absolute right-10 xl:right-16 bottom-16 max-w-[260px] z-20 animate-fade-in-up"
          style={{ animationDelay: '800ms', animationFillMode: 'both', opacity: 0 }}
        >
          <div className="bg-ink-950/80 backdrop-blur-md border border-brand-500/25 rounded-2xl p-5 shadow-2xl">
            <Quote className="w-5 h-5 text-brand-400 mb-3" />
            <p className="font-serif text-base text-ink-100 leading-relaxed italic">
              &ldquo;Forgiveness is not a feeling. It&rsquo;s a choice that sets you free.&rdquo;
            </p>
            <p className="text-brand-400 text-[10px] font-semibold uppercase tracking-widest mt-3">
              — Bruno Iradukunda
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 opacity-40 animate-bounce" aria-hidden="true">
          <span className="text-[10px] uppercase tracking-widest text-ink-400">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-ink-400 to-transparent" />
        </div>
      </section>
      {/* ── BOOK SPOTLIGHT ───────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 bg-[#f7f0e8] overflow-hidden">
        {/* Decorative background text */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <span className="font-serif text-[12rem] md:text-[18rem] font-semibold text-ink-900/[0.03] leading-none whitespace-nowrap">
            Forgiveness
          </span>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">

            {/* Book image */}
            <AnimateOnScroll delay="animate-on-scroll-delay-1">
              <Book3D />
            </AnimateOnScroll>

            {/* Book info */}
            <AnimateOnScroll delay="animate-on-scroll-delay-2">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-brand-400 text-xs font-semibold uppercase tracking-widest">
                    Featured Work
                  </span>
                </div>
                <h2 className="font-serif text-4xl md:text-5xl text-ink-900 font-semibold leading-tight mb-2">
                  My Forgiveness
                  <br />
                  <span className="text-brand-700">Story</span>
                </h2>
                <p className="text-ink-500 text-sm uppercase tracking-wider mb-6 font-medium">
                  Memoir · Personal Growth · Faith
                </p>
                <p className="text-ink-700 leading-relaxed mb-4 text-lg">
                  Part personal memoir, part in-depth study — this book chronicles Bruno&apos;s path
                  from the trauma of 1994 to finding spiritual and emotional peace.
                </p>
                <p className="text-ink-500 leading-relaxed mb-8">
                  A testament to the power of grace, purposeful living, and the freedom that comes
                  from choosing to forgive the unforgivable.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/books"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg font-semibold bg-ink-900 text-white hover:bg-ink-800 transition-colors text-sm cursor-pointer"
                  >
                    View &amp; Purchase
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/books"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg font-semibold border-2 border-ink-200 text-ink-700 hover:border-ink-400 transition-colors text-sm cursor-pointer"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── THE WORK (replaces the old Impact banner) ──────────────────── */}
      <section className="bg-ink-50 band">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <Reveal className="mb-10 md:mb-16 flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
            <div>
              <p className="eyebrow">The work</p>
              {/* Measure lives on the heading so ch resolves against its own
                  font-size and the line break scales with the clamp. */}
              <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.05] tracking-tight text-ink-950 font-semibold mt-4 max-w-[20ch]">
                Three ways the same message travels
              </h2>
            </div>
            <Link to="/my-work" className="link-more">
              See the full body of work <ArrowRight className="w-4 h-4 arw" />
            </Link>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {ROLES.map(({ tag, title, body }, i) => (
              <Reveal
                key={title}
                variant="reveal-3d"
                delay={i || undefined}
                className="group stage"
              >
                {/* translateZ inside the .stage perspective — a perspective-correct
                    lift toward the viewer, not a flat scale. */}
                <article className="border-t border-ink-950/15 pt-6 transition-[transform,border-color] duration-500 ease-ease group-hover:border-brand-600 [transform:translateZ(0px)] group-hover:[transform:translateZ(34px)]">
                  <p className="text-[.68rem] uppercase tracking-[.2em] font-semibold text-brand-600 mb-4">
                    {tag}
                  </p>
                  <h3 className="font-serif text-[clamp(1.5rem,2.2vw,1.9rem)] leading-tight text-ink-950 mb-3">
                    {title}
                  </h3>
                  <p className="text-ink-700 leading-relaxed">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WRITING (replaces the old three-equal-card blog grid) ──────── */}
      {featuredPost && (
        <section className="bg-ink-100 band">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
            <Reveal className="flex items-end justify-between gap-8 mb-8 md:mb-12">
              <div>
                <p className="eyebrow">Writing</p>
                <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.05] tracking-tight text-ink-950 font-semibold mt-4">
                  From the journal
                </h2>
              </div>
              <Link to="/blog" className="link-more">
                All posts <ArrowRight className="w-4 h-4 arw" />
              </Link>
            </Reveal>

            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-11">
              <Reveal>
                <Link to={`/blog/${featuredPost.slug}`} className="group flex flex-col h-full">
                  <div className="relative aspect-[16/11] rounded-card overflow-hidden bg-ink-200">
                    {featuredPost.coverImage ? (
                      <img
                        src={featuredPost.coverImage}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-ease group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center bg-gradient-to-br from-ink-300 to-ink-200">
                        <BookOpen className="w-10 h-10 text-ink-500" />
                      </div>
                    )}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, rgba(12,20,18,.5), transparent 55%)' }}
                    />
                  </div>
                  <p className="text-[.68rem] uppercase tracking-[.18em] font-semibold text-brand-600 mt-5 mb-2">
                    {featuredPost.category}
                  </p>
                  <h3 className="font-serif text-[clamp(1.5rem,2.2vw,1.9rem)] leading-tight text-ink-950 transition-colors group-hover:text-brand-600">
                    {featuredPost.title}
                  </h3>
                  {featuredPost.excerpt && (
                    <p className="text-ink-700 leading-relaxed mt-3 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <p className="mt-auto pt-5 text-[.78rem] uppercase tracking-[.1em] text-ink-500">
                    {featuredPost.readTime || 5} min read
                  </p>
                </Link>
              </Reveal>

              <div className="grid gap-6 lg:gap-9 content-start">
                {sidePosts.map((post, i) => (
                  <Reveal key={post._id} delay={i + 1}>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group grid grid-cols-[110px_1fr] gap-4 items-start"
                    >
                      <div className="aspect-square rounded-card overflow-hidden bg-ink-200">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 ease-ease group-hover:scale-[1.05]"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center bg-gradient-to-br from-ink-300 to-ink-200">
                            <BookOpen className="w-5 h-5 text-ink-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[.68rem] uppercase tracking-[.18em] font-semibold text-brand-600 mb-1.5">
                          {post.category}
                        </p>
                        <h3 className="font-serif text-lg leading-snug text-ink-950 transition-colors group-hover:text-brand-600">
                          {post.title}
                        </h3>
                        <p className="text-[.78rem] uppercase tracking-[.1em] text-ink-500 mt-2">
                          {post.readTime || 4} min read
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SPEAKING (replaces the old Promo banner + Let's Connect CTA) ── */}
      <section className="on-dark bg-ink-950 band">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <Reveal>
            <p className="eyebrow">Speaking</p>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] leading-[1.05] tracking-tight text-ink-100 font-semibold mt-4">
              Bring this story
              <br />
              to your room
            </h2>
            <p className="text-[1.1875rem] leading-relaxed text-ink-200/75 max-w-[42ch] mt-6 mb-8">
              Churches, conferences, universities, and community gatherings across
              more than ten nations. Bruno speaks from experience, not theory.
            </p>
            <Link to="/contact" className="btn-accent">
              <Mic className="w-4 h-4" />
              Invite Me to Speak <ArrowRight className="w-4 h-4 arw" />
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
                  style={{ '--chip-d': `${i * 70}ms` }}
                >
                  {topic}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Reach map — placeholder nations, see ReachMap.jsx */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mt-14 md:mt-20">
          <div className="flex items-end justify-between gap-6 mb-6">
            <h3 className="text-[.72rem] font-semibold uppercase tracking-[.2em] text-ink-400">
              Where the message has travelled
            </h3>
          </div>
          <ReachMap />

        </div>
      </section>
    </div>
  )
}
