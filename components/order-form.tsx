"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CircleAlert } from 'lucide-react'
import { cn } from "@/lib/utils"
import type { IndiaBroker, MarketKind } from "./market-switcher"
import { AnimatePresence, motion } from "framer-motion"

type CryptoOrderType = "Limit" | "Market" | "Stop Limit" | "Stop Market" | "TP/SL" | "OCO"
type IndiaSegment = "Equity" | "Futures" | "Options"
type IndiaProduct = "CNC" | "MIS" | "NRML"
type OptionType = "CE" | "PE"

export function OrderForm({ market = "CRYPTO", broker = "Zerodha" }: { market?: MarketKind; broker?: IndiaBroker }) {
  // Shared
  const [symbol, setSymbol] = useState("BTCUSDT")
  const [confirmAllOpen, setConfirmAllOpen] = useState(false)

  // Crypto
  const [orderType, setOrderType] = useState<CryptoOrderType>("Limit")
  const [qty, setQty] = useState(0.01)
  const [price, setPrice] = useState(30000)
  const [stop, setStop] = useState<number | undefined>()
  const [tp, setTp] = useState<number | undefined>()
  const [leverage, setLeverage] = useState(10)
  const [reduceOnly, setReduceOnly] = useState(false)

  // India
  const [segment, setSegment] = useState<IndiaSegment>("Equity")
  const [product, setProduct] = useState<IndiaProduct>("MIS")
  const [equityQty, setEquityQty] = useState<number>(1)

  // F&O fields
  const [expiry, setExpiry] = useState<string>("2025-08-28")
  const [strike, setStrike] = useState<number>(25000)
  const [optType, setOptType] = useState<OptionType>("CE")
  const [lots, setLots] = useState<number>(1)
  const lotSize = useMemo(() => {
    const map: Record<string, number> = { NIFTY: 50, BANKNIFTY: 15, RELIANCE: 505 }
    return map[symbol] ?? 50
  }, [symbol])

  useEffect(() => {
    if (market === "CRYPTO") {
      const t = setInterval(() => setPrice((p) => Math.max(1, p + (Math.random() - 0.5) * 30)), 1800)
      return () => clearInterval(t)
    }
  }, [market])

  // Reset default symbol when market changes
  useEffect(() => {
    if (market === "CRYPTO") setSymbol("BTCUSDT")
    else setSymbol("NIFTY")
  }, [market])

  const onPlace = async (side: "BUY" | "SELL") => {
    if (market === "CRYPTO") {
      const payload = {
        market,
        side,
        symbol,
        orderType,
        qty,
        price: orderType === "Market" ? "MARKET" : price,
        stop,
        tp,
        leverage,
        reduceOnly,
      }
      alert(JSON.stringify(payload, null, 2))
      return
    }

    // INDIA
    const payload =
      segment === "Equity"
        ? {
            market,
            broker,
            side,
            segment,
            product,
            symbol,
            quantity: equityQty,
            orderType: "MARKET",
          }
        : segment === "Futures"
        ? {
            market,
            broker,
            side,
            segment,
            product,
            tradingsymbol: `${symbol}_${expiry}_FUT`,
            quantity: lots * lotSize,
            orderType: "MARKET",
          }
        : {
            market,
            broker,
            side,
            segment,
            product,
            tradingsymbol: `${symbol}_${expiry}_${strike}${optType}`,
            quantity: lots * lotSize,
            orderType: "MARKET",
          }

    try {
      const res = await fetch("/api/broker/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      alert("Order response (mock/proxy):\n" + JSON.stringify(json, null, 2))
    } catch (e: any) {
      alert("Order failed: " + e?.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {market === "CRYPTO" ? "Advanced Order (Crypto)" : `Order (${segment} • ${broker})`}
        </CardTitle>
      </CardHeader>

      {/* Animated content switcher */}
      <AnimatePresence mode="wait">
        {market === "CRYPTO" ? (
          <motion.div
            key="crypto-form"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25 }}
          >
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Symbol</Label>
                  <Select value={symbol} onValueChange={setSymbol}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      {["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Order Type</Label>
                  <Select value={orderType} onValueChange={(v) => setOrderType(v as CryptoOrderType)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Limit", "Market", "Stop Limit", "Stop Market", "TP/SL", "OCO"].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Quantity: {qty}</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <Slider value={[qty]} min={0.001} max={1} step={0.001} onValueChange={(v) => setQty(+v[0].toFixed(3))} className="flex-1" />
                  <Input type="number" value={qty} step={0.001} min={0.001} onChange={(e) => setQty(parseFloat(e.target.value) || 0)} className="w-28" />
                </div>
              </div>

              {orderType !== "Market" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Price</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="mt-1.5" />
                  </div>
                  {(orderType === "Stop Limit" || orderType === "Stop Market" || orderType === "TP/SL" || orderType === "OCO") && (
                    <div>
                      <Label>{"Stop / Trigger"}</Label>
                      <Input type="number" value={stop ?? ""} onChange={(e) => setStop(parseFloat(e.target.value) || undefined)} className="mt-1.5" />
                    </div>
                  )}
                </div>
              )}

              {(orderType === "TP/SL" || orderType === "OCO") && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Take Profit</Label>
                    <Input type="number" value={tp ?? ""} onChange={(e) => setTp(parseFloat(e.target.value) || undefined)} className="mt-1.5" />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="w-full">
                      <Label>Reduce Only</Label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Switch checked={reduceOnly} onCheckedChange={setReduceOnly} />
                        <span className="text-sm text-muted-foreground">Only decrease position size</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label>Leverage: {leverage}x</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <Slider value={[leverage]} min={1} max={125} step={1} onValueChange={(v) => { setLeverage(v[0]) }} className="flex-1" />
                  <Input
                    type="number"
                    value={leverage}
                    min={1}
                    max={125}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(125, parseInt(e.target.value || "1")))
                      setLeverage(val)
                    }}
                    className="w-24"
                  />
                </div>
                {leverage >= 50 && (
                  <Alert variant="destructive" className="mt-2">
                    <CircleAlert className="h-4 w-4" />
                    <AlertTitle>High leverage</AlertTitle>
                    <AlertDescription>Confirm you understand the risks when using 50x+ leverage.</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </motion.div>
        ) : (
          <motion.div
            key="india-form"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Symbol</Label>
                  <Select value={symbol} onValueChange={setSymbol}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      {["NIFTY", "BANKNIFTY", "RELIANCE", "TCS", "HDFCBANK", "INFY"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Segment</Label>
                  <Select value={segment} onValueChange={(v) => setSegment(v as IndiaSegment)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Equity">Equity (Cash)</SelectItem>
                      <SelectItem value="Futures">Futures</SelectItem>
                      <SelectItem value="Options">Options</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Product</Label>
                  <Select value={product} onValueChange={(v) => setProduct(v as IndiaProduct)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNC">CNC (Delivery)</SelectItem>
                      <SelectItem value="MIS">MIS (Intraday)</SelectItem>
                      <SelectItem value="NRML">NRML (Carry Forward)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {segment === "Equity" && (
                  <div>
                    <Label>Quantity (shares)</Label>
                    <Input
                      type="number"
                      value={equityQty}
                      min={1}
                      onChange={(e) => setEquityQty(Math.max(1, parseInt(e.target.value || "1")))}
                      className="mt-1.5"
                    />
                  </div>
                )}
              </div>

              {segment !== "Equity" && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Expiry</Label>
                    <Input
                      type="date"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  {segment === "Options" && (
                    <>
                      <div>
                        <Label>Strike</Label>
                        <Input
                          type="number"
                          value={strike}
                          onChange={(e) => setStrike(parseInt(e.target.value || "0"))}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select value={optType} onValueChange={(v) => setOptType(v as OptionType)}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CE">CE</SelectItem>
                            <SelectItem value="PE">PE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  <div className={cn("col-span-1", segment === "Options" ? "" : "col-start-3")}>
                    <Label>Lots (lot={lotSize})</Label>
                    <Input
                      type="number"
                      value={lots}
                      min={1}
                      onChange={(e) => setLots(Math.max(1, parseInt(e.target.value || "1")))}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {segment === "Equity"
                  ? `Order will be placed as ${product} on ${broker}.`
                  : `Qty to send: ${lots * lotSize} (${lots} lot(s) × ${lotSize}). Product: ${product}.`}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      <CardFooter className="flex gap-2">
        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => onPlace("BUY")}>
          Buy
        </Button>
        <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => onPlace("SELL")}>
          Sell
        </Button>
        <Dialog open={confirmAllOpen} onOpenChange={setConfirmAllOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Cancel All Orders
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel all open orders?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This action will attempt to cancel all open orders for all symbols.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAllOpen(false)}>
                Keep Orders
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setConfirmAllOpen(false)
                  alert("All orders cancelled (mock).")
                }}
              >
                Confirm Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
