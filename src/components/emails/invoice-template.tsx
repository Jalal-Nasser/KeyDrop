import * as React from 'react';
import { format } from "date-fns";

// Define more specific types for the email template
interface Product {
  name: string;
  download_url?: string | null;
  is_digital?: boolean | null;
}

interface OrderItem {
  quantity: number;
  price_at_purchase: number;
  products: { name: string; }[] | null; // Corrected back to array of objects
}

export interface Profile {
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

export interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  payment_gateway: string | null;
  order_items: OrderItem[]; // Added order_items here
  // Note: 'profiles' is NOT part of this 'Order' interface, as it's passed separately to InvoiceTemplateProps
}

interface InvoiceTemplateProps {
  order: Order;
  profile: Profile;
}

// Base styles
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
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

// Top header with logo and company info
const topHeader = {
  padding: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  borderBottom: '1px solid #eee',
};

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
};

const logoText = {
  color: '#1e73be',
  fontSize: '24px',
  fontWeight: 'bold',
  marginLeft: '10px',
};

const companyInfo = {
  textAlign: 'right' as const,
  fontSize: '13px',
  color: '#555',
  lineHeight: '1.5',
};

// Green invoice header bar
const invoiceHeaderBar = {
  backgroundColor: '#28a645', // Green color from image
  color: 'white',
  padding: '15px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '20px',
  fontWeight: 'bold',
};

// Details section (Invoice Date, Invoiced To)
const detailsSection = {
  padding: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '14px',
  lineHeight: '1.6',
};

const detailsColumn = {
  flex: '1',
  paddingRight: '10px',
};

const detailsColumnRight = {
  flex: '1',
  paddingLeft: '10px',
  textAlign: 'right' as const,
};

const addressStyle = {
  fontStyle: 'normal' as const,
  marginTop: '5px',
};

// Items table
const itemsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginTop: '20px',
};

const itemsTh = {
  textAlign: 'left' as const,
  padding: '10px 8px',
  borderBottom: '1px solid #ddd',
  color: '#666',
  fontSize: '13px',
  fontWeight: 'normal',
};

const itemsTd = {
  padding: '10px 8px',
  borderBottom: '1px solid #eee',
  fontSize: '14px',
  color: '#333',
};

const itemsTdRight = {
  ...itemsTd,
  textAlign: 'right' as const,
};

// Totals section
const totalsSection = {
  padding: '20px',
  paddingTop: '0',
  textAlign: 'right' as const,
  fontSize: '14px',
  color: '#333',
};

const totalRow = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: '5px',
};

const totalLabel = {
  width: '150px',
  paddingRight: '10px',
  fontWeight: 'normal',
};

const totalValue = {
  width: '100px',
  fontWeight: 'bold',
};

const finalTotalBar = {
  backgroundColor: '#28a645', // Green color from image
  color: 'white',
  padding: '15px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '18px',
  fontWeight: 'bold',
};

const footer = {
  padding: '20px',
  borderTop: '1px solid #dddddd',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: '#666666',
  backgroundColor: '#f8f8f8',
};

const LOGO_URL = "https://notncpmpmgostfxesrvk.supabase.co/storage/v1/object/public/product-images/public/panda.png"; // Use the Supabase URL for the logo

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, profile }) => {
  const processingFee = order.total * 0.15;
  const finalTotal = order.total + processingFee;

  return (
    <div style={main}>
      <div style={container}>
        {/* Top Header with Logo and Company Info */}
        <div style={topHeader}>
          <div style={logoContainer}>
            <img src={LOGO_URL} alt="Dropskey Logo" width="40" height="40" />
            <span style={logoText}>Dropskey</span>
          </div>
          <div style={companyInfo}>
            <p>Dropskey</p>
            <p>123 Digital Key Street</p>
            <p>Suite 456</p>
            <p>Tech City, TX 78701</p>
            <p>USA</p>
            {/* Assuming a static VAT for the company for now, or remove if not applicable */}
            <p>VAT Number: N/A</p>
          </div>
        </div>

        {/* Green Invoice Header Bar */}
        <div style={invoiceHeaderBar}>
          <span>Invoice #{order.id.substring(0, 8)}</span>
          <span>Paid</span>
        </div>

        {/* Details Section */}
        <div style={detailsSection}>
          <div style={detailsColumn}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Invoice Date</p>
            <p>{format(new Date(order.created_at), 'EEEE, MMMM do, yyyy')}</p>
            <p style={{ fontWeight: 'bold', marginTop: '15px', marginBottom: '5px' }}>PAID</p>
            <p>{order.payment_gateway || 'N/A'} | {format(new Date(order.created_at), 'EEEE, MMMM do, yyyy')}</p>
          </div>
          <div style={detailsColumnRight}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Invoiced To</p>
            <address style={addressStyle}>
              {profile.company_name && <p style={{ fontWeight: 'bold' }}>{profile.company_name}</p>}
              <p>{profile.first_name} {profile.last_name}</p>
              <p>{profile.address_line_1}</p>
              {profile.address_line_2 && <p>{profile.address_line_2}</p>}
              <p>{profile.city}, {profile.state_province_region} {profile.postal_code}</p>
              <p>{profile.country}</p>
              {profile.vat_number && <p>VAT Number: {profile.vat_number}</p>}
            </address>
          </div>
        </div>

        {/* Items Table */}
        <table style={itemsTable}>
          <thead>
            <tr>
              <th style={itemsTh}>Description</th>
              <th style={itemsTh}></th> {/* Empty header for spacing */}
              <th style={itemsTh}></th> {/* Empty header for spacing */}
              <th style={{ ...itemsTh, textAlign: 'right' as const }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item: OrderItem, index: number) => {
              const product = item.products?.[0];
              return (
                <tr key={index}>
                  <td style={itemsTd}>{product?.name || 'Unknown Product'}</td>
                  <td style={itemsTd}></td>
                  <td style={itemsTd}></td>
                  <td style={itemsTdRight}>${(item.quantity * item.price_at_purchase).toFixed(2)} USD</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals Section */}
        <div style={totalsSection}>
          <div style={totalRow}>
            <span style={totalLabel}>Sub Total</span>
            <span style={totalValue}>${order.total.toFixed(2)} USD</span>
          </div>
          <div style={totalRow}>
            <span style={totalLabel}>15.00% Process Fees</span>
            <span style={totalValue}>${processingFee.toFixed(2)} USD</span>
          </div>
          <div style={totalRow}>
            <span style={totalLabel}>Credit</span>
            <span style={totalValue}>$0.00 USD</span> {/* Placeholder for credit */}
          </div>
        </div>

        {/* Final Total Bar */}
        <div style={finalTotalBar}>
          <span>Total</span>
          <span>${finalTotal.toFixed(2)} USD</span>
        </div>

        {/* Footer */}
        <div style={footer}>
          <p>Thank you for your business!</p>
          <p>Dropskey | support@dropskey.com</p>
        </div>
      </div>
    </div>
  );
};