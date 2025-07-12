'use server'

import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { sendMail } from '@/lib/postmark'
import { renderInvoiceTemplateToHtml } from '@/lib/render-email-template'; // Import the new rendering utility

// Define types that match the Supabase query result structure
interface FetchedProduct {
  name: string;
  download_url: string | null;
  is_digital: boolean | null;
}

interface FetchedOrderItem {
  quantity: number;
  price_at_purchase: number;
  products: FetchedProduct[] | null; // Changed to array of FetchedProduct
}

interface FetchedProfile {
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
}

// This interface represents the full object returned by the .single() query
interface FullFetchedOrder {
  id: string;
  created_at: string;
  total: number;
  status: string;
  payment_gateway: string | null;
  order_items: FetchedOrderItem[];
  profiles: FetchedProfile | null; // This is the nested profile from the query
}

export async function sendOrderConfirmation(payload: { orderId: string; userEmail: string; }) {
  const supabase = createSupabaseServerClient()

  try {
    const { data: fetchedOrder, error: orderError } = await supabase
      .from('orders')
      .select(`
        id, created_at, total, status, payment_gateway,
        order_items ( quantity, price_at_purchase, products ( name, download_url, is_digital ) ),
        profiles ( first_name, last_name, company_name, vat_number, address_line_1, address_line_2, city, state_province_region, postal_code, country )
      `)
      .eq('id', payload.orderId)
      .single() as { data: FullFetchedOrder | null, error: any }; // Cast the result

    if (orderError || !fetchedOrder) {
      throw new Error(`Failed to fetch order details: ${orderError?.message}`)
    }

    const profile = fetchedOrder.profiles; // Now correctly typed as FetchedProfile | null
    if (!profile) {
      throw new Error('User profile not found for this order.')
    }

    // Create an 'order' object that matches the 'Order' interface expected by InvoiceTemplate
    // The InvoiceTemplate's 'Order' interface does NOT have a 'profiles' property.
    const orderForInvoiceTemplate = {
      id: fetchedOrder.id,
      created_at: fetchedOrder.created_at,
      total: fetchedOrder.total,
      status: fetchedOrder.status,
      payment_gateway: fetchedOrder.payment_gateway,
      order_items: fetchedOrder.order_items,
    };

    // Use the new utility function to render the invoice template
    const invoiceHtml = await renderInvoiceTemplateToHtml(orderForInvoiceTemplate, profile);

    const productListHtml = fetchedOrder.order_items.map(item => {
      const product = item.products?.[0]; // Access the first product in the array
      if (product?.is_digital && product.download_url) {
        return `<li>${product.name}: <a href="${process.env.NEXT_PUBLIC_BASE_URL}${product.download_url}">Download Now</a></li>`
      }
      return `<li>${product?.name || 'Product'}</li>`
    }).join('')

    await sendMail({
      to: payload.userEmail,
      subject: `Your Dropskey Order Confirmation #${fetchedOrder.id.substring(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Thank you for your order, ${profile!.first_name}!</h2>
          <p>Your order has been confirmed and is being processed. You can find your invoice attached to this email.</p>
          <h3>Your Products:</h3>
          <ul>${productListHtml}</ul>
          <p>You can also view your order details anytime by visiting your account:
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/orders/${fetchedOrder.id}">View Order</a>
          </p>
          <p>If you have any questions, please reply to this email.</p>
          <p>Thanks,<br/>The Dropskey Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${fetchedOrder.id.substring(0, 8)}.html`,
          content: invoiceHtml,
          ContentType: 'text/html', // Specify content type for the attachment
        },
      ],
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error sending confirmation email:", error.message)
    return { success: false, message: error.message }
  }
}

export async function sendOrderCancellation(payload: { orderId: string; userEmail: string; }) {
  const supabase = createSupabaseServerClient()

  try {
    const { data: fetchedOrder, error: orderError } = await supabase
      .from('orders')
      .select(`
        id, created_at, total, status, payment_gateway,
        profiles ( first_name, last_name )
      `)
      .eq('id', payload.orderId)
      .single() as { data: FullFetchedOrder | null, error: any };

    if (orderError || !fetchedOrder) {
      throw new Error(`Failed to fetch order details for cancellation email: ${orderError?.message}`)
    }

    const profile = fetchedOrder.profiles;
    if (!profile) {
      throw new Error('User profile not found for this order cancellation.')
    }

    await sendMail({
      to: payload.userEmail,
      subject: `Your Dropskey Order #${fetchedOrder.id.substring(0, 8)} Has Been Cancelled`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Dear ${profile!.first_name},</h2>
          <p>We regret to inform you that your order <strong>#${fetchedOrder.id.substring(0, 8)}</strong> placed on ${new Date(fetchedOrder.created_at).toLocaleDateString()} has been cancelled.</p>
          <p>If you have any questions or concerns regarding this cancellation, please do not hesitate to contact our support team by replying to this email.</p>
          <p>We apologize for any inconvenience this may cause.</p>
          <p>Thanks,<br/>The Dropskey Team</p>
        </div>
      `,
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error sending cancellation email:", error.message)
    return { success: false, message: error.message }
  }
}