"use client"

import { useEffect, useState } from "react"
import { AppHeader } from "@/components/nav-header"
import { AppFooter } from "@/components/app-footer"
import { MarketOverview } from "@/components/market-overview"
import { PositionSummary } from "@/components/position-summary"
import { OrderForm } from "@/components/order-form"
import { FearGreedPanel } from "@/components/fear-greed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketSwitcher, type IndiaBroker, type MarketKind } from "@/components/market-switcher"

export default function Page() {
  const [connected, setConnected] = useState(true)
  const [marketStatus, setMarketStatus] = useState<"open" | "closed" | "volatile">("open")
  const [serverTime, setServerTime] = useState<string>(new Date().toISOString())

  // New: Market selection state
  const [market, setMarket] = useState<MarketKind>("CRYPTO")
  const [broker, setBroker] = useState<IndiaBroker>("Zerodha")

  useEffect(() => {
    const t = setInterval(() => setServerTime(new Date().toISOString()), 1000)
    const m = setInterval(() => {
      const states: ("open" | "closed" | "volatile")[] = ["open", "open", "open", "volatile"]
      setMarketStatus(states[Math.floor(Math.random() * states.length)])
    }, 15000)
    const c = setInterval(() => setConnected((c) => (Math.random() < 0.97 ? true : !c)), 20000)
    return () => {
      clearInterval(t)
      clearInterval(m)
      clearInterval(c)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <MarketSwitcher
          market={market}
          onMarketChange={setMarket}
          broker={broker}
          onBrokerChange={setBroker}
        />
        <section className="grid grid-cols-1 2xl:grid-cols-3 gap-4 md:gap-6">
          <div className="2xl:col-span-2 space-y-4 md:space-y-6">
            <MarketOverview
              market={market}
              defaultSymbols={
                market === "CRYPTO"
                  ? ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
                  : ["NIFTY", "RELIANCE", "TCS", "HDFCBANK", "INFY"]
              }
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <PositionSummary />
              <FearGreedPanel />
            </div>
          </div>
          <div className="2xl:col-span-1 space-y-4 md:space-y-6">
            <OrderForm market={market} broker={broker} />
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>{"Simulated data for demonstration. Replace mocks with your broker/exchange APIs."}</p>
                <ul className="list-disc pl-5">
                  <li>{"For India, use broker APIs (e.g., Kite Connect, Upstox, Angel One SmartAPI, DhanHQ)."}</li>
                  <li>{"Do not expose API keys on the client. Use server routes as a proxy."}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <AppFooter connected={connected} marketStatus={marketStatus} serverTime={serverTime} />
    </div>
  )
}
