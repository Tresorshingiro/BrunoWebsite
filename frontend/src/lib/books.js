/* Shared book helpers, used by both the catalogue index and the detail page.
   These live here rather than on either page so neither has to import the
   other. */

/* Vitalreadings publishes other authors, so authorship is what separates
   Bruno's own titles from the rest of the catalogue. The `featured` flag is
   merchandising and says nothing about who wrote the book — it has been set
   on another author's title before now, which is exactly the mix-up this
   guards against. */
const BRUNO = 'bruno iradukunda'

export const byBruno = (book) => (book.author || '').trim().toLowerCase() === BRUNO

/** Label/value pairs for the detail page's spec table. Empty fields print nothing. */
export function specsFor(book) {
  const specs = []
  const formats = []
  if (book.availableFormats?.physical !== false) formats.push('Paperback')
  if (book.availableFormats?.digital) formats.push('Digital')
  if (formats.length) specs.push(['Format', formats.join(' · ')])
  if (book.pages) specs.push(['Pages', String(book.pages)])
  if (book.publishedDate) {
    const year = new Date(book.publishedDate).getFullYear()
    if (!Number.isNaN(year)) specs.push(['Published', String(year)])
  }
  if (book.language) specs.push(['Language', book.language])
  return specs
}

/** The same facts as a flat list, for the one-line meta under a catalogue row. */
export function metaFor(book) {
  return specsFor(book).map(([label, value]) => (label === 'Pages' ? `${value} pages` : value))
}

/** Split a textarea-authored field into paragraphs on blank lines. */
export const paragraphs = (text) =>
  (text || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

export const pluralTitles = (n) => `${n} ${n === 1 ? 'title' : 'titles'}`
