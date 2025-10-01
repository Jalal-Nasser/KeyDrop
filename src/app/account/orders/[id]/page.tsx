import { createServerClient } from "@/lib/supabase/server" // Updated import
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Json, Tables } from "@/types/supabase" // Import Json and Tables

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string; // Changed from payment_status
  payment_id: string | null; // Changed from payment_intent_id
  amounts: Json | null; // Added amounts
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  order_items: Array<{
    id: string;
    product_id: number;
    quantity: number;
    price_at_purchase: number;
    product_name: string;
    sku: string | null;
    line_total: number | null;
  }>;
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient() // Await the client

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, created_at, total, status, payment_id, amounts,
      order_items (id, product_id, quantity, price_at_purchase, product_name, sku, line_total),
      profiles (first_name, last_name, email)
    `)
    .eq('id', params.id)
    .single() as { data: Order | null, error: any }; // Explicitly type order

  if (error || !order) {
    console.error("Error fetching order details:", error);
    notFound();
  }

  const profile = order.profiles;
  const amounts = (order.amounts || { subtotal: 0, discount: 0, tax: 0, total: 0 }) as { subtotal: number, discount: number, tax: number, total: number, currency?: string };

  return (
    <div className="container mx-auto p-4 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Order Details #{order.id.substring(0, 8)}...</CardTitle>
          <CardDescription>Information about your order placed on {format(new Date(order.created_at), 'PPP')}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Date:</strong> {format(new Date(order.created_at), 'PPP p')}</p>
              <p><strong>Status:</strong> <span className="font-medium capitalize">{order.status}</span></p>
              {order.payment_id && <p><strong>Payment ID:</strong> {order.payment_id}</p>}
            </div>
            {profile && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
                <p>{profile.first_name} {profile.last_name}</p>
                {profile.email && <p>{profile.email}</p>}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Items Ordered</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(order.order_items) && order.order_items.map((item: any) => {
                  const price = typeof item.price_at_purchase === 'number' ? item.price_at_purchase : 0;
                  const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                  const lineTotal = typeof item.line_total === 'number' ? item.line_total : price * quantity;
                  const productName = item.product_name || `Product ${item.product_id || ''}`;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{productName}</TableCell>
                      <TableCell className="text-right">{quantity}</TableCell>
                      <TableCell className="text-right">${price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${lineTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4 text-lg font-semibold">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${amounts.subtotal.toFixed(2)}</span>
                </div>
                {amounts.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${amounts.discount.toFixed(2)}</span>
                  </div>
                )}
                {amounts.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${amounts.tax.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>${amounts.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button asChild variant="outline">
              <Link href={`/account/orders/${order.id}/invoice`}>View Invoice</Link>
            </Button>
            <Button asChild>
              <Link href="/account/orders">Back to Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}