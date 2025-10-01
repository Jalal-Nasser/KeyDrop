import { createServerClient } from "@/lib/supabase/server" // Updated import
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID and email are required' }),
        { status: 400 }
      )
    }

    const supabase = await createServerClient() // Await the client

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return new NextResponse(
        JSON.stringify({ message: 'Profile already exists' }),
        { status: 200 }
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
          last_name: '',
          created_at: new Date().toISOString()
        }
      ])

    if (error) {
      console.error('Error creating profile:', error)
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create profile' }),
        { status: 500 }
      )
    }

    return new NextResponse(
      JSON.stringify({ message: 'Profile created successfully' }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in create-profile API:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}