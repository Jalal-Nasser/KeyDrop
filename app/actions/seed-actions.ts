'use server';

import { db } from '@/lib/db';
import { products } from '@/lib/schema';

export async function seedProducts() {
  try {
    const dummyProducts = [
      {
        name: 'Organic Apples',
        description: 'Fresh, crisp organic apples from local farms.',
        imageUrl: 'https://images.unsplash.com/photo-1568702847927-a2549876920a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        onSale: false,
        price: '2.99',
        regularPrice: '3.50',
        featured: true,
        createdAt: new Date(),
      },
      {
        name: 'Whole Wheat Bread',
        description: 'Artisan whole wheat bread, baked fresh daily.',
        imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        onSale: true,
        price: '4.50',
        regularPrice: '5.00',
        featured: false,
        createdAt: new Date(),
      },
      {
        name: 'Fresh Organic Milk',
        description: 'Locally sourced, pasteurized organic milk.',
        imageUrl: 'https://images.unsplash.com/photo-1628222876000-12821222211f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        onSale: false,
        price: '3.75',
        regularPrice: null,
        featured: true,
        createdAt: new Date(),
      },
      {
        name: 'Avocado',
        description: 'Ripe and ready-to-eat avocados.',
        imageUrl: 'https://images.unsplash.com/photo-1557495000-19201222211f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        onSale: false,
        price: '1.50',
        regularPrice: null,
        featured: false,
        createdAt: new Date(),
      },
      {
        name: 'Organic Eggs (Dozen)',
        description: 'Farm-fresh organic eggs, free-range.',
        imageUrl: 'https://images.unsplash.com/photo-1587486913049-53448799ad66?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        onSale: true,
        price: '5.99',
        regularPrice: '6.50',
        featured: true,
        createdAt: new Date(),
      },
      {
        name: 'Blueberries (Pint)',
        description: 'Sweet and juicy blueberries, perfect for snacking or baking.',
        imageUrl: 'https://images.unsplash.com/photo-1587486913049-53448799ad66?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        onSale: false,
        price: '4.25',
        regularPrice: null,
        featured: false,
        createdAt: new Date(),
      },
      {
        name: 'Ground Coffee (Fair Trade)',
        description: 'Rich and aromatic fair trade ground coffee.',
        imageUrl: 'https://images.unsplash.com/photo-1511920170104-ab69cba2c53d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        onSale: false,
        price: '12.00',
        regularPrice: null,
        featured: true,
        createdAt: new Date(),
      },
      {
        name: 'Artisan Cheese',
        description: 'Aged artisan cheddar cheese, perfect for a cheese board.',
        imageUrl: 'https://images.unsplash.com/photo-1587486913049-53448799ad66?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        onSale: true,
        price: '8.99',
        regularPrice: '10.50',
        featured: false,
        createdAt: new Date(),
      },
    ];

    // Clear existing products to avoid duplicates if run multiple times
    await db.delete(products);

    await db.insert(products).values(dummyProducts);
    console.log('Products seeded successfully!');
    return { success: true, message: 'Products seeded successfully!' };
  } catch (error) {
    console.error('Error seeding products:', error);
    return { success: false, message: 'Failed to seed products.' };
  }
}