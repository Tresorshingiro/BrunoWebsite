import { useEffect, useRef } from 'react'

/**
 * Scroll-triggered reveal. Pairs with the .reveal / .reveal-3d CSS in
 * index.css, which only hides content once the .js class confirms JS is
 * running — so a failed bundle leaves the page readable.
 *
 * Unobserves after firing: these animations play once.
 */
export default function Reveal({
  as: Tag = 'div',
  variant = 'reveal', // 'reveal' | 'reveal-3d'
  delay,              // 1 | 2 | 3 -> staggered transition-delay
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`${variant} ${className}`} data-d={delay} {...rest}>
      {children}
    </Tag>
  )
}
