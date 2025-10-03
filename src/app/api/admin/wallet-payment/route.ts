import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClientComponent } from '@/lib/supabase/server';

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

    // Start a database transaction
    const { data: orderData, error: orderError } = await supabase.rpc('process_wallet_payment', {
      p_order_id: orderId,
      p_admin_id: user.id,
      p_client_id: clientId || null,
      p_amount: amount,
      p_current_balance: profile.wallet_balance || 0 // Added nullish coalescing operator
    });

    if (orderError) {
      console.error('Wallet payment transaction error:', orderError);
      throw orderError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wallet payment error:', error);
    return NextResponse.json(
      { error: 'Payment failed' },
      { status: 500 }
    );
  }
}