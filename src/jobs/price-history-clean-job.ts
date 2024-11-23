import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { PRICE_HISTORY_MODULE } from "../modules/price-history";
import PriceHistoryModuleService from "src/modules/price-history/service";
import deletePriceHistoryWorkflow from "src/workflows/delete-price-history";

export default async function (
  container: MedusaContainer
) {

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  const priceHistoryModuleService: PriceHistoryModuleService = container.resolve(
    PRICE_HISTORY_MODULE
  )

  const ageInDays: number = priceHistoryModuleService.getAgeOfPriceHistories();

  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: priceHistoriesWithVariant
  } : {data: any[]} = await query.graph({
    entity: "price_history",
    fields: [
      "*",
      "product_variant.id"
    ],
    filters: {
      created_at: {
        $lt: new Date(new Date().getTime() - (ageInDays * 24 * 60 * 60 * 1000))
      }
    }
  });

  const result = priceHistoriesWithVariant.map(priceHistoryWithVariant => {
    return {
      priceHistoryId: priceHistoryWithVariant.id,
      variantId: priceHistoryWithVariant.product_variant.id
    }
  })

  await deletePriceHistoryWorkflow(container)
    .run({
      input: {
        priceHistoriesIdsWithVariantId: result
      }
    });

  logger.info('Prices histories have been cleaned up');
}

// the job's configurations
export const config = {
  name: "price-history-clean",
  // execute every minute
  schedule: process.env.MEDUSA_PRICE_HISTORY_DELETE_SCHEDULE || "0 0 * * *",
}