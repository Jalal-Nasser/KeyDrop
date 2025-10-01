import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server'; // Updated import
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const supabase = await createServerClient(); // Await the client

  // Check if user is authenticated and is admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden: Not an admin' }, { status: 403 });
  }

  try {
    const formData = await req.json();
    const { error } = await supabase.from('products').insert([formData]);

    if (error) {
      console.error("Error creating product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // These revalidatePath calls are for server-rendered deployments,
    // for static export, a full re-deployment is needed for changes to appear.
    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}