"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderStatusUpdater } from "@/components/admin/order-status-updater"
import { ReSendInvoiceButton } from "@/components/admin/resend-invoice-button"
import { format } from "date-fns"
import { Database } from "@/types/supabase"

type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  products: Pick<Database['public']['Tables']['products']['Row'], 'name'> | null
}

type Order = Database['public']['Tables']['orders']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'first_name' | 'last_name'> | null
  order_items: OrderItem[]
}

interface AdminOrderListClientProps {
  orders: Order[];
}

export function AdminOrderListClient({ orders }: AdminOrderListClientProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
              <TableCell>{format(new Date(order.created_at), "PPP")}</TableCell>
              <TableCell>
                {order.profiles?.first_name || order.profiles?.last_name ?
                  `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`.trim() :
                  `User: ${order.user_id.substring(0, 8)}...`}
              </TableCell>
              <TableCell>
                {order.order_items.map((item, index) => (
                  <div key={item.product_id}>
                    {item.quantity} x {item.products?.name || `Product ${item.product_id}`}
                    {index < order.order_items.length - 1 ? ', ' : ''}
                  </div>
                ))}
              </TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>
                <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ReSendInvoiceButton orderId={order.id} />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center">No orders found.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}