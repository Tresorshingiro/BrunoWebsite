import { useEffect, useRef, useState } from 'react'

/**
 * Wraps children and adds .is-visible when the element enters the viewport,
 * triggering the .animate-on-scroll transition.
 */
export default function AnimateOnScroll({ children, className = '', delay = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${delay} ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
