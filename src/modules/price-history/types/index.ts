export type PriceHistoryType = {
  id: string,
  currency_code: string,
  amount: number,
  raw_amount: Record<string, string>,
  created_at: Date
}