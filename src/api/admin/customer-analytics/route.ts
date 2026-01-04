import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    // Get customer module to fetch all customers
    const customerModuleService: any = req.scope.resolve("customer")
    const orderModuleService: any = req.scope.resolve("order")

    // Parse query params
    const limit = parseInt(req.query.limit as string) || 20
    const offset = parseInt(req.query.offset as string) || 0
    const sortBy = (req.query.sort_by as string) || "total_spent"
    const sortOrder = (req.query.sort_order as string) || "desc"

    // Fetch customers
    let customers: any[] = []
    let totalCount = 0
    try {
      const [customerList, count] = await customerModuleService.listAndCountCustomers(
        {},
        { skip: offset, take: limit }
      )
      customers = customerList
      totalCount = count
    } catch (e) {
      console.log("Could not fetch customers:", e)
    }

    // Compute analytics for each customer
    const customerAnalytics = await Promise.all(
      customers.map(async (customer: any) => {
        let orders: any[] = []
        try {
          orders = await orderModuleService.listOrders({
            customer_id: customer.id,
          })
        } catch (e) {
          // Continue with empty orders
        }

        const ordersCount = orders.length
        const totalSpent = orders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0)
        const averageOrderValue = ordersCount > 0 ? totalSpent / ordersCount : 0

        const sortedOrders = orders.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        const lastOrderAt = sortedOrders[0]?.created_at || null
        const firstOrderAt = sortedOrders[sortedOrders.length - 1]?.created_at || null

        const daysSinceLastOrder = lastOrderAt 
          ? Math.floor((Date.now() - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24))
          : null

        return {
          customer_id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          created_at: customer.created_at,
          metrics: {
            orders_count: ordersCount,
            total_spent: totalSpent,
            average_order_value: averageOrderValue,
            last_order_at: lastOrderAt,
            first_order_at: firstOrderAt,
            days_since_last_order: daysSinceLastOrder,
            lifetime_value: totalSpent,
          }
        }
      })
    )

    // Sort results
    const sortedAnalytics = customerAnalytics.sort((a, b) => {
      let valueA: any, valueB: any
      
      switch (sortBy) {
        case "total_spent":
          valueA = a.metrics.total_spent
          valueB = b.metrics.total_spent
          break
        case "orders_count":
          valueA = a.metrics.orders_count
          valueB = b.metrics.orders_count
          break
        case "average_order_value":
          valueA = a.metrics.average_order_value
          valueB = b.metrics.average_order_value
          break
        case "last_order_at":
          valueA = a.metrics.last_order_at ? new Date(a.metrics.last_order_at).getTime() : 0
          valueB = b.metrics.last_order_at ? new Date(b.metrics.last_order_at).getTime() : 0
          break
        default:
          valueA = a.metrics.total_spent
          valueB = b.metrics.total_spent
      }

      if (sortOrder === "asc") {
        return valueA - valueB
      }
      return valueB - valueA
    })

    // Calculate summary stats
    const summary = {
      total_customers: totalCount,
      total_revenue: customerAnalytics.reduce((sum, c) => sum + c.metrics.total_spent, 0),
      total_orders: customerAnalytics.reduce((sum, c) => sum + c.metrics.orders_count, 0),
      average_customer_value: customerAnalytics.length > 0 
        ? customerAnalytics.reduce((sum, c) => sum + c.metrics.lifetime_value, 0) / customerAnalytics.length 
        : 0,
      customers_with_orders: customerAnalytics.filter(c => c.metrics.orders_count > 0).length,
    }

    res.json({
      customer_analytics: sortedAnalytics,
      summary,
      count: totalCount,
      offset,
      limit,
    })
  } catch (error: any) {
    console.error("Error fetching customer analytics:", error)
    res.status(500).json({
      error: "Failed to fetch customer analytics",
      message: error.message
    })
  }
}
