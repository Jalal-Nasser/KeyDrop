import { NextResponse } from 'next/server';
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase-fixed";

export async function POST(req: Request) {
  const requestId = `req_${Date.now()}`;
  
  try {
    
    // Create a Supabase client with the request cookies
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          },
        },
      }
    );
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error(`[${requestId}] Authentication error:`, authError?.message || 'No user found');
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to complete your purchase' }, 
        { status: 401 }
      );
    }

    console.log(`[${requestId}] Authenticated user:`, {
      userId: user.id,
      email: user.email,
      isAuthenticated: !!user.id,
    });

    // Parse the request body
    let body;
    try {
      body = await req.json();
      console.log(`[${requestId}] Request body:`, {
        ...body,
        cartItems: body.cartItems?.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          name: item.name?.substring(0, 30) + (item.name?.length > 30 ? '...' : '')
        }))
      });
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { cartItems, cartTotal, targetUserId, planId } = body;

    // Validate required fields
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    if (typeof cartTotal !== 'number' || cartTotal <= 0) {
      return NextResponse.json(
        { error: 'Invalid cart total' },
        { status: 400 }
      );
    }

    // Verify the target user exists and is accessible
    if (targetUserId !== user.id) {
      // In a real app, you might want to check permissions here
      console.warn(`[${requestId}] User ${user.id} attempted to create order for different user ${targetUserId}`);
    }

    // --- Start Order Creation Logic ---
    console.log(`[${requestId}] Creating order for user ${user.id}`, {
      itemCount: cartItems.length,
      cartTotal,
      planId: planId || 'N/A',
    });

    try {
      // In a real implementation, you would integrate with PayPal's API here
      // For now, we'll simulate a successful order creation
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock order ID - in a real app, this would come from PayPal
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      console.log(`[${requestId}] Successfully created order ${orderId}`);
      
      return NextResponse.json({
        id: orderId,
        success: true,
        message: 'Order created successfully',
        timestamp: new Date().toISOString(),
      });
      
    } catch (error: any) {
      console.error(`[${requestId}] Order creation failed:`, error);
      return NextResponse.json(
        { 
          error: 'Failed to create order',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    // Catch any unexpected errors
    console.error(`[${requestId}] Unexpected error in create-order:`, error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      },
      { status: 500 }
    );
  }
}