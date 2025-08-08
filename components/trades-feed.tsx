"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Trade = { time: string; side: "buy" | "sell"; price: number; qty: number }

export function TradesFeed({ symbol = "BTCUSDT" }: { symbol?: string }) {
  const [trades, setTrades] = useState<Trade[]>([])
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const t = setInterval(() => {
      setTrades((prev) => {
        const side: Trade["side"] = Math.random() > 0.5 ? "buy" : "sell"
        const last = prev[prev.length - 1]?.price ?? 30000
        const price = Math.max(1, last + (Math.random() - 0.5) * 25)
        const qty = +(Math.random() * 0.02).toFixed(4)
        const trade: Trade = { time: new Date().toLocaleTimeString(), side, price, qty }
        const next = [...prev, trade].slice(-80)
        return next
      })
      ref.current?.scrollTo({ top: ref.current.scrollHeight })
    }, 700)
    return () => clearInterval(t)
  }, [])

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Recent Trades {symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]" ref={ref as any}>
          <ul className="space-y-1">
            {trades.map((t, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.time}</span>
                <span className={cn("tabular-nums", t.side === "buy" ? "text-emerald-700" : "text-red-600")}>
                  {t.side.toUpperCase()}
                </span>
                <span className="tabular-nums">{t.price.toFixed(2)}</span>
                <span className="tabular-nums">{t.qty}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
