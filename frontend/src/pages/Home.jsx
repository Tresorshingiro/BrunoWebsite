import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { blogApi } from '../lib/api'
import AnimateOnScroll from '../components/AnimateOnScroll'

export default function Home() {
  const [latestPosts, setLatestPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    blogApi.getLatest().then((posts) => setLatestPosts(Array.isArray(posts) ? posts : [])).catch(() => setLatestPosts([])).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero with entrance animations */}
      <section className="relative min-h-screen flex items-center bg-ink-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/bruno-portrait.png"
            alt="Bruno Iradukunda"
            className="w-full h-full object-cover opacity-30 object-[center_30%] animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/80 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 z-10">
          <div className="max-w-xl">
            <p className="font-serif text-brand-400 text-lg md:text-xl mb-2">
              Author &amp; Mentor
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-4 text-white">
              Bruno Iradukunda
            </h1>
            <p className="text-ink-200 text-lg md:text-xl leading-relaxed mb-8">
              Stories of forgiveness, faith, and purposeful living. Author of{' '}
              <em className="text-white">My Forgiveness Story</em>—a genocide survivor&apos;s journey to peace.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/books" className="btn-primary">
                Explore Books
              </Link>
              <Link to="/about" className="btn-secondary border-white text-white hover:bg-white hover:text-ink-900">
                About Bruno
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* My Forgiveness Story – promo section (dark, uses book-promo image) */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-ink-950">
        <div className="absolute inset-0">
          <img
            src="/images/book-promo.png"
            alt=""
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/90 to-ink-950/70" />
        </div>
        <AnimateOnScroll>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-serif text-brand-400 text-sm uppercase tracking-widest mb-3">
              Featured work
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4">
              My Forgiveness Story
            </h2>
            <p className="text-ink-300 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              A genocide survivor&apos;s story of forgiveness &amp; in-depth study of the theme
            </p>
            <Link
              to="/books"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-brand-500 text-white hover:bg-brand-400 transition-colors"
            >
              Discover the book
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Discover the book – product-style section (books + succulent image) */}
      <section className="py-16 md:py-24 bg-[#f5ebe6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <AnimateOnScroll delay="animate-on-scroll-delay-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/book-display.png"
                  alt="My Forgiveness Story – multiple copies on display"
                  className="w-full h-auto object-cover"
                />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay="animate-on-scroll-delay-2">
              <div>
                <p className="text-brand-700 font-medium uppercase tracking-wide text-sm mb-2">
                  In the spotlight
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-4">
                  A journey from trauma to peace
                </h2>
                <p className="text-ink-700 leading-relaxed mb-6">
                  &quot;My Forgiveness Story&quot; is part personal memoir and part in-depth study of forgiveness. 
                  It chronicles Bruno Iradukunda&apos;s path from the trauma of 1994 to finding spiritual and emotional peace—a testament to the power of grace and purposeful living.
                </p>
                <Link to="/books" className="btn-primary">
                  View &amp; purchase
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Latest from Blog */}
      {latestPosts.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-end mb-8">
              <AnimateOnScroll>
                <h2 className="section-heading mb-0">From the Blog</h2>
              </AnimateOnScroll>
              <Link to="/blog" className="text-brand-600 font-medium hover:underline">
                View all
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {latestPosts.map((post, i) => (
                <AnimateOnScroll
                  key={post._id}
                  delay={`animate-on-scroll-delay-${Math.min(i + 1, 3)}`}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block bg-white rounded-xl border border-ink-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt=""
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="p-5">
                      <span className="text-sm text-brand-600 font-medium">{post.category}</span>
                      <h3 className="font-serif text-xl text-ink-900 mt-1 group-hover:text-brand-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-ink-600 text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-brand-600 text-white">
        <AnimateOnScroll>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Join the conversation</h2>
            <p className="text-brand-100 text-lg mb-8">
              Connect for events, readings, and updates on faith, forgiveness, and purposeful living.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-white text-brand-700 hover:bg-brand-50 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </AnimateOnScroll>
      </section>
    </div>
  )
}
