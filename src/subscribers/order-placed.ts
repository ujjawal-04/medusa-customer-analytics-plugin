import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

export default async function orderPlacedHandler({
  event,
  container
}: SubscriberArgs<{ id: string }>) {
  try {
    const orderService = container.resolve("order") as any
    const analyticsService = container.resolve("customerAnalytics") as any

    const order = await orderService.retrieveOrder(event.data.id)

    if (!order?.customer_id) return

    await analyticsService.recordOrder(
      order.customer_id,
      Number(order.total || 0) / 100
    )
  } catch (error) {
    console.error("Error recording order analytics:", error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed"
}
