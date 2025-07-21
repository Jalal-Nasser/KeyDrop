import * as React from 'react';
import { format } from "date-fns";

interface Product {
  name: string;
  download_url?: string | null;
  is_digital?: boolean | null;
}

interface OrderItem {
  quantity: number;
  price_at_purchase: number;
  products: { name: string; }[] | null;
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
  order_items: OrderItem[];
}

interface InvoiceTemplateProps {
  order: Order;
  profile: Profile;
}

const main = {
  fontFamily: '"Helvetica Neue", Arial, sans-serif',
  backgroundColor: '#fff',
  padding: '0',
  margin: '0',
};

const container = {
  maxWidth: '800px',
  margin: '0 auto',
  border: '1px solid #ddd',
  borderRadius: '4px',
  overflow: 'hidden',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
};

const headerTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  backgroundColor: '#fff',
  padding: '20px',
};

const logoStyle = {
  width: '150px',
  height: 'auto',
};

const companyInfoStyle = {
  fontSize: '12px',
  color: '#333',
  lineHeight: '1.4',
  textAlign: 'right' as const,
  paddingTop: '10px',
  fontWeight: 'normal' as const,
};

const greenBar = {
  backgroundColor: '#4CAF50',
  color: 'white',
  fontWeight: 'bold' as const,
  fontSize: '20px',
  padding: '15px 30px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const detailsSection = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '20px 30px',
  fontSize: '12px',
  color: '#555',
  lineHeight: '1.5',
};

const detailsColumn = {
  width: '45%',
};

const labelStyle = {
  fontWeight: 'bold' as const,
  color: '#777',
  marginBottom: '6px',
};

const itemsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  fontSize: '12px',
  color: '#333',
};

const itemsTh = {
  backgroundColor: '#f2f2f2',
  padding: '10px',
  textAlign: 'left' as const,
  borderBottom: '1px solid #ddd',
};

const itemsTd = {
  padding: '10px',
  borderBottom: '1px solid #eee',
  verticalAlign: 'top' as const,
};

const itemsTdRight = {
  ...itemsTd,
  textAlign: 'right' as const,
  whiteSpace: 'nowrap' as const,
};

const totalsSection = {
  width: '100%',
  padding: '20px 30px',
  fontSize: '12px',
  color: '#333',
  textAlign: 'right' as const,
};

const totalRow = {
  marginBottom: '6px',
  display: 'flex',
  justifyContent: 'flex-end',
};

const totalLabel = {
  width: '150px',
  fontWeight: 'normal' as const,
};

const totalValue = {
  width: '100px',
  fontWeight: 'bold' as const,
};

const totalBar = {
  backgroundColor: '#4CAF50',
  color: 'white',
  fontWeight: 'bold' as const,
  fontSize: '16px',
  padding: '15px 30px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const footer = {
  padding: '20px 30px',
  fontSize: '12px',
  color: '#777',
  textAlign: 'center' as const,
  backgroundColor: '#f9f9f9',
};

const logoUrl = "https://notncpmpmgostfxesrvk.supabase.co/storage/v1/object/public/product-images/public/dropskey-logo.png";

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, profile }) => {
  const processingFee = order.total * 0.15;
  const finalTotal = order.total + processingFee;

  return (
    <div style={main}>
      <div style={container}>
        {/* Header with logo and company info */}
        <table style={headerTable}>
          <tbody>
            <tr>
              <td style={{ width: '50%' }}>
                <img src={logoUrl} alt="Dropskey Logo" style={logoStyle} />
              </td>
              <td style={{ width: '50%', verticalAlign: 'top' }}>
                <div style={companyInfoStyle}>
                  <div><strong>Dropskey</strong></div>
                  <div>4283 Express Lane</div>
                  <div>Suite 193-395</div>
                  <div>Sarasota, FL 34249</div>
                  <div>VAT Number: 20115192</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Green bar with Invoice # and Paid */}
        <div style={greenBar}>
          <div>Invoice #{order.id.substring(0, 8)}</div>
          <div>Paid</div>
        </div>

        {/* Invoice details */}
        <div style={detailsSection}>
          <div style={detailsColumn}>
            <div style={labelStyle}>Invoice Date</div>
            <div>{format(new Date(order.created_at), 'EEEE, MMMM do, yyyy')}</div>
            <div style={{ marginTop: '20px', ...labelStyle }}>PAID</div>
            <div>{order.payment_gateway || 'N/A'} | {format(new Date(order.created_at), 'EEEE, MMMM do, yyyy')}</div>
          </div>
          <div style={detailsColumn}>
            <div style={labelStyle}>Invoiced To</div>
            <div>
              {profile.company_name && <div><strong>{profile.company_name}</strong></div>}
              <div>{profile.first_name} {profile.last_name}</div>
              <div>{profile.address_line_1}</div>
              {profile.address_line_2 && <div>{profile.address_line_2}</div>}
              <div>{profile.city}, {profile.state_province_region} {profile.postal_code}</div>
              <div>{profile.country}</div>
              {profile.vat_number && <div>VAT Number: {profile.vat_number}</div>}
            </div>
          </div>
        </div>

        {/* Items table */}
        <table style={itemsTable}>
          <thead>
            <tr>
              <th style={itemsTh}>Description</th>
              <th style={itemsTh}></th>
              <th style={itemsTh}></th>
              <th style={itemsTh}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item, idx) => {
              const product = item.products?.[0];
              return (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#f7f7f7' : 'transparent' }}>
                  <td style={itemsTd}>{product?.name || 'Unknown Product'}</td>
                  <td style={itemsTd}></td>
                  <td style={itemsTd}></td>
                  <td style={itemsTdRight}>${(item.quantity * item.price_at_purchase).toFixed(2)} USD</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div style={totalsSection}>
          <div style={totalRow}>
            <div style={totalLabel}>Sub Total</div>
            <div style={totalValue}>${order.total.toFixed(2)} USD</div>
          </div>
          <div style={totalRow}>
            <div style={totalLabel}>15.00% Process Fees</div>
            <div style={totalValue}>${processingFee.toFixed(2)} USD</div>
          </div>
          <div style={totalRow}>
            <div style={totalLabel}>Credit</div>
            <div style={totalValue}>$0.00 USD</div>
          </div>
        </div>

        {/* Total bar */}
        <div style={totalBar}>
          <div>Total</div>
          <div>${finalTotal.toFixed(2)} USD</div>
        </div>

        {/* Footer */}
        <div style={footer}>
          <div>Thank you for your business!</div>
          <div>Dropskey | support@dropskey.com</div>
        </div>
      </div>
    </div>
  );
};