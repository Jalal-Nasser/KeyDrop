import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, price, sale_price, is_on_sale, image');

    if (error) throw error;

    // Generate CSV format for Facebook
    const csvRows = products.map(product => {
      const price = product.is_on_sale && product.sale_price 
        ? product.sale_price 
        : product.price;
      
      const imageUrl = product.image?.startsWith('http') 
        ? product.image 
        : `https://dropskey.vercel.app${product.image}`;

      return [
        product.id,
        `"${product.name}"`,
        `"${product.description || product.name}"`,
        'in stock',
        'new',
        `${price} USD`,
        `https://dropskey.vercel.app/shop/${product.id}`,
        imageUrl,
        'Dropskey',
        'Software'
      ].join(',');
    });

    const csv = [
      'id,title,description,availability,condition,price,link,image_link,brand,google_product_category',
      ...csvRows
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error: any) {
    console.error('Product feed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
