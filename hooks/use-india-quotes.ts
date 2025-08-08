"use client"

import { useEffect, useMemo, useRef, useState } from "react"

export type Broker = "Zerodha" | "Upstox" | "AngelOne" | "Dhan"

export function useIndiaQuotes(symbols: string[], broker?: Broker) {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [connected, setConnected] = useState(false)
  const [info, setInfo] = useState<{ broker?: string } | null>(null)
  const evtRef = useRef<EventSource | null>(null)

  const url = useMemo(() => {
    const sp = new URLSearchParams()
    sp.set("symbols", symbols.join(","))
    if (broker) sp.set("broker", broker)
    return `/api/india/stream?${sp.toString()}`
  }, [symbols, broker])

  useEffect(() => {
    if (!symbols.length) return
    const es = new EventSource(url)
    evtRef.current = es

    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)
    es.addEventListener("info", (e) => {
      try {
        const d = JSON.parse((e as MessageEvent).data)
        setInfo({ broker: d?.broker })
      } catch {}
    })
    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data) as { symbol: string; ltp: number }
        if (d?.symbol && Number.isFinite(d?.ltp)) {
          setPrices((prev) => ({ ...prev, [d.symbol.toUpperCase()]: d.ltp }))
        }
      } catch {
        // ignore
      }
    }

    return () => {
      es.close()
      evtRef.current = null
      setConnected(false)
    }
  }, [url])

  return { prices, connected, info }
}
