import { createSupabaseServerClientComponent } from "@/lib/supabase/server" // Updated import
import { redirect } from "next/navigation"
import Link from "next/link"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Database, Tables, Json } from "@/types/supabase" // Import Json

type OrderItem = Tables<'order_items'>

type Order = {
  id: string;
  user_id: string; // user_id is not null in DB
  status: string; // Changed from payment_status to status
  total: number;
  created_at: string;
  email: string | null; // Email is now in profiles, but might be needed here for display
  amounts: Json | null; // Added amounts
  promo_code: string | null; // Added promo_code
  promo_snapshot: Json | null; // Added promo_snapshot
  payment_gateway: string | null; // Added payment_gateway
  payment_id: string | null; // Added payment_id
  order_items: OrderItem[];
}

export default async function AccountOrdersPage() {
  const supabase = await createSupabaseServerClientComponent() // Await the client
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      status,
      total,
      created_at,
      amounts,
      promo_code,
      promo_snapshot,
      payment_gateway,
      payment_id,
      profiles (email),
      order_items!inner(
        id,
        order_id,
        product_id,
        quantity,
        price_at_purchase,
        product_name,
        line_total,
        product_key,
        sku,
        unit_price
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const orders: Order[] = (data || []).map(order => ({
    ...order,
    email: order.profiles?.email || null, // Extract email from profiles
    // Ensure all fields match the Order type
    user_id: order.user_id || '', // Ensure user_id is string
    status: order.status || 'unknown', // Ensure status is string
    total: order.total || 0, // Ensure total is number
    created_at: order.created_at || new Date().toISOString(), // Ensure created_at is string
    order_items: order.order_items || [], // Ensure order_items is array
  }));

  if (error) {
    return <div>Error loading orders.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
        <CardDescription>View your past orders and their status.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                  <TableCell>{format(new Date(order.created_at), "PPP")}</TableCell>
                  <TableCell>
                    {order.order_items.map((item, index) => (
                      <span key={index}>
                        {item.quantity} x {item.product_name || `Product ${item.product_id}`}
                        {index < (order.order_items.length - 1) ? ', ' : ''}
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === 'completed' ? 'default' : 
                      order.status === 'pending' ? 'secondary' :
                      order.status === 'cancelled' ? 'destructive' : 'secondary'
                    }>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/account/orders/${order.id}/invoice`}>View Invoice</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">You have no orders.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}