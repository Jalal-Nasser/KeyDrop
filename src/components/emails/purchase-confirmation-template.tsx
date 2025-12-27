import React from 'react';

interface PurchaseConfirmationTemplateProps {
  firstName: string;
  orderId: string;
  productListHtml: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const LOGO_URL = "https://i.imgur.com/dcJe2iS.png";

export const PurchaseConfirmationTemplate: React.FC<PurchaseConfirmationTemplateProps> = ({ firstName, orderId, productListHtml }) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
  <img src={LOGO_URL} alt="Dropskey Logo" width={150} height={50} style={{ width: '150px', maxWidth: '150px', height: 'auto', display: 'block', margin: '0 auto' }} />
      </div>
      <h2 style={{ color: '#000' }}>Thank you for your order, {firstName}!</h2>
      <p>Your order <strong>#{orderId.substring(0, 8)}</strong> has been received and is now being processed. We will notify you again once your products have been delivered. You can find your detailed invoice attached to this email.</p>
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Your Products</h3>
      <div dangerouslySetInnerHTML={{ __html: productListHtml }} style={{ paddingLeft: '20px' }}></div>
      <p>You can also view your order status anytime by visiting your account:</p>
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a href={`${BASE_URL}/account/orders/${orderId}`} style={{ backgroundColor: '#007bff', color: 'white', padding: '12px 25px', textDecoration: 'none', borderRadius: '5px', fontSize: '16px' }}>View Order Status</a>
      </div>
      <p>If you have any questions, please reply to this email.</p>
      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
      <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>Thanks,<br/>The Dropskey Team</p>
    </div>
  </div>
);