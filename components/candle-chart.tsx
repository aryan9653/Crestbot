"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type Candle = {
  time: number // timestamp (ms)
  open: number
  high: number
  low: number
  close: number
}

function generateSeed(n = 180, start = 3000): Candle[] {
  const out: Candle[] = []
  let last = start
  const now = Date.now()
  for (let i = n - 1; i >= 0; i--) {
    const ts = now - i * 60_000
    const open = last
    const vol = open * (0.001 + Math.random() * 0.01)
    const close = Math.max(1, open + (Math.random() - 0.5) * vol)
    const high = Math.max(open, close) + Math.random() * vol * 0.6
    const low = Math.min(open, close) - Math.random() * vol * 0.6
    out.push({ time: ts, open, high, low, close })
    last = close
  }
  return out
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

export function CandleChart({
  symbol = "BTCUSDT",
  livePrice,
  height = 360,
}: {
  symbol?: string
  livePrice?: number
  height?: number
}) {
  const [data, setData] = useState<Candle[]>(() => generateSeed())
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const [yMin, yMax] = useMemo(() => {
    let hi = Number.NEGATIVE_INFINITY
    let lo = Number.POSITIVE_INFINITY
    for (const d of data) {
      if (d.high > hi) hi = d.high
      if (d.low < lo) lo = d.low
    }
    if (!Number.isFinite(hi) || !Number.isFinite(lo)) {
      hi = 1
      lo = 0
    }
    const pad = Math.max(1, (hi - lo) * 0.08)
    return [Math.max(0, lo - pad), hi + pad]
  }, [data])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const cssW = Math.max(0, rect.width)
    const cssH = Math.max(0, height)
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1))
    if (cssW === 0 || cssH === 0) return

    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    canvas.width = Math.floor(cssW * dpr)
    canvas.height = Math.floor(cssH * dpr)

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.clearRect(0, 0, cssW, cssH)

    const N = data.length
    if (N === 0) return

    const padLeft = 8, padRight = 8, padTop = 8, padBottom = 8
    const plotW = Math.max(0, cssW - padLeft - padRight)
    const plotH = Math.max(0, cssH - padTop - padBottom)

    const xStep = plotW / N
    const bodyW = clamp(xStep * 0.6, 2, 20)
    const yToPx = (v: number) => {
      const t = (v - yMin) / Math.max(1e-9, yMax - yMin)
      return padTop + (1 - t) * plotH
    }

    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    ctx.beginPath()
    const gridLines = 4
    for (let i = 0; i <= gridLines; i++) {
      const y = padTop + (plotH * i) / gridLines
      ctx.moveTo(padLeft, y)
      ctx.lineTo(padLeft + plotW, y)
    }
    ctx.stroke()

    for (let i = 0; i < N; i++) {
      const d = data[i]
      const cx = padLeft + i * xStep + xStep / 2

      const yO = yToPx(d.open)
      const yC = yToPx(d.close)
      const yH = yToPx(d.high)
      const yL = yToPx(d.low)

      if (!Number.isFinite(cx) || !Number.isFinite(yO) || !Number.isFinite(yC) || !Number.isFinite(yH) || !Number.isFinite(yL)) {
        continue
      }

      const isUp = d.close >= d.open
      const color = isUp ? "#10b981" : "#ef4444"

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx, yH)
      ctx.lineTo(cx, yL)
      ctx.stroke()

      const top = Math.min(yO, yC)
      const h = Math.max(1, Math.abs(yC - yO))
      const x = cx - bodyW / 2
      ctx.fillStyle = color
      ctx.fillRect(x, top, bodyW, h)
    }

    const last = data[N - 1]
    const lastY = yToPx(last.close)
    ctx.strokeStyle = "rgba(0,0,0,0.3)"
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.moveTo(padLeft, lastY)
    ctx.lineTo(padLeft + plotW, lastY)
    ctx.stroke()
    ctx.setLineDash([])

    const label = last.close.toFixed(2)
    const labelW = Math.max(48, ctx.measureText(label).width + 12)
    const labelH = 18
    const lx = padLeft + plotW - labelW
    const ly = Math.max(padTop, Math.min(lastY - labelH / 2, padTop + plotH - labelH))
    ctx.fillStyle = "#111827"
    ctx.fillRect(lx, ly, labelW, labelH)
    ctx.fillStyle = "#ffffff"
    ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
    ctx.textBaseline = "middle"
    ctx.fillText(label, lx + 6, ly + labelH / 2)
  }, [data, height, yMin, yMax])

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(redraw)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [redraw])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let frame: number | null = null
    const ro = new ResizeObserver(() => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(redraw)
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [redraw])

  useEffect(() => {
    if (livePrice !== undefined) return
    timerRef.current = window.setInterval(() => {
      setData((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        const newCandle = Math.random() > 0.8
        if (newCandle) {
          const open = last.close
          const vol = open * (0.001 + Math.random() * 0.01)
          const close = Math.max(1, open + (Math.random() - 0.5) * vol)
          const high = Math.max(open, close) + Math.random() * vol * 0.6
          const low = Math.min(open, close) - Math.random() * vol * 0.6
          const ts = Date.now()
          const candle: Candle = { time: ts, open, high, low, close }
          return [...next.slice(-359), candle]
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
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [livePrice])

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
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      <canvas ref={canvasRef} aria-label={`Candlestick chart for ${symbol}`} role="img" />
    </div>
  )
}
