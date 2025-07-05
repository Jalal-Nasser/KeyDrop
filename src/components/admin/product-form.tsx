"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription, // Added this import
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Product } from "@/types/product"
import { createProduct, updateProduct, deleteProduct } from "@/app/admin/products/actions"
import { toast } from "sonner"
import { RichTextEditor } from "./rich-text-editor"
import { Checkbox } from "@/components/ui/checkbox"

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string().min(1, "Price is required").regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number with up to 2 decimal places."),
  description: z.string().optional(),
  image: z.string().optional(),
  is_on_sale: z.boolean().default(false).optional(),
  sale_price: z.string().optional().nullable().refine(
    (val) => val === null || val === undefined || val === "" || /^\d+(\.\d{1,2})?$/.test(val),
    "Sale price must be a valid number with up to 2 decimal places."
  ),
  sale_percent: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0).max(100).nullable().optional()
  ),
})

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price || "",
      description: product?.description || "",
      image: Array.isArray(product?.image) ? product.image[0] : product?.image || "",
      is_on_sale: product?.is_on_sale || false,
      sale_price: product?.sale_price || "",
      sale_percent: product?.sale_percent || null,
    },
  })

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    let result;
    const dataToSave = {
      ...values,
      // Ensure sale_price is null if not on sale or empty
      sale_price: values.is_on_sale && values.sale_price ? values.sale_price : null,
      // Ensure sale_percent is null if not on sale or empty
      sale_percent: values.is_on_sale && values.sale_percent ? values.sale_percent : null,
    };

    if (product) {
      result = await updateProduct(product.id, dataToSave);
    } else {
      result = await createProduct(undefined, dataToSave);
    }

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Product ${product ? "updated" : "created"} successfully!`)
      setIsOpen(false)
    }
  }

  const handleDelete = async () => {
    if (product) {
      const result = await deleteProduct(product.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Product deleted successfully!")
        setIsOpen(false)
      }
    }
  }

  const isOnSale = form.watch("is_on_sale");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={product ? "outline" : "default"}>
          {product ? "Edit" : "Add Product"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl><Input {...field} placeholder="$XX.XX" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://example.com/image.webp" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_on_sale"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Product is on Sale
                    </FormLabel>
                    <FormDescription>
                      Check this box if the product is currently on sale.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {isOnSale && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price</FormLabel>
                      <FormControl><Input {...field} placeholder="$XX.XX" value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sale_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Percentage (%)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value === "" ? null : Number(e.target.value))} placeholder="e.g., 25" value={field.value === null ? "" : String(field.value)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <DialogFooter className="pt-8">
              {product && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}