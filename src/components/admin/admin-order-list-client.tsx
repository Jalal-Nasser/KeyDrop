"use client"

import React, { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { OrderStatusUpdater } from "@/components/admin/order-status-updater"
import { ReSendInvoiceButton } from "@/components/admin/resend-invoice-button"
import { Input } from "@/components/ui/input"

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    is_admin: boolean | null; // Added is_admin
  }[] | null;
  order_items: {
    product_id: number;
    quantity: number;
    products: { name: string }[] | null;
  }[];
}

interface AdminOrderListClientProps {
  initialOrders: Order[];
}

export function AdminOrderListClient({ initialOrders }: AdminOrderListClientProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = useMemo(() => {
    if (!searchTerm) {
      return initialOrders
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return initialOrders.filter(order => {
      const customerName = `${order.profiles?.[0]?.first_name || ""} ${order.profiles?.[0]?.last_name || ""}`.toLowerCase()
      const orderId = order.id.toLowerCase()
      const productNames = order.order_items.map(item => item.products?.[0]?.name?.toLowerCase() || "").join(" ")

      return orderId.includes(lowerCaseSearchTerm) ||
             customerName.includes(lowerCaseSearchTerm) ||
             productNames.includes(lowerCaseSearchTerm)
    })
  }, [initialOrders, searchTerm])

  return (
    <CardContent>
      <div className="mb-4">
        <Input
          placeholder="Search orders by ID, customer name, or product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {filteredOrders && filteredOrders.length > 0 ? (
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
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell> {/* Shortened ID */}
                  <TableCell>
                    {/* Always display the customer's name */}
                    {`${order.profiles?.[0]?.first_name || ""} ${order.profiles?.[0]?.last_name || ""}`}
                  </TableCell>
                  <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
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
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/account/orders/${order.id}/invoice`}>View Invoice</Link>
                      </Button>
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/account/orders/${order.id}/invoice?print=true`} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </Link>
                      </Button>
                      <ReSendInvoiceButton orderId={order.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-4">No orders found matching your search.</p>
      )}
    </CardContent>
  )
}