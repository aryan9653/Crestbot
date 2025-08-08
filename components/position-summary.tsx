"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"

type Position = {
  symbol: string
  side: "LONG" | "SHORT"
  entry: number
  mark: number
  qty: number
  leverage: number
  pnl: number
}

export function PositionSummary() {
  const [wallet, setWallet] = useState(10000)
  const [positions, setPositions] = useState<Position[]>([
    { symbol: "BTCUSDT", side: "LONG", entry: 30000, mark: 30010, qty: 0.05, leverage: 10, pnl: 5.0 },
  ])

  useEffect(() => {
    const t = setInterval(() => {
      setPositions((prev) =>
        prev.map((p) => {
          const mark = Math.max(1, p.mark + (Math.random() - 0.5) * (p.entry * 0.001))
          const pnl = (mark - p.entry) * (p.side === "LONG" ? 1 : -1) * p.qty * p.leverage
          return { ...p, mark, pnl }
        })
      )
    }, 1500)
    return () => clearInterval(t)
  }, [])

  const unrealized = positions.reduce((acc, p) => acc + p.pnl, 0)
  const realized = 123.45

  return (
    <Card>
      <CardHeader>
        <CardTitle>Position Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Wallet Balance" value={"$" + wallet.toFixed(2)} />
          <Metric label="Unrealized PnL" value={(unrealized >= 0 ? "+" : "") + "$" + unrealized.toFixed(2)} tone={unrealized >= 0 ? "pos" : "neg"} />
          <Metric label="Realized PnL" value={"$" + realized.toFixed(2)} tone="pos" />
          <Metric label="Margin Level" value={((wallet + unrealized) / wallet * 100).toFixed(1) + "%"} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>Mark</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Lev</TableHead>
              <TableHead>PnL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((p, i) => (
              <TableRow key={i}>
                <TableCell>{p.symbol}</TableCell>
                <TableCell>
                  <Badge className={p.side === "LONG" ? "bg-emerald-600" : "bg-red-600"}>{p.side}</Badge>
                </TableCell>
                <TableCell className="tabular-nums">{p.entry.toFixed(2)}</TableCell>
                <TableCell className="tabular-nums">{p.mark.toFixed(2)}</TableCell>
                <TableCell className="tabular-nums">{p.qty}</TableCell>
                <TableCell className="tabular-nums">{p.leverage}x</TableCell>
                <TableCell className={"tabular-nums " + (p.pnl >= 0 ? "text-emerald-700" : "text-red-600")}>
                  {(p.pnl >= 0 ? "+" : "") + "$" + p.pnl.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "pos" | "neg" }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={"text-lg font-semibold " + (tone === "pos" ? "text-emerald-700" : tone === "neg" ? "text-red-600" : "")}>{value}</div>
    </div>
  )
}
