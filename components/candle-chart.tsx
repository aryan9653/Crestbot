"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  CartesianGrid,
  ComposedChart,
  Customized,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"

type Candle = {
  time: string
  open: number
  high: number
  low: number
  close: number
}

function generateSeed(n = 120, start = 30000): Candle[] {
  const out: Candle[] = []
  let last = start
  const now = Date.now()
  for (let i = n - 1; i >= 0; i--) {
    const ts = new Date(now - i * 60_000)
    const open = last
    const vol = open * (0.001 + Math.random() * 0.01)
    const close = Math.max(1, open + (Math.random() - 0.5) * vol)
    const high = Math.max(open, close) + Math.random() * vol * 0.6
    const low = Math.min(open, close) - Math.random() * vol * 0.6
    out.push({
      time: ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      open,
      high,
      low,
      close,
    })
    last = close
  }
  return out
}

function isFiniteNum(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n)
}

export function CandleChart({
  symbol = "BTCUSDT",
  livePrice,
}: {
  symbol?: string
  livePrice?: number // optional external live price to drive last candle
}) {
  const [data, setData] = useState<Candle[]>(() => generateSeed())
  const timerRef = useRef<number | null>(null)

  const yDomain = useMemo(() => {
    const highs = data.map((d) => d.high)
    const lows = data.map((d) => d.low)
    const max = Math.max(...highs)
    const min = Math.min(...lows)
    const pad = (max - min) * 0.1 || 10
    return [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)]
  }, [data])

  // Simulation (when no livePrice provided)
  useEffect(() => {
    if (livePrice !== undefined) return
    timerRef.current = window.setInterval(() => {
      setData((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        const shouldNew = Math.random() > 0.8

        if (shouldNew) {
          const open = last.close
          const vol = open * (0.001 + Math.random() * 0.01)
          const close = Math.max(1, open + (Math.random() - 0.5) * vol)
          const high = Math.max(open, close) + Math.random() * vol * 0.6
          const low = Math.min(open, close) - Math.random() * vol * 0.6
          const ts = new Date()
          const candle: Candle = {
            time: ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            open,
            high,
            low,
            close,
          }
          return [...next.slice(-239), candle]
        } else {
          const vol = last.open * 0.008
          const close = Math.max(1, last.close + (Math.random() - 0.5) * vol)
          const high = Math.max(last.high, close)
          const low = Math.min(last.low, close)
          next[next.length - 1] = { ...last, close, high, low }
          return next
        }
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [livePrice])

  // Drive last candle from livePrice (India mode)
  useEffect(() => {
    if (livePrice === undefined) return
    setData((prev) => {
      const next = [...prev]
      const last = next[next.length - 1]
      const close = livePrice
      const high = Math.max(last.high, close)
      const low = Math.min(last.low, close)
      next[next.length - 1] = { ...last, close, high, low }
      return next
    })
  }, [livePrice])

  return (
    <ChartContainer config={{}} className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid stroke="#e5e7eb" vertical />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tickMargin={6}
            allowDuplicatedCategory
          />
          <YAxis
            domain={yDomain as any}
            tickLine={false}
            axisLine={false}
            width={64}
            tickMargin={6}
          />

          <Customized
            component={(props: any) => {
              const { xAxisMap, yAxisMap, offset, data } = props
              const xAxis = xAxisMap?.[0] ?? Object.values(xAxisMap ?? {})[0]
              const yAxis = yAxisMap?.[0] ?? Object.values(yAxisMap ?? {})[0]
              if (!xAxis || !yAxis) return null

              const xScale = xAxis.scale
              const yScale = yAxis.scale
              if (typeof xScale !== "function" || typeof yScale !== "function") return null

              const plotWidth =
                (offset?.width ??
                  (isFiniteNum(props?.width)
                    ? Math.max(0, props.width - (offset?.left ?? 0) - (offset?.right ?? 0))
                    : undefined)) ?? 600

              const total = Math.max(1, Array.isArray(data) ? data.length : 1)
              const isBand = typeof (xScale as any).bandwidth === "function"
              const band = isBand ? (xScale as any).bandwidth() : 0
              const step = plotWidth / total
              const derived = band > 0 ? band * 0.6 : step * 0.6
              const bodyWidth = Math.max(2, Math.min(20, isFiniteNum(derived) ? derived : 6))

              return (
                <g>
                  {Array.isArray(data) &&
                    data.map((d: Candle, i: number) => {
                      const xr = xScale(d.time)
                      let cx: number | undefined

                      if (isFiniteNum(xr)) {
                        cx = xr + (band > 0 ? band / 2 : 0)
                      } else if (isFiniteNum(offset?.left)) {
                        cx = (offset.left as number) + (i + 0.5) * step
                      } else {
                        cx = (i + 0.5) * step
                      }

                      const yOpen = yScale(d.open)
                      const yClose = yScale(d.close)
                      const yHigh = yScale(d.high)
                      const yLow = yScale(d.low)

                      if (
                        !isFiniteNum(cx) ||
                        !isFiniteNum(yOpen) ||
                        !isFiniteNum(yClose) ||
                        !isFiniteNum(yHigh) ||
                        !isFiniteNum(yLow)
                      ) {
                        return null
                      }

                      const isUp = d.close >= d.open
                      const color = isUp ? "#059669" : "#dc2626"
                      const top = Math.min(yOpen, yClose)
                      const bottom = Math.max(yOpen, yClose)
                      const rectHeight = Math.max(1, bottom - top)

                      return (
                        <g key={i}>
                          <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={color} strokeWidth={2} />
                          <rect
                            x={cx - bodyWidth / 2}
                            y={top}
                            width={bodyWidth}
                            height={rectHeight}
                            fill={color}
                            rx={1}
                          />
                        </g>
                      )
                    })}
                </g>
              )
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
