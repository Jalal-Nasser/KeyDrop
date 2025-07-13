'use server'

import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { sendMail } from '@/lib/postmark'
import { 
  renderInvoiceTemplateToHtml,
  renderPurchaseConfirmationTemplateToHtml,
  renderOrderStatusChangedTemplateToHtml,
  renderProfileUpdateTemplateToHtml,
  renderRegistrationConfirmationTemplateToHtml
} from '@/lib/render-email-template';

// Define types that match the Supabase query result structure
interface FetchedProduct {
  name: string;
  download_url: string | null;
  is_digital: boolean | null;
}

interface FetchedOrderItem {
  quantity: number;
  price_at_purchase: number;
  products: FetchedProduct[] | null;
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

interface FullFetchedOrder {
  id: string;
  created_at: string;
  total: number;
  status: string;
  payment_gateway: string | null;
  order_items: FetchedOrderItem[];
  profiles: FetchedProfile | null;
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
      .single() as { data: FullFetchedOrder | null, error: any };

    if (orderError || !fetchedOrder) {
      throw new Error(`Failed to fetch order details: ${orderError?.message}`)
    }

    const profile = fetchedOrder.profiles;
    if (!profile) {
      throw new Error('User profile not found for this order.')
    }

    const orderForInvoiceTemplate = {
      id: fetchedOrder.id,
      created_at: fetchedOrder.created_at,
      total: fetchedOrder.total,
      status: fetchedOrder.status,
      payment_gateway: fetchedOrder.payment_gateway,
      order_items: fetchedOrder.order_items,
    };

    const invoiceHtml = await renderInvoiceTemplateToHtml(orderForInvoiceTemplate, profile);

    const productListHtml = fetchedOrder.order_items.map(item => {
      const product = item.products?.[0];
      if (product?.is_digital && product.download_url) {
        return `<li>${product.name}: <a href="${process.env.NEXT_PUBLIC_BASE_URL}${product.download_url}">Download Now</a></li>`
      }
      return `<li>${product?.name || 'Product'}</li>`
    }).join('')

    const purchaseConfirmationHtml = await renderPurchaseConfirmationTemplateToHtml(
      profile.first_name || 'Valued Customer',
      fetchedOrder.id,
      productListHtml
    );

    await sendMail({
      to: payload.userEmail,
      subject: `Your Dropskey Order Confirmation #${fetchedOrder.id.substring(0, 8)}`,
      html: purchaseConfirmationHtml,
      attachments: [
        {
          filename: `invoice-${fetchedOrder.id.substring(0, 8)}.html`,
          content: invoiceHtml,
          ContentType: 'text/html',
        },
      ],
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error sending confirmation email:", error.message)
    return { success: false, message: error.message }
  }
}

export async function sendOrderStatusUpdate(payload: { orderId: string; userEmail: string; status: string; firstName: string; }) {
  try {
    const { orderId, userEmail, status, firstName } = payload;
    const html = await renderOrderStatusChangedTemplateToHtml(firstName, orderId, status);

    await sendMail({
      to: userEmail,
      subject: `Your Dropskey Order #${orderId.substring(0, 8)} has been ${status}`,
      html,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error sending order status update email:", error.message);
    return { success: false, message: error.message };
  }
}

export async function sendProfileUpdateConfirmation(payload: { userEmail: string; firstName: string; }) {
  try {
    const { userEmail, firstName } = payload;
    const html = await renderProfileUpdateTemplateToHtml(firstName);

    await sendMail({
      to: userEmail,
      subject: 'Your Dropskey Profile Has Been Updated',
      html,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error sending profile update email:", error.message);
    return { success: false, message: error.message };
  }
}

export async function sendRegistrationConfirmation(payload: { userEmail: string; firstName: string; }) {
  try {
    const { userEmail, firstName } = payload;
    const html = await renderRegistrationConfirmationTemplateToHtml(firstName);

    await sendMail({
      to: userEmail,
      subject: 'Welcome to Dropskey!',
      html,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error sending registration email:", error.message);
    return { success: false, message: error.message };
  }
}

// Note: The original sendOrderCancellation is now covered by sendOrderStatusUpdate
// and can be removed if no longer directly used elsewhere. For now, it's left for compatibility.
export async function sendOrderCancellation(payload: { orderId: string; userEmail: string; }) {
  const supabase = createSupabaseServerClient()

  try {
    const { data: fetchedOrder, error: orderError } = await supabase
      .from('orders')
      .select(`id, created_at, profiles ( first_name )`)
      .eq('id', payload.orderId)
      .single() as { data: { id: string, created_at: string, profiles: { first_name: string | null } | null }, error: any };

    if (orderError || !fetchedOrder || !fetchedOrder.profiles) {
      throw new Error(`Failed to fetch order details for cancellation email: ${orderError?.message}`)
    }
    
    const firstName = fetchedOrder.profiles.first_name || 'Valued Customer';
    return await sendOrderStatusUpdate({ ...payload, status: 'cancelled', firstName });

  } catch (error: any) {
    console.error("Error sending cancellation email:", error.message)
    return { success: false, message: error.message }
  }
}