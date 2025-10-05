import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClientComponent } from '@/lib/supabase/server';
import { sendOrderConfirmation } from '@/lib/email-actions';
import { createClient } from '@supabase/supabase-js';
import { notifyAdminNewOrder } from '@/lib/whatsapp';
import { Tables } from '@/types/supabase'; // Import Tables for base types

// Define types for the specific query result
type ProductDetailsForNotification = Pick<Tables<'products'>, 'name' | 'image'>;

type OrderItemDetailsForNotification = Pick<Tables<'order_items'>, 'product_name'> & {
  products: ProductDetailsForNotification[] | null; // This is the crucial part: it's an array
};

type OrderDetailsForNotification = Pick<Tables<'orders'>, 'total' | 'user_id'> & {
  order_items: OrderItemDetailsForNotification[];
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClientComponent();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, wallet_balance')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { orderId, clientId, amount } = await request.json();

    // Check wallet balance
    if ((profile.wallet_balance || 0) < amount) { // Added nullish coalescing operator
      return NextResponse.json(
        { error: 'Insufficient wallet balance' }, 
        { status: 400 }
      );
    }

    // Process wallet payment directly
    const newBalance = (profile.wallet_balance || 0) - amount;
    
    // Update admin's wallet balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', user.id);

    if (balanceError) {
      console.error('Error updating wallet balance:', balanceError);
      throw balanceError;
    }

    // Update order status to completed
    const { error: orderStatusError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_gateway: 'admin_wallet',
        payment_id: `admin_wallet_${Date.now()}`
      })
      .eq('id', orderId);

    if (orderStatusError) {
      console.error('Error updating order status:', orderStatusError);
      throw orderStatusError;
    }

    // Get order details for notifications
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('total, user_id, order_items(product_name, products(name, image))')
      .eq('id', orderId)
      .single() as { data: OrderDetailsForNotification | null, error: any }; // Explicitly cast here
      
    // Send WhatsApp notification to admin
    try {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_name, quantity, line_total')
        .eq('order_id', orderId);

      const itemsList = orderItems
        ?.map(item => `- ${item.product_name} (x${item.quantity}) - $${(item.line_total || 0).toFixed(2)}`)
        .join('\n') || 'No items';

      const purchaseType = clientId ? 'Admin purchase for client' : 'Admin personal purchase';

      const message = `${purchaseType}\n\nOrder ID: ${orderId}\nPaid by: Admin (Wallet)\nAmount: $${amount.toFixed(2)}\n\nItems:\n${itemsList}`;

      const authString = Buffer.from(
        `${process.env.VONAGE_API_KEY}:${process.env.VONAGE_API_SECRET}`
      ).toString('base64');

      const whatsappResponse = await fetch('https://api.nexmo.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.VONAGE_WHATSAPP_NUMBER,
          to: process.env.VONAGE_ADMIN_WHATSAPP,
          message_type: 'text',
          text: message,
          channel: 'whatsapp'
        })
      });

      if (!whatsappResponse.ok) {
        console.error('WhatsApp notification failed:', await whatsappResponse.text());
      }
    } catch (whatsappError) {
      console.error('WhatsApp notification error:', whatsappError);
    }

    if (orderError) {
      console.error('Error fetching order details for notifications:', orderError);
      // Continue without notifications rather than failing the payment
    } else if (order) { // Only proceed if order is not null
      // Get client's email for notifications
      let clientEmail = user.email!; // Default to admin email
      if (clientId && clientId !== user.id) {
        try {
          const { data: clientProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', clientId)
            .single();
          
          if (clientProfile) {
            // Get the client's auth email
            const supabaseAdmin = createClient(
              (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            
            const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(clientId);
            if (authUser?.user?.email) {
              clientEmail = authUser.user.email;
            }
          }
        } catch (clientError) {
          console.error('Error fetching client email:', clientError);
        }
      }

      // Send email confirmation to client
      try {
        await sendOrderConfirmation({ orderId, userEmail: clientEmail });
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }

      // Send Discord notification for new order
      try {
        const supabaseAdmin = createClient(
          (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        // Determine the product image/name for the notification (use first available)
        const firstProductImage = order.order_items.find(item => item.products?.[0]?.image)?.products?.[0]?.image || null;
        const firstProductName = (order.order_items.find(item => item.product_name)?.product_name)
          || (order.order_items.find(item => item.products?.[0]?.name)?.products?.[0]?.name)
          || null;

        await supabaseAdmin.functions.invoke('discord-order-notification', {
          body: {
            notificationType: 'new_order',
            orderId: orderId,
            cartTotal: order.total,
            userEmail: clientEmail,
            productImage: firstProductImage
          }
        });
      } catch (discordError) {
        console.error("Discord notification for new order failed:", discordError);
      }

      // WhatsApp admin notification
      try {
        let customerName: string | undefined;
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .maybeSingle();
          if (profile) {
            const fn = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
            if (fn) customerName = fn;
          }
        } catch (_) { /* ignore */ }

        await notifyAdminNewOrder({
          orderId: orderId,
          total: order.total,
          userEmail: clientEmail,
          channel: 'admin_wallet',
          customerName: customerName ?? ((user as any)?.user_metadata?.full_name as string | undefined) ?? clientEmail ?? undefined,
        });
      } catch (whatsappError) {
        console.error("WhatsApp notification failed:", whatsappError);
      }
    }

    return NextResponse.json({ 
      success: true,
      newBalance,
      message: 'Payment completed successfully'
    });
  } catch (error) {
    console.error('Wallet payment error:', error);
    return NextResponse.json(
      { error: 'Payment failed' },
      { status: 500 }
    );
  }
}