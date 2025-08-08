"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type MarketKind = "CRYPTO" | "INDIA"
export type IndiaBroker = "Zerodha" | "Upstox" | "AngelOne" | "Dhan"

export function MarketSwitcher({
  market,
  onMarketChange,
  broker,
  onBrokerChange,
}: {
  market: MarketKind
  onMarketChange: (m: MarketKind) => void
  broker: IndiaBroker
  onBrokerChange: (b: IndiaBroker) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative inline-grid grid-cols-2 p-1 rounded-lg border bg-muted/40">
        {(["CRYPTO", "INDIA"] as MarketKind[]).map((m) => {
          const active = market === m
          return (
            <button
              key={m}
              onClick={() => onMarketChange(m)}
              className={cn(
                "relative z-10 px-4 py-1.5 text-sm rounded-md transition-colors",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {m === "CRYPTO" ? "Crypto" : "India (NSE/BSE)"}
              {active && (
                <motion.span
                  layoutId="pill"
                  className="absolute inset-0 z-[-1] rounded-md bg-white shadow"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {market === "INDIA" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Broker</span>
          <Select value={broker} onValueChange={(v) => onBrokerChange(v as IndiaBroker)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Zerodha">Zerodha</SelectItem>
              <SelectItem value="Upstox">Upstox</SelectItem>
              <SelectItem value="AngelOne">Angel One</SelectItem>
              <SelectItem value="Dhan">Dhan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
