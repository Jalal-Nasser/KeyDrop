import { pgTable, serial, text, integer, timestamp, decimal, varchar, boolean } from 'drizzle-orm/pg-core';

// This table will store the main order information
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // e.g., pending, paid, shipped
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// This table will store the individual items within each order
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').notNull(), // From WordPress
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Price per item at time of purchase
});

// This table will store product information, typically cloned from WordPress
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  onSale: boolean('on_sale').default(false).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  regularPrice: decimal('regular_price', { precision: 10, scale: 2 }),
  featured: boolean('featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});