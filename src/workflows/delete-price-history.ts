/*
 * Copyright 2024 RSC-Labs, https://rsoftcon.com/
 *
 * MIT License
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { dismissRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import PriceHistoryModuleService from "../modules/price-history/service";
import { PRICE_HISTORY_MODULE } from "src/modules/price-history";

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