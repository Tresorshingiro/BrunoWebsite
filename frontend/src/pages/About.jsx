import { Link } from 'react-router-dom'
import AnimateOnScroll from '../components/AnimateOnScroll'

export default function About() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-ink-900 to-ink-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
            About Bruno
          </h1>
          <p className="text-xl text-ink-200 leading-relaxed">
            A journey of faith, forgiveness, and restoration
          </p>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 md:py-24 bg-white">
        <AnimateOnScroll>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="order-2 md:order-1">
                <img
                  src="/images/bruno-standing.png"
                  alt="Bruno Iradukunda"
                  className="rounded-xl shadow-2xl w-full max-w-md mx-auto"
                />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-6">
                  Welcome
                </h2>
                <div className="space-y-4 text-lg text-ink-700 leading-relaxed">
                  <p>
                    My name is Bruno Iradukunda, an author, speaker, and advocate for forgiveness, healing, and reconciliation. 
                    My life journey has been profoundly shaped by personal loss during the 1994 Genocide Against the Tutsi.
                  </p>
                  <p>
                    Yet through faith and the grace of God, that painful history became the beginning of a deeper calling: 
                    to share a message of forgiveness and restoration.
                  </p>
                  <p>
                    Through my writing, speaking, and ministry, I seek to encourage individuals and communities to believe 
                    that even after deep pain, healing is possible and forgiveness can transform lives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* My Work Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-ink-50 to-white">
        <AnimateOnScroll>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-4 text-center">
              My Work
            </h2>
            <p className="text-center text-brand-600 text-lg mb-12 max-w-2xl mx-auto">
              Through these roles, I am committed to sharing stories that inspire healing, faith, and reconciliation.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group bg-white rounded-2xl p-8 shadow-lg border-2 border-ink-100 hover:border-brand-400 hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors">
                  <svg className="w-8 h-8 text-brand-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-ink-900 mb-3 group-hover:text-brand-600 transition-colors">
                  Author
                </h3>
                <p className="text-ink-600 leading-relaxed mb-2">
                  <strong className="text-ink-800">My Forgiveness Story:</strong>
                </p>
                <p className="text-ink-600 leading-relaxed">
                  A Genocide Survivor&apos;s Story of Forgiveness and the In-depth Study of the Theme
                </p>
              </div>

              <div className="group bg-white rounded-2xl p-8 shadow-lg border-2 border-ink-100 hover:border-brand-400 hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors">
                  <svg className="w-8 h-8 text-brand-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-ink-900 mb-3 group-hover:text-brand-600 transition-colors">
                  Co-Founder
                </h3>
                <p className="text-ink-600 leading-relaxed mb-2">
                  <strong className="text-ink-800">Vitalreadings Publishers</strong>
                </p>
                <p className="text-ink-600 leading-relaxed">
                  Publishing stories that inspire healing, faith, and reconciliation in communities worldwide
                </p>
              </div>

              <div className="group bg-white rounded-2xl p-8 shadow-lg border-2 border-ink-100 hover:border-brand-400 hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors">
                  <svg className="w-8 h-8 text-brand-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-ink-900 mb-3 group-hover:text-brand-600 transition-colors">
                  Ministry Partner
                </h3>
                <p className="text-ink-600 leading-relaxed mb-2">
                  <strong className="text-ink-800">Ellel Ministries Rwanda</strong>
                </p>
                <p className="text-ink-600 leading-relaxed">
                  Associate Team Member committed to ministries of healing and restoration
                </p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Background & Experience */}
      <section className="py-16 md:py-24 bg-ink-50">
        <AnimateOnScroll>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-8 text-center">
              Background & Experience
            </h2>
            <div className="prose prose-lg max-w-none text-ink-700 leading-relaxed space-y-4">
              <p>
                Bruno holds degrees in both <strong className="text-ink-900">Theology</strong> and <strong className="text-ink-900">Information Science</strong>, 
                which informs the blend of spiritual depth and structured research in his writing.
              </p>
              <p>
                Before becoming a prominent memoirist, Bruno was known as a talented illustrator and artist. 
                He has illustrated several children&apos;s books (including &quot;La Troisième Perle&quot; and &quot;I Love You&quot;) 
                and has been recognized by organizations such as the International Board on Books for Young People (IBBY).
              </p>
              <p>
                His primary literary work, <em className="text-ink-800">My Forgiveness Story</em> (published in 2024), 
                chronicles his journey from the trauma of 1994 to finding spiritual and emotional peace—a testament to the power of grace and purposeful living.
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-brand-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Connect with Bruno
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            Interested in his books, speaking engagements, or learning more about his mission?
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/books" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-white text-brand-700 hover:bg-brand-50 transition-colors">
              Explore Books
            </Link>
            <Link to="/mission" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium border-2 border-white text-white hover:bg-white hover:text-brand-700 transition-colors">
              Learn About the Mission
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium border-2 border-white text-white hover:bg-white hover:text-brand-700 transition-colors">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
