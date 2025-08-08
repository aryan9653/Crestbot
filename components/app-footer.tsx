"use client"

import { cn } from "@/lib/utils"
import { Wifi, WifiOff, Clock } from 'lucide-react'

export function AppFooter({
  connected = true,
  marketStatus = "open",
  serverTime,
}: {
  connected?: boolean
  marketStatus?: "open" | "closed" | "volatile"
  serverTime?: string
}) {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto h-12 px-4 md:px-6 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {connected ? <Wifi className="h-4 w-4 text-emerald-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
          <span className={cn(connected ? "text-emerald-700" : "text-red-700")}>
            {connected ? "Connected to Binance (mock)" : "Disconnected"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "px-2 py-0.5 rounded-md",
              marketStatus === "open" && "bg-emerald-100 text-emerald-700",
              marketStatus === "closed" && "bg-gray-200 text-gray-700",
              marketStatus === "volatile" && "bg-yellow-100 text-yellow-700"
            )}
          >
            Market: {marketStatus}
          </span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <time dateTime={serverTime}>{new Date(serverTime ?? Date.now()).toLocaleTimeString()}</time>
          </div>
        </div>
      </div>
    </footer>
  )
}
