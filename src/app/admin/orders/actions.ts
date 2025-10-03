'use server'

import { createSupabaseServerClientComponent } from "@/lib/supabase/server" // Updated import
import { revalidatePath } from "next/cache"
import { sendOrderStatusUpdate as sendOrderStatusUpdateEmail, sendOrderConfirmation, sendProductDelivery } from "@/lib/email-actions" // Renamed to avoid conflict
import { createClient } from '@supabase/supabase-js'
import { Json, Tables, TablesInsert, TablesUpdate } from "@/types/supabase"

// Define types that match the Supabase query result structure
type OrderItemRow = Tables<'order_items'>;
type OrderItemInsert = TablesInsert<'order_items'>;
type OrderItemUpdate = TablesUpdate<'order_items'>;
type OrderRow = Tables<'orders'>;
type OrderUpdate = TablesUpdate<'orders'>;
type ProfileRow = Tables<'profiles'>;
type ProductRow = Tables<'products'>;

interface UpdatedOrderItemResult {
  order_id: string;
  product_name: string | null;
  products: Pick<ProductRow, 'name' | 'image'>[] | null;
  orders: Pick<OrderRow, 'user_id' | 'total'> & { profiles: Pick<ProfileRow, 'first_name'> | null } | null;
}

export async function fulfillOrderItem(orderItemId: string, productKey: string) {
  const supabase = await createSupabaseServerClientComponent() // Await the client
  
  // Debug environment variables
  console.log('Debug Environment Variables:')
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing')
  console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `Present (length: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length})` : 'Missing')
  
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Update the order item with the product key
    const { data: updatedItem, error: itemUpdateError } = await supabase
      .from('order_items')
      .update({ product_key: productKey }) // Removed explicit cast, now types should align
      .eq('id', orderItemId)
      .select(`
        order_id,
        product_name,
        products (name, image),
        orders ( user_id, total, profiles (first_name) )
      `)
      .maybeSingle() as { data: UpdatedOrderItemResult | null, error: any };

    if (itemUpdateError) throw new Error(`Failed to update order item: ${itemUpdateError?.message}`)
    if (!updatedItem) throw new Error('Order item not found or could not be updated.');

    const { order_id, product_name, products, orders } = updatedItem;
    if (!orders || !orders.profiles) throw new Error('Could not retrieve full order details.');

    // 2. Get user email from Supabase auth
    console.log('Getting user by ID:', orders.user_id);
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(orders.user_id as string) // Cast to string
    console.log('User fetch result:', { user: user ? 'Found' : 'Not found', error: userError?.message });
    
    if (userError || !user?.email) {
      throw new Error(`Could not get user email: ${userError?.message || 'No email found'}`)
    }
    
    const userEmail = user.email;

    await sendProductDelivery({
      userEmail: userEmail,
      firstName: orders.profiles.first_name || 'Valued Customer',
      orderId: order_id,
      productName: product_name || products?.[0]?.name || 'Unknown Product',
      productKey: productKey,
    })

    // 3. Check if all items in the order are fulfilled
    const { data: allItems, error: allItemsError } = await supabase
      .from('order_items')
      .select('product_key, products (image)')
      .eq('order_id', order_id) as { data: (Pick<OrderItemRow, 'product_key'> & { products: Pick<ProductRow, 'image'>[] | null })[] | null, error: any }; // Explicitly type allItems

    if (allItemsError) throw new Error(`Could not check order status: ${allItemsError.message}`)
    if (!allItems) throw new Error('No order items found for status check.');

    const allFulfilled = allItems.every(item => item.product_key !== null)

    // 4. If all fulfilled, update order status to 'completed'
    if (allFulfilled) {
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ status: 'completed' }) // Removed explicit cast, now types should align
        .eq('id', order_id)

      if (orderUpdateError) throw new Error(`Failed to update order status: ${orderUpdateError.message}`)
      
      // Determine the product image for the notification (use first available)
      const firstProductImage = allItems.find(item => item.products?.[0]?.image)?.products?.[0]?.image || null;
      
      // Send Discord notification for completed order
      await supabaseAdmin.functions.invoke('discord-order-notification', {
        body: {
          notificationType: 'order_completed',
          orderId: order_id,
          cartTotal: orders.total,
          userEmail: userEmail,
          productImage: firstProductImage
        }
      }).catch(err => console.error("Discord notification for completed order failed:", err));
    }

    revalidatePath('/admin/orders')
    return { success: true, message: 'Product key delivered successfully!' }

  } catch (error: any) {
    return { success: false, message: `Fulfillment failed: ${error.message}` }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createSupabaseServerClientComponent() // Await the client

  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(`user_id, total, order_items (product_name, products (image))`)
      .eq('id', orderId)
      .single() as { data: (Pick<OrderRow, 'user_id' | 'total'> & { order_items: (Pick<OrderItemRow, 'product_name'> & { products: Pick<ProductRow, 'image'>[] | null })[] }) | null, error: any };

    if (fetchError || !order) {
      throw new Error(`Failed to fetch order for status update: ${fetchError?.message}`)
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.user_id as string) // Cast to string

    if (userError || !user || !user.email) {
      throw new Error(`Failed to fetch user email for user ${order.user_id}: ${userError?.message}`)
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', order.user_id as string) // Cast to string
      .single();

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status }) // Removed explicit cast, now types should align
      .eq('id', orderId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    await sendOrderStatusUpdateEmail({ // Use renamed function
      orderId, 
      userEmail: user.email, 
      status, 
      firstName: profile?.first_name || 'Valued Customer' 
    });

    // Send Discord notification for status changes
    if (status === 'cancelled') {
      // Determine the product image for the notification (use first available)
      const firstProductImage = order.order_items.find(item => item.products?.[0]?.image)?.products?.[0]?.image || null;

      await supabaseAdmin.functions.invoke('discord-order-notification', {
        body: {
          notificationType: 'order_cancelled',
          orderId: orderId,
          cartTotal: order.total,
          userEmail: user.email,
          productImage: firstProductImage
        }
      }).catch(err => console.error("Discord notification for cancelled order failed:", err));
    } else if (status === 'received') {
      // Determine the product image for the notification (use first available)
      const firstProductImage = order.order_items.find(item => item.products?.[0]?.image)?.products?.[0]?.image || null;

      await supabaseAdmin.functions.invoke('discord-order-notification', {
        body: {
          notificationType: 'order_received',
          orderId: orderId,
          cartTotal: order.total,
          userEmail: user.email,
          productImage: firstProductImage
        }
      }).catch(err => console.error("Discord notification for received order failed:", err));
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/account/orders/${orderId}`)
    revalidatePath(`/account/orders/${orderId}/invoice`)

    return { success: true, message: 'Order status updated successfully.' }
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to update order status: ${error.message}`
    }
  }
}

export async function reSendInvoice(orderId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { data: order, error: orderFetchError } = await supabaseAdmin
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single()

    if (orderFetchError || !order) {
      throw new Error(`Failed to fetch order details for re-sending invoice: ${orderFetchError?.message}`)
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.user_id as string) // Cast to string

    if (userError || !user || !user.email) {
      throw new Error(`Failed to fetch user email for user ${order.user_id}: ${userError?.message}`)
    }

    const { success, message } = await sendOrderConfirmation({ orderId, userEmail: user.email })

    if (!success) {
      throw new Error(message || 'Failed to send order confirmation email.')
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/account/orders/${orderId}`)
    revalidatePath(`/account/orders/${orderId}/invoice`)

    return { success: true, message: 'Invoice re-sent successfully.' }
  } catch (error: any) {
    console.error("Error re-sending invoice:", error.message)
    return {
      success: false,
      message: `Failed to re-send invoice: ${error.message}`
    }
  }
}