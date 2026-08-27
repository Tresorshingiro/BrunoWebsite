import { useBookSpin } from '../hooks/useMotion'

/**
 * A real 3D book built from six CSS faces — no WebGL, no library, nothing
 * added to the bundle. The front carries the cover art; the spine, back and
 * page edges are drawn in CSS.
 *
 * Rotates slowly on its own; drag it to spin it yourself.
 */
export default function Book3D({
  cover = '/images/book-cover.png',
  title = 'My Forgiveness Story',
  author = 'Bruno Iradukunda',
  publisher = 'Vitalreadings Publishers',
}) {
  const [ref, { dragging }] = useBookSpin()

  return (
    <div className="book-stage">
      <div
        ref={ref}
        className={`book ${dragging ? 'is-dragging' : ''}`}
        role="img"
        aria-label={`3D cover of ${title} by ${author}. Drag to rotate.`}
      >
        {/* Front — the cover art */}
        <div className="book-face book-front">
          <img src={cover} alt="" draggable="false" />
        </div>

        {/* Spine */}
        <div className="book-face book-spine">
          <span className="book-spine-title">{title}</span>
          <span className="book-spine-author">{author}</span>
        </div>

        {/* Back */}
        <div className="book-face book-back">
          <p className="book-back-quote">
            “Forgiveness is not a feeling.
            <br />
            It’s a choice that sets you free.”
          </p>
          <p className="book-back-pub">{publisher}</p>
        </div>

        {/* Page edges */}
        <div className="book-face book-pages" />
        <div className="book-face book-top" />
        <div className="book-face book-bottom" />
      </div>

      <div className="book-shadow" aria-hidden="true" />
      <p className="book-hint" aria-hidden="true">Drag to rotate</p>
    </div>
  )
}
