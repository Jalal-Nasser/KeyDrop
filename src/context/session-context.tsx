type SessionContextType = {
  session: Session | null
  supabase: SupabaseClient<any, "public", any> // Simplified type
  isLoading: boolean
}