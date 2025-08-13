import { paypalClient } from "@/lib/paypal"
import paypal from "@paypal/checkout-server-sdk"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { order_price, currency_code } = await req.json()

  if (!order_price || !currency_code) {
    return NextResponse.json({ error: "Missing order price or currency code" }, { status: 400 })
  }

  const request = new paypal.orders.OrdersCreateRequest()
  request.prefer("return=representation")
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency_code,
          value: order_price.toString(),
        },
      },
    ],
    application_context: {
      shipping_preference: "NO_SHIPPING",
    },
  })

  try {
    const order = await paypalClient.execute(request)
    return NextResponse.json({ id: order.result.id })
  } catch (e: any) {
    console.error("PayPal API Error:", e.message)
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 })
  }
}