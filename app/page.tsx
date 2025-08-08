"use client"

import { useEffect, useState } from "react"
import { NavHeader } from "@/components/nav-header"
import { AppFooter } from "@/components/app-footer"
import { MarketOverview } from "@/components/market-overview"
import { PositionSummary } from "@/components/position-summary"
import { OrderForm } from "@/components/order-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketSwitcher, type IndiaBroker, type MarketKind } from "@/components/market-switcher"
import { IndiaStockList } from "@/components/india-stock-list"

export default function Page() {
  const [connected, setConnected] = useState(true)
  const [marketStatus, setMarketStatus] = useState<"open" | "closed" | "volatile">("open")
  const [serverTime, setServerTime] = useState<string>(new Date().toISOString())

  const [market, setMarket] = useState<MarketKind>("CRYPTO")
  const [broker, setBroker] = useState<IndiaBroker>("Zerodha")

  useEffect(() => {
    const t = setInterval(() => setServerTime(new Date().toISOString()), 1000)
    const m = setInterval(() => {
      const states: ("open" | "closed" | "volatile")[] = ["open", "open", "open", "volatile"]
      setMarketStatus(states[Math.floor(Math.random() * states.length)])
    }, 15000)
    const c = setInterval(() => setConnected((c0) => (Math.random() < 0.98 ? true : !c0)), 20000)
    return () => {
      clearInterval(t)
      clearInterval(m)
      clearInterval(c)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavHeader />
      <main className="container mx-auto flex-1 space-y-4 p-4 md:space-y-6 md:p-6">
        <MarketSwitcher market={market} onMarketChange={setMarket} broker={broker} onBrokerChange={setBroker} />

        <section className="grid grid-cols-1 gap-4 md:gap-6 2xl:grid-cols-3">
          <div className="space-y-4 md:space-y-6 2xl:col-span-2">
            <MarketOverview
              market={market}
              defaultSymbols={
                market === "CRYPTO"
                  ? ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"]
                  : ["RELIANCE", "TCS", "HDFCBANK", "INFY", "SBIN"]
              }
            />

            {market === "INDIA" && (
              <div className="mt-4 md:mt-6">
                <IndiaStockList broker={broker} />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
              <PositionSummary market={market} />
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>{"Switch between Crypto and India to see equivalent functionality."}</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>{"India mode streams NSE/BSE quotes via /api/india/stream (real if broker envs available, else mocked)."}</li>
                    <li>{"Do not expose broker keys on the client. Keep them as server environment variables."}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 2xl:col-span-1">
            <OrderForm market={market} broker={broker} />
          </div>
        </section>
      </main>
      <AppFooter connected={connected} marketStatus={marketStatus} serverTime={serverTime} market={market} broker={broker} />
    </div>
  )
}
