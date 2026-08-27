import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

/**
 * Releases a hero's entrance sequence. Returns a boolean the page applies as
 * the `loaded` class on its own root element.
 *
 * This used to set `loaded` on <body> and never take it off, which meant the
 * class was still there on the next client-side navigation: About, My Work and
 * Books all mounted with their heroes already released, so the words and fades
 * appeared fully-formed with no transition. Only a hard reload animated. Owning
 * the flag per page re-arms it on every visit.
 *
 * Still waits for `load` on a cold start, so the entrance does not race the
 * webfonts, and still carries the safety net: if `load` is slow or never fires,
 * reveal anyway rather than leaving text invisible.
 */
export function useHeroLoad() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let raf = 0
    const release = () => setLoaded(true)
    // Two frames: the first paints the start state, the second gives the
    // transition something to move from.
    const releaseNextFrame = () => {
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(release)
      })
    }

    if (document.readyState === 'complete') {
      releaseNextFrame()
    } else {
      window.addEventListener('load', releaseNextFrame, { once: true })
    }

    const safety = setTimeout(release, 1200)
    return () => {
      clearTimeout(safety)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('load', releaseNextFrame)
    }
  }, [])

  return loaded
}

/**
 * Writes --rx / --ry custom properties as the pointer moves across the
 * element, for CSS to compose into a transform. rAF-throttled.
 * Inert under reduced-motion and on touch devices.
 */
export function usePointerTilt({ max = 6, baseRx = 0, baseRy = 0 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reset = () => {
      el.style.setProperty('--rx', `${baseRx}deg`)
      el.style.setProperty('--ry', `${baseRy}deg`)
      el.style.setProperty('--mx', '50%')
      el.style.setProperty('--my', '0%')
    }
    reset()

    if (prefersReducedMotion() || isTouch()) return

    let raf = 0
    const onMove = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) return
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        el.style.setProperty('--ry', `${baseRy + px * max * 2}deg`)
        el.style.setProperty('--rx', `${baseRx - py * max * 2}deg`)
        // Raw pointer position too, so a specular sheen can follow it.
        el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
        el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
      })
    }
    const onLeave = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0 }
      reset()
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [max, baseRx, baseRy])

  return ref
}

/**
 * Writes --py as the page scrolls, clamped to the first viewport so the
 * offset cannot grow without bound. rAF-throttled, passive listener.
 */
export function useParallax(factor = 0.15) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--py', '0px')
    if (prefersReducedMotion()) return

    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const limit = window.innerHeight
        const y = Math.min(window.scrollY, limit)
        el.style.setProperty('--py', `${y * factor}px`)
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [factor])

  return ref
}

/** True once the page has scrolled past `offset`. Drives the sticky nav. */
export function useScrolled(offset = 40) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        setScrolled(window.scrollY > offset)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [offset])

  return scrolled
}

/**
 * Counts from 0 to `target` once the element scrolls into view, then stops.
 * Returns [ref, currentValue]. Honours reduced-motion by jumping straight to
 * the final value — the number must always be readable, animation or not.
 */
export function useCountUp(target, { duration = 1400, delay = 400 } = {}) {
  const ref = useRef(null)
  // Starts at the REAL value, not 0. IntersectionObserver never fires in a
  // hidden document, so starting at 0 would leave "0 Nations Reached" rendered
  // for anything that isn't a visible tab — a wrong fact, not just a missing
  // animation. We drop to 0 only once the count is actually about to run.
  const [value, setValue] = useState(target)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setValue(target)
      return
    }

    let raf = 0
    let timer = 0
    let safety = 0
    let startedAt = 0

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.unobserve(entry.target)
        // Reset on the same frame the element enters view, so the jump from
        // the real value to 0 is never visible.
        setValue(0)
        timer = setTimeout(() => {
          const step = (now) => {
            if (!startedAt) startedAt = now
            const p = Math.min((now - startedAt) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
            setValue(Math.round(target * eased))
            if (p < 1) raf = requestAnimationFrame(step)
          }
          raf = requestAnimationFrame(step)
        }, delay)

        // Safety net. requestAnimationFrame is paused in background tabs, so
        // without this the stat can sit at 0 — showing the wrong number, which
        // is worse than showing no animation. Timers still fire when throttled.
        safety = setTimeout(() => setValue(target), delay + duration + 600)
      },
      { threshold: 0.4 }
    )

    io.observe(el)
    return () => {
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
      if (timer) clearTimeout(timer)
      if (safety) clearTimeout(safety)
    }
  }, [target, duration, delay])

  return [ref, value]
}

