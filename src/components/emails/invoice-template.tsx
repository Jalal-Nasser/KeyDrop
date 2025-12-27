import * as React from 'react';
import { format } from "date-fns";
import { Json } from '@/types/supabase';

interface Product {
  name: string;
  download_url?: string | null;
  is_digital?: boolean | null;
}

interface OrderItem {
  quantity: number;
  price_at_purchase: number;
  product_name: string | null; // Added
  unit_price: number | null; // Added
  line_total: number | null; // Added
  // Optional joined product info for safer fallback
  products?: Array<{ name?: string | null }> | null;
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
  amounts: Json | null; // Added
  promo_code: string | null; // Added
  promo_snapshot: Json | null; // Added
  order_items: OrderItem[];
}

interface InvoiceTemplateProps {
  order: Order;
  profile: Profile;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, profile }) => {
  // Safely parse stored amounts snapshot (may have subtotal already including tax)
  const snapshot = (order.amounts as { subtotal?: string | number; discount?: string | number; tax?: string | number; total?: string | number; currency?: string }) || {};
  const parseNum = (v: any, def = 0) => {
    if (v === null || v === undefined) return def;
    if (typeof v === 'number') return v;
    const n = parseFloat(String(v));
    return isNaN(n) ? def : n;
  };

  // Compute item subtotal from order items (line_total preferred, else unit * qty)
  const itemSubtotal = order.order_items.reduce((acc, item) => {
    const unit = (item.unit_price != null ? item.unit_price : item.price_at_purchase) || 0;
    const qty = item.quantity || 1;
    const line = item.line_total != null ? item.line_total : unit * qty;
    return acc + line;
  }, 0);

  const discount = parseNum(snapshot.discount, 0);
  // Stored subtotal may already include tax; if greater than order.total, ignore it and use itemSubtotal.
  let storedSubtotal = parseNum(snapshot.subtotal, itemSubtotal);
  if (storedSubtotal >= order.total && order.total > 0) {
    storedSubtotal = itemSubtotal; // treat stored value as inflated
  }

  // Base subtotal after discount (pre-tax)
  const baseSubtotal = Math.max(0, itemSubtotal - discount);
  // Determine tax: prefer snapshot.tax; else difference between order.total and baseSubtotal if positive; else fallback 15%.
  const snapshotTax = parseNum(snapshot.tax, 0);
  let tax = snapshotTax;
  if (tax <= 0) {
    if (order.total > baseSubtotal) {
      tax = order.total - baseSubtotal;
    } else {
      tax = baseSubtotal * 0.15; // fallback processing/tax rate
    }
  }

  // Total: prefer order.total if consistent, else recompute
  let total = parseNum(snapshot.total, order.total || (baseSubtotal + tax));
  if (total < baseSubtotal || total < itemSubtotal) {
    total = baseSubtotal + tax;
  }

  const currency = snapshot.currency || 'USD';

  // Configurable logo URL and width
  const DEFAULT_LOGO_URL = "https://i.imgur.com/dcJe2iS.png";
  const DEFAULT_LOGO_WIDTH = 220;
  // Use environment variables if available (for SSR, process.env; for client, fallback to defaults)
  const logoUrl = (process.env.EMAIL_LOGO_URL as string) || DEFAULT_LOGO_URL;
  const logoWidth = parseInt((process.env.EMAIL_LOGO_WIDTH as string) || "" + DEFAULT_LOGO_WIDTH, 10);

  // Inline styles for email client compatibility (Gmail/Outlook)
  const styles = {
    body: {
      margin: 0,
      padding: 0,
      backgroundColor: '#F5F7FB',
      color: '#111827',
      fontFamily: 'Arial, Helvetica, sans-serif' as const,
    },
    container: {
      width: '100%',
      padding: '24px 0',
      boxSizing: 'border-box' as const,
    },
    card: {
      width: '600px',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
    },
    section: { padding: '20px 24px' },
    brand: { width: '100%', textAlign: 'center' as const, padding: '12px 0 0 0' },
    headerDetails: { width: '100%', textAlign: 'left' as const, padding: '8px 0 16px 24px' },
    h1: { margin: 0, fontSize: '22px', fontWeight: 700 as const, textAlign: 'left' as const },
    small: { margin: 0, color: '#6B7280', fontSize: '12px', textAlign: 'left' as const },
    hr: { border: 0, borderTop: '1px solid #E5E7EB', margin: 0 },
    grid: { display: 'table', width: '100%' },
    col: { display: 'table-cell', verticalAlign: 'top' as const, width: '50%' },
    label: { fontSize: '14px', fontWeight: 600 as const, marginBottom: '6px' },
    muted: { color: '#374151', fontSize: '13px', lineHeight: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: '8px' },
    th: { backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '10px', fontSize: '13px', textAlign: 'left' as const },
    td: { border: '1px solid #E5E7EB', padding: '10px', fontSize: '13px' },
    tdRight: { border: '1px solid #E5E7EB', padding: '10px', fontSize: '13px', textAlign: 'right' as const },
    totalRowLabel: { padding: '10px', fontWeight: 700 as const, textAlign: 'right' as const, fontSize: '14px' },
    totalRowValue: { padding: '10px', fontWeight: 700 as const, textAlign: 'right' as const, fontSize: '14px' },
    footer: { backgroundColor: '#F9FAFB', padding: '14px 24px', textAlign: 'right' as const, fontWeight: 700 as const, fontSize: '16px' },
  };

  // Format date as readable string
  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Compose client address lines safely
  const clientAddressLines = [
    profile.company_name,
    `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
    profile.address_line_1,
    profile.address_line_2,
    `${profile.city || ''}, ${profile.state_province_region || ''} ${profile.postal_code || ''}`.trim(),
    profile.country,
    profile.vat_number ? `VAT Number: ${profile.vat_number}` : null,
  ].filter(Boolean);

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.brand}>
            <img
              src={logoUrl}
              alt="Dropskey LTD"
              width={logoWidth}
              style={{
                display: 'block',
                margin: '0 auto',
                width: logoWidth + 'px',
                maxWidth: logoWidth + 'px',
                height: 'auto',
                imageRendering: 'auto',
                padding: '8px 0',
              }}
            />
          </div>
          <div style={styles.headerDetails}>
            <div style={styles.h1}>INVOICE</div>
            <div style={styles.small}>Invoice ID: {order.id.substring(0, 8)}</div>
            <div style={styles.small}>Date: {invoiceDate}</div>
            <div style={styles.small}>Status: {order.status.toUpperCase()}</div>
          </div>
          <div style={styles.section}>
            <div style={styles.grid}>
              <div style={styles.col}>
                <div style={styles.label}>Billed From</div>
                <div style={styles.muted}>
                  <div><strong>Dropskey LTD</strong></div>
                  <div>4283 Express Lane</div>
                  <div>Suite 193-395</div>
                  <div>Sarasota, FL 34249</div>
                  <div>VAT Number: 20115192</div>
                </div>
              </div>
              <div style={styles.col}>
                <div style={styles.label}>Billed To</div>
                <div style={styles.muted}>
                  {clientAddressLines.map((line, idx) => (<div key={idx}>{line}</div>))}
                </div>
              </div>
            </div>
          </div>
          <hr style={styles.hr} />
          <div style={styles.section}>
            <table style={styles.table} cellPadding={0} cellSpacing={0} role="presentation">
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '55%' }}>Description</th>
                  <th style={{ ...styles.th, width: '15%', textAlign: 'right' as const }}>Qty</th>
                  <th style={{ ...styles.th, width: '15%', textAlign: 'right' as const }}>Unit Price</th>
                  <th style={{ ...styles.th, width: '15%', textAlign: 'right' as const }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((item, index) => {
                  const fallbackName = (item.products && item.products[0]?.name) || null;
                  const productName = item.product_name || fallbackName || 'Unknown Product';
                  const unit = (item.unit_price != null ? item.unit_price : item.price_at_purchase) || 0;
                  const qty = item.quantity || 1;
                  const line = item.line_total != null ? item.line_total : unit * qty;
                  return (
                    <tr key={index}>
                      <td style={styles.td}>{productName}</td>
                      <td style={styles.tdRight}>{qty}</td>
                      <td style={styles.tdRight}>${unit.toFixed(2)}</td>
                      <td style={styles.tdRight}>${line.toFixed(2)}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td style={styles.totalRowLabel} colSpan={3}>Subtotal</td>
                  <td style={styles.totalRowValue}>${baseSubtotal.toFixed(2)}</td>
                </tr>
                {discount > 0 && (
                  <tr>
                    <td style={styles.totalRowLabel} colSpan={3}>Discount</td>
                    <td style={styles.totalRowValue}>-${discount.toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td style={styles.totalRowLabel} colSpan={3}>Tax</td>
                  <td style={styles.totalRowValue}>${tax.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={styles.footer}>Total: ${total.toFixed(2)} {currency}</div>
        </div>
      </div>
    </div>
  );
};