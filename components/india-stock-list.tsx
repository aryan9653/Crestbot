"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowDownAZ, ArrowUpAZ, ArrowUpRight, ArrowDownRight, Search, Filter } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useIndiaQuotes } from "@/hooks/use-india-quotes"
import type { IndiaBroker } from "./market-switcher"

type Exchange = "NSE" | "BSE"

type StockMeta = { symbol: string; name: string }

// 50 widely known symbols (NIFTY 50)
const NIFTY50: StockMeta[] = [
  { symbol: "RELIANCE", name: "Reliance Industries" },
  { symbol: "TCS", name: "Tata Consultancy" },
  { symbol: "HDFCBANK", name: "HDFC Bank" },
  { symbol: "ICICIBANK", name: "ICICI Bank" },
  { symbol: "INFY", name: "Infosys" },
  { symbol: "ITC", name: "ITC" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever" },
  { symbol: "LT", name: "Larsen & Toubro" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank" },
  { symbol: "SBIN", name: "State Bank of India" },
  { symbol: "AXISBANK", name: "Axis Bank" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance" },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv" },
  { symbol: "TITAN", name: "Titan Company" },
  { symbol: "ASIANPAINT", name: "Asian Paints" },
  { symbol: "SUNPHARMA", name: "Sun Pharma" },
  { symbol: "MARUTI", name: "Maruti Suzuki" },
  { symbol: "WIPRO", name: "Wipro" },
  { symbol: "TECHM", name: "Tech Mahindra" },
  { symbol: "POWERGRID", name: "Power Grid" },
  { symbol: "NTPC", name: "NTPC" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement" },
  { symbol: "HCLTECH", name: "HCL Technologies" },
  { symbol: "M&M", name: "Mahindra & Mahindra" },
  { symbol: "ADANIENT", name: "Adani Enterprises" },
  { symbol: "ADANIPORTS", name: "Adani Ports" },
  { symbol: "TATASTEEL", name: "Tata Steel" },
  { symbol: "JSWSTEEL", name: "JSW Steel" },
  { symbol: "TATAMOTORS", name: "Tata Motors" },
  { symbol: "HINDALCO", name: "Hindalco" },
  { symbol: "TATACONSUM", name: "Tata Consumer" },
  { symbol: "COALINDIA", name: "Coal India" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories" },
  { symbol: "CIPLA", name: "Cipla" },
  { symbol: "DRREDDY", name: "Dr. Reddy's Labs" },
  { symbol: "GRASIM", name: "Grasim" },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp" },
  { symbol: "BPCL", name: "BPCL" },
  { symbol: "BRITANNIA", name: "Britannia" },
  { symbol: "NESTLEIND", name: "Nestle India" },
  { symbol: "ONGC", name: "ONGC" },
  { symbol: "EICHERMOT", name: "Eicher Motors" },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals" },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto" },
  { symbol: "HDFCLIFE", name: "HDFC Life" },
  { symbol: "SBILIFE", name: "SBI Life Insurance" },
  { symbol: "UPL", name: "UPL" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank" },
]

const BSE50: StockMeta[] = NIFTY50

function formatINR(v: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v)
}
function compact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)
}

type SortKey = "name" | "price" | "change" | "volume"

export function IndiaStockList({ broker = "Zerodha", defaultExchange = "NSE" }: { broker?: IndiaBroker; defaultExchange?: Exchange }) {
  const [exchange, setExchange] = useState<Exchange>(defaultExchange)
  const symbols = exchange === "NSE" ? NIFTY50 : BSE50
  const symbolCodes = useMemo(() => symbols.map((s) => s.symbol), [symbols])

  const { prices, connected } = useIndiaQuotes(symbolCodes, broker)

  const baselineRef = useRef<Record<string, number>>({})
  const [volumes, setVolumes] = useState<Record<string, number>>(() =>
    Object.fromEntries(symbolCodes.map((s) => [s, Math.floor(50_000 + Math.random() * 5_000_000)]))
  )

  useEffect(() => {
    const t = setInterval(() => {
      setVolumes((prev) => {
        const next: Record<string, number> = {}
        for (const s of symbolCodes) {
          const v = prev[s] ?? 0
          const bump = Math.floor((Math.random() - 0.4) * 50_000)
          next[s] = Math.max(0, v + bump)
        }
        return next
      })
    }, 2000)
    return () => clearInterval(t)
  }, [symbolCodes])

  useEffect(() => {
    for (const [sym, ltp] of Object.entries(prices)) {
      if (!baselineRef.current[sym] && Number.isFinite(ltp)) {
        baselineRef.current[sym] = ltp
      }
    }
  }, [prices])

  const [q, setQ] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("change")
  const [asc, setAsc] = useState(false)
  const [showGainers, setShowGainers] = useState(false)
  const [showLosers, setShowLosers] = useState(false)
  const [highVolumeOnly, setHighVolumeOnly] = useState(false)

  const rows = useMemo(() => {
    const dataset = symbols.map((m) => {
      const price = prices[m.symbol] ?? baselineRef.current[m.symbol] ?? Math.max(1, 500 + Math.random() * 2000)
      const base = baselineRef.current[m.symbol] ?? price
      const changePct = base > 0 ? ((price - base) / base) * 100 : 0
      const volume = volumes[m.symbol] ?? 0
      return { ...m, price, changePct, volume }
    })

    const search = q.trim().toLowerCase()
    let filtered = dataset.filter((r) => {
      const match = r.name.toLowerCase().includes(search) || r.symbol.toLowerCase().includes(search)
      if (!match) return false
      if (showGainers && r.changePct <= 0) return false
      if (showLosers && r.changePct >= 0) return false
      return true
    })

    if (highVolumeOnly) {
      filtered = filtered.sort((a, b) => b.volume - a.volume).slice(0, 10)
    }

    filtered.sort((a, b) => {
      let d = 0
      switch (sortBy) {
        case "name":
          d = a.name.localeCompare(b.name)
          break
        case "price":
          d = a.price - b.price
          break
        case "change":
          d = a.changePct - b.changePct
          break
        case "volume":
          d = a.volume - b.volume
          break
      }
      return asc ? d : -d
    })

    return filtered
  }, [symbols, prices, volumes, q, sortBy, asc, showGainers, showLosers, highVolumeOnly])

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Stocks ({exchange})</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={exchange === "NSE" ? "default" : "outline"} onClick={() => setExchange("NSE")}>
              NSE
            </Button>
            <Button size="sm" variant={exchange === "BSE" ? "default" : "outline"} onClick={() => setExchange("BSE")}>
              BSE
            </Button>
            <Badge variant="secondary" className={cn(connected ? "text-emerald-700" : "text-yellow-700")}>
              {connected ? "Live" : "Connecting…"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search stocks..." value={q} onChange={(e) => setQ(e.target.value)} className="w-[220px] pl-8" />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="change">Change %</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setAsc((s) => !s)} title="Toggle ascending">
              {asc ? <ArrowUpAZ /> : <ArrowDownAZ />}
            </Button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant={showGainers ? "default" : "outline"} size="sm" onClick={() => setShowGainers((v) => !v)}>
              <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-600" />
              Gainers
            </Button>
            <Button variant={showLosers ? "default" : "outline"} size="sm" onClick={() => setShowLosers((v) => !v)}>
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
              Losers
            </Button>
            <Button variant={highVolumeOnly ? "default" : "outline"} size="sm" onClick={() => setHighVolumeOnly((v) => !v)}>
              <Filter className="mr-1 h-4 w-4" />
              High Vol
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[36%]">Name</TableHead>
                <TableHead className="w-[16%]">Symbol</TableHead>
                <TableHead className="w-[16%] text-right">Price</TableHead>
                <TableHead className="w-[16%] text-right">Change</TableHead>
                <TableHead className="w-[16%] text-right">Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const up = r.changePct >= 0
                return (
                  <TableRow key={r.symbol} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{exchange}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{r.symbol}</TableCell>
                    <TableCell className="text-right font-mono">{formatINR(r.price)}</TableCell>
                    <TableCell className={cn("text-right font-mono", up ? "text-emerald-700" : "text-red-600")}>
                      {(up ? "+" : "") + r.changePct.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right font-mono">{compact(r.volume)}</TableCell>
                  </TableRow>
                )
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
