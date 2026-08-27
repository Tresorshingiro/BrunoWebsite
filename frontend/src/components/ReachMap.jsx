import Reveal from './Reveal'

/* ─────────────────────────────────────────────────────────────────────────
   PLACEHOLDER DATA — NOT VERIFIED.
   These countries are stand-ins so the visual can be reviewed. They are NOT
   a factual record of where Bruno has spoken. Replace `NATIONS` with the real
   list before this goes anywhere public. Coordinates are real (capital or
   principal city) so positions stay correct once the names are corrected.
   ───────────────────────────────────────────────────────────────────────── */
const ORIGIN = { name: 'Rwanda', lat: -1.94, lon: 29.87, dx: 8, dy: 14 }

const NATIONS = [
  { name: 'Kenya', lat: -1.29, lon: 36.82, dx: 8, dy: 4 },
  { name: 'Uganda', lat: 0.35, lon: 32.58, dx: 6, dy: -8 },
  { name: 'Tanzania', lat: -6.79, lon: 39.21, dx: 8, dy: 10 },
  { name: 'South Africa', lat: -25.75, lon: 28.19, dx: 8, dy: 12 },
  { name: 'United Kingdom', lat: 51.51, lon: -0.13, dx: -10, dy: -8, anchor: 'end' },
  { name: 'Belgium', lat: 50.85, lon: 4.35, dx: 8, dy: -10 },
  { name: 'Germany', lat: 52.52, lon: 13.4, dx: 8, dy: 4 },
  { name: 'United States', lat: 38.9, lon: -77.04, dx: -10, dy: 4, anchor: 'end' },
  { name: 'Canada', lat: 45.42, lon: -75.7, dx: -10, dy: -10, anchor: 'end' },
  { name: 'India', lat: 28.61, lon: 77.21, dx: 8, dy: 4 },
  { name: 'Australia', lat: -35.28, lon: 149.13, dx: -8, dy: 14, anchor: 'end' },
]

// Equirectangular projection over a fixed window, so the layout is stable
// regardless of which countries are in the list.
const LON = [-100, 165]
const LAT = [-46, 64]
const W = 1000
const H = Math.round((W * (LAT[1] - LAT[0])) / (LON[1] - LON[0]))

const px = (lon) => ((lon - LON[0]) / (LON[1] - LON[0])) * W
const py = (lat) => ((LAT[1] - lat) / (LAT[1] - LAT[0])) * H

/** Great-circle-ish arc: a quadratic bezier bowed away from the straight line. */
function arc(from, to) {
  const x1 = px(from.lon)
  const y1 = py(from.lat)
  const x2 = px(to.lon)
  const y2 = py(to.lat)
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.hypot(dx, dy)
  // Perpendicular offset, scaled by distance so short hops stay flat.
  const bow = Math.min(dist * 0.22, 90)
  const cx = mx + (dy / (dist || 1)) * bow
  const cy = my - (dx / (dist || 1)) * bow
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
}

const graticule = () => {
  const lines = []
  for (let lon = LON[0]; lon <= LON[1]; lon += 30) {
    lines.push(<line key={`v${lon}`} x1={px(lon)} y1="0" x2={px(lon)} y2={H} />)
  }
  for (let lat = LAT[0]; lat <= LAT[1]; lat += 20) {
    lines.push(<line key={`h${lat}`} x1="0" y1={py(lat)} x2={W} y2={py(lat)} />)
  }
  return lines
}

export default function ReachMap() {
  return (
    <Reveal className="reach">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="reach-svg"
        role="img"
        aria-label={`Map showing speaking engagements reaching ${NATIONS.length} nations from Rwanda`}
      >
        <g className="reach-grid">{graticule()}</g>

        {NATIONS.map((n, i) => (
          <path
            key={`arc-${n.name}`}
            className="reach-arc"
            d={arc(ORIGIN, n)}
            style={{ '--i': i }}
          />
        ))}

        {NATIONS.map((n, i) => (
          <g key={n.name} className="reach-node" style={{ '--i': i }}>
            <circle cx={px(n.lon)} cy={py(n.lat)} r="4" />
            <text
              x={px(n.lon) + (n.dx ?? 8)}
              y={py(n.lat) + (n.dy ?? 4)}
              textAnchor={n.anchor ?? 'start'}
            >
              {n.name}
            </text>
          </g>
        ))}

        {/* Origin last so it sits on top */}
        <g className="reach-origin">
          <circle cx={px(ORIGIN.lon)} cy={py(ORIGIN.lat)} r="10" className="reach-pulse" />
          <circle cx={px(ORIGIN.lon)} cy={py(ORIGIN.lat)} r="5" />
          <text x={px(ORIGIN.lon) + ORIGIN.dx} y={py(ORIGIN.lat) + ORIGIN.dy}>
            {ORIGIN.name}
          </text>
        </g>
      </svg>
    </Reveal>
  )
}