/**
 * Drives a 3D book: slow continuous rotation, drag to spin it yourself.
 *
 * Writes --by (yaw) to the element rather than using React state, so spinning
 * never re-renders the tree. The rAF loop only runs while the book is actually
 * on screen — an IntersectionObserver stops it otherwise, so it costs nothing
 * once you scroll past. Reduced-motion disables the auto-spin but keeps drag,
 * since dragging is user-initiated.
 *
 * Returns [ref, { dragging }] where ref goes on the rotating element.
 */
export function useBookSpin({ degreesPerSecond = 11, initial = -28 } = {}) {
  const ref = useRef(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = prefersReducedMotion()
    let angle = initial
    let raf = 0
    let lastT = 0
    let isDragging = false
    let lastX = 0
    let onScreen = false
    let hovering = false

    const apply = () => el.style.setProperty('--by', `${angle.toFixed(2)}deg`)
    apply()

    const loop = (t) => {
      const dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0
      lastT = t
      if (!isDragging && !hovering) {
        angle = (angle + degreesPerSecond * dt) % 360
        apply()
      }
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (raf || reduced) return
      lastT = 0
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (!raf) return
      cancelAnimationFrame(raf)
      raf = 0
    }

    // Only animate while visible.
    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            ([e]) => {
              onScreen = e.isIntersecting
              onScreen ? start() : stop()
            },
            { threshold: 0.05 }
          )
        : null
    if (io) io.observe(el)
    else start()

    const onEnter = () => { hovering = true }
    const onLeave = () => { hovering = false }

    const onDown = (e) => {
      isDragging = true
      setDragging(true)
      lastX = e.clientX
      el.setPointerCapture?.(e.pointerId)
    }
    const onMove = (e) => {
      if (!isDragging) return
      angle += (e.clientX - lastX) * 0.45
      lastX = e.clientX
      apply()
    }
    const onUp = (e) => {
      if (!isDragging) return
      isDragging = false
      setDragging(false)
      el.releasePointerCapture?.(e.pointerId)
    }

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)

    return () => {
      stop()
      if (io) io.disconnect()
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [degreesPerSecond, initial])

  return [ref, { dragging }]
}

/**
 * Writes --progress (0→1) as the element travels through the viewport.
 * Drives the About timeline's spine, which draws downward as you scroll.
 *
 * Starts when the element's top reaches 85% down the viewport and completes
 * when its bottom reaches 35%, so the line finishes before the section leaves.
 * The rAF loop runs only while the element is on screen. Reduced-motion pins
 * it to 1, leaving the spine fully drawn rather than absent.
 */
export function useScrollProgress() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) {
      el.style.setProperty('--progress', '1')
      return
    }

    let raf = 0
    let onScreen = false

    const update = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = r.height + vh * 0.5
      const travelled = vh * 0.85 - r.top
      const p = Math.max(0, Math.min(1, travelled / total))
      el.style.setProperty('--progress', p.toFixed(4))
    }

    const onScroll = () => {
      if (raf || !onScreen) return
      raf = requestAnimationFrame(() => {
        raf = 0
        update()
      })
    }

    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            ([e]) => {
              onScreen = e.isIntersecting
              if (onScreen) update()
            },
            { threshold: 0 }
          )
        : null

    if (io) io.observe(el)
    else onScreen = true

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      if (io) io.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return ref
}

/**
 * True once the referenced element has scrolled entirely off the top of the
 * viewport. Drives the sticky buy bar on the book detail page: the bar only
 * appears after the real buy panel is gone, so the two never both show.
 *
 * IntersectionObserver rather than a scroll handler — no listener runs while
 * the panel is on screen.
 */
export function useScrolledPast() {
  const ref = useRef(null)
  const [past, setPast] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!('IntersectionObserver' in window)) return

    const io = new IntersectionObserver(
      ([entry]) => {
        // Gone off the top: no longer intersecting, and sitting above the fold.
        setPast(!entry.isIntersecting && entry.boundingClientRect.bottom < 0)
      },
      { threshold: 0, rootMargin: '0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return [ref, past]
}

/**
 * Reading progress for a long article. Returns a ref for the element being
 * read and a ref for the bar; the bar's --progress is written directly rather
 * than held in state, so scrolling never re-renders the page.
 */
export function useReadingProgress() {
  const targetRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    const el = targetRef.current
    const bar = barRef.current
    if (!el || !bar) return

    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      // How far through the article the bottom of the viewport has travelled.
      const total = rect.height - window.innerHeight
      if (total <= 0) {
        bar.style.setProperty('--progress', rect.bottom <= window.innerHeight ? '1' : '0')
        return
      }
      const done = Math.min(Math.max(-rect.top / total, 0), 1)
      bar.style.setProperty('--progress', done.toFixed(4))
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return { targetRef, barRef }
}
