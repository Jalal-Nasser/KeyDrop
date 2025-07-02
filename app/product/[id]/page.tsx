import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Star, CheckCircle } from 'lucide-react';
import products from '@/data/products.json';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// This function can be used by Next.js to generate static pages for each product at build time.
export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id.toString() === params.id);

  if (!product) {
    notFound();
  }

  const primaryImage = Array.isArray(product.image) ? product.image[1] : product.image;

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Gallery */}
          <div>
            <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden mb-4 border">
              <Image
                src={primaryImage || '/placeholder.jpg'}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-contain"
              />
            </div>
            {/* Future thumbnail images could go here */}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <a href="#" className="ml-3 text-sm font-medium text-blue-600 hover:text-blue-500">12 Reviews</a>
            </div>

            <p className="text-3xl font-semibold text-blue-600 mb-6">{product.price}</p>

            <div
              className="text-gray-700 space-y-4 mb-6 prose"
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
            />

            <Separator className="my-6" />

            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">In Stock</span>
              <Badge variant="secondary" className="ml-auto">Digital Product</Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <Button variant="ghost" size="icon" className="h-12 w-12 text-lg">-</Button>
                <span className="w-16 text-center font-medium text-lg">1</span>
                <Button variant="ghost" size="icon" className="h-12 w-12 text-lg">+</Button>
              </div>
              <Button size="lg" className="flex-1 h-12 text-base" style={{ backgroundColor: "#1e73be" }}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}