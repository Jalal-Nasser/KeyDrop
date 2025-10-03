import { integer, pgTable, varchar, text, numeric } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    content: text().notNull().default('')
});

export const order_items = pgTable('order_items', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    order_id: integer().notNull(),
    product_name: text().notNull(),
    sku: text(),
    quantity: integer('quantity').notNull(),
    unit_price: numeric().notNull(),
    line_total: numeric().notNull()
});