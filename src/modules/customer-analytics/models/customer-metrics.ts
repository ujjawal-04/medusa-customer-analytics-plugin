import { model } from "@medusajs/framework/utils"

export const CustomerMetrics = model.define("customer_metrics", {
  id: model.id().primaryKey(),
  customer_id: model.text().unique(),
  orders_count: model.number().default(0),
  total_spent: model.bigNumber().default(0),
  average_order_value: model.bigNumber().default(0),
  lifetime_value: model.bigNumber().default(0),
  first_order_at: model.dateTime().nullable(),
  last_order_at: model.dateTime().nullable(),
  days_since_last_order: model.number().nullable(),
})
