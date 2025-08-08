"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function BotSettingsPage() {
  const [useTestnet, setUseTestnet] = useState(false)
  const [strategy, setStrategy] = useState("RSI")
  const [maxLev, setMaxLev] = useState(10)
  const [maxDrawdown, setMaxDrawdown] = useState(10)
  const [enableLogging, setEnableLogging] = useState(true)

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Store keys server-side only. Do not expose in the browser.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Binance Key (Crypto)</Label>
            <Input placeholder="BINANCE_API_KEY (server-side only)" />
          </div>
          <div className="space-y-1">
            <Label>Binance Secret</Label>
            <Input placeholder="BINANCE_SECRET (server-side only)" />
          </div>
          <Separator className="md:col-span-2 my-2" />
          <div className="space-y-1">
            <Label>Zerodha (Kite) API Key</Label>
            <Input placeholder="ZERODHA_API_KEY (server-side only)" />
          </div>
          <div className="space-y-1">
            <Label>Zerodha Access Token</Label>
            <Input placeholder="ZERODHA_ACCESS_TOKEN (server-side only)" />
          </div>
          <div className="space-y-1">
            <Label>Upstox Access Token</Label>
            <Input placeholder="UPSTOX_ACCESS_TOKEN (server-side only)" />
          </div>
          <div className="space-y-1">
            <Label>AngelOne API Key</Label>
            <Input placeholder="ANGEL_API_KEY (server-side only)" />
          </div>
          <div className="space-y-1">
            <Label>AngelOne JWT Token</Label>
            <Input placeholder="ANGEL_JWT_TOKEN (server-side only)" />
          </div>
          <div className="space-y-1">
            <Label>Dhan Access Token</Label>
            <Input placeholder="DHAN_ACCESS_TOKEN (server-side only)" />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button variant="outline" onClick={() => alert("Testing connection (mock)…")}>Test Connection</Button>
            <Button onClick={() => alert("Saved (mock). Use server actions to persist securely.")}>Save</Button>
            <div className="ml-auto flex items-center gap-2">
              <Label htmlFor="testnet">Use Testnet</Label>
              <Switch id="testnet" checked={useTestnet} onCheckedChange={setUseTestnet} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strategy Settings</CardTitle>
          <CardDescription>Pick a strategy and risk controls.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Strategy</Label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RSI">RSI</SelectItem>
                <SelectItem value="MA">Moving Average</SelectItem>
                <SelectItem value="FG">Fear/Greed-based</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Max Leverage</Label>
            <Input type="number" value={maxLev} onChange={(e) => setMaxLev(parseInt(e.target.value || "1"))} />
          </div>
          <div className="space-y-1">
            <Label>Max Drawdown (%)</Label>
            <Input type="number" value={maxDrawdown} onChange={(e) => setMaxDrawdown(parseInt(e.target.value || "0"))} />
          </div>
          <div className="space-y-1">
            <Label>Auto Stop Loss Threshold (%)</Label>
            <Input type="number" placeholder="e.g. 5" />
          </div>
          <div className="md:col-span-2">
            <Button onClick={() => alert(`Strategy saved: ${strategy}, maxLev=${maxLev}, dd=${maxDrawdown}%`)}>Save Strategy</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logging Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={enableLogging} onCheckedChange={setEnableLogging} id="log" />
            <Label htmlFor="log">Enable detailed logging</Label>
          </div>
          <div className="space-y-1">
            <Label>Log storage horizon</Label>
            <Select defaultValue="30d">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button variant="outline" onClick={() => alert("Exported logs (mock).")}>Export logs</Button>
            <Button onClick={() => alert("Cleared logs older than horizon (mock).")}>Clear old logs</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
