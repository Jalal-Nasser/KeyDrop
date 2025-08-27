"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { OrderWithDetails } from "@/app/admin/orders/page"
import { format } from "date-fns"
import { OrderStatusUpdater } from "./order-status-updater"
import { FulfillOrderItemDialog } from "./fulfill-order-item-dialog"
import { CheckCircle, Mail, Package, ShieldCheck, XCircle } from "lucide-react"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"
function getStatusVariant(status: string): BadgeVariant {
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
                <div className={cn(badgeVariants({ variant: getStatusVariant(order.status) }), "capitalize")}>
                  {order.status}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-muted/50 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Order Items</h4>
                <div className="flex items-center gap-2">
                  <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
              <div className="space-y-2">
                {order.order_items.map((item: OrderWithDetails["order_items"][number]) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-background rounded-md">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.product_name || item.products?.[0]?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div>
                      {/* Show send code button for all items to test */}
                      <div className="flex items-center gap-2">
                        {item.product_key && (
                          <div className="flex items-center gap-2 text-green-600 mr-2">
                            <ShieldCheck className="h-5 w-5" />
                            <span className="font-medium text-sm">Fulfilled</span>
                          </div>
                        )}
                        <FulfillOrderItemDialog orderItemId={item.id} productName={item.product_name || item.products?.[0]?.name || ''}>
                          <Button className={buttonVariants({ size: 'sm', variant: 'default' })}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send code
                          </Button>
                        </FulfillOrderItemDialog>
                        {item.products?.[0]?.is_digital ? (
                          <span className="text-xs text-green-600 ml-2">Digital</span>
                        ) : (
                          <span className="text-xs text-gray-500 ml-2">Physical</span>
                        )}
                      </div>
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