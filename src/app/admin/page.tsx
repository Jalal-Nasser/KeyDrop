import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { DollarSign, Package, ShoppingCart, Users, Tag, Megaphone, Settings } from "lucide-react"
import { format } from "date-fns"
import { IncomeChart } from "@/components/admin/income-chart"

export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient()

  // Fetch product count
  const { count: productCount, error: productCountError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })

  // Fetch order statistics
  const { data: orderStats, error: orderStatsError } = await supabase
    .from("orders")
    .select("total", { count: "exact" })

  const totalRevenue = orderStats?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0
  const orderCount = orderStats?.length || 0

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
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              from {orderCount} orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              available in your store
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+0</div>
            <p className="text-xs text-muted-foreground">
              coming soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income Chart */}
      <div className="mb-8">
        <IncomeChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">Order #{order.id.substring(0, 8)}...</p>
                      <p className="text-sm text-muted-foreground">
                        {order.profiles?.first_name} {order.profiles?.last_name} - {format(new Date(order.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${parseFloat(order.total).toFixed(2)}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent orders.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li><Link href="/admin/products" className="text-blue-600 hover:underline text-lg flex items-center gap-2"><Package className="h-5 w-5" /> Manage Products</Link></li>
              <li><Link href="/admin/coupons" className="text-blue-600 hover:underline text-lg flex items-center gap-2"><Tag className="h-5 w-5" /> Manage Coupons</Link></li>
              <li><Link href="/admin/store-notice" className="text-blue-600 hover:underline text-lg flex items-center gap-2"><Megaphone className="h-5 w-5" /> Manage Store Notice</Link></li>
              <li><Link href="/admin/settings" className="text-blue-600 hover:underline text-lg flex items-center gap-2"><Settings className="h-5 w-5" /> Manage Site Settings</Link></li>
              <li><Link href="/admin/contact-submissions" className="text-blue-600 hover:underline text-lg">View Contact Submissions</Link></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}