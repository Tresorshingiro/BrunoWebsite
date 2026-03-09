import { Link } from 'react-router-dom'
import AnimateOnScroll from '../components/AnimateOnScroll'

export default function Mission() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <AnimateOnScroll>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
              My Mission
            </h1>
            <div className="w-20 h-1 bg-white/50 mx-auto mb-8" />
            <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-brand-50">
              To help people rise beyond hatred and pain and become a better version of themselves through forgiveness.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* The Heart of Forgiveness */}
      <section className="py-16 md:py-24 bg-white">
        <AnimateOnScroll>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-8 text-center">
              The Heart of Forgiveness
            </h2>
            <div className="prose prose-lg max-w-none text-ink-700 leading-relaxed space-y-6">
              <p className="text-xl">
                Forgiveness is not merely an act of letting go—it is a transformative journey that reshapes our hearts, 
                our relationships, and our communities. It is the bridge between pain and peace, between brokenness and restoration.
              </p>
              <p>
                Through my own journey from the depths of trauma to the freedom of forgiveness, I have witnessed firsthand 
                the incredible power of grace to heal wounds that seem impossible to mend. This is not just my story—it is 
                a message for anyone who has ever felt trapped by resentment, bitterness, or the weight of unforgiveness.
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Core Values Grid */}
      <section className="py-16 md:py-24 bg-ink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-4 text-center">
              Guided by Faith
            </h2>
            <p className="text-center text-ink-600 text-lg mb-12 max-w-2xl mx-auto">
              These principles guide every aspect of my work and ministry
            </p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimateOnScroll delay="animate-on-scroll-delay-1">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-brand-500">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-ink-900 mb-3">
                  Grace
                </h3>
                <p className="text-ink-600 leading-relaxed">
                  Believing in the transformative power of God&apos;s grace to heal even the deepest wounds and restore broken lives
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay="animate-on-scroll-delay-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-brand-500">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-ink-900 mb-3">
                  Healing
                </h3>
                <p className="text-ink-600 leading-relaxed">
                  Creating spaces where individuals and communities can find emotional, spiritual, and relational restoration
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay="animate-on-scroll-delay-3">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-brand-500">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-ink-900 mb-3">
                  Hope
                </h3>
                <p className="text-ink-600 leading-relaxed">
                  Sharing a message that no situation is too broken, no pain too deep, for God&apos;s redemptive power
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay="animate-on-scroll-delay-1">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-brand-500">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-ink-900 mb-3">
                  Reconciliation
                </h3>
                <p className="text-ink-600 leading-relaxed">
                  Building bridges between divided hearts and communities, fostering understanding and unity through forgiveness
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay="animate-on-scroll-delay-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-brand-500">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-ink-900 mb-3">
                  Empowerment
                </h3>
                <p className="text-ink-600 leading-relaxed">
                  Equipping people with the tools and courage to break free from cycles of pain and become agents of change
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay="animate-on-scroll-delay-3">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-brand-500">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-ink-900 mb-3">
                  Impact
                </h3>
                <p className="text-ink-600 leading-relaxed">
                  Reaching individuals, families, and communities around the world with a message that transforms lives
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Vision Statement */}
      <section className="py-16 md:py-24 bg-white">
        <AnimateOnScroll>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-8 text-center">
              A Vision for Restoration
            </h2>
            <div className="prose prose-xl max-w-none text-ink-700 leading-relaxed">
              <p className="text-center text-xl mb-8 text-ink-800 font-light italic">
                &quot;I believe that forgiveness is not only a personal journey but also a path toward restoring 
                individuals, families, and communities.&quot;
              </p>
              <p>
                My hope is that through these reflections, conversations, and resources, many will find courage to heal 
                and to build a future defined not by pain, but by faith, love, and reconciliation.
              </p>
              <p>
                Whether you are struggling with your own journey of forgiveness, seeking to understand how to help others, 
                or looking for inspiration to start anew, this mission is for you. Together, we can rise beyond the shadows 
                of our past and step into a brighter, more hopeful tomorrow.
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-ink-900 to-ink-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl mb-6">
              Join This Journey
            </h2>
            <p className="text-xl text-ink-200 mb-8 leading-relaxed">
              Whether through reading, speaking engagements, or simply beginning your own path of forgiveness—
              let&apos;s walk this journey together.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/books"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-brand-600 text-white hover:bg-brand-500 transition-colors"
              >
                Read My Story
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium border-2 border-white text-white hover:bg-white hover:text-ink-900 transition-colors"
              >
                Attend an Event
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium border-2 border-white text-white hover:bg-white hover:text-ink-900 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  )
}
