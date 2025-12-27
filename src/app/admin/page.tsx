import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { createSupabaseServerClientComponent } from "@/lib/supabase/server" // Updated import
import { DollarSign, Package, ShoppingCart, Users, Tag, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react" // Import Tag icon
import { format, subDays } from "date-fns"
import { IncomeChart } from "@/components/admin/income-chart" // Import the new component
import { Tables } from "@/types/supabase" // Import Tables type
import { Badge } from "@/components/ui/badge"

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClientComponent() // Await the client

  // Fetch product count
  const { count: productCount, error: productCountError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })

  // Fetch order statistics
  const { data: orderStats, error: orderStatsError } = await supabase
    .from("orders")
    .select("total, status, created_at", { count: "exact" }) as { data: Pick<Tables<'orders'>, 'total' | 'status' | 'created_at'>[] | null, error: any }; // Explicitly type orderStats

  const totalRevenue = orderStats?.reduce((sum, order) => sum + order.total, 0) || 0 // Removed parseFloat
  const orderCount = orderStats?.length || 0

  // Calculate pending orders
  const pendingOrderCount = orderStats?.filter(order => order.status === 'pending').length || 0

  // Calculate completed orders
  const completedOrderCount = orderStats?.filter(order => order.status === 'completed').length || 0

  // Calculate new customers (profiles created in last 30 days)
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
  const { count: newCustomerCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo)

  // Calculate revenue from last 30 days
  const recentRevenue = orderStats?.filter(order =>
    new Date(order.created_at) >= subDays(new Date(), 30)
  ).reduce((sum, order) => sum + order.total, 0) || 0

  // Fetch recent orders
  const { data: recentOrders, error: recentOrdersError } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      total,
      status,
      profiles (first_name, last_name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening with your store.</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Clock className="h-3 w-3 mr-1" />
          Last updated: {format(new Date(), 'MMM dd, HH:mm')}
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              from {orderCount} total orders
            </p>
            <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              ${recentRevenue.toFixed(2)} last 30 days
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              available in your store
            </p>
            <Link href="/admin/products" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
              Manage products →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Customers
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newCustomerCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              joined in last 30 days
            </p>
            <Link href="/admin/clients" className="text-xs text-purple-600 hover:underline mt-2 inline-block">
              View all clients →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrderCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              awaiting processing
            </p>
            {pendingOrderCount > 0 && (
              <div className="flex items-center mt-2 text-xs text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-3 w-3 mr-1" />
                Action required
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrderCount}</div>
            <p className="text-xs text-muted-foreground">
              {orderCount > 0 ? `${((completedOrderCount / orderCount) * 100).toFixed(1)}%` : '0%'} completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${orderCount > 0 ? (totalRevenue / orderCount).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">per order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
            <p className="text-xs text-muted-foreground">all time</p>
          </CardContent>
        </Card>
      </div>

      {/* Income Chart */}
      <div className="mb-8">
        <IncomeChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription className="mt-1">Latest 5 orders from your store</CardDescription>
              </div>
              <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-start p-3 rounded-lg hover:bg-muted/50 transition-colors border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Order #{order.id.substring(0, 8)}...</p>
                        <Badge variant={
                          order.status === 'completed' ? 'default' :
                          order.status === 'pending' ? 'secondary' :
                          'destructive'
                        } className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.profiles?.first_name} {order.profiles?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-lg">${parseFloat(order.total).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No recent orders.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="border-b">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription className="mt-1">Manage your store content and settings</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-3">
              <Link href="/admin/products" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Manage Products</p>
                  <p className="text-xs text-muted-foreground">Add, edit or remove products</p>
                </div>
              </Link>

              <Link href="/admin/orders" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Manage Orders</p>
                  <p className="text-xs text-muted-foreground">Process and fulfill orders</p>
                </div>
              </Link>

              <Link href="/admin/coupons" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Manage Coupons</p>
                  <p className="text-xs text-muted-foreground">Create and manage discount codes</p>
                </div>
              </Link>

              <Link href="/admin/clients" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                  <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">View Clients</p>
                  <p className="text-xs text-muted-foreground">Manage customer accounts</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}