import { Link } from 'react-router-dom'
import AnimateOnScroll from '../components/AnimateOnScroll'

const speakingTopics = [
  'Forgiveness & Reconciliation',
  'Healing from Trauma',
  'Faith & Restoration',
  'Genocide Awareness',
  'Community Healing',
  'Christian Discipleship',
  'Personal Transformation',
  'Rwanda & Resilience',
]

export default function MyWork() {
  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[50vh] flex items-center bg-ink-900 text-white overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-brand-700/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[350px] h-[350px] rounded-full bg-brand-600/10 blur-2xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20 w-full">
          <AnimateOnScroll>
            <p className="text-brand-400 font-medium tracking-widest uppercase text-sm mb-4">
              What I Do
            </p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-6 max-w-3xl">
              My Work &amp; <span className="text-brand-400">Ministry</span>
            </h1>
            <div className="w-16 h-1 bg-brand-500 mb-8" />
            <p className="text-xl text-ink-300 leading-relaxed max-w-2xl">
              Author, publisher, and ministry partner — each role united by a single calling:
              to inspire healing, faith, and reconciliation through the power of story.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Role 01 — Author ─────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateOnScroll>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left — content */}
              <div>
                <span className="text-[120px] md:text-[160px] font-serif font-bold text-ink-50 leading-none select-none block -mb-8">
                  01
                </span>
                <p className="text-brand-600 font-semibold tracking-widest uppercase text-sm mb-3">
                  Author
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-6 leading-snug">
                  My Forgiveness Story
                </h2>
                <p className="text-ink-600 text-lg leading-relaxed mb-4">
                  A Genocide Survivor&apos;s Story of Forgiveness and the In-depth Study of the Theme — a memoir
                  published in 2024 that chronicles the journey from the trauma of the 1994 Genocide Against
                  the Tutsi to spiritual peace and restoration.
                </p>
                <p className="text-ink-600 leading-relaxed mb-8">
                  This book is more than a personal story. It is an invitation for anyone trapped by pain or
                  bitterness to discover that forgiveness is not only possible — it is the path to freedom.
                </p>
                <Link
                  to="/books"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors"
                >
                  Explore the Book
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Right — book cover */}
              <div className="relative flex items-center justify-center">
                <div className="relative">
                  <img
                    src="/images/book-cover.png"
                    alt="My Forgiveness Story book cover"
                    className="w-56 md:w-72 rounded-2xl shadow-2xl object-cover"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-ink-900 text-white px-4 py-2 rounded-xl shadow-xl text-sm font-medium">
                    Published 2024
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Bold Quote ───────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-brand-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 text-[200px] font-serif leading-none text-white/5 select-none pointer-events-none">
          &ldquo;
        </div>
        <AnimateOnScroll>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
            <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-white mb-6">
              Stories have the power to cross every border — of culture, language, and pain —
              and remind us that healing is always within reach.
            </p>
            <span className="text-brand-200 font-medium">— Bruno Iradukunda</span>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ── Role 02 — Publisher ──────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-ink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateOnScroll>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left — logo */}
              <div className="relative flex items-center justify-center order-2 lg:order-1">
                <div className="relative">
                  <div className="w-56 h-56 md:w-72 md:h-72 rounded-3xl bg-ink-900 flex items-center justify-center shadow-2xl p-8">
                    <img
                      src="/images/vital_logo.jpeg"
                      alt="Vitalreadings Publishers logo"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <div className="absolute -top-4 -left-4 bg-brand-600 text-white px-4 py-2 rounded-xl shadow-xl text-sm font-medium">
                    Co-Founder
                  </div>
                </div>
              </div>

              {/* Right — content */}
              <div className="order-1 lg:order-2">
                <span className="text-[120px] md:text-[160px] font-serif font-bold text-ink-200 leading-none select-none block -mb-8">
                  02
                </span>
                <p className="text-brand-600 font-semibold tracking-widest uppercase text-sm mb-3">
                  Publisher
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-6 leading-snug">
                  Vitalreadings Publishers
                </h2>
                <p className="text-ink-600 text-lg leading-relaxed mb-4">
                  As Co-Founder of Vitalreadings Publishers, Bruno is committed to bringing powerful,
                  life-changing stories to readers around the world.
                </p>
                <p className="text-ink-600 leading-relaxed">
                  The publishing house focuses on books that speak to the human experience — stories of
                  faith, resilience, and restoration that cross cultural borders and touch hearts globally.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Role 03 — Ministry ──────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateOnScroll>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left — content */}
              <div>
                <span className="text-[120px] md:text-[160px] font-serif font-bold text-ink-50 leading-none select-none block -mb-8">
                  03
                </span>
                <p className="text-brand-600 font-semibold tracking-widest uppercase text-sm mb-3">
                  Ministry
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-6 leading-snug">
                  Ellel Ministries Rwanda
                </h2>
                <p className="text-ink-600 text-lg leading-relaxed mb-4">
                  As an Associate Team Member of Ellel Ministries Rwanda, Bruno actively participates
                  in ministries focused on healing and restoration.
                </p>
                <p className="text-ink-600 leading-relaxed">
                  Through prayer, teaching, and personal ministry, he walks alongside individuals on
                  their journey toward emotional and spiritual wholeness — living out the very message
                  he writes and speaks about.
                </p>
              </div>

              {/* Right — logo */}
              <div className="relative flex items-center justify-center">
                <div className="relative">
                  <div className="w-56 h-56 md:w-72 md:h-72 rounded-3xl bg-white flex items-center justify-center shadow-2xl border border-ink-100 p-8">
                    <img
                      src="/images/ellel_logo.png"
                      alt="Ellel Ministries Rwanda logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-brand-600 text-white px-4 py-2 rounded-xl shadow-xl text-sm font-medium">
                    Healing &amp; Restoration
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Speaking Topics ──────────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-ink-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(46,148,156,0.15),transparent_60%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <AnimateOnScroll>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-brand-400 font-semibold tracking-widest uppercase text-sm mb-4">
                  Speaking
                </p>
                <h2 className="font-serif text-3xl md:text-4xl mb-6 leading-snug">
                  Available for Speaking Engagements
                </h2>
                <p className="text-ink-300 text-lg leading-relaxed mb-8">
                  Bruno speaks at churches, conferences, universities, and community events — bringing
                  a message grounded in personal experience, faith, and hope.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-500 transition-colors"
                >
                  Book Bruno to Speak
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              <div>
                <p className="text-ink-400 text-sm uppercase tracking-widest mb-5 font-medium">
                  Topics include
                </p>
                <div className="flex flex-wrap gap-3">
                  {speakingTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-4 py-2 rounded-full border border-ink-700 text-ink-300 text-sm hover:border-brand-500 hover:text-brand-400 transition-colors cursor-default"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-white">
        <AnimateOnScroll>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-4">
              Ready to Connect?
            </h2>
            <p className="text-ink-600 text-lg mb-10 leading-relaxed">
              Whether you want to read the book, attend an event, or invite Bruno to speak —
              every journey toward healing begins with a single step.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/books"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
              >
                Read My Books
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border-2 border-ink-200 text-ink-700 font-medium hover:border-brand-500 hover:text-brand-600 transition-colors"
              >
                Upcoming Events
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border-2 border-ink-200 text-ink-700 font-medium hover:border-brand-500 hover:text-brand-600 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

    </div>
  )
}
