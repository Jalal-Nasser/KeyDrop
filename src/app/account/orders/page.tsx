"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/context/session-context"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"
import type { ChangeEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  products: {
    name: string;
  }[]; // Changed to array of product objects
}

const ticketFormSchema = z.object({
  message: z.string().min(10, {
    message: "Your message must be at least 10 characters long.",
  }).max(1000, {
    message: "Your message must not be longer than 1000 characters.",
  }),
})

export default function OrdersPage() {
  const { session, supabase } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const form = useForm<z.infer<typeof ticketFormSchema>>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: { message: "" },
  })

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.id) {
        setLoading(false)
        setError("User not authenticated.")
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(`
            id, created_at, total, status,
            order_items (id, product_id, quantity, price_at_purchase, products (name))
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setOrders(data as Order[])
      } catch (err: any) {
        console.error("Error fetching orders:", err)
        setError(err.message || "Failed to fetch orders.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [session, supabase])

  const handleOpenTicketDialog = (order: Order) => {
    setSelectedOrder(order)
    setIsTicketDialogOpen(true)
    form.reset()
  }

  const onSubmit = async (values: z.infer<typeof ticketFormSchema>) => {
    if (!selectedOrder || !session?.user?.email) {
      toast.error("Could not submit ticket. User or order not found.")
      return
    }
    const toastId = toast.loading("Submitting ticket...")

    try {
      const { error: invokeError } = await supabase.functions.invoke('support-ticket', {
        body: {
          orderId: selectedOrder.id,
          userEmail: session.user.email,
          message: values.message,
        },
      })

      if (invokeError) throw new Error(invokeError.message)

      toast.success("Support ticket submitted successfully!", { id: toastId })
      setIsTicketDialogOpen(false)
    } catch (error: any) {
      console.error("Failed to submit ticket:", error)
      toast.error(`Failed to submit ticket: ${error.message}`, { id: toastId })
    }
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center py-12 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be signed in to view your orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please sign in to access your order history.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto p-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>View your past orders and their details.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p>Loading orders...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && orders.length === 0 && <p>You haven't placed any orders yet.</p>}
            {!loading && !error && orders.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: Order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link href={`/account/orders/${order.id}`} className="text-blue-600 hover:underline">
                          {order.id.substring(0, 8)}...
                        </Link>
                      </TableCell>
                      <TableCell>{format(new Date(order.created_at), 'PPP')}</TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        {order.status}
                      </TableCell>
                      <TableCell>
                        {order.order_items.map((item: OrderItem, index: number) => (
                          <div key={item.id}>
                            {item.quantity} x {item.products?.[0]?.name || `Product ${item.product_id}`}
                            {index < order.order_items.length - 1 ? ',' : ''}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleOpenTicketDialog(order)}>
                          Open a Ticket
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Open Support Ticket</DialogTitle>
            <DialogDescription>
              Have an issue with order #{selectedOrder?.id.substring(0, 8)}...? Let us know.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe your issue</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please tell us more about the problem..."
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}