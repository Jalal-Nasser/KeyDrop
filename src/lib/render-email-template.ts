import React from 'react';
import { InvoiceTemplate } from '@/components/emails/invoice-template';

// Define types that match the InvoiceTemplateProps
interface Product {
  name: string;
  download_url?: string | null;
  is_digital?: boolean | null;
}

interface OrderItem {
  quantity: number;
  price_at_purchase: number;
  products: Product | null;
}

interface Profile {
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_province_region: string | null;
  postal_code: string | null;
  country: string | null;
  vat_number: string | null;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  payment_gateway: string | null;
  order_items: OrderItem[];
}

/**
 * Renders the InvoiceTemplate React component to a static HTML string.
 * This utility is used to generate email content on the server without
 * conflicting with Next.js Server Component rules.
 * @param order The order data.
 * @param profile The user profile data.
 * @returns A string containing the static HTML representation of the invoice.
 */
export async function renderInvoiceTemplateToHtml(order: Order, profile: Profile): Promise<string> {
  // Dynamically import react-dom/server to ensure it's only loaded on the server
  // and not bundled for the client.
  const { renderToStaticMarkup } = await import('react-dom/server');
  
  return renderToStaticMarkup(
    React.createElement(InvoiceTemplate, { order, profile })
  );
}