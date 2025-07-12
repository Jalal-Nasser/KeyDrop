import * as React from 'react';
import { format } from "date-fns";

// Define more specific types for the email template
interface Product {
  name: string;
  download_url?: string | null; // Added for completeness, though not used in invoice display
  is_digital?: boolean | null; // Added for completeness
}

interface OrderItem {
  quantity: number;
  price_at_purchase: number;
  products: { name: string; }[] | null; // Corrected back to array of objects
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
  // Note: 'profiles' is NOT part of this 'Order' interface, as it's passed separately to InvoiceTemplateProps
}

interface InvoiceTemplateProps {
  order: Order;
  profile: Profile;
}

const main = {
  fontFamily: '"Helvetica Neue", "Arial", sans-serif',
  backgroundColor: '#f4f4f4',
  padding: '20px',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  border: '1px solid #dddddd',
  borderRadius: '8px',
  overflow: 'hidden',
};

const header = {
  padding: '20px',
  borderBottom: '1px solid #dddddd',
  backgroundColor: '#f8f8f8',
};

const content = {
  padding: '20px',
};

const footer = {
  padding: '20px',
  borderTop: '1px solid #dddddd',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: '#666666',
  backgroundColor: '#f8f8f8',
};

const h1 = {
  color: '#1e73be',
  fontSize: '24px',
  margin: '0 0 10px 0',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const th = {
  textAlign: 'left' as const,
  padding: '8px',
  borderBottom: '2px solid #dddddd',
};

const td = {
  textAlign: 'left' as const,
  padding: '8px',
  borderBottom: '1px solid #eeeeee',
};

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, profile }) => {
  const processingFee = order.total * 0.15;
  const finalTotal = order.total + processingFee;

  return (
    <div style={main}>
      <div style={container}>
        <div style={header}>
          <h1 style={h1}>Dropskey Invoice</h1>
          <p>Order ID: {order.id.substring(0, 8)}</p>
          <p>Date: {format(new Date(order.created_at), 'PPP')}</p>
        </div>
        <div style={content}>
          <h2>Billed To:</h2>
          <address>
            <strong>{profile.first_name} {profile.last_name}</strong><br />
            {profile.company_name && <>{profile.company_name}<br /></>}
            {profile.address_line_1}<br />
            {profile.address_line_2 && <>{profile.address_line_2}<br /></>}
            {profile.city}, {profile.state_province_region} {profile.postal_code}<br />
            {profile.country}<br />
            {profile.vat_number && <>VAT: {profile.vat_number}</>}
          </address>
          <hr style={{ margin: '20px 0' }} />
          <h2>Order Summary</h2>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Item</th>
                <th style={{ ...th, textAlign: 'right' as const }}>Qty</th>
                <th style={{ ...th, textAlign: 'right' as const }}>Price</th>
                <th style={{ ...th, textAlign: 'right' as const }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item, index) => {
                // Access the first product in the array
                const product = item.products?.[0];
                return (
                  <tr key={index}>
                    <td style={td}>{product?.name || 'Unknown Product'}</td>
                    <td style={{ ...td, textAlign: 'right' as const }}>{item.quantity}</td>
                    <td style={{ ...td, textAlign: 'right' as const }}>${item.price_at_purchase.toFixed(2)}</td>
                    <td style={{ ...td, textAlign: 'right' as const }}>${(item.quantity * item.price_at_purchase).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ ...td, textAlign: 'right' as const }}>Subtotal:</td>
                <td style={{ ...td, textAlign: 'right' as const }}>${order.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={3} style={{ ...td, textAlign: 'right' as const }}>Processing Fee (15%):</td>
                <td style={{ ...td, textAlign: 'right' as const }}>${processingFee.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={3} style={{ ...th, textAlign: 'right' as const, borderTop: '2px solid #dddddd' }}><strong>TOTAL:</strong></td>
                <td style={{ ...th, textAlign: 'right' as const, borderTop: '2px solid #dddddd' }}><strong>${finalTotal.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style={footer}>
          <p>Thank you for your business!</p>
          <p>Dropskey | support@dropskey.com</p>
        </div>
      </div>
    </div>
  );
};