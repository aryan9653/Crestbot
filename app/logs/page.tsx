"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

type LogLevel = "info" | "warn" | "error"

function seedLogs(): { ts: string; level: LogLevel; msg: string }[] {
  const rows: any[] = []
  const start = Date.now() - 60_000
  for (let i = 0; i < 80; i++) {
    const ts = new Date(start + i * 750).toLocaleTimeString()
    const lvl: LogLevel = i % 17 === 0 ? "error" : i % 7 === 0 ? "warn" : "info"
    const msg =
      lvl === "error"
        ? "Order rejected due to margin"
        : lvl === "warn"
        ? "High leverage detected (50x+)"
        : "Placed LIMIT BUY BTCUSDT"
    rows.push({ ts, level: lvl, msg })
  }
  return rows.reverse()
}

export default function LogsPage() {
  const [logs] = useState(seedLogs)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<{ info: boolean; warn: boolean; error: boolean }>({
    info: true,
    warn: true,
    error: true,
  })

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (!filter.info && l.level === "info") return false
      if (!filter.warn && l.level === "warn") return false
      if (!filter.error && l.level === "error") return false
      if (search && !l.msg.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [logs, search, filter])

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Bot Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Input placeholder="Search logs…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-60" />
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox checked={filter.info} onCheckedChange={(v) => setFilter((f) => ({ ...f, info: Boolean(v) }))} /> Info
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={filter.warn} onCheckedChange={(v) => setFilter((f) => ({ ...f, warn: Boolean(v) }))} /> Warnings
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={filter.error} onCheckedChange={(v) => setFilter((f) => ({ ...f, error: Boolean(v) }))} /> Errors
              </label>
            </div>
            <Button variant="outline" onClick={() => alert("Live streaming logs not yet wired (mock).")}>Follow</Button>
          </div>
          <div className="rounded-md border bg-black text-green-400">
            <ScrollArea className="h-[400px]">
              <pre className="text-xs p-3 leading-5">
                {filtered.map((l, i) => `[${l.ts}] ${l.level.toUpperCase()} ${l.msg}`).join("\n")}
              </pre>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
