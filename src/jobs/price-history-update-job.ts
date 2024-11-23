import { MedusaContainer, IPricingModuleService, CalculatedPriceSet, RegionDTO } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import updatePriceHistoryWorkflow from "../workflows/update-price-history";

export default async function (
  container: MedusaContainer
) {

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const regionModuleService = container.resolve(
    Modules.REGION
  )

  const regions: RegionDTO[] = await regionModuleService.listRegions()

  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { 
    data: productPriceSets,
  } = await query.graph({
    entity: "product_variant_price_set",
    fields: [
      "*",
    ],
  });

  const pricingModuleService: IPricingModuleService = container.resolve(Modules.PRICING);

  const pricesForVariant = new Map<string, CalculatedPriceSet[]>();

  for (const region of regions) {
    for (const productPriceSet of productPriceSets) {
      const prices = await pricingModuleService.calculatePrices( 
        {
          id: [productPriceSet.price_set_id]
        },
        {
          context: {
            currency_code: region.currency_code,
            region_id: region.id
          }
        }
      )
      pricesForVariant.set(
        productPriceSet.variant_id,
        prices
      )
    }
  }

  for (let priceForVariant of pricesForVariant) {
    await updatePriceHistoryWorkflow(container)
      .run({
        input: {
          variantId: priceForVariant[0],
          calculatedPriceSets: priceForVariant[1]
        }
      });
  }


  logger.info('Prices histories have been updated');
}

// the job's configurations
export const config = {
  name: "every-minute-message",
  // execute every minute
  schedule: process.env.MEDUSA_PRICE_HISTORY_UPDATE_SCHEDULE || "0 0 * * *",
}