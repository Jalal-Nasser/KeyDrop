import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase' // Import Database type
import { sendOrderStatusUpdate as sendOrderStatusUpdateEmail } from '@/lib/email-actions' // Renamed to avoid conflict

export const dynamic = 'force-dynamic'

// Configuration: Auto-cancel orders after 10 minutes of being pending
const AUTO_CANCEL_TIMEOUT_MINUTES = 10

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get current time and calculate cutoff time
    const now = new Date()
    const cutoffTime = new Date(now.getTime() - (AUTO_CANCEL_TIMEOUT_MINUTES * 60 * 1000))
    
    console.log(`Auto-cancelling orders older than ${AUTO_CANCEL_TIMEOUT_MINUTES} minutes (before ${cutoffTime.toISOString()})`)
    
    // Find orders that are pending and older than the timeout
    const { data: pendingOrders, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        total,
        created_at,
        order_items (
          product_name,
          products (image)
        )
      `)
      .eq('status', 'pending') // Corrected column name to 'status'
      .lt('created_at', cutoffTime.toISOString())
    
    if (fetchError) {
      console.error('Error fetching pending orders:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch pending orders' }, { status: 500 })
    }
    
    if (!pendingOrders || pendingOrders.length === 0) {
      console.log('No orders to auto-cancel')
      return NextResponse.json({ 
        message: 'No orders to auto-cancel',
        cancelledCount: 0 
      })
    }
    
    console.log(`Found ${pendingOrders.length} orders to auto-cancel`)
    
    // Update orders to cancelled status
    const orderIds = pendingOrders.map(order => order.id)
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' }) // Corrected column name to 'status'
      .in('id', orderIds)
    
    if (updateError) {
      console.error('Error updating orders to cancelled:', updateError)
      return NextResponse.json({ error: 'Failed to cancel orders' }, { status: 500 })
    }
    
    // Send notifications for each cancelled order
    const supabaseAdmin = createClient<Database>( // Explicitly type createClient
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const notificationPromises = pendingOrders.map(async (order) => {
      try {
        // Get user email
        if (!order.user_id) {
          console.error(`Skipping notification for order ${order.id}: user_id is null.`);
          return;
        }
        const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.user_id)
        
        if (userError || !user || !user.email) {
          console.error(`Failed to fetch user email for order ${order.id}:`, userError)
          return
        }
        
        // Get user profile for first name
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', order.user_id)
          .single()
        
        // Send email notification
        await sendOrderStatusUpdateEmail({ // Use renamed import
          orderId: order.id,
          userEmail: user.email,
          status: 'cancelled',
          firstName: profile?.first_name || 'Valued Customer',
          isAutoCancelled: true
        })
        
        // Determine the product image for the notification (use first available)
        const firstProductImage = order.order_items.find(item => item.products?.[0]?.image)?.products?.[0]?.image || null;

        // Send Discord notification
        await supabaseAdmin.functions.invoke('discord-order-notification', {
          body: {
            orderId: order.id,
            cartTotal: order.total, // Use order.total directly
            orderItems: order.order_items,
            notificationType: 'order_auto_cancelled',
            userEmail: user.email,
            productImage: firstProductImage
          }
        }).catch(err => console.error(`Discord notification for auto-cancelled order ${order.id} failed:`, err))
        
      } catch (error) {
        console.error(`Error processing notification for order ${order.id}:`, error)
      }
    })
    
    // Wait for all notifications to complete (don't fail if notifications fail)
    await Promise.allSettled(notificationPromises)
    
    console.log(`Successfully auto-cancelled ${pendingOrders.length} orders`)
    
    return NextResponse.json({
      message: `Successfully auto-cancelled ${pendingOrders.length} orders`,
      cancelledCount: pendingOrders.length,
      cancelledOrderIds: orderIds
    })
    
  } catch (error) {
    console.error('Auto-cancel orders error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during auto-cancel process' 
    }, { status: 500 })
  }
}

// Helper function to send order status update email (removed as it's now imported from email-actions)
// async function sendOrderStatusUpdate(...) { ... }