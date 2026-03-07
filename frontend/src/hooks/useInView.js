import { useEffect, useState, useRef } from 'react'

/**
 * Returns true when the ref element enters the viewport (with optional threshold).
 * Use for scroll-triggered animations.
 */
export function useInView(options = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px', once = true } = options
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
        else if (!once) setInView(false)
      },
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, inView]
}
