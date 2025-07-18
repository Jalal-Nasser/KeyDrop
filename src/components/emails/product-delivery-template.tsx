import React from 'react';

interface ProductDeliveryTemplateProps {
  firstName: string;
  orderId: string;
  productName: string;
  productKey: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const ProductDeliveryTemplate: React.FC<ProductDeliveryTemplateProps> = ({ firstName, orderId, productName, productKey }) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src="cid:logo_image" alt="Dropskey Logo" style={{ width: '150px' }} />
      </div>
      <h2 style={{ color: '#000' }}>Your Product Key is Here!</h2>
      <p>Hello {firstName},</p>
      <p>Thank you for your purchase. Here is the product key for your item: <strong>{productName}</strong>.</p>
      
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '5px', 
        textAlign: 'center', 
        margin: '20px 0',
        fontFamily: 'monospace',
        fontSize: '16px',
        border: '1px dashed #ccc'
      }}>
        {productKey}
      </div>

      <p>You can view your full order details by clicking the button below:</p>
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a href={`${BASE_URL}/account/orders/${orderId}`} style={{ backgroundColor: '#007bff', color: 'white', padding: '12px 25px', textDecoration: 'none', borderRadius: '5px', fontSize: '16px' }}>View Your Order</a>
      </div>
      <p>If you have any questions, please reply to this email.</p>
      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
      <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>Thanks,<br/>The Dropskey Team</p>
    </div>
  </div>
);