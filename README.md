# POS Malaysia Shipping Rate Calculator

## Overview
Tests the POS Malaysia shipping calculator from Malaysia to India with 1kg package.

## Setup
```cmd
npm install @playwright/test
npx playwright install
```

## Run the test
```cmd
npx playwright test
```

## Run with browser visible
```cmd
npx playwright test --headed
```

Question 1:

a.  API that lists all the countries available in the "To" dropdown
    https://www-api.pos.com.my/api/countries

b.  API that responds to the postcode number entered by user and creates the request
    https://www-api.pos.com.my/api/getStateByPostcode

c.  API that calculates the shipping rate
    https://www-api.pos.com.my/api/price

