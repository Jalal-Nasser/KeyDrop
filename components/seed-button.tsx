'use client';

import { seedProducts } from '@/app/actions/seed-actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SeedProductsButton() {
  const handleSeed = async () => {
    const result = await seedProducts();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Button onClick={handleSeed}>Seed Products</Button>
  );
}