import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CustomerAnalyticsService from "../../../../../modules/customer-analytics/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { customer_id } = req.params
  
  try {
    const analyticsService = req.scope.resolve(
      "customerAnalytics"
    ) as CustomerAnalyticsService

    // Get order module to fetch real orders
    const orderModuleService: any = req.scope.resolve("order")
    
    // Fetch customer orders
    let orders: any[] = []
    try {
      orders = await orderModuleService.listOrders({
        customer_id: customer_id,
      })
    } catch (e) {
      // If order module fails, continue with empty orders
      console.log("Could not fetch orders:", e)
    }

    // Calculate metrics from real orders
    const metrics = await analyticsService.calculateMetricsFromOrders(
      customer_id,
      orders
    )

    res.json({
      customer_id,
      metrics: metrics ?? {
        orders_count: 0,
        total_spent: 0,
        average_order_value: 0,
        last_order_at: null,
        first_order_at: null,
        days_since_last_order: null,
        lifetime_value: 0,
      }
    })
  } catch (error: any) {
    console.error("Error fetching customer analytics:", error)
    res.status(500).json({
      error: "Failed to fetch customer analytics",
      message: error.message
    })
  }
}
