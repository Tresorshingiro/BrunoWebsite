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

      {/* Mission — Quote Block */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        {/* Decorative large quote mark */}
        <div className="absolute -top-8 left-4 md:left-12 text-[220px] md:text-[300px] font-serif leading-none text-white/5 select-none pointer-events-none">
          &ldquo;
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(46,148,156,0.18),transparent_60%)] pointer-events-none" />
        <AnimateOnScroll>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-brand-400 font-semibold tracking-widest uppercase text-sm mb-6">My Mission</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed text-white mb-8">
              To help people rise beyond hatred and pain and become a better version of themselves through{' '}
              <span className="text-brand-400 italic">forgiveness.</span>
            </h2>
            <div className="w-16 h-px bg-brand-500 mx-auto" />
          </div>
        </AnimateOnScroll>
      </section>

      {/* Mission — Values */}
      <section className="py-16 md:py-24 bg-white">
        <AnimateOnScroll>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-center text-ink-500 text-sm uppercase tracking-widest font-medium mb-12">
              Principles that guide every step
            </p>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
              {[
                {
                  num: '01', title: 'Grace',
                  desc: "Believing in the transformative power of God's grace to heal even the deepest wounds and restore broken lives.",
                  path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
                },
                {
                  num: '02', title: 'Healing',
                  desc: 'Creating spaces where individuals and communities can find emotional, spiritual, and relational restoration.',
                  path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
                },
                {
                  num: '03', title: 'Hope',
                  desc: "Sharing a message that no situation is too broken, no pain too deep, for God's redemptive power.",
                  path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                },
                {
                  num: '04', title: 'Reconciliation',
                  desc: 'Building bridges between divided hearts and communities, fostering understanding and unity through forgiveness.',
                  path: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
                },
                {
                  num: '05', title: 'Empowerment',
                  desc: 'Equipping people with the tools and courage to break free from cycles of pain and become agents of change.',
                  path: 'M13 10V3L4 14h7v7l9-11h-7z',
                },
                {
                  num: '06', title: 'Impact',
                  desc: 'Reaching individuals, families, and communities around the world with a message that transforms lives.',
                  path: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
                },
              ].map(({ num, title, desc, path }) => (
                <div key={title} className="flex gap-5 group">
                  {/* Icon circle */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center group-hover:bg-brand-600 group-hover:border-brand-600 transition-colors duration-300 mt-1">
                    <svg className="w-5 h-5 text-brand-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} />
                    </svg>
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0 pb-10 border-b border-ink-100 group-last:border-0">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-xs font-mono text-brand-400 font-semibold">{num}</span>
                      <h3 className="font-serif text-xl text-ink-900 group-hover:text-brand-600 transition-colors duration-300">{title}</h3>
                    </div>
                    <p className="text-ink-500 leading-relaxed text-sm">{desc}</p>
                  </div>
                </div>
              ))}
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
            <Link to="/my-work" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium border-2 border-white text-white hover:bg-white hover:text-brand-700 transition-colors">
              My Work
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
