"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Result = { equity: number[]; stats: { winRate: number; profitFactor: number; maxDD: number } }

export default function BacktestPage() {
  const [fileName, setFileName] = useState<string>("")
  const [strategy, setStrategy] = useState("MA")
  const [range, setRange] = useState<{ from: string; to: string }>({ from: "", to: "" })
  const [res, setRes] = useState<Result | null>(null)

  const onRun = async () => {
    await new Promise((r) => setTimeout(r, 800))
    const equity = Array.from({ length: 120 }, (_, i) => 10000 + Math.sin(i / 6) * 200 + i * 10)
    setRes({ equity, stats: { winRate: 53.2, profitFactor: 1.41, maxDD: 8.7 } })
  }

  const equityMinMax = useMemo(() => {
    if (!res) return [0, 0]
    return [Math.min(...res.equity), Math.max(...res.equity)]
  }, [res])

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backtesting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Upload CSV</Label>
              <Input type="file" accept=".csv" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
              {fileName && <p className="text-xs text-muted-foreground mt-1">Selected: {fileName}</p>}
            </div>
            <div>
              <Label>Strategy</Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MA">Moving Average</SelectItem>
                  <SelectItem value="RSI">RSI</SelectItem>
                  <SelectItem value="FG">Fear/Greed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From</Label>
                <Input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
              </div>
              <div>
                <Label>To</Label>
                <Input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
              </div>
            </div>
          </div>
          <Button onClick={onRun}>Run Backtest</Button>
        </CardContent>
      </Card>

      {res && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Win rate: {res.stats.winRate}% • Profit factor: {res.stats.profitFactor} • Max drawdown: {res.stats.maxDD}%
            </div>
            <div className="h-48 rounded-md border bg-white relative overflow-hidden">
              {/* simple equity curve */}
              <svg className="absolute inset-0 w-full h-full">
                {(() => {
                  const w = 800, h = 192, pad = 8
                  const N = res.equity.length
                  const xmin = 0, xmax = N - 1
                  const [ymin, ymax] = equityMinMax
                  const x = (i: number) => pad + (i - xmin) / Math.max(1, xmax - xmin) * (w - pad * 2)
                  const y = (v: number) => pad + (1 - (v - ymin) / Math.max(1e-9, ymax - ymin)) * (h - pad * 2)
                  let d = ""
                  res.equity.forEach((v, i) => {
                    const cmd = i === 0 ? "M" : "L"
                    d += `${cmd}${x(i)},${y(v)} `
                  })
                  return <path d={d} stroke="#111827" fill="none" strokeWidth="2" />
                })()}
              </svg>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
