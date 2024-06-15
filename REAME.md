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
