import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { notFound, redirect } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"

interface Order {
  id: string
  created_at: string
  status: string
  total: number
  // Add other order fields as needed
}

export default async function ClientOrdersPage({
  params,
}: {
  params: { id: string }
}) {
  const clientId = params.id
  const supabase = createSupabaseServerClient()
  
  // Verify admin status
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (!profile?.is_admin) {
    redirect("/account")
  }

  // Fetch client details with error handling
  const { data: client, error: clientError } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', clientId)
    .single()

  if (clientError || !client) {
    console.error('Error fetching client:', clientError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Client Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested client could not be found.</p>
        <Button asChild>
          <Link href="/admin/clients">
            Back to Clients
          </Link>
        </Button>
      </div>
    )
  }

  // Fetch client's orders with error handling
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', clientId)
    .order('created_at', { ascending: false })
    
  if (ordersError) {
    console.error('Error fetching orders:', ordersError)
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {client.first_name} {client.last_name}'s Orders
            </h1>
            <p className="text-muted-foreground">
              {client.email}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/clients">
              Back to Clients
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Orders</CardTitle>
            <CardDescription>
              There was an error loading the order history. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {client.first_name} {client.last_name}'s Orders
          </h1>
          <p className="text-muted-foreground">
            {client.email}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/clients">
            Back to Clients
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View and manage {client.first_name}'s order history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      ${(order.total / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/orders/${order.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No orders found for this client.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
