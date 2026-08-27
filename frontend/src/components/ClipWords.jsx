import { Fragment, useEffect, useState } from 'react'

/**
 * Clip-up reveal, one word at a time. Each word is its own overflow-hidden
 * box, so this survives natural line wrapping — unlike a per-line clip, which
 * needs the break points known in advance.
 *
 * Two release modes:
 *
 * - default: released by the `loaded` class useHeroLoad hands the page, which
 *   the page applies to its own root so the words stay in step with the rest
 *   of that hero's entrance.
 * - `selfStart`: releases itself one frame after mount. Needed for headings
 *   that render *after* an API response, by which point the page's own release
 *   has already fired and the words would appear with no transition at all.
 */
export default function ClipWords({ text, offset = 0, accent = false, selfStart = false }) {
  const [released, setReleased] = useState(false)

  useEffect(() => {
    if (!selfStart) return
    // Next frame, not this one: the browser needs to paint the start state
    // before the transition has anything to move from.
    const raf = requestAnimationFrame(() => setReleased(true))
    return () => cancelAnimationFrame(raf)
  }, [selfStart])

  const words = text.split(' ').map((word, i) => (
    // The {' '} is a real space in the DOM, not CSS margin — otherwise
    // screen readers and copy-paste get one run-on word.
    <Fragment key={`${word}-${i}`}>
      <span className="word" style={{ '--w-d': `${(i + offset) * 45}ms` }}>
        <span className={accent ? 'text-brand-300 italic' : undefined}>{word}</span>
      </span>{' '}
    </Fragment>
  ))

  if (!selfStart) return words

  return <span className={`words ${released ? 'is-in' : ''}`}>{words}</span>
}
