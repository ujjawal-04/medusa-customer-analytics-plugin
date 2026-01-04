import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"

type CustomerAnalytics = {
  customer_id: string
  metrics: {
    orders_count: number
    total_spent: number
    average_order_value: number
    last_order_at: string | null
    first_order_at: string | null
    days_since_last_order: number | null
    lifetime_value: number
  }
}

type CustomerDetailsWidgetProps = {
  data: {
    id: string
    email: string
    first_name?: string
    last_name?: string
  }
}

const CustomerAnalyticsWidget = ({ data }: CustomerDetailsWidgetProps) => {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!data?.id) return
      
      setIsLoading(true)
      try {
        const response = await fetch(`/admin/customers/${data.id}/analytics`, {
          credentials: "include",
        })
        if (response.ok) {
          const result = await response.json()
          setAnalytics(result)
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [data?.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  return (
    <Container className="p-6">
      <Heading level="h2" className="mb-4">Customer Analytics</Heading>
      
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Text className="text-ui-fg-subtle">Loading analytics...</Text>
        </div>
      )}
      
      {!isLoading && analytics && analytics.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-ui-bg-subtle rounded-lg p-4">
            <Text className="text-sm text-ui-fg-subtle mb-1">Total Orders</Text>
            <Text className="text-2xl font-bold">{analytics.metrics.orders_count}</Text>
          </div>

          <div className="bg-ui-bg-subtle rounded-lg p-4">
            <Text className="text-sm text-ui-fg-subtle mb-1">Lifetime Value</Text>
            <Text className="text-2xl font-bold text-ui-fg-interactive">
              {formatCurrency(analytics.metrics.lifetime_value)}
            </Text>
          </div>

          <div className="bg-ui-bg-subtle rounded-lg p-4">
            <Text className="text-sm text-ui-fg-subtle mb-1">Average Order Value</Text>
            <Text className="text-2xl font-bold">
              {formatCurrency(analytics.metrics.average_order_value)}
            </Text>
          </div>

          <div className="bg-ui-bg-subtle rounded-lg p-4">
            <Text className="text-sm text-ui-fg-subtle mb-1">Total Spent</Text>
            <Text className="text-2xl font-bold">
              {formatCurrency(analytics.metrics.total_spent)}
            </Text>
          </div>

          <div className="bg-ui-bg-subtle rounded-lg p-4">
            <Text className="text-sm text-ui-fg-subtle mb-1">First Order</Text>
            <Text className="text-lg font-semibold">
              {formatDate(analytics.metrics.first_order_at)}
            </Text>
          </div>

          <div className="bg-ui-bg-subtle rounded-lg p-4">
            <Text className="text-sm text-ui-fg-subtle mb-1">Last Order</Text>
            <Text className="text-lg font-semibold">
              {formatDate(analytics.metrics.last_order_at)}
            </Text>
            {analytics.metrics.days_since_last_order !== null && (
              <Badge className="mt-2">
                {analytics.metrics.days_since_last_order} days ago
              </Badge>
            )}
          </div>
        </div>
      )}

      {!isLoading && (!analytics || !analytics.metrics || analytics.metrics.orders_count === 0) && (
        <div className="flex items-center justify-center py-8">
          <Text className="text-ui-fg-subtle">No orders found for this customer</Text>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.after",
})

export default CustomerAnalyticsWidget
