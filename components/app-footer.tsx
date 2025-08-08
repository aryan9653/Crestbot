"use client"

import { cn } from "@/lib/utils"

export function AppFooter({
  connected,
  marketStatus,
  serverTime,
  market = "CRYPTO",
  broker = "Zerodha",
}: {
  connected: boolean
  marketStatus: "open" | "closed" | "volatile"
  serverTime: string
  market?: "CRYPTO" | "INDIA"
  broker?: "Zerodha" | "Upstox" | "AngelOne" | "Dhan"
}) {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto h-12 px-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className={cn("h-2 w-2 rounded-full", connected ? "bg-emerald-500" : "bg-red-500")} aria-hidden />
          <span>{connected ? (market === "INDIA" ? `Connected (India ${broker})` : "Connected (Crypto)") : "Disconnected"}</span>
        </div>
        <div className="text-muted-foreground">
          Market: {marketStatus.toUpperCase()} • Server time: {new Date(serverTime).toLocaleTimeString()}
        </div>
      </div>
    </footer>
  )
}
