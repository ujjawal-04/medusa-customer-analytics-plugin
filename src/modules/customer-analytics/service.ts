import { MedusaService } from "@medusajs/framework/utils"
import { CustomerMetrics } from "./models/customer-metrics"

export default class CustomerAnalyticsService extends MedusaService({
  CustomerMetrics,
}) {
  async calculateMetricsFromOrders(customerId: string, orders: any[]) {
    if (!orders || orders.length === 0) {
      return {
        orders_count: 0,
        total_spent: 0,
        average_order_value: 0,
        last_order_at: null,
        first_order_at: null,
        days_since_last_order: null,
        lifetime_value: 0,
      }
    }

    const ordersCount = orders.length
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
    const averageOrderValue = totalSpent / ordersCount

    // Sort orders by date
    const sortedOrders = orders.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const lastOrderAt = sortedOrders[0]?.created_at
    const firstOrderAt = sortedOrders[sortedOrders.length - 1]?.created_at

    const daysSinceLastOrder = lastOrderAt 
      ? Math.floor((Date.now() - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24))
      : null

    return {
      orders_count: ordersCount,
      total_spent: totalSpent,
      average_order_value: averageOrderValue,
      last_order_at: lastOrderAt,
      first_order_at: firstOrderAt,
      days_since_last_order: daysSinceLastOrder,
      lifetime_value: totalSpent,
    }
  }
  
  async recordOrder(customerId: string, orderTotal: number) {
    let metrics = await this.retrieveCustomerMetrics(customerId)

    if (!metrics) {
      metrics = await this.createCustomerMetrics({
        customer_id: customerId,
        orders_count: 1,
        total_spent: orderTotal,
        average_order_value: orderTotal,
        last_order_at: new Date()
      })
    } else {
      const orders = metrics.orders_count + 1
      const total = Number(metrics.total_spent) + orderTotal

      await this.updateCustomerMetrics({
        id: metrics.id,
        orders_count: orders,
        total_spent: total,
        average_order_value: total / orders,
        last_order_at: new Date()
      })
    }
  }
}
