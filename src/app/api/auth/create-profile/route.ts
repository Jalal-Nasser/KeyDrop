import { createSupabaseServerClientComponent } from "@/lib/supabase/server" // Updated import
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // First, read the request body as text
    const bodyText = await request.text()
    
    // If body is empty, return error
    if (!bodyText) {
      return new NextResponse(
        JSON.stringify({ error: 'Request body is empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse the JSON body
    let requestBody;
    try {
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new NextResponse(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { userId, email } = requestBody;

    if (!userId || !email) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID and email are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = await createSupabaseServerClientComponent() // Await the client

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return new NextResponse(
        JSON.stringify({ message: 'Profile already exists' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create new profile
    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: email,
          first_name: '',
          last_name: ''
        }
      ])

    if (error) {
      console.error('Error creating profile:', error);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to create profile',
          details: error.message 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: 'Profile created successfully' }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in create-profile API:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}