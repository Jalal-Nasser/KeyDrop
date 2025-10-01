'use server';

import { createServerClient } from '@/lib/supabase/server'; // Updated import

import type { Database } from '@/types/supabase';

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items?: Array<Database['public']['Tables']['order_items']['Row']>;
}

export async function cancelExpiredOrders() {
  try {
    const supabase = await createServerClient(); // Await the client
    
    // Get orders that are older than 10 minutes and still in 'pending' status
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: expiredOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending') // Changed payment_status to status
      .lt('created_at', tenMinutesAgo);

    if (error) {
      console.error('Error fetching expired orders:', error);
      return { error: error.message };
    }

    // Update status of expired orders to 'cancelled'
    if (expiredOrders && expiredOrders.length > 0) {
      const orderIds = expiredOrders.map((order) => order.id);
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' }) // Changed payment_status to status
        .in('id', orderIds);
        
      if (updateError) {
        console.error('Error cancelling expired orders:', updateError);
        return { error: updateError.message };
      }
      
      console.log(`Cancelled ${orderIds.length} expired orders`);
      return { success: true, count: orderIds.length };
    }
    
    return { success: true, count: 0 };
  } catch (error) {
    console.error('Unexpected error in cancelExpiredOrders:', error);
    return { error: 'An unexpected error occurred' };
  }
}