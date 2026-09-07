"use client"

export interface ProgressionPeriod {
  quarter: string
  year: string
  invested: number
  realised: number
  fair: number
}

// App valuation palette (matches the sibling Portfolio Valuation chart).
const COLOR_INVESTED = "#C4B5D8" // lavender
const COLOR_REALISED = "#4B3D8F" // deep purple
const COLOR_FAIR = "#B8E8C8" // mint

// SVG layout constants (uniform coordinate space, scaled responsively via viewBox).
const PW = 150 // period width
const BASELINE = 208 // y of the x-axis
const TOP = 64 // y that the tallest bar reaches
const BAR_W = 40

export function ValueProgressionChart({ periods }: { periods: ProgressionPeriod[] }) {
  const width = periods.length * PW

  // Fixed scale across periods, derived from the fund's own numbers with headroom.
  const maxBar = Math.max(1, ...periods.map((p) => Math.max(p.invested, p.realised + p.fair)))
  const maxVal = maxBar * 1.15
  const scale = (BASELINE - TOP) / maxVal
  const h = (value: number) => value * scale

  return (
    <div className="rounded-[10px] border border-[#E8E6E0] bg-white p-4">
      <h3 className="text-[13px] font-semibold text-[#2C2C2A]">Value progression of portfolio companies</h3>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <LegendItem color={COLOR_INVESTED} label="Invested capital" />
        <LegendItem color={COLOR_FAIR} label="Fair market value" />
        <LegendItem color={COLOR_REALISED} label="Realised proceeds" />
      </div>

      <svg
        viewBox={`0 0 ${width} 244`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        className="mt-1 max-h-[260px]"
        role="img"
        aria-label="Bar chart comparing invested capital against realised proceeds plus fair market value for each quarter, with the money multiple above each period."
      >
        {/* Baseline */}
        <line x1={0} y1={BASELINE} x2={width} y2={BASELINE} stroke="#D8D6CE" strokeWidth={1} />

        {periods.map((p, i) => {
          const ox = i * PW
          const investedX = ox + 26
          const stackedX = ox + 84
          const investedCenter = investedX + BAR_W / 2
          const stackedCenter = stackedX + BAR_W / 2

          const investedH = h(p.invested)
          const realisedH = h(p.realised)
          const fairH = h(p.fair)
          const total = p.realised + p.fair
          const totalH = realisedH + fairH

          const topInvested = BASELINE - investedH
          const topStacked = BASELINE - totalH
          const bracketY = Math.min(topInvested, topStacked) - 30
          const moi = p.invested > 0 ? total / p.invested : 0

          const midX = (investedCenter + stackedCenter) / 2
          const arrowEndY = topStacked - 12

          return (
            <g key={`${p.quarter}-${p.year}`}>
              {/* Invested bar */}
              <rect x={investedX} y={topInvested} width={BAR_W} height={investedH} fill={COLOR_INVESTED} />
              <text x={investedCenter} y={topInvested - 6} textAnchor="middle" fontSize={11} fill="#6B6963" fontWeight={600}>
                {Math.round(p.invested)}
              </text>

              {/* Stacked bar: realised (bottom) + fair (top) */}
              {realisedH > 0 && (
                <rect x={stackedX} y={BASELINE - realisedH} width={BAR_W} height={realisedH} fill={COLOR_REALISED} />
              )}
              <rect x={stackedX} y={topStacked} width={BAR_W} height={fairH} fill={COLOR_FAIR} />
              {realisedH > 16 && (
                <text x={stackedCenter} y={BASELINE - realisedH / 2 + 4} textAnchor="middle" fontSize={11} fill="#FFFFFF" fontWeight={600}>
                  {Math.round(p.realised)}
                </text>
              )}
              {fairH > 14 && (
                <text x={stackedCenter} y={topStacked + fairH / 2 + 4} textAnchor="middle" fontSize={11} fill="#2C2C2A" fontWeight={600}>
                  {Math.round(p.fair)}
                </text>
              )}
              <text x={stackedCenter} y={topStacked - 6} textAnchor="middle" fontSize={11} fill="#2C2C2A" fontWeight={600}>
                {Math.round(total)}
              </text>

              {/* MOI bracket: up from invested, across, down to stacked with arrowhead */}
              <path
                d={`M ${investedCenter} ${topInvested - 12} V ${bracketY} H ${stackedCenter} V ${arrowEndY}`}
                fill="none"
                stroke="#B8975A"
                strokeWidth={1.2}
              />
              <path d={`M ${stackedCenter} ${arrowEndY + 1} l -3.5 -6 l 7 0 z`} fill="#B8975A" />
              {/* MOI pill */}
              <rect x={midX - 22} y={bracketY - 9} width={44} height={18} rx={9} fill="#FFFFFF" stroke="#B8975A" strokeWidth={1} />
              <text x={midX} y={bracketY + 4} textAnchor="middle" fontSize={10} fill="#B8975A" fontWeight={600}>
                {moi.toFixed(2)}x
              </text>

              {/* Axis labels */}
              <text x={investedCenter} y={BASELINE + 17} textAnchor="middle" fontSize={10} fill="#6B6963">
                {p.quarter}
              </text>
              <text x={stackedCenter} y={BASELINE + 17} textAnchor="middle" fontSize={10} fill="#2C2C2A" fontWeight={600}>
                {p.year}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: color }} />
      <span className="text-[12px] text-[#2C2C2A]">{label}</span>
    </div>
  )
}
