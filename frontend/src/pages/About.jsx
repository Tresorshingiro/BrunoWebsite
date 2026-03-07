import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div>
      <section className="py-12 md:py-20 bg-ink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="section-heading text-center">About Bruno</h1>
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <img
                src="/images/bruno-standing.png"
                alt="Bruno Iradukunda"
                className="rounded-xl shadow-lg w-full max-w-md mx-auto"
              />
            </div>
            <div className="order-1 md:order-2">
              <p className="prose-custom text-lg mb-4">
                <strong className="text-ink-900">Bruno Iradukunda</strong> is an author, mentor, and multifaceted creator whose work spans memoir, Christian literature, and children&apos;s illustration.
              </p>
              <p className="prose-custom mb-4">
                His primary literary work, <em className="text-ink-800">My Forgiveness Story</em> (published in 2024), is part personal memoir and part in-depth study of forgiveness. It chronicles his journey from the trauma of 1994 to finding spiritual and emotional peace—a testament to the power of grace and purposeful living.
              </p>
              <p className="prose-custom mb-4">
                Bruno is associated with <strong className="text-ink-900">Vital Readings Publishers</strong>, where he serves as an author and mentor, helping to promote Christian literature and stories that inspire.
              </p>
              <p className="prose-custom mb-6">
                Before becoming a prominent memoirist, Bruno was known as a talented illustrator and artist. He has illustrated several children&apos;s books (including &quot;La Troisième Perle&quot; and &quot;I Love You&quot;) and has been recognized by organizations such as the International Board on Books for Young People (IBBY). He holds degrees in both <strong className="text-ink-900">Theology</strong> and <strong className="text-ink-900">Information Science</strong>, which informs the blend of spiritual depth and structured research in his writing.
              </p>
              <Link to="/books" className="btn-primary">
                Explore His Books
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-ink-900 mb-6">
            &quot;A journey from trauma to peace—through the lens of forgiveness.&quot;
          </h2>
          <Link to="/contact" className="text-brand-600 font-medium hover:underline">
            Contact Bruno →
          </Link>
        </div>
      </section>
    </div>
  )
}
