import { Module } from "@medusajs/framework/utils"
import CustomerAnalyticsService from "./service"

export const CUSTOMER_ANALYTICS_MODULE = "customerAnalytics"

export default Module(CUSTOMER_ANALYTICS_MODULE, {
  service: CustomerAnalyticsService,
})
