/**
 * SSE stream of India market quotes (NSE/BSE) for given symbols.
 * Query params:
 *  - symbols: comma-separated, e.g. RELIANCE,TCS,HDFCBANK,INFY
 *  - broker: Zerodha|Upstox|AngelOne|Dhan (optional; first available creds will be used if omitted)
 *
 * Notes:
 *  - If no broker credentials are set in env, the stream falls back to mocked quotes.
 *  - For live data, provide the broker tokens as environment variables on the server.
 */
import { NextRequest } from "next/server"

type Broker = "Zerodha" | "Upstox" | "AngelOne" | "Dhan"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const raw = (searchParams.get("symbols") ?? "").trim()
  const requestedBroker = (searchParams.get("broker") as Broker | null) ?? null

  const symbols = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)

  if (symbols.length === 0) {
    return new Response("Missing symbols", { status: 400 })
  }

  const encoder = new TextEncoder()

  // Choose broker by availability of credentials (or requested one)
  const available = getAvailableBrokers()
  const broker: Broker | "mock" =
    (requestedBroker && available.includes(requestedBroker) && requestedBroker) ||
    available[0] ||
    "mock"

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Write initial event
      controller.enqueue(encoder.encode(`event: info\ndata: ${JSON.stringify({ broker })}\n\n`))

      let stop = false
      const abort = req.signal
      abort.addEventListener("abort", () => {
        stop = true
      })

      // Poll interval for REST brokers (WebSockets not used in this demo route)
      const intervalMs = 2000

      // Seed mock state for fallback or as a backup
      const mockState = Object.fromEntries(
        symbols.map((s) => [s, 1000 + Math.random() * 500])
      ) as Record<string, number>

      async function tick() {
        if (stop) return
        try {
          let quotes: Record<string, number> | null = null

          if (broker === "Zerodha") {
            quotes = await fetchZerodhaQuotes(symbols)
          } else if (broker === "Upstox") {
            quotes = await fetchUpstoxQuotes(symbols)
          } else if (broker === "AngelOne") {
            quotes = await fetchAngelQuotes(symbols)
          } else if (broker === "Dhan") {
            quotes = await fetchDhanQuotes(symbols)
          }

          // If no live quotes (missing env or API failure), update mock
          if (!quotes) {
            quotes = {}
            for (const s of symbols) {
              const last = mockState[s]
              const delta = (Math.random() - 0.5) * Math.max(1, last * 0.004)
              const next = Math.max(1, last + delta)
              mockState[s] = next
              quotes[s] = next
            }
          }

          // Emit quotes as individual SSE messages
          const now = Date.now()
          for (const [symbol, ltp] of Object.entries(quotes)) {
            const payload = JSON.stringify({ symbol, ltp, ts: now, broker })
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
          }
        } catch (err) {
          // Soft error; keep the stream alive
          controller.enqueue(
            encoder.encode(`event: warn\ndata: ${JSON.stringify({ error: "poll_failed" })}\n\n`)
          )
        }
        if (!stop) {
          setTimeout(tick, intervalMs)
        }
      }

      tick()
    },
    cancel() {
      // nothing
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}

function getAvailableBrokers(): Broker[] {
  const list: Broker[] = []
  if (process.env.ZERODHA_API_KEY && process.env.ZERODHA_ACCESS_TOKEN) list.push("Zerodha")
  if (process.env.UPSTOX_ACCESS_TOKEN) list.push("Upstox")
  if (process.env.ANGEL_API_KEY && process.env.ANGEL_JWT_TOKEN) list.push("AngelOne")
  if (process.env.DHAN_ACCESS_TOKEN) list.push("Dhan")
  return list
}

// Map app symbol (e.g., RELIANCE) to broker-specific instrument IDs
function mapToZerodhaInstruments(symbols: string[]) {
  // Basic mapping for common equities. Extend with instrument master for completeness.
  return symbols.map((s) => `NSE:${s}`)
}

