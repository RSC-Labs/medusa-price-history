# Medusa Price History

## What is it?

Medusa Price History provides functionality which stores older prices for variants. It can be used to fulfill Omnibus Directive in EU or other scenarios.

## Installation

1. Install plugin by adding to your `package.json`:

**Warning**

```json
...
"@rsc-labs/medusa-price-history": "0.0.3"
...
```
and execute install, e.g. `yarn install`.

2. Add plugin to your `medusa-config.js` with the licence key, which you received:

```js
...
plugins: [
    {
      resolve: "@rsc-labs/medusa-price-history",
    }
]
...
```

### Database migration

Medusa Price History introduces new models in database. To have it working, you need to firstly execute migrations:
```bash
npx medusa db:migrate
```

## Overview

The plugin drops calculated price at defined schedule for every variant. Then you are able to fetch such data through new Store API.

*NOTE*: While the calculated price can be different for every customer (the price might have many different rules), this plugin only calculates a price for a common use case. The only context which it gets is the `region`. It does not check customer groups, sales etc.

## Configuration

### Update schedule

Plugin uses scheduled job to update the prices. By default it uses `0 0 * * *` cron expression which means `every day at midnight`. It means, that every day the price is dropped into database with the current date, so you have a history of price split per day.

You can update such schedule using environment variable `MEDUSA_PRICE_HISTORY_UPDATE_SCHEDULE`, for instance: `export MEDUSA_PRICE_HISTORY_UPDATE_SCHEDULE="* * * * *"` will update price history every minute.

### Delete schedule

Plugin uses scheduled job to clean up the old entries in price histories. It uses two configuration variables:
- age in days - this can be setup through `options` under module in `medusa-config`. It means how old in days price history shall be to be deleted in the next execution. By default plugin uses 30 days, so every price history older than 30 days will be deleted.
```js
{
  // Only if the plugin system will work
  resolve: "@rsc-labs/medusa-price-history"
  options:
    ageInDays: 30
}
```
- schedule - you can configure also a schedule execution. By default plugin uses `0 0 * * *` cron expression which means `every day at midnight`. It means, that every day job is executed to check if you have price history older than `age in days`. If yes, then it will delete it.

You can update such schedule using environment variable `MEDUSA_PRICE_HISTORY_DELETE_SCHEDULE`, for instance: `export MEDUSA_PRICE_HISTORY_DELETE_SCHEDULE="* * * * *"` will check price history for deletion every minute (for instance it does not make sense to make every minute, because it looks for older entries in days).

## API

After storing price histories in database, you can fetch them for variants. Plugin exposes one new API - `store/products/[id]/price-history`. After calling this API you will get list of variants with their price histories. Details are here: [Store API](./docs/api.yaml)

## Limitations

Plugin checks the regions and currencies, but it does not check the context (like price rules, customers groups etc.) due to complexity. However, it might be considered as an improvement in the future.

## License

MIT

---

© 2024 RSC https://rsoftcon.com/
