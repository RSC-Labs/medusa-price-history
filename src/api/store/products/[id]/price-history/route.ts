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

import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { IProductModuleService, IRegionModuleService, ProductVariantDTO } from "@medusajs/framework/types";
import { PriceHistoryType } from "../../../../../modules/price-history/types";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const productModuleService: IProductModuleService  = req.scope.resolve(
    Modules.PRODUCT
  );

  const regionModuleService: IRegionModuleService  = req.scope.resolve(
    Modules.REGION
  );

  const rawRequest = req as unknown as any;
  const productId = rawRequest.params.id;

  const ageInDaysRaw = req.query.ageInDays as string;
  const regionId = req.query.region_id as string;

  const region = await regionModuleService.retrieveRegion(regionId);

  const variants: ProductVariantDTO[] = await productModuleService.listProductVariants({
    product_id: productId
  });

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let { 
    data: variantsPriceHistories
  } : {data: any[]} = await query.graph({
    entity: "product_variant",
    fields: [
      "*",
      "price_histories.*"
    ],
    filters: {
      id: variants.map(variant => variant.id)
    }
  });

  for (const variant of variantsPriceHistories) {
    variant.price_histories = variant.price_histories.filter((priceHistory: PriceHistoryType) => {
      if (priceHistory === null || priceHistory === undefined) {
        return false;
      }
      if (region && region.currency_code) {
        if (priceHistory.currency_code !== region.currency_code) {
          return false;
        }
      }
      if (ageInDaysRaw) {
        const ageInDays = Number(ageInDaysRaw);
        if (priceHistory.created_at < new Date(new Date().getTime() - (ageInDays * 24 * 60 * 60 * 1000))) {
          return false;
        }
      }
      return true;
    })
  }
  res.json(variantsPriceHistories);
}