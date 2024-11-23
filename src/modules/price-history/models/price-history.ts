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

import { model } from "@medusajs/framework/utils"

const PriceHistory = model.define("price_history", {
  id: model.id().primaryKey(),
  currency_code: model.text(),
  amount: model.bigNumber(),
  raw_amount: model.json()
}) 

export default PriceHistory