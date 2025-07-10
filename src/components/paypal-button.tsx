"use client"

import {
  PayPalButtons,
} from "@paypal/react-paypal-js"
import { useSession } from "@/context/session-context"
import { toast } from "sonner"
import { Product } from "@/types/product"
import { sendOrderConfirmationEmail } from "@/lib/order-mail" // Import the new email utility
import { format } from "date-fns"

interface PayPalButtonProps {
  product: Product
  quantity: number
}

export function PayPalButton({ product, quantity }: PayPalButtonProps) {
  const { session, supabase } = useSession()

  const createOrder = (data: any, actions: any) => {
    if (!session) {
      toast.error("You must be signed in to make a purchase.")
      return Promise.reject(new Error("User not signed in"))
    }

    const price = product.price
    const totalValue = (price * quantity).toFixed(2)

    return actions.order.create({
      purchase_units: [
        {
          description: product.name,
          amount: {
            currency_code: "USD",
            value: totalValue,
          },
        },
      ],
    })
  }

  const onApprove = async (data: any, actions: any) => {
    if (!actions.order) {
      toast.error("Something went wrong with the PayPal order. Please try again.")
      return Promise.reject(new Error("Order actions not available"))
    }

    const details = await actions.order.capture()
    const price = product.price
    const total = price * quantity

    if (details.status === "COMPLETED") {
      toast.success("Payment successful! Your order is being processed.")

      if (supabase && session) {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: session.user.id,
            status: "completed",
            total: total,
            payment_gateway: "paypal",
            payment_id: details.id,
          })
          .select()
          .single()

        if (orderError) {
          toast.error(`Failed to save your order: ${orderError.message}`)
          return
        }

        const { error: itemError } = await supabase.from("order_items").insert({
          order_id: orderData.id,
          product_id: product.id,
          quantity: quantity,
          price_at_purchase: price,
        })

        if (itemError) {
          toast.error(`Failed to save order items: ${itemError.message}`)
        } else {
          toast.success("Your order has been successfully saved.")

          // Fetch user profile for billing details
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile for email:", profileError);
            toast.error("Order saved, but failed to fetch profile for email. Please check your account.");
          }

          // Send order confirmation email
          if (session.user.email) {
            const customerName = profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || session.user.email : session.user.email;
            const invoiceLink = `${window.location.origin}/account/orders/${orderData.id}/invoice`;
            const itemsForEmail = [{
              name: product.name,
              quantity: quantity,
              price: product.price,
            }];

            await sendOrderConfirmationEmail({
              supabase, // Pass supabase client
              to: session.user.email,
              orderId: orderData.id,
              orderDate: format(new Date(orderData.created_at), 'PPP p'),
              totalAmount: total,
              items: itemsForEmail,
              customerName: customerName,
              invoiceLink: invoiceLink,
            });
            toast.success("Order confirmation email sent!", { duration: 3000 });
          }
        }
      }
    } else {
      toast.error("Payment not completed. Please try again.")
    }
  }

  const onError = (err: any) => {
    toast.error(
      "An error occurred during the PayPal transaction. Please try again."
    )
    console.error("PayPal Error:", err)
  }

  return (
    <div className="w-full">
      <PayPalButtons
        style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        disabled={!session}
      />
      {!session && (
        <p className="text-xs text-red-500 text-center mt-2">
          Please sign in to purchase.
        </p>
      )}
    </div>
  )
}