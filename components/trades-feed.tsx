"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef, useState } from "react"
import type { MarketKind } from "./market-switcher"
import { cn } from "@/lib/utils"

type Trade = { ts: number; side: "BUY" | "SELL"; price: number; qty: number }

export function TradesFeed({
  symbol,
  livePrice,
  market = "CRYPTO",
}: {
  symbol: string
  livePrice?: number
  market?: MarketKind
}) {
  const [trades, setTrades] = useState<Trade[]>([])
  const timer = useRef<number | null>(null)
  const lastPriceRef = useRef<number>(livePrice ?? 1000)

  useEffect(() => {
    if (typeof livePrice === "number" && Number.isFinite(livePrice)) {
      lastPriceRef.current = livePrice
    }
  }, [livePrice])

  useEffect(() => {
    timer.current = window.setInterval(() => {
      const lp = lastPriceRef.current
      const side = Math.random() > 0.5 ? "BUY" : "SELL"
      const price =
        typeof livePrice === "number"
          ? livePrice + (Math.random() - 0.5) * Math.max(0.05, livePrice * 0.0008)
          : lp + (Math.random() - 0.5) * Math.max(0.05, lp * 0.001)
      lastPriceRef.current = Math.max(0.01, price)
      const qty = Math.random() * (market === "INDIA" ? 100 : 0.01) + (market === "INDIA" ? 1 : 0.0001)
      setTrades((prev) => [{ ts: Date.now(), side, price, qty }, ...prev].slice(0, 50))
    }, 600)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [livePrice, market])

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Recent Trades • {symbol}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-48">
          <div className="divide-y">
            {trades.map((t, i) => (
              <div key={t.ts + ":" + i} className="px-3 py-2 text-xs flex items-center justify-between">
                <span className={cn("font-medium", t.side === "BUY" ? "text-emerald-600" : "text-red-600")}>
                  {t.side}
                </span>
                <span className="font-mono">{t.price.toFixed(2)}</span>
                <span className="font-mono text-gray-600">{t.qty.toFixed(2)}</span>
              </div>
            ))}
            {trades.length === 0 && <div className="px-3 py-8 text-center text-xs text-gray-500">Waiting for trades…</div>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
