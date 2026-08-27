import { useEffect, useState } from 'react'
import { usePointerTilt } from '../hooks/useMotion'
import { cldResize, cldSrcSet } from '../lib/images'

/**
 * A book cover with real thickness: the front board carries the actual cover
 * art, with a spine slab and a page-edge slab attached perpendicular to it in
 * 3D, and a page block behind the board.
 *
 * Distinct from Book3D on purpose. Book3D is the auto-spinning six-face box
 * on Home and My Work, and it hardcodes Bruno's back-cover copy. This one
 * takes any book's artwork and stays legible down at catalogue-row scale.
 *
 * Two levels of treatment:
 *
 * - default (catalogue rows): rests at a negative yaw, which tilts the right
 *   edge toward the viewer and puts the page edges in view, and leans toward
 *   the pointer. Nothing else — a list of twelve books should not have twelve
 *   things moving in it.
 * - `showcase` (the detail page): adds an entrance swing, an idle float, a
 *   specular sheen that tracks the pointer, and a front board that opens on
 *   its spine hinge to show the page block underneath. Hover opens it where
 *   there is a pointer; tap toggles it everywhere.
 *
 * usePointerTilt writes --rx/--ry/--mx/--my straight to the element and
 * no-ops under prefers-reduced-motion or on touch. The float and entrance are
 * pure CSS and are disabled by the same media query.
 */
export default function BookCover3D({
  src,
  alt = '',
  rest = -10,
  max = 9,
  thickness = 16,
  showcase = false,
  /* The CSS width this cover actually occupies. Cloudinary is asked for that
     size rather than shipping the original — a 1809px master to fill a 150px
     slot is twelve times more image than the slot can show. */
  width = 320,
  eager = false,
  className = '',
}) {
  const ref = usePointerTilt({ max, baseRy: rest })
  const [arrived, setArrived] = useState(false)
  const [open, setOpen] = useState(false)

  // Entrance plays one frame after mount, so the start state gets painted
  // first. Same reason ClipWords waits a frame.
  useEffect(() => {
    if (!showcase) return
    const raf = requestAnimationFrame(() => setArrived(true))
    return () => cancelAnimationFrame(raf)
  }, [showcase])

  const stageClass = [
    'cover3d-stage',
    showcase ? 'is-showcase' : '',
    open ? 'is-open' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const cover = (
    <div ref={ref} className="cover3d" style={{ '--thick': `${thickness}px` }}>
      <span className="cover3d-spine" aria-hidden="true" />
      <span className="cover3d-edge" aria-hidden="true" />

      {/* The page block the board opens away from. */}
      <div className="cover3d-block" aria-hidden="true">
        <span className="cover3d-leaf" />
      </div>

      {/* The front board — hinged on the spine side. */}
      <div className="cover3d-board">
        <div className="cover3d-art">
          {src ? (
            <img
              src={cldResize(src, width)}
              srcSet={cldSrcSet(src, width)}
              alt={alt}
              draggable="false"
              decoding="async"
              loading={eager ? 'eager' : 'lazy'}
              fetchpriority={eager ? 'high' : undefined}
            />
          ) : (
            <div className="cover3d-blank" aria-hidden="true" />
          )}
          {/* Binding gutter — the shadow a real cover throws near its spine. */}
          <span className="cover3d-gutter" aria-hidden="true" />
          {showcase && <span className="cover3d-sheen" aria-hidden="true" />}
        </div>
        <div className="cover3d-inside" aria-hidden="true" />
      </div>
    </div>
  )

  if (!showcase) {
    return (
      <div className={stageClass}>
        {cover}
        <div className="cover3d-shadow" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className={stageClass}>
      {/* A div rather than a <button>: the content is block-level, which a
          button may not legally contain, and preserve-3d on a button is
          unreliable across browsers. Role and key handling restore what the
          element would have given us. */}
      <div
        role="button"
        tabIndex={0}
        className="cover3d-hit"
        aria-pressed={open}
        aria-label={open ? 'Close the cover' : 'Open the cover'}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
      >
        <div className={`cover3d-enter ${arrived ? 'is-arrived' : ''}`}>
          <div className="cover3d-float">{cover}</div>
        </div>
      </div>
      <div className="cover3d-shadow" aria-hidden="true" />
      <p className="cover3d-hint" aria-hidden="true">
        {open ? 'Close' : 'Open the cover'}
      </p>
    </div>
  )
}
