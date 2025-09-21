'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServer';

interface Order {
  id: string;
  status: string;
  created_at: string;
  // Add other order properties as needed
}

export async function cancelExpiredOrders() {
  try {
    const supabase = createSupabaseServerClient();
    
    // Get orders that are older than 10 minutes and still in 'pending' status
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: expiredOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', tenMinutesAgo);

    if (error) {
      console.error('Error fetching expired orders:', error);
      return { error: error.message };
    }

    // Update status of expired orders to 'cancelled'
    if (expiredOrders && expiredOrders.length > 0) {
      const orderIds = expiredOrders.map((order: Order) => order.id);
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
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
