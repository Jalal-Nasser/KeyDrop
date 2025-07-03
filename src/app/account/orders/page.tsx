"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/context/session-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import Link from "next/link"

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  products: { // This will be joined from the products table
    name: string;
  };
}

export default function OrdersPage() {
  const { session, supabase } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.id) {
        setLoading(false)
        setError("User not authenticated.")
        return
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            total,
            status,
            order_items (
              id,
              product_id,
              quantity,
              price_at_purchase,
              products (
                name
              )
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        setOrders(data as Order[])
      } catch (err: any) {
        console.error("Error fetching orders:", err)
        setError(err.message || "Failed to fetch orders.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [session, supabase])

  if (!session) {
    return (
      <div className="flex justify-center items-center py-12 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must be signed in to view your orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please sign in to access your order history.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>
            View your past orders and their details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading orders...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && orders.length === 0 && (
            <p>You haven't placed any orders yet.</p>
          )}
          {!loading && !error && orders.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link href={`/account/orders/${order.id}`} className="text-blue-600 hover:underline">
                        {order.id.substring(0, 8)}...
                      </Link>
                    </TableCell>
                    <TableCell>{format(new Date(order.created_at), 'PPP')}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      {order.order_items.map((item, index) => (
                        <div key={item.id}>
                          {item.quantity} x {item.products?.name || `Product ${item.product_id}`}
                          {index < order.order_items.length - 1 ? ',' : ''}
                        </div>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}