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