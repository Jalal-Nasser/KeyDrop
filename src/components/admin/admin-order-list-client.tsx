"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrderWithDetails } from "@/app/admin/orders/page"
import { format } from "date-fns"
import { OrderStatusUpdater } from "./order-status-updater"
import { ReSendInvoiceButton } from "./resend-invoice-button" // Corrected import name
import { FulfillOrderItemDialog } from "./fulfill-order-item-dialog"
import { CheckCircle, KeyRound, Package, ShieldCheck, XCircle } from "lucide-react"

function getStatusVariant(status: string) {
  switch (status) {
    case "completed":
      return "default"
    case "pending":
      return "default"
    case "cancelled":
      return "destructive"
    default:
      return "secondary"
  }
}

export function AdminOrderListClient({ orders }: { orders: OrderWithDetails[] }) {
  if (!orders.length) {
    return <p>No orders found.</p>
  }

  return (
    <Accordion type="multiple" className="w-full">
      {orders.map((order) => (
        <AccordionItem value={order.id} key={order.id}>
          <AccordionTrigger>
            <div className="flex justify-between items-center w-full pr-4">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-left">
                <span className="font-mono text-sm text-muted-foreground">#{order.id.substring(0, 8)}</span>
                <span className="font-semibold">{order.profiles?.first_name} {order.profiles?.last_name}</span>
                <span className="text-sm text-muted-foreground">{format(new Date(order.created_at), "PPP")}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden md:inline-block font-bold text-lg">${order.total.toFixed(2)}</span>
                <Badge variant={getStatusVariant(order.status)} className="capitalize">
                  {order.status}
                </Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-muted/50 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Order Items</h4>
                <div className="flex items-center gap-2">
                  <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                  <ReSendInvoiceButton orderId={order.id} />
                </div>
              </div>
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-background rounded-md">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.product_name || item.products?.[0]?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div>
                      {item.products?.[0]?.is_digital ? (
                        item.product_key ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <ShieldCheck className="h-5 w-5" />
                            <span className="font-medium">Fulfilled</span>
                            <p className="text-xs font-mono p-1 bg-green-100 rounded">Key Sent</p>
                          </div>
                        ) : (
                          <FulfillOrderItemDialog orderItemId={item.id} productName={item.product_name || item.products?.[0]?.name || ''}>
                            <Button size="sm">
                              <KeyRound className="mr-2 h-4 w-4" />
                              Fulfill
                            </Button>
                          </FulfillOrderItemDialog>
                        )
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Physical Item</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}