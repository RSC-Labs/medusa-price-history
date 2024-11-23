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