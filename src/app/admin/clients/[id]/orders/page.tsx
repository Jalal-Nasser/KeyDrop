import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { redirect, notFound } from "next/navigation"
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
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type ClientOrder = {
    id: string;
    created_at: string;
    status: string;
    total: number;
    order_items: {
        quantity: number;
        products: {
            name: string;
        } | null;
    }[];
}

export default async function ClientOrdersPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  // 1. Admin Check
  if (!session) {
    return redirect("/login")
  }
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (!adminProfile?.is_admin) {
    redirect("/account")
  }

  const clientId = params.id

  // 2. Fetch Client Info
  const { data: client, error: clientError } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', clientId)
    .single()

  if (clientError || !client) {
    notFound() // If client doesn't exist, show 404
  }

  // 3. Fetch Client's Orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      total,
      order_items (
        quantity,
        products (name)
      )
    `)
    .eq('user_id', clientId)
    .order('created_at', { ascending: false })

  if (ordersError) {
    console.error("Error fetching client orders:", ordersError)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Orders</CardTitle>
          <CardDescription>
            There was an error loading orders for this client.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Orders for {client.first_name} {client.last_name}</CardTitle>
            <CardDescription>A complete history of all orders placed by this client.</CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Link>
          </Button>
        </div>
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
              (orders as ClientOrder[]).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                  <TableCell>{format(new Date(order.created_at), "PPP")}</TableCell>
                  <TableCell>
                    {order.order_items.map((item, index) => (
                      <span key={index}>
                        {item.quantity} x {item.products?.name || 'Unknown Product'}
                        {index < (order.order_items.length - 1) ? ', ' : ''}
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
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
                <TableCell colSpan={6} className="text-center">This client has no orders.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}