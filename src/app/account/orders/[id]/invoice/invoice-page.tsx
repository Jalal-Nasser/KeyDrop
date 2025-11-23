"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Database, Json } from "@/types/supabase-fixed"; // Import Json
import { useSession } from "@/context/session-context"; // Import useSession

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
  status: string;
  payment_id: string | null;
  payment_gateway?: string | null; // include gateway for display logic
  amounts: Json | null;
  order_items: OrderItem[];
  profiles: Profile[] | null;
};

export default function InvoicePage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSession(); // Get supabase from context
  const params = useParams();
  const router = useRouter();
  
  // Process amounts
  const getAmount = (value: any, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return defaultValue;
  };

  // Type the amounts object
  type OrderAmounts = {
    subtotal?: string | number;
    discount?: string | number;
    tax?: string | number;
    currency?: string;
    [key: string]: any;
  };

  // Safely get the amounts object with proper typing
  const orderAmounts = (order?.amounts as OrderAmounts) || {};
  
  // Calculate amounts with proper fallbacks
  const amounts = {
    // Assume provided subtotal is pre-tax; fallback to order.total only if subtotal missing
    subtotal: getAmount(orderAmounts.subtotal ?? order?.total ?? 0),
    discount: getAmount(orderAmounts.discount ?? 0),
    tax: getAmount(orderAmounts.tax ?? 0),
    currency: orderAmounts.currency || 'USD'
  };

  // We will compute a reliable item subtotal after data loads; initialize placeholders.
  const [itemSubtotal, setItemSubtotal] = useState<number>(0);
  const taxRateFallback = 0.15;
  const [derivedTax, setDerivedTax] = useState<number>(0);
  const [derivedTotal, setDerivedTotal] = useState<number>(0);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!supabase) {
        setError("Supabase client not initialized.");
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id, 
            created_at, 
            total, 
            status, 
            payment_id, 
            payment_gateway,
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
        const typedOrder = data as unknown as Order;
        setOrder(typedOrder);
        // Compute item subtotal directly from line items to avoid double counting fees.
        if (typedOrder?.order_items) {
          const sum = typedOrder.order_items.reduce((acc, item) => {
            const unit = typeof item.price_at_purchase === 'number' ? item.price_at_purchase : parseFloat(String(item.price_at_purchase) || '0');
            const qty = item.quantity || 1;
            const line = item.line_total != null ? (typeof item.line_total === 'number' ? item.line_total : parseFloat(String(item.line_total) || '0')) : unit * qty;
            return acc + line;
          }, 0);
          setItemSubtotal(sum);
          // Decide tax: priority: amounts.tax >0 -> use; else order.total - sum if positive -> treat as tax; else compute fallback rate.
          const providedTax = getAmount((typedOrder.amounts as any)?.tax, 0);
          let taxValue = 0;
          if (providedTax > 0) {
            taxValue = providedTax;
          } else if (typedOrder.total && typedOrder.total > sum) {
            taxValue = typedOrder.total - sum; // difference represents fee/tax included in stored total
          } else {
            taxValue = sum * taxRateFallback;
          }
          setDerivedTax(taxValue);
          setDerivedTotal(sum + taxValue);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id, supabase]); // Add supabase to dependencies

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
              <strong>Method:</strong>{' '}
              {(() => {
                const gateway = order.payment_gateway?.toLowerCase();
                switch (gateway) {
                  case 'admin_wallet':
                    return 'Admin Wallet';
                  case 'paypal':
                    return 'PayPal';
                  case 'stripe':
                    return 'Stripe';
                  case 'manual':
                    return 'Manual';
                  default:
                    return gateway ? gateway.charAt(0).toUpperCase() + gateway.slice(1) : 'N/A';
                }
              })()}
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
              {Array.isArray(order.order_items) && order.order_items.map((item) => {
                const unitPrice = typeof item.price_at_purchase === 'number' 
                  ? item.price_at_purchase 
                  : typeof item.price_at_purchase === 'string' 
                    ? parseFloat(item.price_at_purchase) 
                    : 0;
                
                const quantity = item.quantity || 1;
                const lineTotal = item.line_total 
                  ? (typeof item.line_total === 'string' ? parseFloat(item.line_total) : item.line_total)
                  : unitPrice * quantity;
                
                return (
                  <tr key={item.id} className="border-b border-border">
                    <td className="py-3 text-muted-foreground">
                      {item.product_name || `Product ${item.product_id || 'N/A'}`}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {quantity}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      ${unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      ${lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-3 text-right font-semibold text-foreground">
                  Subtotal:
                </td>
                <td className="py-3 text-right font-semibold text-foreground">
                  ${itemSubtotal.toFixed(2)}
                </td>
              </tr>
              {amounts.discount > 0 && (
                <tr>
                  <td colSpan={3} className="py-3 text-right font-semibold text-green-600">
                    Discount:
                  </td>
                  <td className="py-3 text-right font-semibold text-green-600">
                    -${amounts.discount.toFixed(2)}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="py-2 text-right font-semibold text-foreground">
                  {(amounts.tax && amounts.tax > 0) ? 'Tax:' : 'Tax (15% fallback):'}
                </td>
                <td className="py-2 text-right font-semibold text-foreground">
                  ${derivedTax.toFixed(2)}
                </td>
              </tr>
              <tr className="bg-muted">
                <td colSpan={3} className="py-4 text-right text-xl font-bold text-foreground">
                  TOTAL:
                </td>
                <td className="py-4 text-right text-xl font-bold text-foreground">
                  ${derivedTotal.toFixed(2)}
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