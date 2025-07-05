"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

interface ProductData {
  name: string
  price: string
  description?: string
  image?: string
  sale_price?: string // New
  is_on_sale?: boolean // New
  sale_percent?: number // New
}

// Helper to parse price strings to numbers
const parsePrice = (price: string): number => {
  return parseFloat(price.replace(/[^0-9.-]+/g, ""))
}

export async function createProduct(_: any, formData: ProductData) {
  const supabase = createServerActionClient({ cookies })

  const dataToInsert: any = {
    name: formData.name,
    price: formData.price,
    description: formData.description,
    image: formData.image,
  };

  if (formData.is_on_sale && formData.sale_price) {
    const originalPrice = parsePrice(formData.price);
    const salePrice = parsePrice(formData.sale_price);
    if (!isNaN(originalPrice) && !isNaN(salePrice) && originalPrice > 0) {
      dataToInsert.sale_price = formData.sale_price;
      dataToInsert.is_on_sale = true;
      dataToInsert.sale_percent = ((originalPrice - salePrice) / originalPrice) * 100;
    } else {
      // If sale price is invalid, treat it as not on sale
      dataToInsert.is_on_sale = false;
      dataToInsert.sale_price = null;
      dataToInsert.sale_percent = null;
    }
  } else {
    dataToInsert.is_on_sale = false;
    dataToInsert.sale_price = null;
    dataToInsert.sale_percent = null;
  }

  const { error } = await supabase.from("products").insert([dataToInsert])
  if (error) {
    return { error: error.message }
  }
  revalidatePath("/admin/products")
  revalidatePath("/shop")
  revalidatePath("/") // Revalidate home page for weekly products
  return { error: null }
}

export async function updateProduct(id: number | undefined, formData: ProductData) {
  if (!id) return { error: "Product ID is missing." }
  const supabase = createServerActionClient({ cookies })

  const dataToUpdate: any = {
    name: formData.name,
    price: formData.price,
    description: formData.description,
    image: formData.image,
  };

  if (formData.is_on_sale && formData.sale_price) {
    const originalPrice = parsePrice(formData.price);
    const salePrice = parsePrice(formData.sale_price);
    if (!isNaN(originalPrice) && !isNaN(salePrice) && originalPrice > 0) {
      dataToUpdate.sale_price = formData.sale_price;
      dataToUpdate.is_on_sale = true;
      dataToUpdate.sale_percent = ((originalPrice - salePrice) / originalPrice) * 100;
    } else {
      // If sale price is invalid, treat it as not on sale
      dataToUpdate.is_on_sale = false;
      dataToUpdate.sale_price = null;
      dataToUpdate.sale_percent = null;
    }
  } else {
    dataToUpdate.is_on_sale = false;
    dataToUpdate.sale_price = null;
    dataToUpdate.sale_percent = null;
  }

  const { error } = await supabase.from("products").update(dataToUpdate).eq("id", id)
  if (error) {
    return { error: error.message }
  }
  revalidatePath("/admin/products")
  revalidatePath(`/product/${id}`)
  revalidatePath("/shop")
  revalidatePath("/") // Revalidate home page for weekly products
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
  revalidatePath("/") // Revalidate home page for weekly products
  return { error: null }
}