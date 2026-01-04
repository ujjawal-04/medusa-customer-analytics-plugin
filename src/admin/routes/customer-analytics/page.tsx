import { defineRouteConfig } from "@medusajs/admin-sdk"
import { 
  Container, 
  Heading, 
  Text, 
  Table,
  Badge,
  Button,
  Input,
  Select,
  clx
} from "@medusajs/ui"
import { ChartBar, Users, CurrencyDollar, ShoppingCart, ArrowPath } from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"

type CustomerAnalyticsItem = {
  customer_id: string
  email: string
  first_name: string | null
  last_name: string | null
  created_at: string
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

type Summary = {
  total_customers: number
  total_revenue: number
  total_orders: number
  average_customer_value: number
  customers_with_orders: number
}

type AnalyticsResponse = {
  customer_analytics: CustomerAnalyticsItem[]
  summary: Summary
  count: number
  offset: number
  limit: number
}

const SORT_OPTIONS = [
  { value: "total_spent", label: "Total Spent" },
  { value: "orders_count", label: "Orders Count" },
  { value: "average_order_value", label: "Avg Order Value" },
  { value: "last_order_at", label: "Last Order Date" },
]

const CustomerAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<CustomerAnalyticsItem[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [limit] = useState(20)
  const [sortBy, setSortBy] = useState("total_spent")
  const [sortOrder, setSortOrder] = useState("desc")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/admin/customer-analytics?offset=${offset}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`,
        { credentials: "include" }
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }
      
      const data: AnalyticsResponse = await response.json()
      setAnalytics(data.customer_analytics || [])
      setSummary(data.summary || null)
      setCount(data.count || 0)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setAnalytics([])
      setSummary(null)
      setCount(0)
    } finally {
      setLoading(false)
    }
  }, [offset, limit, sortBy, sortOrder])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getCustomerName = (item: CustomerAnalyticsItem) => {
    if (item.first_name || item.last_name) {
      return `${item.first_name || ""} ${item.last_name || ""}`.trim()
    }
    return item.email
  }

  const getCustomerSegment = (metrics: CustomerAnalyticsItem["metrics"]) => {
    if (metrics.orders_count === 0) {
      return { label: "New", color: "blue" as const }
    }
    if (metrics.lifetime_value > 50000) { // > $500
      return { label: "VIP", color: "purple" as const }
    }
    if (metrics.orders_count >= 5) {
      return { label: "Loyal", color: "green" as const }
    }
    if (metrics.days_since_last_order && metrics.days_since_last_order > 90) {
      return { label: "At Risk", color: "orange" as const }
    }
    return { label: "Active", color: "green" as const }
  }

  const filteredAnalytics = analytics.filter((item) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.email?.toLowerCase().includes(query) ||
      item.first_name?.toLowerCase().includes(query) ||
      item.last_name?.toLowerCase().includes(query)
    )
  })

  const totalPages = Math.ceil(count / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <Container className="p-0">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-ui-border-base">
        <div>
          <Heading level="h1" className="text-2xl font-bold">Customer Analytics</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Track customer behavior, lifetime value, and purchase patterns
          </Text>
        </div>
        <Button variant="secondary" onClick={fetchAnalytics} disabled={loading}>
          <ArrowPath className={clx("mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-ui-bg-subtle">
          <div className="bg-ui-bg-base rounded-lg p-4 shadow-sm border border-ui-border-base">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ui-bg-subtle rounded-lg">
                <Users className="text-ui-fg-subtle" />
              </div>
              <div>
                <Text className="text-sm text-ui-fg-subtle">Total Customers</Text>
                <Text className="text-2xl font-bold">{summary.total_customers}</Text>
              </div>
            </div>
          </div>

          <div className="bg-ui-bg-base rounded-lg p-4 shadow-sm border border-ui-border-base">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ui-bg-subtle rounded-lg">
                <CurrencyDollar className="text-ui-fg-subtle" />
              </div>
              <div>
                <Text className="text-sm text-ui-fg-subtle">Total Revenue</Text>
                <Text className="text-2xl font-bold text-ui-fg-interactive">
                  {formatCurrency(summary.total_revenue)}
                </Text>
              </div>
            </div>
          </div>

          <div className="bg-ui-bg-base rounded-lg p-4 shadow-sm border border-ui-border-base">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ui-bg-subtle rounded-lg">
                <ShoppingCart className="text-ui-fg-subtle" />
              </div>
              <div>
                <Text className="text-sm text-ui-fg-subtle">Total Orders</Text>
                <Text className="text-2xl font-bold">{summary.total_orders}</Text>
              </div>
            </div>
          </div>

          <div className="bg-ui-bg-base rounded-lg p-4 shadow-sm border border-ui-border-base">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ui-bg-subtle rounded-lg">
                <ChartBar className="text-ui-fg-subtle" />
              </div>
              <div>
                <Text className="text-sm text-ui-fg-subtle">Avg Customer Value</Text>
                <Text className="text-2xl font-bold">
                  {formatCurrency(summary.average_customer_value)}
                </Text>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-6 border-b border-ui-border-base">
        <div className="flex-1 min-w-[200px] max-w-[300px]">
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Text className="text-sm text-ui-fg-subtle">Sort by:</Text>
          <Select value={sortBy} onValueChange={setSortBy}>
            <Select.Trigger className="w-[180px]">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {SORT_OPTIONS.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-ui-fg-subtle">Loading analytics...</Text>
          </div>
        ) : filteredAnalytics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="text-ui-fg-subtle mb-4" />
            <Text className="text-ui-fg-subtle">No customers found</Text>
          </div>
        ) : (
          <>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Customer</Table.HeaderCell>
                  <Table.HeaderCell>Segment</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Orders</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Total Spent</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Avg Order</Table.HeaderCell>
                  <Table.HeaderCell>Last Order</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredAnalytics.map((item) => {
                  const segment = getCustomerSegment(item.metrics)
                  return (
                    <Table.Row 
                      key={item.customer_id}
                      className="cursor-pointer hover:bg-ui-bg-subtle"
                      onClick={() => window.location.href = `/app/customers/${item.customer_id}`}
                    >
                      <Table.Cell>
                        <div>
                          <Text className="font-medium">{getCustomerName(item)}</Text>
                          <Text className="text-sm text-ui-fg-subtle">{item.email}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={segment.color}>{segment.label}</Badge>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <Text className="font-medium">{item.metrics.orders_count}</Text>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <Text className="font-medium text-ui-fg-interactive">
                          {formatCurrency(item.metrics.total_spent)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <Text>{formatCurrency(item.metrics.average_order_value)}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <div>
                          <Text>{formatDate(item.metrics.last_order_at)}</Text>
                          {item.metrics.days_since_last_order !== null && (
                            <Text className="text-sm text-ui-fg-subtle">
                              {item.metrics.days_since_last_order} days ago
                            </Text>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-ui-border-base">
                <Text className="text-sm text-ui-fg-subtle">
                  Showing {offset + 1} - {Math.min(offset + limit, count)} of {count} customers
                </Text>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                  >
                    Previous
                  </Button>
                  <Text className="text-sm px-2">
                    Page {currentPage} of {totalPages}
                  </Text>
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={currentPage === totalPages}
                    onClick={() => setOffset(offset + limit)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Customer Analytics",
  icon: ChartBar,
})

export default CustomerAnalyticsPage
