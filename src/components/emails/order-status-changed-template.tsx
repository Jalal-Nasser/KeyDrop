import React from 'react';

interface OrderStatusChangedTemplateProps {
  firstName: string;
  orderId: string;
  newStatus: string;
}

const LOGO_URL = "https://i.imgur.com/dcJe2iS.png";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const OrderStatusChangedTemplate: React.FC<OrderStatusChangedTemplateProps> = ({ firstName, orderId, newStatus }) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src={LOGO_URL} alt="Dropskey Logo" style={{ width: '150px' }} />
      </div>
      <h2 style={{ color: '#000' }}>Your Order Status Has Been Updated</h2>
      <p>Hello {firstName},</p>
      <p>The status of your order <strong>#{orderId.substring(0, 8)}</strong> has been updated to: <strong>{newStatus}</strong>.</p>
      <p>You can view the full details of your order by clicking the button below.</p>
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a href={`${BASE_URL}/account/orders/${orderId}`} style={{ backgroundColor: '#007bff', color: 'white', padding: '12px 25px', textDecoration: 'none', borderRadius: '5px', fontSize: '16px' }}>View Order Details</a>
      </div>
      <p>If you have any questions, please reply to this email.</p>
      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
      <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>Thanks,<br/>The Dropskey Team</p>
    </div>
  </div>
);