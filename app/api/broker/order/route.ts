import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  // In production, read broker from body and route to appropriate SDK/API with server-side credentials
  const body = await req.json().catch(() => ({}))

  // Example shape of a normalized response
  const result = {
    ok: true,
    order_id: "MOCK-" + Math.floor(Math.random() * 1_000_000),
    echo: body,
    note:
      "This is a mock proxy. Replace with broker SDK call here using server-side secrets. Do not expose credentials to the client.",
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
