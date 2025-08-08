"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"

export function BotSettings() {
  const [apiKey, setApiKey] = useState("")
  const [apiSecret, setApiSecret] = useState("")
  const [useTestnet, setUseTestnet] = useState(true)
  const [strategy, setStrategy] = useState("Moving Average")
  const [maxLev, setMaxLev] = useState(20)
  const [maxDD, setMaxDD] = useState(15)
  const [autoStopPct, setAutoStopPct] = useState(20)
  const [enableLogs, setEnableLogs] = useState(true)
  const [logRetention, setLogRetention] = useState(30)

  useEffect(() => {
    // load from storage
    setApiKey(localStorage.getItem("api_key") ?? "")
    setApiSecret(localStorage.getItem("api_secret") ?? "")
    setUseTestnet(localStorage.getItem("testnet") === "true")
    setStrategy(localStorage.getItem("strategy") ?? "Moving Average")
    setMaxLev(parseInt(localStorage.getItem("maxLev") ?? "20"))
    setMaxDD(parseInt(localStorage.getItem("maxDD") ?? "15"))
    setAutoStopPct(parseInt(localStorage.getItem("autoStopPct") ?? "20"))
    setEnableLogs(localStorage.getItem("enableLogs") !== "false")
    setLogRetention(parseInt(localStorage.getItem("logRetention") ?? "30"))
  }, [])

  const save = () => {
    localStorage.setItem("api_key", apiKey)
    localStorage.setItem("api_secret", apiSecret)
    localStorage.setItem("testnet", String(useTestnet))
    localStorage.setItem("strategy", strategy)
    localStorage.setItem("maxLev", String(maxLev))
    localStorage.setItem("maxDD", String(maxDD))
    localStorage.setItem("autoStopPct", String(autoStopPct))
    localStorage.setItem("enableLogs", String(enableLogs))
    localStorage.setItem("logRetention", String(logRetention))
    toast({ title: "Saved", description: "Settings saved locally." })
  }

  const testConnection = async () => {
    await new Promise((r) => setTimeout(r, 800))
    const ok = apiKey.length > 5 && apiSecret.length > 5
    toast({
      title: ok ? "Connection successful" : "Connection failed",
      description: ok ? "API credentials look valid (mock)." : "Please check your API key and secret.",
      variant: ok ? "default" : "destructive",
    })
  }

  const exportLogs = () => {
    const blob = new Blob(["[14:22:35] Connected to Binance Futures\n[14:22:37] Placed LIMIT BUY BTCUSDT @ 30000, qty 0.001\n"], {
      type: "text/plain",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bot-logs.txt"
    a.click()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Connect your exchange account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label>API Key</Label>
              <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="mt-1.5" placeholder="Enter API key" />
            </div>
            <div>
              <Label>API Secret</Label>
              <Input value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} className="mt-1.5" placeholder="Enter API secret" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Use Testnet</Label>
                <p className="text-xs text-muted-foreground">Toggle Binance Futures Testnet</p>
              </div>
              <Switch checked={useTestnet} onCheckedChange={setUseTestnet} />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={testConnection}>Test Connection</Button>
              <Button variant="outline" onClick={save}>
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strategy Settings</CardTitle>
          <CardDescription>Choose strategy and risk limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Max Leverage</Label>
              <Input type="number" value={maxLev} min={1} max={125} onChange={(e) => setMaxLev(parseInt(e.target.value || "1"))} className="mt-1.5" />
            </div>
            <div>
              <Label>Max Drawdown %</Label>
              <Input type="number" value={maxDD} min={1} max={90} onChange={(e) => setMaxDD(parseInt(e.target.value || "1"))} className="mt-1.5" />
            </div>
            <div>
              <Label>Auto-stop if loss %</Label>
              <Input
                type="number"
                value={autoStopPct}
                min={1}
                max={90}
                onChange={(e) => setAutoStopPct(parseInt(e.target.value || "1"))}
                className="mt-1.5"
              />
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Detailed logging</Label>
                <p className="text-xs text-muted-foreground">Include debug-level logs</p>
              </div>
              <Switch checked={enableLogs} onCheckedChange={setEnableLogs} />
            </div>
            <div>
              <Label>Log storage limit (days)</Label>
              <Input
                type="number"
                value={logRetention}
                min={1}
                max={365}
                onChange={(e) => setLogRetention(parseInt(e.target.value || "1"))}
                className="mt-1.5"
              />
            </div>
            <Button variant="outline" onClick={exportLogs}>
              Export logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
