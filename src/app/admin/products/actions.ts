"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

interface ProductData {
  name: string
  price: string
  description?: string
  image?: string
}

export async function createProduct(_: any, formData: ProductData) {
  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase.from("products").insert([formData])
  if (error) {
    return { error: error.message }
  }
  revalidatePath("/admin/products")
  revalidatePath("/shop")
  return { error: null }
}

export async function updateProduct(id: number | undefined, formData: ProductData) {
  if (!id) return { error: "Product ID is missing." }
  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase.from("products").update(formData).eq("id", id)
  if (error) {
    return { error: error.message }
  }
  revalidatePath("/admin/products")
  revalidatePath(`/product/${id}`)
  revalidatePath("/shop")
  return { error: null }
}

export async function deleteProduct(id: number) {
  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) {
    return { error: error.message }
  }
  revalidatePath("/admin/products")
  revalidatePath("/shop")
  return { error: null }
}