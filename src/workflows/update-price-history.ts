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
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { CalculatedPriceSet } from "@medusajs/framework/types"
import { BigNumber, Modules } from "@medusajs/framework/utils";
import PriceHistoryModuleService from "../modules/price-history/service";
import { PRICE_HISTORY_MODULE } from "src/modules/price-history";

const stepCreatePricesHistory = createStep("create", async ({ calculatedPriceSets } : { calculatedPriceSets: CalculatedPriceSet[]}, context) => {

  const priceHistoryModuleService: PriceHistoryModuleService =
    context.container.resolve(PRICE_HISTORY_MODULE)

  const pricesHistories = await priceHistoryModuleService.createPriceHistories(calculatedPriceSets.map(calcPriceSet => {
    return {
      currency_code: calcPriceSet.currency_code,
      amount: new BigNumber(calcPriceSet.calculated_amount).bigNumber,
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