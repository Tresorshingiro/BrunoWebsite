import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { blogApi } from '../lib/api'
import AnimateOnScroll from '../components/AnimateOnScroll'
import { BookOpen, Mic, Users, ArrowRight, Quote } from 'lucide-react'

// ── Stat pill ────────────────────────────────────────────────────────────────
function StatItem({ value, label }) {
  return (
    <div className="text-center md:text-left">
      <p className="font-serif text-3xl md:text-4xl font-semibold text-white leading-none">
        {value}
      </p>
      <p className="text-ink-400 text-xs uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

// ── Blog card ────────────────────────────────────────────────────────────────
function BlogCard({ post, delay }) {
  return (
    <AnimateOnScroll delay={delay}>
      <Link
        to={`/blog/${post.slug}`}
        className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-ink-100 hover:border-brand-300 hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
      >
        {post.coverImage ? (
          <div className="relative overflow-hidden h-52">
            <img
              src={post.coverImage}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="absolute bottom-3 left-4 text-xs font-semibold text-white bg-brand-600/90 px-3 py-1 rounded-full">
              {post.category}
            </span>
          </div>
        ) : (
          <div className="h-52 bg-gradient-to-br from-ink-100 to-ink-200 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-ink-400" />
          </div>
        )}
        <div className="p-5 flex flex-col flex-1">
          {!post.coverImage && (
            <span className="text-xs font-semibold text-brand-600 mb-2">{post.category}</span>
          )}
          <h3 className="font-serif text-xl text-ink-900 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug flex-1">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-ink-500 text-sm mt-2 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          <div className="mt-4 flex items-center gap-1 text-brand-600 text-sm font-medium">
            Read article
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </AnimateOnScroll>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Home() {
  const [latestPosts, setLatestPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    blogApi
      .getLatest()
      .then((posts) => setLatestPosts(Array.isArray(posts) ? posts : []))
      .catch(() => setLatestPosts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-ink-950 text-white overflow-hidden">

        {/* ── MOBILE: full-bleed portrait background ── */}
        <div className="absolute inset-0 md:hidden" aria-hidden="true">
          <img
            src="/images/bruno-portrait.png"
            alt=""
            className="w-full h-full object-cover object-[60%_20%] opacity-55 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-ink-950/50 to-ink-950/10" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-ink-950 to-transparent" />
        </div>

        {/* ── DESKTOP: proper split layout ── */}
        <div className="hidden md:block absolute inset-0" aria-hidden="true">
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
                <span className="block w-8 h-px bg-brand-500 flex-shrink-0" />
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
              <div className="relative">
                {/* Gold decorative rectangle behind image */}
                <div className="absolute -top-4 -left-4 w-full h-full rounded-2xl border-2 border-brand-500/30" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/images/book-display.png"
                    alt="My Forgiveness Story book display"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </AnimateOnScroll>

            {/* Book info */}
            <AnimateOnScroll delay="animate-on-scroll-delay-2">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="block w-8 h-px bg-brand-500" />
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

      {/* ── IMPACT BANNER ────────────────────────────────────────────────── */}
      <section className="bg-ink-950 py-14 border-y border-ink-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateOnScroll>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              {[
                { icon: BookOpen, value: '1', label: 'Published Book' },
                { icon: Mic, value: '30+', label: 'Speaking Events' },
                { icon: Users, value: '10+', label: 'Nations Reached' },
                { icon: Quote, value: '1994', label: 'Story Begins' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center text-center group">
                  <Icon className="w-5 h-5 text-brand-400 mb-3 opacity-70" />
                  <span className="font-serif text-4xl md:text-5xl font-semibold text-white leading-none">
                    {value}
                  </span>
                  <span className="text-ink-500 text-xs uppercase tracking-widest mt-2">{label}</span>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── PROMO BANNER (dark) ───────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-ink-900">
        <div className="absolute inset-0">
          <img
            src="/images/book-promo.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center opacity-20"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/50" />
        </div>
        <AnimateOnScroll>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="block w-6 h-px bg-brand-500" />
              <span className="text-brand-400 text-xs font-semibold uppercase tracking-widest">
                A Story of Redemption
              </span>
              <span className="block w-6 h-px bg-brand-500" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-5 leading-tight">
              From Ashes<br />
              <span className="italic text-brand-400">to Purpose</span>
            </h2>
            <p className="text-ink-300 text-lg md:text-xl max-w-xl mx-auto mb-8 leading-relaxed">
              How a genocide survivor found peace, purpose, and a mission to help the world heal.
            </p>
            <Link
              to="/about"
              className="btn-primary gap-2 cursor-pointer"
            >
              Discover His Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ── LATEST BLOG ──────────────────────────────────────────────────── */}
      {(loading || latestPosts.length > 0) && (
        <section className="py-16 md:py-24 bg-ink-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="block w-6 h-px bg-brand-500" />
                    <span className="text-brand-400 text-xs font-semibold uppercase tracking-widest">
                      Thoughts &amp; Reflections
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink-900">
                    From the Blog
                  </h2>
                </div>
                <Link
                  to="/blog"
                  className="hidden sm:inline-flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:text-brand-800 transition-colors group cursor-pointer"
                >
                  View all posts
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </AnimateOnScroll>

            {loading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl overflow-hidden bg-white border border-ink-100">
                    <div className="h-52 bg-ink-100 animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-ink-100 rounded w-1/3 animate-pulse" />
                      <div className="h-5 bg-ink-100 rounded w-5/6 animate-pulse" />
                      <div className="h-4 bg-ink-100 rounded w-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {latestPosts.map((post, i) => (
                  <BlogCard
                    key={post._id}
                    post={post}
                    delay={`animate-on-scroll-delay-${Math.min(i + 1, 3)}`}
                  />
                ))}
              </div>
            )}

            <div className="mt-8 text-center sm:hidden">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm cursor-pointer"
              >
                View all posts <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── SPEAKING CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-ink-950 text-white relative overflow-hidden">
        {/* Gold accent blob */}
        <div
          className="absolute -top-32 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(40,119,129,0.12) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-12 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(40,119,129,0.08) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <AnimateOnScroll>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="block w-6 h-px bg-brand-500/60" />
              <Mic className="w-4 h-4 text-brand-400" />
              <span className="block w-6 h-px bg-brand-500/60" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-5 leading-tight">
              Let&apos;s Connect
            </h2>
            <p className="text-ink-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
              Whether you want to book a speaking engagement, share your own journey, or simply get in touch — Bruno would love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="btn-primary gap-2 w-full sm:w-auto cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                Invite Me to Speak
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold border border-ink-700 text-ink-300 hover:border-ink-500 hover:text-white transition-colors text-sm w-full sm:w-auto cursor-pointer"
              >
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </AnimateOnScroll>
      </section>
    </div>
  )
}
