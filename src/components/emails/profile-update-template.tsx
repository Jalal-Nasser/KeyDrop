import React from 'react';

interface ProfileUpdateTemplateProps {
  firstName: string;
}

const LOGO_URL = "https://i.imgur.com/626b44t.png";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const ProfileUpdateTemplate: React.FC<ProfileUpdateTemplateProps> = ({ firstName }) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src={LOGO_URL} alt="Dropskey Logo" style={{ width: '150px' }} />
      </div>
      <h2 style={{ color: '#000' }}>Your Profile Has Been Updated</h2>
      <p>Hello {firstName},</p>
      <p>This is a confirmation that your profile information was successfully updated on {new Date().toLocaleDateString()}.</p>
      <p>If you did not make this change, please contact our support team immediately by replying to this email.</p>
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a href={`${BASE_URL}/account`} style={{ backgroundColor: '#007bff', color: 'white', padding: '12px 25px', textDecoration: 'none', borderRadius: '5px', fontSize: '16px' }}>View Your Profile</a>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
      <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>Thanks,<br/>The Dropskey Team</p>
    </div>
  </div>
);