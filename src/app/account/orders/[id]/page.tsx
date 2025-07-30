import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  payment_gateway: string | null;
  payment_id: string | null;
  order_items: OrderItem[];
  profiles: {
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    vat_number: string | null;
    address_line_1: string | null;
    address_line_2: string | null;
    city: string | null;
    state_province_region: string | null;
    postal_code: string | null;
    country: string | null;
  }[] | null;
}

interface OrderItem {
  id: string;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  products: {
    name: string;
  }[] | null; // Changed to array of objects
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, created_at, total, status, payment_gateway, payment_id,
      order_items (id, product_id, quantity, price_at_purchase, products (name)),
      profiles (first_name, last_name, company_name, vat_number, address_line_1, address_line_2, city, state_province_region, postal_code, country)
    `)
    .eq('id', params.id)
    .single()

  if (error || !order) {
    console.error("Error fetching order details:", error)
    return notFound()
  }

  const processingFee = order.total * 0.15;
  const finalTotal = order.total + processingFee;

  const profile = order.profiles?.[0];

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
              <p><strong>Payment Gateway:</strong> {order.payment_gateway || 'N/A'}</p>
              {order.payment_id && <p><strong>Payment ID:</strong> {order.payment_id}</p>}
            </div>
            {profile && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Billing Details</h3>
                <p>{profile.first_name} {profile.last_name}</p>
                {profile.company_name && <p>{profile.company_name}</p>}
                <p>{profile.address_line_1}</p>
                {profile.address_line_2 && <p>{profile.address_line_2}</p>}
                <p>{profile.city}, {profile.state_province_region} {profile.postal_code}</p>
                <p>{profile.country}</p>
                {profile.vat_number && <p>VAT: {profile.vat_number}</p>}
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
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.products?.[0]?.name || `Product ${item.product_id}`}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.price_at_purchase.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(item.quantity * item.price_at_purchase).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4 text-lg font-semibold">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee (15%):</span>
                  <span>${processingFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>${finalTotal.toFixed(2)}</span>
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