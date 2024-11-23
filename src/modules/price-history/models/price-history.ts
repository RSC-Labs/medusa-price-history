import { model } from "@medusajs/framework/utils"

const PriceHistory = model.define("price_history", {
  id: model.id().primaryKey(),
  currency_code: model.text(),
  amount: model.bigNumber(),
  raw_amount: model.json()
}) 

export default PriceHistory