'use server'

import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { sendMail } from '@/lib/postmark'
import { 
  renderInvoiceTemplateToHtml,
  renderPurchaseConfirmationTemplateToHtml, // Still imported, but not used for main body
  renderOrderStatusChangedTemplateToHtml,
  renderProfileUpdateTemplateToHtml,
  renderRegistrationConfirmationTemplateToHtml,
  renderProductDeliveryTemplateToHtml
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
  products: FetchedProduct[] | null; // Changed to array
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
      order_items: fetchedOrder.order_items.map(oi => ({ ...oi, products: oi.products || [] })), // Ensure products is an array
    };

    // Render the invoice HTML to be the main body of the email
    const invoiceHtml = await renderInvoiceTemplateToHtml(orderForInvoiceTemplate, profile);
    
    // No longer sending purchaseConfirmationHtml as the main body, nor attaching the invoice.
    // The invoice IS the email body now.

    await sendMail({
      to: payload.userEmail,
      subject: `Your Dropskey Invoice #${fetchedOrder.id.substring(0, 8)}`, // Updated subject
      html: invoiceHtml, // Send invoice HTML as the main body
      attachments: [], // No attachments needed if invoice is the body
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error sending confirmation email:", error.message)
    return { success: false, message: error.message }
  }
}

export async function sendProductDelivery(payload: { userEmail: string, firstName: string, orderId: string, productName: string, productKey: string }) {
  try {
    const { userEmail, firstName, orderId, productName, productKey } = payload;
    const html = await renderProductDeliveryTemplateToHtml(firstName, orderId, productName, productKey);

    await sendMail({
      to: userEmail,
      subject: `Your Product Key for ${productName}`,
      html,
      attachments: [],
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error sending product delivery email:", error.message);
    return { success: false, message: error.message };
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
      attachments: [],
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
      attachments: [],
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
      attachments: [],
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error sending registration email:", error.message);
    return { success: false, message: error.message };
  }
}