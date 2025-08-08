"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"

type Order = {
  id: string
  type: string
  side: "Buy" | "Sell"
  symbol: string
  entry: number
  sl?: number
  tp?: number
  qty: number
  status: "Open" | "Filled" | "Cancelled"
}

type Trade = {
  ts: string
  symbol: string
  side: "Buy" | "Sell"
  priceIn: number
  priceOut?: number
  pnl: number
  fees: number
}

export function OrdersTables() {
  const [orders, setOrders] = useState<Order[]>([])
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    // seed
    setOrders([
      { id: "O-17401", type: "Limit", side: "Buy", symbol: "BTCUSDT", entry: 29950, sl: 29500, tp: 30500, qty: 0.01, status: "Open" },
      { id: "O-17402", type: "Market", side: "Sell", symbol: "ETHUSDT", entry: 3150, qty: 0.2, status: "Filled" },
    ])
    setTrades([
      { ts: new Date().toLocaleString(), symbol: "ETHUSDT", side: "Sell", priceIn: 3160, priceOut: 3150, pnl: 2.5, fees: 0.2 },
      { ts: new Date().toLocaleString(), symbol: "BTCUSDT", side: "Buy", priceIn: 30000, priceOut: 30110, pnl: 5.2, fees: 0.3 },
    ])
  }, [])

  const cancelOrder = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "Cancelled" } : o)))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>SL/TP</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono">{o.id}</TableCell>
                  <TableCell>{o.type}</TableCell>
                  <TableCell className={o.side === "Buy" ? "text-emerald-700" : "text-red-600"}>{o.side}</TableCell>
                  <TableCell>{o.symbol}</TableCell>
                  <TableCell className="tabular-nums">{o.entry}</TableCell>
                  <TableCell className="tabular-nums">
                    {(o.sl ? "SL " + o.sl : "-") + " / " + (o.tp ? "TP " + o.tp : "-")}
                  </TableCell>
                  <TableCell className="tabular-nums">{o.qty}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled={o.status !== "Open"} onClick={() => cancelOrder(o.id)}>
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No active orders
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead>PnL</TableHead>
                <TableHead>Fees</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((t, i) => (
                <TableRow key={i}>
                  <TableCell>{t.ts}</TableCell>
                  <TableCell>{t.symbol}</TableCell>
                  <TableCell className={t.side === "Buy" ? "text-emerald-700" : "text-red-600"}>{t.side}</TableCell>
                  <TableCell className="tabular-nums">{t.priceIn}</TableCell>
                  <TableCell className="tabular-nums">{t.priceOut ?? "-"}</TableCell>
                  <TableCell className={"tabular-nums " + (t.pnl >= 0 ? "text-emerald-700" : "text-red-600")}>
                    {(t.pnl >= 0 ? "+" : "") + t.pnl.toFixed(2)}
                  </TableCell>
                  <TableCell className="tabular-nums">{t.fees.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {trades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No trades yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
