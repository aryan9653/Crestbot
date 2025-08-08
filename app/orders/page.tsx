"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type MarketKind = "CRYPTO" | "INDIA"
type Order = {
  id: string
  market: MarketKind
  symbol: string
  type: string
  side: "Buy" | "Sell"
  entry: number
  stop?: number
  takeProfit?: number
  qty: number
  status: "Open" | "Filled" | "Cancelled"
}

type Trade = {
  ts: string
  market: MarketKind
  symbol: string
  side: "Buy" | "Sell"
  entry: number
  exit: number
  pnl: number
  fee: number
}

function seedOrders(): Order[] {
  return [
    { id: "O-1001", market: "CRYPTO", symbol: "BTCUSDT", type: "Limit", side: "Buy", entry: 30000, stop: 29500, takeProfit: 31000, qty: 0.01, status: "Open" },
    { id: "O-1002", market: "INDIA", symbol: "RELIANCE", type: "Market", side: "Buy", entry: 2950.5, qty: 10, status: "Filled" },
    { id: "O-1003", market: "INDIA", symbol: "TCS", type: "Limit", side: "Sell", entry: 3800, stop: 3825, takeProfit: 3750, qty: 5, status: "Open" },
  ]
}
function seedTrades(): Trade[] {
  return [
    { ts: new Date().toLocaleString(), market: "CRYPTO", symbol: "ETHUSDT", side: "Buy", entry: 1700, exit: 1725, pnl: 12.3, fee: 0.2 },
    { ts: new Date().toLocaleString(), market: "INDIA", symbol: "HDFCBANK", side: "Sell", entry: 1650, exit: 1640.5, pnl: 9.1, fee: 1.2 },
  ]
}

export default function OrdersPage() {
  const [marketFilter, setMarketFilter] = useState<MarketKind | "ALL">("ALL")
  const [orders, setOrders] = useState<Order[]>(seedOrders)
  const [trades] = useState<Trade[]>(seedTrades)

  const filtered = useMemo(() => {
    return orders.filter((o) => marketFilter === "ALL" ? true : o.market === marketFilter)
  }, [orders, marketFilter])

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Orders</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={marketFilter} onValueChange={(v) => setMarketFilter(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Market filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="CRYPTO">Crypto</SelectItem>
                <SelectItem value="INDIA">India (NSE/BSE)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setOrders((prev) => prev.map((o) => o.status === "Open" ? { ...o, status: "Cancelled" } : o))}
            >
              Cancel All Open
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>SL / TP</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.market}</TableCell>
                  <TableCell>{o.symbol}</TableCell>
                  <TableCell>{o.type}</TableCell>
                  <TableCell className={o.side === "Buy" ? "text-emerald-600" : "text-red-600"}>{o.side}</TableCell>
                  <TableCell className="tabular-nums">{o.entry.toFixed(2)}</TableCell>
                  <TableCell className="tabular-nums">{(o.stop ?? "-") + " / " + (o.takeProfit ?? "-")}</TableCell>
                  <TableCell className="tabular-nums">{o.qty}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      disabled={o.status !== "Open"}
                      onClick={() => setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: "Cancelled" } : x))}
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-sm text-muted-foreground">No orders.</TableCell>
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
                <TableHead>Time</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Symbol</TableHead>
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
                  <TableCell>{t.market}</TableCell>
                  <TableCell>{t.symbol}</TableCell>
                  <TableCell className={t.side === "Buy" ? "text-emerald-600" : "text-red-600"}>{t.side}</TableCell>
                  <TableCell className="tabular-nums">{t.entry.toFixed(2)}</TableCell>
                  <TableCell className="tabular-nums">{t.exit.toFixed(2)}</TableCell>
                  <TableCell className={"tabular-nums " + (t.pnl >= 0 ? "text-emerald-700" : "text-red-600")}>
                    {(t.pnl >= 0 ? "+" : "") + t.pnl.toFixed(2)}
                  </TableCell>
                  <TableCell className="tabular-nums">{t.fee.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
