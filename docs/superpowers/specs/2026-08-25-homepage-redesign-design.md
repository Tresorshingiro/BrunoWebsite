# Site Redesign — Homepage, About, My Work, Header & Footer

**Date:** 2026-08-25
**Status:** Approved, ready for implementation planning
**Scope:** Frontend only. No backend changes.
**Pages done:** Home, About, My Work (all 2026-08-25).

## Context

The site is a React 18 / Vite 5 / Tailwind 3 frontend for author Bruno Iradukunda.
A static HTML mockup (`~/Downloads/bruno-homepage.html`) proposes a new visual
direction: an editorial, book-jacket aesthetic derived from the cover of
*My Forgiveness Story*, replacing the current SaaS-leaning look.

This spec covers the first migration pass: design tokens, `Header`, `Footer`, and
`Home`. Other pages inherit the new tokens but keep their current layouts until
their own mockups arrive.

## Decisions

Settled with the project owner before writing this spec:

| Decision | Choice | Rationale |
|---|---|---|
| Typography | **Unchanged** — Cormorant Garamond + Source Sans 3 | Owner preference; the mockup's Fraunces/Newsreader/Archivo is not adopted |
| Palette | **Adopt** the mockup's moss/aqua/paper, site-wide | Ties the site to the book cover; applied by redefining existing ramps so all pages inherit |
| Nav behaviour | **Two variants** — overlay on the homepage, solid elsewhere | A transparent light-text nav is invisible on light pages |
| New section content | **Hardcoded arrays** in `Home.jsx` | Biographical copy that changes ~annually; admin CRUD is not worth a new model, controller, routes and admin screen |
| 3D | **CSS depth system** — hero parallax, book pointer-tilt, role-card lift. Blog stays flat | Zero dependencies, zero bundle cost; restraint suits the subject matter |
| Currency fix | **Deferred** to a later pass | Owner chose to do frontend first |

## Non-goals

- Layouts of the other 16 public pages (awaiting mockups)
- Admin panel layout (inherits colours only)
- The backend security issues from the earlier project analysis
- Code splitting of the 797 KB bundle
- The Stripe currency bug (see Known Issues)

---

## 1. Design tokens — `tailwind.config.js`

`fontFamily` is untouched. The `brand-*` and `ink-*` ramps are **redefined in
place** so every existing utility class picks up the new palette with no
find-and-replace across 25 pages.

```js
brand: {
   50: '#F0F7F4',  100: '#DCEDE7',  200: '#BADCD0',
  300: '#9CD3C4',  // aqua — accent on dark grounds
  400: '#6FB49F',  500: '#4E9683',
  600: '#3A7566',  // primary buttons, links
  700: '#2F6154',  800: '#1F463C',
  900: '#17332C',  // moss — cover background green
  950: '#0E211C',
},
ink: {
   50: '#F4F2EC',  // paper-warm — light section grounds
  100: '#EAE8E1',  // paper
  200: '#D5D2C9',  300: '#B0ADA4',  400: '#85837B',
  500: '#62615A',  600: '#4A4944',  700: '#343732',
  800: '#242926',  900: '#1C2220',
  950: '#121615',  // ink — darkest ground
}
```

### Verified contrast (WCAG 2.1)

Computed, not estimated. All pairs below meet AA.

| Pair | Ratio | Required |
|---|---|---|
| `brand-600` text on white | 5.36:1 | 4.5 |
| `brand-600` text on `ink-50` | 4.79:1 | 4.5 |
| white on `brand-600` (primary button) | 5.36:1 | 4.5 |
| white on `brand-700` (button hover) | 7.10:1 | 4.5 |
| `ink-600` body on white | 9.02:1 | 4.5 |
| `ink-500` muted on white | 6.22:1 | 4.5 |
| `ink-700` body on `ink-50` | 10.79:1 | 4.5 |
| `brand-300` aqua on `ink-950` | 10.88:1 | 4.5 |
| `ink-100` on `ink-950` | 14.88:1 | 4.5 |
| white on `ink-900` (admin sidebar) | 16.17:1 | 4.5 |
| `brand-300` on `ink-900` (admin active nav) | 9.64:1 | 4.5 |

