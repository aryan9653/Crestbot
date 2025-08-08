"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type Level = "INFO" | "WARN" | "ERROR"

type LogLine = { ts: string; level: Level; message: string }

export function LogsPanel() {
  const [lines, setLines] = useState<LogLine[]>([])
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<{ INFO: boolean; WARN: boolean; ERROR: boolean }>({ INFO: true, WARN: true, ERROR: true })
  const areaRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const t = setInterval(() => {
      const levels: Level[] = ["INFO", "WARN", "ERROR"]
      const level = levels[Math.floor(Math.random() * levels.length)]
      const msgs = {
        INFO: ["Connected to Binance Futures", "Placed LIMIT BUY BTCUSDT", "Order filled", "Heartbeat OK"],
        WARN: ["Latency high 250ms", "Partial fill detected", "Price deviation > 0.5%"],
        ERROR: ["Stop loss failed (retrying)", "API rate limited", "Order rejected (insufficient balance)"],
      }
      const message = msgs[level][Math.floor(Math.random() * msgs[level].length)]
      const line: LogLine = { ts: new Date().toLocaleTimeString(), level, message }
      setLines((prev) => [...prev.slice(-400), line])
      if (areaRef.current) areaRef.current.scrollTo({ top: areaRef.current.scrollHeight })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const shown = lines.filter((l) => filters[l.level] && (query.trim() === "" || (l.message + " " + l.ts + " " + l.level).toLowerCase().includes(query.toLowerCase())))

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <CardTitle>Logs</CardTitle>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox checked={filters.INFO} onCheckedChange={(v) => setFilters((f) => ({ ...f, INFO: !!v }))} id="f-info" />
            <label htmlFor="f-info" className="text-sm">
              Info
            </label>
            <Badge className="bg-gray-600">INFO</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={filters.WARN} onCheckedChange={(v) => setFilters((f) => ({ ...f, WARN: !!v }))} id="f-warn" />
            <label htmlFor="f-warn" className="text-sm">
              Warnings
            </label>
            <Badge className="bg-yellow-500">WARN</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={filters.ERROR} onCheckedChange={(v) => setFilters((f) => ({ ...f, ERROR: !!v }))} id="f-err" />
            <label htmlFor="f-err" className="text-sm">
              Errors
            </label>
            <Badge className="bg-red-600">ERROR</Badge>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Input placeholder="Search logs..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
            <Button variant="outline" onClick={() => setLines([])}>
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-black text-green-400 font-mono text-xs p-3">
          <ScrollArea className="h-[420px]" ref={areaRef as any}>
            {shown.map((l, i) => (
              <div key={i} className={cn(l.level === "ERROR" && "text-red-400", l.level === "WARN" && "text-yellow-300")}>
                [{l.ts}] {l.level} {l.message}
              </div>
            ))}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
