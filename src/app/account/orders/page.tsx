import { createSupabaseServerClient } from "@/lib/supabaseServer"
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
import { Database } from "@/types/supabase"

type OrderItem = Database['public']['Tables']['order_items']['Row']

type Order = {
  id: string;
  user_id: string | null;
  payment_status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
  email: string;
  subtotal: number;
  tax: number;
  payment_intent_id: string | null;
}

export default async function AccountOrdersPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      payment_status,
      total,
      created_at,
      email,
      subtotal,
      tax,
      payment_intent_id,
      order_items!inner(
        id,
        order_id,
        product_id,
        quantity,
        price,
        product_name,
        line_total,
        created_at
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const orders: Order[] = data || []

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
                      order.payment_status === 'paid' ? 'default' : 
                      order.payment_status === 'pending' ? 'secondary' :
                      order.payment_status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {order.payment_status}
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