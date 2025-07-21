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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const LOGO_URL = `${BASE_URL}/panda.png`; // Corrected logo URL

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, profile }) => {
  const processingFee = order.total * 0.15;
  const finalTotal = order.total + processingFee;

  return (
    <div style={main}>
      <div style={container}>
        {/* Top Header with Logo, Invoice ID, and Company Info */}
        <table width="100%" cellPadding="0" cellSpacing="0" style={topHeader}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top', width: '50%' }}>
                <div style={logoContainer}>
                  <img src={LOGO_URL} alt="Dropskey Logo" width="40" height="40" style={{ display: 'block' }} />
                  <span style={logoText}>Dropskey</span>
                </div>
              </td>
              <td style={{ verticalAlign: 'top', width: '50%', textAlign: 'right' as const }}>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#333', margin: '0 0 5px 0' }}>INVOICE</h2>
                <p style={{ fontSize: '13px', color: '#555', margin: '0 0 2px 0' }}>Invoice ID: #{order.id.substring(0, 8)}</p>
                <p style={{ fontSize: '13px', color: '#555', margin: '0 0 15px 0' }}>Date: {format(new Date(order.created_at), 'PPP')}</p>
                <div style={companyInfo}>
                  <p style={{ margin: '0' }}>Dropskey</p>
                  <p style={{ margin: '0' }}>123 Digital Key Street</p>
                  <p style={{ margin: '0' }}>Suite 456</p>
                  <p style={{ margin: '0' }}>Tech City, TX 78701</p>
                  <p style={{ margin: '0' }}>USA</p>
                  <p style={{ margin: '0' }}>VAT Number: N/A</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Green Invoice Header Bar - Removed as per new design */}

        {/* Details Section */}
        <div style={detailsSection}>
          <div style={detailsColumn}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Billed To:</p>
            <address style={addressStyle}>
              {profile.company_name && <p style={{ fontWeight: 'bold', margin: '0' }}>{profile.company_name}</p>}
              <p style={{ margin: '0' }}>{profile.first_name} {profile.last_name}</p>
              <p style={{ margin: '0' }}>{profile.address_line_1}</p>
              {profile.address_line_2 && <p style={{ margin: '0' }}>{profile.address_line_2}</p>}
              <p style={{ margin: '0' }}>{profile.city}, {profile.state_province_region} {profile.postal_code}</p>
              <p style={{ margin: '0' }}>{profile.country}</p>
              {profile.vat_number && <p style={{ margin: '0' }}>VAT Number: {profile.vat_number}</p>}
            </address>
          </div>
          <div style={detailsColumnRight}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Payment Details:</p>
            <p style={{ margin: '0' }}><strong>Method:</strong> {order.payment_gateway || 'N/A'}</p>
            <p style={{ margin: '0' }}><strong>Status:</strong> <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{order.status}</span></p>
            <p style={{ margin: '0' }}><strong>Date:</strong> {format(new Date(order.created_at), 'PPP')}</p>
          </div>
        </div>

        {/* Items Table */}
        <table style={itemsTable}>
          <thead>
            <tr>
              <th style={itemsTh}>Item</th>
              <th style={{ ...itemsTh, textAlign: 'right' as const }}>Qty</th>
              <th style={{ ...itemsTh, textAlign: 'right' as const }}>Unit Price</th>
              <th style={{ ...itemsTh, textAlign: 'right' as const }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item: OrderItem, index: number) => {
              const product = item.products?.[0];
              return (
                <tr key={index}>
                  <td style={itemsTd}>{product?.name || 'Unknown Product'}</td>
                  <td style={itemsTdRight}>{item.quantity}</td>
                  <td style={itemsTdRight}>${item.price_at_purchase.toFixed(2)}</td>
                  <td style={itemsTdRight}>${(item.quantity * item.price_at_purchase).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ ...itemsTd, textAlign: 'right' as const, fontWeight: 'bold', borderTop: '1px solid #ddd' }}>Subtotal:</td>
              <td style={{ ...itemsTdRight, fontWeight: 'bold', borderTop: '1px solid #ddd' }}>${order.total.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={3} style={{ ...itemsTd, textAlign: 'right' as const, fontWeight: 'bold' }}>Processing Fee (15%):</td>
              <td style={{ ...itemsTdRight, fontWeight: 'bold' }}>${processingFee.toFixed(2)}</td>
            </tr>
            <tr style={{ backgroundColor: '#f8f8f8' }}>
              <td colSpan={3} style={{ ...itemsTd, textAlign: 'right' as const, fontSize: '18px', fontWeight: 'bold', padding: '15px 8px' }}>TOTAL:</td>
              <td style={{ ...itemsTdRight, fontSize: '18px', fontWeight: 'bold', padding: '15px 8px' }}>${finalTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Final Total Bar - Removed as per new design */}

        {/* Footer */}
        <div style={footer}>
          <p style={{ margin: '0 0 5px 0' }}>Thank you for your business!</p>
          <p style={{ margin: '0' }}>Dropskey | support@dropskey.com</p>
        </div>
      </div>
    </div>
  );
};