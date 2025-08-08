"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useMemo, useRef, useState } from "react"
import type { MarketKind } from "./market-switcher"
import { cn } from "@/lib/utils"

type Level = { price: number; qty: number }

export function OrderBook({
  symbol,
  livePrice,
  market = "CRYPTO",
  depth = 14,
}: {
  symbol: string
  livePrice?: number
  market?: MarketKind
  depth?: number
}) {
  const [mid, setMid] = useState(livePrice ?? 1000)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (typeof livePrice === "number" && Number.isFinite(livePrice)) {
      setMid(livePrice)
      return
    }
    timer.current = window.setInterval(() => {
      setMid((m) => Math.max(1, m + (Math.random() - 0.5) * Math.max(1, m * 0.002)))
    }, 1000)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [livePrice])

  const [bids, asks] = useMemo(() => {
    const tick = market === "INDIA" ? 0.05 : 0.5
    const make = (side: "bid" | "ask"): Level[] =>
      Array.from({ length: depth }, (_, i) => {
        const p = side === "bid" ? mid - (i + 1) * tick : mid + (i + 1) * tick
        return { price: Math.max(0.01, Number(p.toFixed(2))), qty: Number((Math.random() * 100).toFixed(2)) }
      })
    return [make("bid"), make("ask")]
  }, [mid, market, depth])

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Order Book • {symbol}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="flex justify-between text-gray-500 mb-1">
            <span>Bid</span>
            <span>Qty</span>
          </div>
          <div className="space-y-1">
            {bids.map((l, i) => (
              <div key={"b" + i} className="flex justify-between">
                <span className="text-emerald-700 font-mono">{l.price.toFixed(2)}</span>
                <span className="font-mono">{l.qty.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between text-gray-500 mb-1">
            <span>Ask</span>
            <span>Qty</span>
          </div>
          <div className="space-y-1">
            {asks.map((l, i) => (
              <div key={"a" + i} className="flex justify-between">
                <span className="text-red-700 font-mono">{l.price.toFixed(2)}</span>
                <span className="font-mono">{l.qty.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2 text-center text-xs text-gray-500 mt-2">
          Mid: <span className={cn("font-mono", "text-gray-700")}>{mid.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
