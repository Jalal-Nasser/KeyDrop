export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          name: string
          description: string | null
          price: string
          image: string | null
          // Remove created_at if it doesn't exist
          // created_at: string
          is_digital: boolean | null
          download_url: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: string
          image?: string | null
          // created_at?: string
          is_digital?: boolean | null
          download_url?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: string
          image?: string | null
          // created_at?: string
          is_digital?: boolean | null
          download_url?: string | null
        }
      }
    }
  }
}