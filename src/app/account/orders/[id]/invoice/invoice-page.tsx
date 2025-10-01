"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Database, Json } from "@/types/supabase-fixed"; // Import Json

type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  product_name: string;
  price_at_purchase: number; // Changed from price
  sku: string | null;
  line_total: number | null;
};

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  vat_number: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_province_region: string | null;
  postal_code: string | null;
  country: string | null;
};

type Order = Database['public']['Tables']['orders']['Row'] & {
  status: string; // Changed from payment_status
  payment_id: string | null; // Changed from payment_intent_id
  amounts: Json | null; // Added amounts
  order_items: OrderItem[];
  profiles: Profile[] | null;
};

export default function InvoicePage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();
  const params = useParams();
  const router = useRouter();
  
  // Calculate amounts
  const amounts = (order?.amounts || { subtotal: '0.00', discount: '0.00', tax: '0.00', total: '0.00', currency: 'USD' }) as { subtotal: string, discount: string, tax: string, total: string, currency: string };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id, 
            created_at, 
            total, 
            status, 
            payment_id, 
            amounts,
            order_items (
              id, 
              product_id, 
              quantity, 
              price_at_purchase, 
              product_name, 
              sku, 
              line_total
            ),
            profiles (
              first_name, 
              last_name, 
              company_name, 
              vat_number, 
              address_line_1, 
              address_line_2, 
              city, 
              state_province_region, 
              postal_code, 
              country
            )
          `)
          .eq('id', params.id as string)
          .single();

        if (error) throw error;
        setOrder(data as unknown as Order);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-destructive">{error || "Invoice not found"}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const profile = order.profiles?.[0];

  return (
    <div className="container mx-auto p-4 py-8 print:p-0 bg-background">
      <div className="max-w-3xl mx-auto bg-card shadow-lg rounded-lg overflow-hidden print:shadow-none print:border-none">
        <div className="p-8 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/panda.png" 
                    alt="Dropskey Logo" 
                    fill 
                    sizes="32px" 
                    style={{ objectFit: "contain" }} 
                    unoptimized={true}
                  />
                </div>
                <h1 className="text-3xl font-bold" style={{ color: "#1e73be" }}>Dropskey</h1>
              </div>
              <p className="text-sm text-muted-foreground">Verified Digital Key Store</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-foreground">INVOICE</h2>
              <p className="text-sm text-muted-foreground">Invoice ID: {order.id.substring(0, 8)}</p>
              <p className="text-sm text-muted-foreground">Date: {format(new Date(order.created_at), 'PPP')}</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Billed To:</h3>
            {profile ? (
              <address className="not-italic text-muted-foreground">
                <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                {profile.company_name && <p>{profile.company_name}</p>}
                <p>{profile.address_line_1}</p>
                {profile.address_line_2 && <p>{profile.address_line_2}</p>}
                <p>{profile.city}, {profile.state_province_region} {profile.postal_code}</p>
                <p>{profile.country}</p>
                {profile.vat_number && <p>VAT: {profile.vat_number}</p>}
              </address>
            ) : (
              <p className="text-muted-foreground">Customer details not available.</p>
            )}
          </div>
          <div className="text-right md:text-left">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Payment Details:</h3>
            <p className="text-muted-foreground">
              <strong>Method:</strong> {order.payment_id ? 'Stripe' : 'N/A'}
            </p>
            {order.payment_id && (
              <p className="text-muted-foreground">
                <strong>Transaction ID:</strong> {order.payment_id}
              </p>
            )}
            <p className="text-muted-foreground">
              <strong>Status:</strong>{' '}
              <span className="font-medium capitalize">{order.status}</span>
            </p>
          </div>
        </div>

        <div className="p-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-foreground">Item</th>
                <th className="py-2 text-right text-foreground">Qty</th>
                <th className="py-2 text-right text-foreground">Unit Price</th>
                <th className="py-2 text-right text-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="py-3 text-muted-foreground">
                    {item.product_name || `Product ${item.product_id}`}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-muted-foreground">${item.price_at_purchase.toFixed(2)}</td>
                  <td className="py-3 text-right text-muted-foreground">
                    {item.line_total ? `$${item.line_total.toFixed(2)}` : `$${(item.price_at_purchase * item.quantity).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-3 text-right font-semibold text-foreground">
                  Subtotal:
                </td>
                <td className="py-3 text-right font-semibold text-foreground">
                  ${parseFloat(amounts.subtotal).toFixed(2)}
                </td>
              </tr>
              {parseFloat(amounts.discount) > 0 && (
                <tr>
                  <td colSpan={3} className="py-3 text-right font-semibold text-green-600">
                    Discount:
                  </td>
                  <td className="py-3 text-right font-semibold text-green-600">
                    -${parseFloat(amounts.discount).toFixed(2)}
                  </td>
                </tr>
              )}
              {parseFloat(amounts.tax) > 0 && (
                <tr>
                  <td colSpan={3} className="py-3 text-right font-semibold text-foreground">
                    Tax:
                  </td>
                  <td className="py-3 text-right font-semibold text-foreground">
                    ${parseFloat(amounts.tax).toFixed(2)}
                  </td>
                </tr>
              )}
              <tr className="bg-muted">
                <td colSpan={3} className="py-4 text-right text-xl font-bold text-foreground">
                  TOTAL:
                </td>
                <td className="py-4 text-right text-xl font-bold text-foreground">
                  ${parseFloat(amounts.total).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-8 bg-muted text-center text-muted-foreground text-sm">
          <p>Thank you for your business!</p>
          <p>If you have any questions, please contact us at support@dropskey.com</p>
          <p className="mt-4">Dropskey | +1 (310) 777 8808 | +1 (310) 888 7708</p>
        </div>
      </div>
    </div>
  );
}