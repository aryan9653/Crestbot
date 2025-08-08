"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

type Ticker = { symbol: string; price: number; change: number }

export function TickerTape({
  symbols = ["BTCUSDT", "ETHUSDT"],
  externalPrices,
}: {
  symbols?: string[]
  externalPrices?: Record<string, number> // optional live price map
}) {
  const [ticks, setTicks] = useState<Ticker[]>(
    symbols.map((s) => ({ symbol: s, price: 100 + Math.random() * 50000, change: 0 }))
  )
  const timer = useRef<number>()

  // Update when external prices arrive
  useEffect(() => {
    if (!externalPrices) return
    setTicks((prev) =>
      prev.map((t) => {
        const p = externalPrices[t.symbol] ?? t.price
        const change = ((p - t.price) / t.price) * 100
        return { ...t, price: p, change: Number.isFinite(change) ? change : 0 }
      })
    )
  }, [externalPrices])

  // Simulate only if no external stream
  useEffect(() => {
    if (externalPrices) return
    timer.current = window.setInterval(() => {
      setTicks((prev) =>
        prev.map((t) => {
          const delta = (Math.random() - 0.5) * (t.price * 0.002)
          const price = Math.max(0.0001, t.price + delta)
          const change = ((price - t.price) / t.price) * 100
          return { ...t, price, change }
        })
      )
    }, 1500)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [externalPrices])

  return (
    <div className="relative overflow-hidden">
      <div className={cn("flex gap-6 whitespace-nowrap animate-[scroll_18s_linear_infinite]")}>
        {[...ticks, ...ticks].map((t, i) => (
          <div key={t.symbol + i} className="flex items-center gap-2">
            <span className="font-mono">{t.symbol}</span>
            <span className="font-mono">{t.price.toFixed(2)}</span>
            <span className={cn("font-mono", t.change >= 0 ? "text-emerald-600" : "text-red-600")}>
              {(t.change >= 0 ? "+" : "") + t.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`@keyframes scroll { 0%{ transform: translateX(0)} 100% { transform: translateX(-50%)} }`}</style>
    </div>
  )
}
