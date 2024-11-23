import PriceHistoryModule from "../modules/price-history"
import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
  ProductModule.linkable.productVariant,
  {
    linkable: PriceHistoryModule.linkable.priceHistory,
    deleteCascade: true,
    isList: true,
  },
)