async function fetchZerodhaQuotes(symbols: string[]): Promise<Record<string, number> | null> {
  try {
    const apiKey = process.env.ZERODHA_API_KEY!
    const accessToken = process.env.ZERODHA_ACCESS_TOKEN!
    if (!apiKey || !accessToken) return null

    const instruments = mapToZerodhaInstruments(symbols)
    const url = `https://api.kite.trade/quote?${instruments
      .map((i) => `i=${encodeURIComponent(i)}`)
      .join("&")}`

    const res = await fetch(url, {
      headers: {
        "X-Kite-Version": "3",
        Authorization: `token ${apiKey}:${accessToken}`,
      },
    })
    if (!res.ok) return null
    const json = (await res.json()) as any
    // Response shape: { data: { "NSE:RELIANCE": { last_price: 1234.5 }, ... } }
    const out: Record<string, number> = {}
    const data = json?.data ?? {}
    for (const [key, obj] of Object.entries<any>(data)) {
      const sym = String(key).split(":")[1] ?? key
      const ltp = Number(obj?.last_price)
      if (Number.isFinite(ltp)) out[sym.toUpperCase()] = ltp
    }
    return Object.keys(out).length ? out : null
  } catch {
    return null
  }
}

function mapToUpstoxSymbols(symbols: string[]) {
  // Upstox format for cash equities: NSE_EQ|RELIANCE
  return symbols.map((s) => `NSE_EQ|${s}`)
}

async function fetchUpstoxQuotes(symbols: string[]): Promise<Record<string, number> | null> {
  try {
    const token = process.env.UPSTOX_ACCESS_TOKEN!
    if (!token) return null
    const list = mapToUpstoxSymbols(symbols)
    const url = `https://api-v2.upstox.com/market-quote/quotes?${list
      .map((s) => `symbol=${encodeURIComponent(s)}`)
      .join("&")}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) return null
    const json = (await res.json()) as any
    // Response shape: { data: { "NSE_EQ|RELIANCE": { last_price: ... }, ... } }
    const out: Record<string, number> = {}
    const data = json?.data ?? {}
    for (const [key, obj] of Object.entries<any>(data)) {
      const sym = String(key).split("|")[1] ?? key
      const ltp = Number(obj?.last_price ?? obj?.ltp ?? obj?.close)
      if (Number.isFinite(ltp)) out[sym.toUpperCase()] = ltp
    }
    return Object.keys(out).length ? out : null
  } catch {
    return null
  }
}

// Angel One SmartAPI (simplified; their quotes API often POSTs with JSON body)
async function fetchAngelQuotes(symbols: string[]): Promise<Record<string, number> | null> {
  try {
    const apiKey = process.env.ANGEL_API_KEY!
    const jwt = process.env.ANGEL_JWT_TOKEN!
    if (!apiKey || !jwt) return null

    const url =
      "https://apiconnect.angelbroking.com/rest/secure/angelbroking/market/v1/quote"
    const body = {
      mode: "LTP",
      exchangeTokens: {
        NSE: symbols, // Simplified; ideally map to exchange token IDs
      },
    }
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-PrivateKey": apiKey,
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    const json = (await res.json()) as any
    // Expected: data with list of { symbol: "RELIANCE", ltp: number }
    const out: Record<string, number> = {}
    const list: any[] = json?.data || []
    for (const item of list) {
      const sym = String(item?.symbol ?? item?.tradingSymbol ?? "").toUpperCase()
      const ltp = Number(item?.ltp ?? item?.last_price)
      if (sym && Number.isFinite(ltp)) out[sym] = ltp
    }
    return Object.keys(out).length ? out : null
  } catch {
    return null
  }
}

async function fetchDhanQuotes(symbols: string[]): Promise<Record<string, number> | null> {
  try {
    const token = process.env.DHAN_ACCESS_TOKEN!
    if (!token) return null
    // Dhan batch quotes endpoint (spec may vary; adjust per latest docs)
    const url = "https://api.dhan.co/marketlive/quotes"
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "access-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbols }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as any
    const out: Record<string, number> = {}
    const list: any[] = json?.data || []
    for (const item of list) {
      const sym = String(item?.symbol ?? item?.tradingSymbol ?? "").toUpperCase()
      const ltp = Number(item?.ltp ?? item?.last_price)
      if (sym && Number.isFinite(ltp)) out[sym] = ltp
    }
    return Object.keys(out).length ? out : null
  } catch {
    return null
  }
}
