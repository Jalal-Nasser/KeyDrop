'use server'

import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { sendMail } from '@/lib/postmark'
import { 
  renderInvoiceTemplateToHtml,
  renderPurchaseConfirmationTemplateToHtml,
  renderOrderStatusChangedTemplateToHtml,
  renderProfileUpdateTemplateToHtml,
  renderRegistrationConfirmationTemplateToHtml,
  renderProductDeliveryTemplateToHtml
} from '@/lib/render-email-template';
import { Json } from '@/types/supabase';

// Define types that match the Supabase query result structure
interface FetchedProduct {
  name: string;
  download_url: string | null;
  is_digital: boolean | null;
  image: string | null;
}

interface FetchedOrderItem {
  quantity: number;
  price_at_purchase: number;
  product_name: string | null;
  sku: string | null;
  unit_price: number | null;
  line_total: number | null;
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
  amounts: Json | null;
  promo_code: string | null;
  promo_snapshot: Json | null;
  order_items: FetchedOrderItem[];
  profiles: FetchedProfile | null;
}

export async function sendOrderConfirmation(payload: { orderId: string; userEmail: string; }) {
  const supabase = createSupabaseServerClient()

  try {
    const { data: fetchedOrder, error: orderError } = await supabase
      .from('orders')
      .select(`
        id, created_at, total, status, payment_gateway, amounts, promo_code, promo_snapshot,
        order_items ( quantity, price_at_purchase, product_name, sku, unit_price, line_total ),
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
      amounts: fetchedOrder.amounts,
      promo_code: fetchedOrder.promo_code,
      promo_snapshot: fetchedOrder.promo_snapshot,
      order_items: fetchedOrder.order_items.map(oi => ({ ...oi, products: oi.products || [] })),
    };

    const invoiceHtml = await renderInvoiceTemplateToHtml(orderForInvoiceTemplate, profile);
    
    await sendMail({
      to: payload.userEmail,
      subject: `Your Dropskey Invoice #${fetchedOrder.id.substring(0, 8)}`,
      html: invoiceHtml,
      attachments: [],
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