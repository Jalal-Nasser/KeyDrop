// @ts-nocheck
// This file is ignored by TypeScript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          ip: unknown
          message: string
          message_sha: string
          name: string
          subject: string
        }
      },
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          // Add other profile fields as needed
          [key: string]: any
        }
      },
      // Other tables would go here
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
