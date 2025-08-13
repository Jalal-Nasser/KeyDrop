'use server'

import { render } from '@react-email/render'
import React from 'react';
import { InvoiceTemplate, Order, Profile } from '@/components/emails/invoice-template'
import { RegistrationConfirmationTemplate } from '@/components/emails/registration-confirmation-template'
import { PurchaseConfirmationTemplate } from '@/components/emails/purchase-confirmation-template'
import { OrderStatusChangedTemplate } from '@/components/emails/order-status-changed-template'
import { ProfileUpdateTemplate } from '@/components/emails/profile-update-template'
import { ProductDeliveryTemplate } from '@/components/emails/product-delivery-template' // Added

const renderOptions = { pretty: true };

async function renderTemplate<P>(Component: React.FunctionComponent<P>, props: P): Promise<string> {
  try {
    const element = React.createElement(Component as any, props as Record<string, unknown>);
    const html = render(element as React.ReactElement<any>, renderOptions);
    return html;
  } catch (error) {
    console.error(`Error rendering ${Component.name} template:`, error);
    throw new Error("Failed to render email template.");
  }
}

export async function renderInvoiceTemplateToHtml(order: Order, profile: Profile): Promise<string> {
  return renderTemplate(InvoiceTemplate, { order, profile });
}

export async function renderRegistrationConfirmationTemplateToHtml(firstName: string): Promise<string> {
  return renderTemplate(RegistrationConfirmationTemplate, { firstName });
}

export async function renderPurchaseConfirmationTemplateToHtml(firstName: string, orderId: string, productListHtml: string): Promise<string> {
  return renderTemplate(PurchaseConfirmationTemplate, { firstName, orderId, productListHtml });
}

export async function renderOrderStatusChangedTemplateToHtml(firstName: string, orderId: string, newStatus: string): Promise<string> {
  return renderTemplate(OrderStatusChangedTemplate, { firstName, orderId, newStatus });
}

export async function renderProfileUpdateTemplateToHtml(firstName: string): Promise<string> {
  return renderTemplate(ProfileUpdateTemplate, { firstName });
}

export async function renderProductDeliveryTemplateToHtml(firstName: string, orderId: string, productName: string, productKey: string): Promise<string> {
  return renderTemplate(ProductDeliveryTemplate, { firstName, orderId, productName, productKey });
}