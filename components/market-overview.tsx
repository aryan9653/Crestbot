"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TickerTape } from "./ticker-tape"
import { CandleChart } from "./candle-chart"
import { OrderBook } from "./order-book"
import { TradesFeed } from "./trades-feed"
import { useEffect, useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MarketKind } from "./market-switcher"
import { AnimatePresence, motion } from "framer-motion"
import { useIndiaQuotes } from "@/hooks/use-india-quotes"

export function MarketOverview({
  defaultSymbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
  market = "CRYPTO",
}: {
  defaultSymbols?: string[]
  market?: MarketKind
}) {
  const [pair, setPair] = useState(defaultSymbols[0])

  useEffect(() => {
    setPair(defaultSymbols[0])
  }, [market, defaultSymbols])

  // Live India quotes via SSE (falls back to mock server-side)
  const indiaSymbols = useMemo(() => (market === "INDIA" ? defaultSymbols : []), [market, defaultSymbols])
  const { prices: indiaPrices, connected } = useIndiaQuotes(indiaSymbols, undefined)

  const livePrice = market === "INDIA" ? indiaPrices[pair] : undefined
  const tapePrices = market === "INDIA" ? indiaPrices : undefined

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between">
          <span>
            {market === "CRYPTO" ? "Market Overview (Crypto)" : "Market Overview (India • NSE/BSE)"}
          </span>
          <Select value={pair} onValueChange={setPair}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={market === "CRYPTO" ? "Symbol (Crypto)" : "Symbol (NSE/BSE)"} />
            </SelectTrigger>
            <SelectContent>
              {defaultSymbols.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
        <TickerTape symbols={defaultSymbols} externalPrices={tapePrices} />
        {market === "INDIA" && (
          <p className="text-xs text-gray-500">Quote stream: {connected ? "Connected" : "Connecting…"} (Broker or Mock)</p>
        )}
      </CardHeader>

      <AnimatePresence mode="wait">
        <motion.div
          key={market + ":" + pair}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border rounded-lg p-2">
              <CandleChart symbol={pair} livePrice={livePrice} />
            </div>
            <div className="space-y-4">
              <OrderBook symbol={pair} livePrice={livePrice} market={market} />
              <TradesFeed symbol={pair} livePrice={livePrice} market={market} />
            </div>
          </CardContent>
        </motion.div>
      </AnimatePresence>
    </Card>
  )
}
