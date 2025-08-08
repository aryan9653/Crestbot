export type PlaceOrderParams =
  | {
      market: "CRYPTO"
      side: "BUY" | "SELL"
      symbol: string
      orderType: string
      qty: number
      price?: number | "MARKET"
      stop?: number
      tp?: number
      leverage?: number
      reduceOnly?: boolean
    }
  | {
      market: "INDIA"
      broker: "Zerodha" | "Upstox" | "AngelOne" | "Dhan"
      side: "BUY" | "SELL"
      segment: "Equity" | "Futures" | "Options"
      product: "CNC" | "MIS" | "NRML"
      tradingsymbol?: string
      symbol?: string // for equity cash
      quantity: number
      orderType: "MARKET" | "LIMIT"
      price?: number
    }

export type OrderResponse = {
  order_id: string
  status: "accepted" | "rejected" | "queued"
  raw?: unknown
}

export interface BrokerAdapter {
  name: string
  placeOrder(params: PlaceOrderParams): Promise<OrderResponse>
  cancelOrder?(id: string): Promise<{ ok: boolean }>
}

// Example mock adapters (replace with real SDK calls on the server)
export const MockBinanceAdapter: BrokerAdapter = {
  name: "Binance",
  async placeOrder(params) {
    return {
      order_id: "BN-" + Math.floor(Math.random() * 1_000_000),
      status: "accepted",
      raw: params,
    }
  },
}

export const MockZerodhaAdapter: BrokerAdapter = {
  name: "Zerodha",
  async placeOrder(params) {
    // Here you'd use Kite Connect REST with access token stored server-side
    return {
      order_id: "KITE-" + Math.floor(Math.random() * 1_000_000),
      status: "accepted",
      raw: params,
    }
  },
}
