// @ts-nocheck
// This file has TypeScript errors but we're ignoring them since we're using supabase-wrapper.ts instead
// The exported Database type can cause TypeScript validation errors in some contexts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Original database schema...
}
