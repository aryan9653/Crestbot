"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type MarketKind = "CRYPTO" | "INDIA"
export type IndiaBroker = "Zerodha" | "Upstox" | "AngelOne" | "Dhan"

export function MarketSwitcher({
  market,
  onMarketChange,
  broker = "Zerodha",
  onBrokerChange,
}: {
  market: MarketKind
  onMarketChange: (m: MarketKind) => void
  broker?: IndiaBroker
  onBrokerChange: (b: IndiaBroker) => void
}) {
  return (
    <Card className="p-3">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div>
          <Label className="mb-2 block">Market</Label>
          <RadioGroup
            className="flex gap-4"
            value={market}
            onValueChange={(v) => onMarketChange(v as MarketKind)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="m-crypto" value="CRYPTO" />
              <Label htmlFor="m-crypto">Crypto</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="m-india" value="INDIA" />
              <Label htmlFor="m-india">India (NSE/BSE)</Label>
            </div>
          </RadioGroup>
        </div>

        {market === "INDIA" && (
          <div className="md:ml-auto">
            <Label className="mb-2 block">Broker</Label>
            <Select value={broker} onValueChange={(v) => onBrokerChange(v as IndiaBroker)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select broker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Zerodha">Zerodha</SelectItem>
                <SelectItem value="Upstox">Upstox</SelectItem>
                <SelectItem value="AngelOne">Angel One</SelectItem>
                <SelectItem value="Dhan">Dhan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </Card>
  )
}
