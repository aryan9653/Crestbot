"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"

type Level = { price: number; qty: number }

function makeBook(mid = 30000) {
  const asks: Level[] = Array.from({ length: 10 }).map((_, i) => ({
    price: mid + i * 5 + Math.random() * 2,
    qty: +(Math.random() * 4).toFixed(3),
  }))
  const bids: Level[] = Array.from({ length: 10 }).map((_, i) => ({
    price: mid - i * 5 - Math.random() * 2,
    qty: +(Math.random() * 4).toFixed(3),
  }))
  return { asks, bids }
}

export function OrderBook({ symbol = "BTCUSDT" }: { symbol?: string }) {
  const [mid, setMid] = useState(30000)
  const [book, setBook] = useState(makeBook(mid))

  useEffect(() => {
    const t = setInterval(() => {
      setMid((m) => {
        const n = Math.max(1, m + (Math.random() - 0.5) * 25)
        setBook(makeBook(n))
        return n
      })
    }, 1200)
    return () => clearInterval(t)
  }, [])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3">
        <CardTitle className="text-base">Order Book {symbol}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Asks</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {book.asks
                .slice()
                .reverse()
                .map((l, i) => (
                  <TableRow key={"ask" + i} className="bg-red-50/40">
                    <TableCell className="text-red-600">{l.price.toFixed(2)}</TableCell>
                    <TableCell className="tabular-nums">{l.qty}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Bids</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {book.bids.map((l, i) => (
                <TableRow key={"bid" + i} className="bg-emerald-50/50">
                  <TableCell className="text-emerald-700">{l.price.toFixed(2)}</TableCell>
                  <TableCell className="tabular-nums">{l.qty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
