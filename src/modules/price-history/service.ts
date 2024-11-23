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

import { MedusaService } from "@medusajs/framework/utils"
import PriceHistory from "./models/price-history";

type ModuleOptions = {
  ageInDays: number,
}

class PriceHistoryModuleService extends MedusaService({
  PriceHistory
}) {

  protected options_: ModuleOptions
  readonly DEFAULT_AGE_IN_DAYS: number = 30;

  constructor({}, options?: ModuleOptions) {
    super(...arguments)

    this.options_ = {
      ageInDays: options.ageInDays ?? this.DEFAULT_AGE_IN_DAYS,
    }

    this.options_ = options;
  }

  getAgeOfPriceHistories() : number {
    return this.options_.ageInDays;
  }
}

export default PriceHistoryModuleService