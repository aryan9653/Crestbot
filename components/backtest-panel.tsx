"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addDays, format } from "date-fns"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

type RunResult = {
  equity: { time: string; value: number }[]
  winRate: number
  profitFactor: number
  maxDD: number
  trades: { ts: string; symbol: string; side: "Buy" | "Sell"; entry: number; exit: number; pnl: number }[]
}

function simulateEquity(start = 10000, days = 30) {
  const eq: { time: string; value: number }[] = []
  let v = start
  let peak = start
  let maxDD = 0
  const trades: RunResult["trades"] = []
  for (let i = 0; i < days; i++) {
    const dailyR = (Math.random() - 0.45) * 0.05 // slight edge
    const entry = 1000 + Math.random() * 1000
    const exit = entry * (1 + dailyR)
    const side: "Buy" | "Sell" = Math.random() > 0.5 ? "Buy" : "Sell"
    const pnl = v * dailyR
    v = v * (1 + dailyR)
    peak = Math.max(peak, v)
    maxDD = Math.max(maxDD, (peak - v) / peak)
    eq.push({ time: format(addDays(new Date(), i), "MM-dd"), value: +v.toFixed(2) })
    trades.push({ ts: format(addDays(new Date(), i), "yyyy-MM-dd"), symbol: "BTCUSDT", side, entry: +entry.toFixed(2), exit: +exit.toFixed(2), pnl: +pnl.toFixed(2) })
  }
  const wins = trades.filter((t) => t.pnl > 0).length
  const losses = trades.length - wins
  const grossProfit = trades.filter((t) => t.pnl > 0).reduce((a, b) => a + b.pnl, 0)
  const grossLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((a, b) => a + b.pnl, 0))
  return {
    equity: eq,
    winRate: trades.length ? (wins / trades.length) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit,
    maxDD: maxDD * 100,
    trades,
  } as RunResult
}

export function BacktestPanel() {
  const [fileName, setFileName] = useState<string>("")
  const [strategy, setStrategy] = useState("Moving Average")
  const [dateFrom, setDateFrom] = useState<string>("2024-01-01")
  const [dateTo, setDateTo] = useState<string>("2024-02-01")
  const [result, setResult] = useState<RunResult | null>(null)
  const chartConfig = useMemo(
    () => ({
      value: { label: "Equity", color: "hsl(142.1 70.6% 45.3%)" },
    }),
    []
  )

  const run = async () => {
    // For this mock, we ignore the file and generate simulated results.
    await new Promise((r) => setTimeout(r, 800))
    setResult(simulateEquity(10000, 45))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backtesting</CardTitle>
          <CardDescription>Upload CSV historical data, choose strategy and dates, then run a simulation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Label>Historical CSV</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                  className="file:mr-2 file:py-1 file:px-2 file:rounded-md file:border file:bg-muted"
                />
                {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
              </div>
            </div>
            <div>
              <Label>Strategy</Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Moving Average">Moving Average</SelectItem>
                  <SelectItem value="RSI">RSI</SelectItem>
                  <SelectItem value="Fear/Greed">Fear/Greed-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div />
            <div>
              <Label>Date from</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Date to</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1.5" />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button onClick={run} className="w-full">
                Run Backtest
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <AreaChart data={result.equity} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={{ stroke: "#94a3b8" }} content={<ChartTooltipContent />} />
                  <Area dataKey="value" type="monotone" stroke="hsl(142.1 70.6% 45.3%)" fill="hsl(142.1 70.6% 45.3% / 0.2)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Stat label="Win rate" value={result.winRate.toFixed(1) + "%"} />
              <Stat label="Profit factor" value={result.profitFactor.toFixed(2)} />
              <Stat label="Max drawdown" value={result.maxDD.toFixed(1) + "%"} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Simulated Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Timestamp</th>
                      <th>Pair</th>
                      <th>Side</th>
                      <th>Entry</th>
                      <th>Exit</th>
                      <th>PnL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.map((t, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2">{t.ts}</td>
                        <td>{t.symbol}</td>
                        <td className={t.side === "Buy" ? "text-emerald-700" : "text-red-600"}>{t.side}</td>
                        <td className="tabular-nums">{t.entry}</td>
                        <td className="tabular-nums">{t.exit}</td>
                        <td className={"tabular-nums " + (t.pnl >= 0 ? "text-emerald-700" : "text-red-600")}>
                          {(t.pnl >= 0 ? "+" : "") + t.pnl.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
