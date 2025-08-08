"use client"

import { AppHeader } from "@/components/nav-header"
import { AppFooter } from "@/components/app-footer"
import { BacktestPanel } from "@/components/backtest-panel"
import { useEffect, useState } from "react"

export default function BacktestPage() {
  const [connected, setConnected] = useState(true)
  const [serverTime, setServerTime] = useState<string>(new Date().toISOString())
  useEffect(() => {
    const t = setInterval(() => setServerTime(new Date().toISOString()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <BacktestPanel />
      </main>
      <AppFooter connected={connected} marketStatus="open" serverTime={serverTime} />
    </div>
  )
}
