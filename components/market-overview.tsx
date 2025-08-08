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

  // Reset selected symbol whenever the market or symbol list changes
  useEffect(() => {
    setPair(defaultSymbols[0])
  }, [market, defaultSymbols])

  // Live India quotes via SSE
  const indiaSymbols = useMemo(() => defaultSymbols, [defaultSymbols])
  const { prices: indiaPrices } = useIndiaQuotes(market === "INDIA" ? indiaSymbols : [], undefined)

  const livePrice = market === "INDIA" ? indiaPrices[pair] : undefined
  const tapePrices = market === "INDIA" ? indiaPrices : undefined

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between">
          <span>{market === "CRYPTO" ? "Market Overview (Crypto)" : "Market Overview (India • NSE/BSE)"}</span>
          <Select value={pair} onValueChange={setPair}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Symbol" />
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
      </CardHeader>

      {/* Animated swap between Crypto and India views */}
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
              <OrderBook symbol={pair} />
              <TradesFeed symbol={pair} />
            </div>
          </CardContent>
        </motion.div>
      </AnimatePresence>
    </Card>
  )
}
