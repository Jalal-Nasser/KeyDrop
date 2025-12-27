import { z } from 'zod';

export const createOrderSchema = z.object({
  cartItems: z.array(z.object({
    id: z.number(),
    quantity: z.number().min(1),
  })).min(1),
  promoCode: z.string().optional(),
});

export const createPayPalOrderSchema = z.object({
  orderId: z.string().uuid(),
});

export const capturePayPalOrderSchema = z.object({
  orderId: z.string().uuid(),
  paypalOrderId: z.string(),
});

export const sendConfirmationSchema = z.object({
  orderId: z.string().uuid(),
});