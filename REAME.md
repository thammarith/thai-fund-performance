# (Partial) Thai Fund Performance for Portfolio Performance

This repository contains some of perfomance for Thai funds.

## Funds

### What are included?

> For the list of all funds, see in [./data/navs/](./data/navs/)

Due to rate limit restricted by SEC API, I'm gradually increasing the coverage for Thai funds.

The following criteria are used to determine which funds are in this repository:

- From SCB, KKP, and (KFGG-A, KFAFIX-A) from Krungsri
- Must have registration date (`regis_date` !== '-')
- Must be selling funds (`regis_date` <= today)
- Must not be cancelled (`cancel_date` < today)

## Use in Portfolio Performance

I haven't set up proper path. To temporary use this:

- Go to configuration for the *Historical Quotes* and *Latest Quotes*
- For *Provider*, select *JSON*
- Feed URL: `https://thammarith.dev/thai-fund-performance/data/navs/YOUR_FUND_NAME.json`
  - See fund names in [./data/navs/](./data/navs/), you can use the JSON file name to replace `YOUR_FUND_NAME.json`
  - Do include `.json` at the end
  - E.g., [`https://thammarith.dev/thai-fund-performance/data/navs/SCBDPLUSA.json`](https://thammarith.dev/thai-fund-performance/data/navs/SCBDPLUSA.json)
- Path to date: `$.data.navs[*].nav_date`
- Date format: *leave blank; it's using the sensible ISO-8601*
- Path to close: `$.data.navs[*].last_val`
- For the rest, leave blank