**Constraint:** `brand-500` (#4E9683) is **3.49:1 on white** — decorative and
dark-ground use only. Never body text on a light background.

Note: the source mockup labels `--aqua-deep: #4E9683` "accessible aqua for text
on paper" and uses it for `.eyebrow` and `.link-more` text. At 3.12:1 on bone
that fails AA. This design uses `brand-600` for those roles instead.

### Radius

Buttons drop to `2px`, cards to `3px`. This single change carries most of the
tonal shift from "SaaS dashboard" to "book jacket".

### `index.css` changes

- `.btn-primary` / `.btn-secondary` — new radius, new colours, shared easing
- Remove the orphaned gold accent: `::-webkit-scrollbar-thumb`,
  `.text-gold-gradient`, `.gold-glow` currently use `#C9A84C`, an accent
  unrelated to the brand ramp. Fold into the brand palette.
- Add `--ease: cubic-bezier(.22,.61,.36,1)` as the single shared easing token
- Add `--perspective: 1400px` for the 3D context

`App.jsx` — the `Toaster` config also hardcodes `#C9A84C` and `#F5EDD6`; update
to the new palette.

---

## 2. Header

One component, two variants, selected by `Layout.jsx` from the route:

```jsx
<Header variant="overlay" />  // '/' only — the full-bleed hero
<Header variant="solid" />    // all other public routes
```

**Overlay:** fixed, transparent, light text over the hero. Past 40px of scroll it
transitions to `bg-ink-950/92` with `backdrop-blur(12px)` and a hairline bottom
border.

**Solid:** sticky, renders that scrolled state from the start.

**Why overlay is limited to `/`:** `About.jsx` and `MyWork.jsx` do open with dark
grounds (`from-ink-900 to-ink-800` and `bg-ink-900` respectively), so light nav
text would be legible there. But neither is a full-bleed hero — they use
`py-16 md:py-24` and `min-h-[50vh]`. A *fixed* overlay nav would overlap their
content and require adding top padding to both, which is outside this pass's
scope.

The solid variant is `ink-950`, so above those pages' `ink-900` heroes it reads
as near-continuous anyway. When those pages get their own mockups, they can move
to `overlay` and gain the full-bleed treatment then.

Both share: aqua underline scaling in from the left on hover and for the active
route (`transform: scaleX(0) → scaleX(1)`, `transform-origin: left`); serif
wordmark; cart icon with count badge; user menu or Login link; mobile hamburger.

The existing cart-count and user-menu logic is correct and carries over unchanged
— only presentation changes.

---

## 3. Home — section order

**Scope correction (2026-08-25):** an earlier draft of this spec also rebuilt
the Hero and Book Spotlight from the mockup. That went beyond the original
request, which was: change the navbar and footer, and swap the Impact and Promo
banners for the work / writing / speaking sections. Both sections are now
**restored to their prior content and structure**, with only depth/motion added.

| # | Section | Ground | Status |
|---|---|---|---|
| 1 | Hero | `ink-950` | **unchanged content** + portrait parallax |
| 2 | Book Spotlight | `#f7f0e8` | copy unchanged; **photo replaced by a CSS 3D book** |
| 3 | The work (Roles) | `ink-50` | **new** — replaces Impact Banner |
| 4 | Writing (Blog) | `ink-100` | **new layout** — featured + 3, replaces the 3-card grid |
| 5 | Speaking | `ink-950` | **new** — replaces Promo Banner + "Let's Connect" CTA; includes the reach map |

**Removed:** Impact Banner (stat counters) → replaced by Roles.
**Removed:** Promo Banner (`book-promo.png` + "From Ashes to Purpose") and the
"Let's Connect" CTA → replaced by Speaking.

**Not adopted:** the mockup's Timeline Rail and Pull Quote were built, then
dropped — they were additions nobody asked for, and the hero already carries its
own stats row and quote card. Available if wanted.

### 3.1 Hero — unchanged

Content and structure are exactly as before: the "Author · Speaker · Forgiveness
Advocate" eyebrow, the "Bruno / Iradukunda" headline, the rule, the tagline with
its mobile read-more toggle, the three CTAs, the stats row, the floating quote
card, and the scroll cue. The split mobile/desktop portrait treatment is intact.

The only addition is **parallax** on the portrait (factor 0.15, clamped to the
first viewport), applied to both the mobile and desktop image wrappers.

### 3.2 Book Spotlight

All copy and layout unchanged. The **photograph (`book-display.png`) has been
replaced by a real 3D book** (`Book3D.jsx`) at the owner's request.

Six CSS faces on a `preserve-3d` box — front carries `book-cover.png`, with a
drawn spine, back cover, and striped page edges. It rotates continuously and can
be dragged to spin. No WebGL, no library, nothing added to the bundle.

`useBookSpin` writes `--by` directly to the element rather than through React
state, so spinning never re-renders. An IntersectionObserver stops the rAF loop
whenever the book is off screen, so it costs nothing once scrolled past.
Reduced-motion disables the auto-spin but keeps drag, which is user-initiated.

`book-display.png` is retained in `public/images/` and can be restored by
swapping `<Book3D />` back for the original `<img>` block.

### 3.3 The work (Roles)

Three cards: Author / Writing, Publisher / Vitalreadings, Ministry / Ellel
Rwanda. Section heading links to `/my-work`. Top rule turns aqua on hover.

### 3.4 Writing (Blog)

One featured post plus three small ones, replacing the current three equal cards
that leave a ragged row.

**Data:** switch from `blogApi.getLatest()` (hard-limited to 3 server-side) to
`blogApi.getPublished({ limit: 4 })`, which accepts a limit and returns
`{ posts, total, pages, page }`. Frontend-only — no backend change.

Degrades correctly: 4+ posts → featured + 3; 2–3 posts → featured + remainder;
1 post → featured only; 0 posts → section hidden (current behaviour).

### 3.5 Speaking

Two columns on `ink-950`: heading, copy, and a "Check availability" CTA to
`/contact` on the left; a topic chip cloud on the right. Six chips, hardcoded.


**Reach map (`ReachMap.jsx`).** A full-width band below the two columns: arcs
draw outward from Rwanda to each destination, then dots and labels fade in
behind them. Inline SVG on an equirectangular projection, ~2 KB, no map library
and no tile requests.

> ⚠️ **The nation list is placeholder data and is not factual.** It exists so the
> visual could be reviewed. Coordinates are real, so replacing the names in the
> `NATIONS` array in `ReachMap.jsx` is sufficient — positions will be correct
> automatically. This must be corrected before the site is published.

---

## 3B. About page

Rebuilt from `~/Downloads/bruno-about.html`. Layout **and** content changed, at
the owner's request.

The structural change: the mission statement — *"To help people rise beyond
hatred and pain…"* — was buried at position 3 mid-scroll behind a generic
"About Bruno / A journey of faith" hero. **It is now the hero.** The saturated
`brand-600` CTA slab became a light band so the page breathes before the footer.

| # | Section | Ground |
|---|---|---|
| 1 | Hero — the mission line + portrait | `ink-950` |
| 2 | In his words — prose ∥ facts rail | `ink-100` |
| 3 | Timeline — 7 stages | `ink-50` |
| 4 | Six commitments | `ink-100` |
| 5 | Quote | `brand-900` |
| 6 | CTA — 3 buttons | `ink-50` |

Nothing was dropped: the degrees, illustration work, *La Troisième Perle*,
*I Love You*, IBBY recognition, Ellel, Vitalreadings and the 2024 book all
survive, redistributed into the timeline and the facts rail. About also moves to
the **overlay nav**, since its hero is now a full dark band.

> ⚠️ **The first-person passages in "In his words" are draft copy, not verified
> quotations.** They are written *as Bruno*, about his own trauma, and must be
> read and approved by him before publication. A comment at the top of
> `About.jsx` says the same.

### Animation

- **Timeline spine draws downward with scroll** — `useScrollProgress` writes
  `--progress`, which scales an aqua rail over a static one. Nodes fill in as
  each item reveals. Degrades to the static rail if JS cannot run.
- **Per-word clip reveal** on the hero mission line (`ClipWords`). Each word is
  its own `overflow:hidden` box, so it survives natural line wrapping — a
  per-line clip would need break points known in advance. Real spaces sit
  between the words in the DOM, so screen readers and copy-paste are unaffected.
- Facts-rail rows stagger in from the right; commitment cards reuse the
  homepage `translateZ` lift; the quote stays still.

## 3C. My Work page

Rebuilt from `~/Downloads/bruno-my-work.html`. Layout and content changed.

The structural argument, which the mockup makes and I agree with: the previous
page gave Author / Publisher / Ministry three identical numbered blocks
(01 / 02 / 03), which asserts they carry equal weight and that they form a
sequence. They are concurrent roles, and the book is the front door. So the
numbered blocks became a **role index**, the book got the **lead slot**, and
publisher + ministry became a **matched pair** below it.

| # | Section | Ground |
|---|---|---|
| 1 | Hero — "One message, carried three different ways" | `ink-950` |
| 2 | Role index — Author / Publisher / Ministry, anchor links | `ink-950` |
| 3 | Author (lead) — `Book3D` + meta + CTAs | `ink-100` |
| 4 | Pair — Vitalreadings + Ellel | `ink-50` |
| 5 | Quote | `brand-900` |
| 6 | Speaking — topics **and formats** | `ink-950` |
| 7 | CTA | `ink-50` |

Deepest speaking detail lives here rather than on the homepage: an organiser
needs formats (keynote / workshop / reading), not just a topic list.

**Logos:** the mockup used "VR"/"EM" letter placeholders; the real
`vital_logo.jpeg` and `ellel_logo.png` from the previous version are used
instead. Both plates are **white** — each logo file carries its own baked-in
background, so a coloured plate leaves a visible rectangle around the mark.

### Animation

- `Book3D` reused in the Author lead — the owner confirmed keeping it on both
  the homepage and here.
- **Pointer tilt on both logo plates** (`usePointerTilt`, max 7°).
- Role-index rows: aqua top rule plus an arrow that slides in on hover.
- Format cards: `translateZ` lift, matching the About commitments.
- Topic chips: staggered arrival, 60ms apart.
- Hero heading: per-word clip reveal (`ClipWords`).

About and My Work both moved to the **overlay nav** alongside Home.

## 4. Footer

Three columns → brand blurb + socials, Explore, Get in touch.

**Contact details:**
- `+250 784 642 822`
- `iradukundabruno2034@gmail.com`
- Kigali, Rwanda
- Vital Readings (existing external link)

**Socials:** URLs not yet supplied. The social row is **omitted** rather than
shipped with dead `#` links. Add when URLs are available.

Base row: copyright, auto-updating year (current behaviour).

---

## 5. Motion & 3D

One easing token, one perspective context, no rotation beyond 12°.

### Reveal system

Adopts the mockup's progressive-enhancement pattern:

1. An inline script in `index.html` `<head>` adds `.js` to `<html>`
2. `.js .reveal { opacity: 0; transform: translateY(18px) }` — hidden **only**
   when JS is confirmed running
3. IntersectionObserver adds `.is-in`, then **unobserves** that element
4. A 1200ms `setTimeout` safety net releases the hero sequence if `load` is slow

### 3D effects

| Target | Effect |
|---|---|
| Hero portrait | Scroll parallax (factor 0.15), clamped to the first viewport |
| Book Spotlight image | `rotateX`/`rotateY` tracking pointer, max 5° |
| Role cards | `translateZ` lift with shadow growth |
| Blog cards | **Flat** — deliberate |

### Guards

All pointer-driven effects are `requestAnimationFrame`-throttled, listeners are
`passive`, and effects are disabled when:

- `(prefers-reduced-motion: reduce)` matches
- `(hover: none)` matches — touch devices, where pointer tracking is meaningless

---

## 6. Bugs fixed en route

1. **Content invisible when JS fails.** `.animate-on-scroll` in `index.css` sets
   `opacity: 0` unconditionally. If the bundle fails to load or is slow, content
   never appears — to users or to link-preview scrapers. The `.js`-class guard
   fixes this.

2. **Reduced-motion only works on mobile.** The global
   `* { animation-duration: .01ms }` block at `index.css:225` is nested inside
   `@media (max-width: 640px)`. Desktop users with the OS setting enabled get
   full animation. Move it to top level.

3. **Observers never released.** `AnimateOnScroll` disconnects on unmount but
   keeps observing after an element has animated. Add `unobserve` on intersect.

4. **Orphan blog card.** The three-equal-card grid leaves a ragged row; the
   featured + small layout resolves it.

---

## 7. Files touched

```
frontend/tailwind.config.js              palette ramps
frontend/src/index.css                   radius, easing, gold cleanup, motion fixes
frontend/index.html                      inline .js-class script
frontend/src/App.jsx                     Toaster colours
frontend/src/components/Layout.jsx       header variant from route
frontend/src/components/Header.jsx       rebuild, two variants
frontend/src/components/Footer.jsx       rebuild
frontend/src/components/AnimateOnScroll.jsx   .js guard, unobserve, stagger
frontend/src/pages/Home.jsx              rebuild sections
```

No backend files.

---

## 8. Known issues (out of scope, tracked)

**Stripe currency — live money bug.** `backend/controllers/paymentController.js`
creates PaymentIntents with `currency: 'usd'` and
`amount: Math.round(total * 100)`. The owner has confirmed prices are **RWF**.
A book priced `20000` is therefore charged as **$20,000 USD** — roughly 1,400×
the intended amount.

The fix requires two verifications the owner must make in their Stripe dashboard:

1. Whether RWF is a zero-decimal currency. Stripe's docs confirm zero-decimal
   currencies take the amount without multiplication, but the list renders
   dynamically and could not be read programmatically. If RWF is zero-decimal,
   drop the `* 100`.
2. Whether RWF is enabled as a presentment currency on the account. Stripe does
   not onboard businesses in Rwanda, so the account is registered elsewhere and
   RWF may be unavailable. If so, charge in a supported currency and display
   that currency rather than showing RWF while charging otherwise.

This design renders prices through a single formatter so the fix lands in one
place.

**Other deferred items** from the project analysis: the public admin-registration
endpoint, client-trusted order totals in `confirmOrder`, the missing Stripe
webhook, and subscriber emails still using SMTP on a host that blocks it.
