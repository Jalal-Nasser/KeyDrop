import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import Image from "next/image"
import { InvoiceActions } from "@/components/invoice-actions"
import { Suspense } from "react"
import { AutoPrinter } from "@/components/auto-printer"

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  payment_gateway: string | null;
  payment_id: string | null;
  order_items: OrderItem[];
  profiles: {
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
  }[] | null;
}

interface OrderItem {
  id: string;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  products: {
    name: string;
  }[] | null; // Changed to array of objects
}

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, created_at, total, status, payment_gateway, payment_id,
      order_items (id, product_id, quantity, price_at_purchase, products (name)),
      profiles (first_name, last_name, company_name, vat_number, address_line_1, address_line_2, city, state_province_region, postal_code, country)
    `)
    .eq('id', params.id)
    .single()

  if (error || !order) {
    console.error("Error fetching invoice details:", error)
    notFound()
  }

  const processingFee = order.total * 0.15;
  const finalTotal = order.total + processingFee;

  const profile = order.profiles?.[0];

  return (
    <div className="container mx-auto p-4 py-8 print:p-0">
      <Suspense fallback={null}>
        <AutoPrinter />
      </Suspense>
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:border-none">
        <div className="p-8 border-b border-gray-200">
          <InvoiceActions />
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 relative">
                  <Image src="/panda.png" alt="Dropskey Logo" fill sizes="32px" style={{ objectFit: "contain" }} />
                </div>
                <h1 className="text-3xl font-bold" style={{ color: "#1e73be" }}>Dropskey</h1>
              </div>
              <p className="text-sm text-gray-600">Verified Digital Key Store</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
              <p className="text-sm text-gray-600">Invoice ID: {order.id.substring(0, 8)}</p>
              <p className="text-sm text-gray-600">Date: {format(new Date(order.created_at), 'PPP')}</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Billed To:</h3>
            {profile ? (
              <address className="not-italic text-gray-700">
                <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                {profile.company_name && <p>{profile.company_name}</p>}
                <p>{profile.address_line_1}</p>
                {profile.address_line_2 && <p>{profile.address_line_2}</p>}
                <p>{profile.city}, {profile.state_province_region} {profile.postal_code}</p>
                <p>{profile.country}</p>
                {profile.vat_number && <p>VAT: {profile.vat_number}</p>}
              </address>
            ) : (
              <p className="text-gray-700">Customer details not available.</p>
            )}
          </div>
          <div className="text-right md:text-left">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Payment Details:</h3>
            <p className="text-gray-700"><strong>Method:</strong> {order.payment_gateway || 'N/A'}</p>
            {order.payment_id && <p className="text-gray-700"><strong>Transaction ID:</strong> {order.payment_id}</p>}
            <p className="text-gray-700"><strong>Status:</strong> <span className="font-medium capitalize">{order.status}</span></p>
          </div>
        </div>

        <div className="p-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2 text-gray-800">Item</th>
                <th className="py-2 text-right text-gray-800">Qty</th>
                <th className="py-2 text-right text-gray-800">Unit Price</th>
                <th className="py-2 text-right text-gray-800">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-gray-700">{item.products?.[0]?.name || `Product ${item.product_id}`}</td>
                  <td className="py-3 text-right text-gray-700">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-700">${item.price_at_purchase.toFixed(2)}</td>
                  <td className="py-3 text-right text-gray-700">${(item.quantity * item.price_at_purchase).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-300">
                <td colSpan={3} className="py-3 text-right font-semibold text-gray-800">Subtotal:</td>
                <td className="py-3 text-right font-semibold text-gray-800">${order.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="py-3 text-right font-semibold text-gray-800">Processing Fee (15%):</td>
                <td className="py-3 text-right font-semibold text-gray-800">${processingFee.toFixed(2)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td colSpan={3} className="py-4 text-right text-xl font-bold text-gray-900">TOTAL:</td>
                <td className="py-4 text-right text-xl font-bold text-gray-900">${finalTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-8 bg-gray-50 text-center text-gray-600 text-sm">
          <p>Thank you for your business!</p>
          <p>If you have any questions, please contact us at support@dropskey.com</p>
          <p className="mt-4">Dropskey | +1 (310) 777 8808 | +1 (310) 888 7708</p>
        </div>
      </div>
    </div>
  )
}