'use server'

import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { revalidatePath } from "next/cache"
import { sendOrderStatusUpdate, sendOrderConfirmation, sendProductDelivery } from "@/lib/email-actions"
import { createClient } from '@supabase/supabase-js'
import { Json } from "@/types/supabase"
import { Database } from "@/types/supabase" // Import Database type

// Define a type for the expected structure of updatedItem
interface UpdatedOrderItemResult {
  order_id: string;
  product_name: string | null;
  products: { name: string, image: string | null }[] | null;
  orders: { user_id: string; total: number; profiles: { first_name: string | null } | null } | null;
}

export async function fulfillOrderItem(orderItemId: string, productKey: string) {
  const supabase = createSupabaseServerClient()
  
  const supabaseAdmin = createClient<Database>( // Explicitly type createClient
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Update the order item with the product key
    const { data: updatedItem, error: itemUpdateError } = await supabase
      .from('order_items')
      .update({ product_key: productKey })
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

    // 2. Send the delivery email
    if (!orders.user_id) throw new Error('Order user ID is null.');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(orders.user_id)
    
    if (userError || !user || !user.email) {
      throw new Error(`Could not get user email: ${userError?.message || 'No email found'}`)
    }

    await sendProductDelivery({
      userEmail: user.email,
      firstName: orders.profiles.first_name || 'Valued Customer',
      orderId: order_id,
      productName: product_name || products?.[0]?.name || 'Unknown Product',
      productKey: productKey,
    })

    // 3. Check if all items in the order are fulfilled
    const { data: allItems, error: allItemsError } = await supabase
      .from('order_items')
      .select('product_key, products (image)')
      .eq('order_id', order_id)

    if (allItemsError) throw new Error(`Could not check order status: ${allItemsError.message}`)

    const allFulfilled = allItems.every(item => item.product_key !== null)

    // 4. If all fulfilled, update order status to 'completed'
    if (allFulfilled) {
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ status: 'completed' }) // Corrected column name to 'status'
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
          userEmail: user.email,
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
  const supabase = createSupabaseServerClient()

  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(`user_id, total, order_items (product_name, products (image))`)
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      throw new Error(`Failed to fetch order for status update: ${fetchError?.message}`)
    }

    const supabaseAdmin = createClient<Database>( // Explicitly type createClient
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    if (!order.user_id) throw new Error('Order user ID is null.');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.user_id)

    if (userError || !user || !user.email) {
      throw new Error(`Failed to fetch user email for user ${order.user_id}: ${userError?.message}`)
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', order.user_id)
      .single();

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status }) // Corrected column name to 'status'
      .eq('id', orderId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    await sendOrderStatusUpdate({ 
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
  const supabaseAdmin = createClient<Database>( // Explicitly type createClient
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

    if (!order.user_id) throw new Error('Order user ID is null.');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.user_id)

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