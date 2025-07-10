import { createSupabaseServerClient } from "@/lib/supabaseServer"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const revalidate = 0 // Disable cache to always get fresh data

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  }[] | null;
  order_items: {
    product_id: number;
    quantity: number;
    products: { name: string }[] | null;
  }[];
}

export default async function AdminOrdersPage() {
  const supabase = createSupabaseServerClient()

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      total,
      status,
      profiles (first_name, last_name),
      order_items (product_id, quantity, products (name))
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching all orders for admin:", error)
    return (
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">All Orders</h1>
        <p className="text-red-500">Error loading orders: {error.message}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">All Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {order.profiles?.[0]?.first_name || ""} {order.profiles?.[0]?.last_name || ""}
                      </TableCell>
                      <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'completed' ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.order_items.map((item, index) => (
                          <div key={item.product_id}>
                            {item.quantity} x {item.products?.[0]?.name || `Product ${item.product_id}`}
                            {index < order.order_items.length - 1 ? ',' : ''}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/account/orders/${order.id}/invoice`}>View Invoice</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No orders found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}