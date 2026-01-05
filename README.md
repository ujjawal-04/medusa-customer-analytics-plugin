<p align="center">
  <a href="https://www.medusajs.com">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
  </a>
</p>
<h1 align="center">
  Medusa Customer-Analytics Plugin
</h1>

<p align="center">
  View Customer Analytics into your store's right from the Medusa Admin dashboard.
</p>

## Overview

A comprehensive customer analytics plugin for Medusa v2 that provides real-time insights into customer behavior and purchasing patterns.


## Features

- **Real-time Analytics**: Fetches and calculates metrics from actual order data
- **Comprehensive Metrics**:
  - Total Orders Count
  - Lifetime Value
  - Average Order Value
  - Total Spent
  - First Order Date
  - Last Order Date
  - Days Since Last Order
- **Admin Dashboard Widget**: Beautiful, responsive widget displayed on customer detail pages
- **Automatic Tracking**: Automatically records and updates metrics when orders are placed

## Installation

```bash
npm install customer-analytics-plugin
# or
yarn add customer-analytics-plugin
```

## Configuration

Add the plugin to your `medusa-config.ts`:

```typescript
  
  plugins: [
    {
      resolve: "customer-analytics-plugin",
      options: {},
    }
  ],
```

## Usage

Once installed and configured, the plugin will:

1. Automatically display a "Customer Analytics" widget on each customer's detail page in the Medusa admin
2. Fetch real order data and calculate comprehensive metrics
3. Display metrics in a beautiful, easy-to-read dashboard


## Development

To develop locally:

```bash
# Build the plugin
yarn build

# Publish with yalc for local testing
yalc publish

# In your Medusa project
yalc add customer-analytics-plugin
yarn install
```
## Contributing

I welcome contributions and feedback.
To get involved, [open an issue](https://github.com/ujjawal-04/medusa-customer-analytics-plugin/issues) or [submit a pull request](https://github.com/ujjawal-04/medusa-customer-analytics-plugin/pulls) on [GitHub →](https://github.com/ujjawal-04/medusa-customer-analytics-plugin)