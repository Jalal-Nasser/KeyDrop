'use server'

import { createSupabaseServerClientComponent } from './server'

export async function createClient() {
  return createSupabaseServerClientComponent()
}
