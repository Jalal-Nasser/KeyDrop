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
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>Invoice - Dropskey LTD</title>
        <style>
          {`
            body {
              font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              color: #333;
              background: #f8f8f8;
            }
            .invoice-box {
              max-width: 900px;
              margin: auto;
              padding: 30px;
              background: #fff;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .top-logo {
              width: 200px;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-bottom: 20px;
            }
            .header-strip {
              background-color: #3cdd8e;
              padding: 20px;
              text-align: center;
              color: white;
              font-size: 24px;
              font-weight: bold;
            }
            .section {
              margin-top: 30px;
            }
            .section h3 {
              margin-bottom: 10px;
              color: #444;
            }
            .address, .invoice-info {
              display: inline-block;
              vertical-align: top;
              width: 48%;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            table, th, td {
              border: 1px solid #eaeaea;
            }
            th, td {
              padding: 12px;
              text-align: left;
            }
            th {
              background: #f3f3f3;
            }
            .total {
              font-weight: bold;
              background: #f9f9f9;
            }
            .footer-total {
              background: #3cdd8e;
              color: white;
              text-align: right;
              padding: 15px;
              font-size: 18px;
            }
          `}
        </style>
      </head>
      <body>
        <div className="invoice-box">
          <div className="invoice-header">
            <img
              src="https://i.imgur.com/dcJe2iS.png"
              alt="Dropskey LTD"
              width="200"
              height="60"
              style={{ width: '200px', maxWidth: '200px', height: 'auto', display: 'block' }}
            />
            <div style={{ textAlign: 'left', marginTop: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Dropskey LTD</strong><br />
                4283 Express Lane<br />
                Suite 193-395<br />
                Sarasota, FL 34249<br />
                VAT Number: 20115192
              </div>
            </div>
          </div>

          <div className="header-strip">Invoice #{order.id.substring(0, 8)} - {order.status.toUpperCase()}</div>

          <div className="section">
            <div className="invoice-info">
              <h3>Invoice Date</h3>
              <p><strong>Status: {order.status.toUpperCase()}</strong><br />
              {invoiceDate}
              </p>
            </div>
            <div className="address">
              <h3>Invoiced To</h3>
              {clientAddressLines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Line Total</th>
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
                    <td>{productName}</td>
                    <td>{qty}</td>
                    <td>${unit.toFixed(2)}</td>
                    <td>${line.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="total">Subtotal</td>
                <td className="total">${baseSubtotal.toFixed(2)}</td>
              </tr>
              {discount > 0 && (
                <tr>
                  <td colSpan={3} className="total">Discount</td>
                  <td className="total">-${discount.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="total">Tax</td>
                <td className="total">${tax.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="footer-total">
            Total: ${total.toFixed(2)} {currency}
          </div>
        </div>
      </body>
    </html>
  );
};