"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function FearGreedPanel() {
  const [value, setValue] = useState(50)

  useEffect(() => {
    const t = setInterval(() => setValue(Math.max(0, Math.min(100, value + (Math.random() - 0.5) * 10))), 4000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const tone = value > 60 ? "greed" : value < 40 ? "fear" : "neutral"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fear & Greed Index</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Sentiment</span>
          <span className={cn("text-sm font-medium", tone === "greed" && "text-emerald-700", tone === "fear" && "text-red-600")}>
            {tone === "greed" ? "Greed" : tone === "fear" ? "Fear" : "Neutral"}
          </span>
        </div>
        <Progress value={value} className={cn(tone === "greed" && "[--progress:bg-emerald-600]", tone === "fear" && "[--progress:bg-red-600]")} />
        <div className="text-xs text-muted-foreground mt-2">Current: {Math.round(value)}</div>
      </CardContent>
    </Card>
  )
}
