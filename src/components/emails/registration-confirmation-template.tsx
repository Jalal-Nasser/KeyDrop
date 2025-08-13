import React from 'react';

interface RegistrationConfirmationTemplateProps {
  firstName: string;
}

const LOGO_URL = "https://i.imgur.com/dcJe2iS.png";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const RegistrationConfirmationTemplate: React.FC<RegistrationConfirmationTemplateProps> = ({ firstName }) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src={LOGO_URL} alt="Dropskey Logo" style={{ width: '150px' }} />
      </div>
      <h2 style={{ color: '#000' }}>Welcome to Dropskey, {firstName}!</h2>
      <p>We're excited to have you on board. Your account has been successfully created.</p>
      <p>You can now explore our products, manage your account, and view your orders.</p>
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a href={`${BASE_URL}/shop`} style={{ backgroundColor: '#007bff', color: 'white', padding: '12px 25px', textDecoration: 'none', borderRadius: '5px', fontSize: '16px' }}>Start Shopping</a>
      </div>
      <p>If you have any questions, feel free to reply to this email. We're here to help!</p>
      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
      <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>Thanks,<br/>The Dropskey Team</p>
    </div>
  </div>
);