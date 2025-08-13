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

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, profile }) => {
  const processingFee = order.total * 0.15;
  const credit = 0.00; // Assuming no credit for now
  const finalTotal = order.total + processingFee - credit;

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
            <img src="https://i.imgur.com/dcJe2iS.png" alt="Dropskey LTD" className="top-logo" />
            <div style={{ textAlign: 'right' }}>
              <strong>Dropskey LTD</strong><br />
              4283 Express Lane<br />
              Suite 193-395<br />
              Sarasota, FL 34249<br />
              VAT Number: 20115192
            </div>
          </div>

          <div className="header-strip">Invoice #{order.id.substring(0, 8)} - {order.status.toUpperCase()}</div>

          <div className="section">
            <div className="invoice-info">
              <h3>Invoice Date</h3>
              <p><strong>Status: PAID</strong><br />
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
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item, index) => {
                const productName = item.products?.[0]?.name || 'Product';
                const lineTotal = (item.quantity * item.price_at_purchase).toFixed(2);
                return (
                  <tr key={index}>
                    <td>{productName}</td>
                    <td>${lineTotal}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td className="total">Sub Total</td>
                <td className="total">${order.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="total">Fees</td>
                <td className="total">${processingFee.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="total">Credit</td>
                <td className="total">${credit.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="footer-total">
            Total: ${finalTotal.toFixed(2)}
          </div>
        </div>
      </body>
    </html>
  );
};