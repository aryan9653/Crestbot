"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  return (
    <div className={cn("relative h-3 w-full overflow-hidden rounded-full bg-muted", className)} {...props}>
      <div
        className="h-full w-full flex-1 bg-foreground transition-all"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: "var(--progress, var(--progress, var(--primary)))",
        }}
      />
    </div>
  )
}
