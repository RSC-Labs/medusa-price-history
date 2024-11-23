import {
  createStep,
  createWorkflow,
  parallelize,
  StepResponse,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep, dismissRemoteLinkStep, removeRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { CalculatedPriceSet } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils";
import PriceHistoryModuleService from "../modules/price-history/service";
import { PRICE_HISTORY_MODULE } from "src/modules/price-history";

const stepCreatePricesHistory = createStep("create", async ({ calculatedPriceSets } : { calculatedPriceSets: CalculatedPriceSet[]}, context) => {

  const priceHistoryModuleService: PriceHistoryModuleService =
    context.container.resolve(PRICE_HISTORY_MODULE)

  const pricesHistories = await priceHistoryModuleService.createPriceHistories(calculatedPriceSets.map(calcPriceSet => {
    return {
      currency_code: calcPriceSet.currency_code,
      amount: calcPriceSet.calculated_amount,
      raw_amount: calcPriceSet.raw_calculated_amount,
    }
  }))

  return new StepResponse(pricesHistories);
})

type UpdatePriceHistoryInput = {
  variantId: string,
  calculatedPriceSets: CalculatedPriceSet[],
}

const updatePriceHistoryWorkflow = createWorkflow(
  "update-price-history",
  function (input: UpdatePriceHistoryInput) {

    const pricesHistories = stepCreatePricesHistory({ calculatedPriceSets: input.calculatedPriceSets});

    const linksToCreate = transform(
      { pricesHistories, input },
      ( data ) => data.pricesHistories.map((item) => {
        return {
          [Modules.PRODUCT]: {
            product_variant_id: data.input.variantId
          },
          [PRICE_HISTORY_MODULE]: {
            price_history_id: item.id
          }
        }}
      )
    )

    createRemoteLinkStep(linksToCreate);

    return new WorkflowResponse({pricesHistories})
  }
)

export default updatePriceHistoryWorkflow