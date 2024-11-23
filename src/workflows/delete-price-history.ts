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
import { PriceHistoryType } from "src/modules/price-history/types";

const stepDeletePricesHistory = createStep("delete", async ({ pricesHistoriesIds } : { pricesHistoriesIds: string[]}, context) => {

  const priceHistoryModuleService: PriceHistoryModuleService =
    context.container.resolve(PRICE_HISTORY_MODULE)

  await priceHistoryModuleService.deletePriceHistories(pricesHistoriesIds);

  return new StepResponse();
})

type DeletePriceHistoryInput = {
  priceHistoriesIdsWithVariantId: {
    priceHistoryId: string,
    variantId: string
  }[]
}

const deletePriceHistoryWorkflow = createWorkflow(
  "delete-price-history",
  function (input: DeletePriceHistoryInput) {

    const pricesHistoriesIdsToDelete = transform(
      { input },
      ( data ) => data.input.priceHistoriesIdsWithVariantId.map(pricesHistory => pricesHistory.priceHistoryId)
    )

    stepDeletePricesHistory({ pricesHistoriesIds: pricesHistoriesIdsToDelete});

    const linksToDismiss = transform(
      { input },
      ( data ) => data.input.priceHistoriesIdsWithVariantId.map((item) => {
        return {
          [Modules.PRODUCT]: {
            product_variant_id: item.variantId
          },
          [PRICE_HISTORY_MODULE]: {
            price_history_id: item.priceHistoryId
          }
        }}
      )
    )

    dismissRemoteLinkStep(linksToDismiss);

    return new WorkflowResponse({})
  }
)

export default deletePriceHistoryWorkflow