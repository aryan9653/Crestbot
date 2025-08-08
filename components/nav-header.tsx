"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { KeyRound, LogOut, Settings, User } from 'lucide-react'
import { useEffect, useState } from "react"

const tabs = [
  { href: "/", label: "Dashboard" },
  { href: "/orders", label: "Orders" },
  { href: "/bot-settings", label: "Bot Settings" },
  { href: "/logs", label: "Logs" },
  { href: "/backtest", label: "Backtest" },
]

export function AppHeader({ appName = "Crest Trade Bot" }: { appName?: string }) {
  const pathname = usePathname()
  const [apiConnected, setApiConnected] = useState(false)

  useEffect(() => {
    // Simulate stored API key status
    const hasKey = typeof window !== "undefined" && localStorage.getItem("api_key")
    setApiConnected(!!hasKey)
  }, [])

  return (
    <header className="border-b bg-white sticky top-0 z-30">
      <div className="container mx-auto h-16 px-4 md:px-6 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/robot-trader-logo.png"
            width={32}
            height={32}
            alt="App logo"
            className="rounded"
          />
          <span className="font-semibold">{appName}</span>
        </Link>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-2 ml-4">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm transition-colors",
                pathname === t.href ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={apiConnected ? "default" : "secondary"} className={apiConnected ? "bg-emerald-600" : "bg-yellow-500"}>
            {apiConnected ? "API Connected" : "API Not Set"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/bot-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("api_key")
                  localStorage.removeItem("api_secret")
                  location.reload()
                }}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Clear API key
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => alert("Logged out (mock).")}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
