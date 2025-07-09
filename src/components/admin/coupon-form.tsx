// Add this near the top with other imports
import { useSession } from "@/context/session-context";

export function CouponForm({ coupon }: CouponFormProps) {
  const { supabase } = useSession();
  // ... rest of component
}