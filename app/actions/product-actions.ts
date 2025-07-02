'use server';

import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { unstable_noStore as noStore } from 'next/cache';

interface GetProductsOptions {
  limit: number;
  featured?: boolean;
}

// This function will fetch products from our database.
export async function getProductsFromDb(options: GetProductsOptions) {
  noStore(); // Opt out of caching for this dynamic data
  try {
    // I am assuming the products table has columns like 'id', 'name', 'description', 
    // 'imageUrl', 'onSale', 'price', 'regularPrice', 'featured', and 'createdAt'.
    // This is based on the data we would have cloned from WordPress.
    const query = db
      .select({
        databaseId: products.id,
        name: products.name,
        description: products.description,
        sourceUrl: products.imageUrl,
        onSale: products.onSale,
        price: products.price,
        regularPrice: products.regularPrice,
      })
      .from(products)
      .orderBy(desc(products.createdAt || products.id))
      .limit(options.limit);

    if (options.featured) {
      // @ts-ignore
      query.where(eq(products.featured, true));
    }

    const productData = await query;

    // The components expect a specific data structure, so we format it here.
    const formattedProducts = productData.map(p => ({
      ...p,
      price: String(p.price),
      regularPrice: p.regularPrice ? String(p.regularPrice) : undefined,
      image: p.sourceUrl ? { sourceUrl: p.sourceUrl } : null,
      productCategories: { nodes: [] }, // Using placeholder for now
      productTags: { nodes: [] },      // Using placeholder for now
    }));

    return formattedProducts;
  } catch (error) {
    console.error('Database Error: Failed to fetch products.', error);
    return []; // Return empty array on error to prevent crashing
  }
}