"use client"

import { useEffect, useState } from "react"
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
  price: z.string().min(1, "Price is required").regex(/^\$?\d+(\.\d{1,2})?$/, "Invalid price format"),
  description: z.string().optional(),
  image: z.string().optional(),
  sale_price: z.string().optional().nullable().transform(e => e === "" ? null : e), // Allow empty string to be null
  is_on_sale: z.boolean().optional(),
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
      sale_price: product?.sale_price || "",
      is_on_sale: product?.is_on_sale || false,
    },
  })

  // Watch for changes in is_on_sale and sale_price
  const is_on_sale = form.watch("is_on_sale");
  const sale_price = form.watch("sale_price");
  const original_price = form.watch("price");

  useEffect(() => {
    if (!is_on_sale) {
      form.setValue("sale_price", ""); // Clear sale price if not on sale
    }
  }, [is_on_sale, form]);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    let result;
    // Ensure price and sale_price are numbers for calculation, but pass as strings to action
    const originalPriceNum = parseFloat(values.price.replace(/[^0-9.-]+/g, ""));
    const salePriceNum = values.sale_price ? parseFloat(values.sale_price.replace(/[^0-9.-]+/g, "")) : null;

    if (values.is_on_sale && salePriceNum !== null && (isNaN(originalPriceNum) || isNaN(salePriceNum) || salePriceNum >= originalPriceNum)) {
      toast.error("Sale price must be a valid number and less than the original price when on sale.");
      return;
    }

    const dataToSend = {
      ...values,
      sale_price: values.sale_price || undefined, // Ensure empty string becomes undefined for Supabase
      is_on_sale: values.is_on_sale || false,
    };

    if (product) {
      result = await updateProduct(product.id, dataToSend);
    } else {
      result = await createProduct(undefined, dataToSend);
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

  const calculateSalePercent = () => {
    const originalPriceNum = parseFloat(original_price.replace(/[^0-9.-]+/g, ""));
    const salePriceNum = sale_price ? parseFloat(sale_price.replace(/[^0-9.-]+/g, "")) : null;

    if (is_on_sale && !isNaN(originalPriceNum) && originalPriceNum > 0 && salePriceNum !== null && !isNaN(salePriceNum) && salePriceNum < originalPriceNum) {
      const percent = ((originalPriceNum - salePriceNum) / originalPriceNum) * 100;
      return ` (${percent.toFixed(0)}% off)`;
    }
    return "";
  };

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
                  <FormLabel>Original Price</FormLabel>
                  <FormControl><Input {...field} placeholder="$XX.XX" /></FormControl>
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
                      Product is on sale
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            {is_on_sale && (
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price {calculateSalePercent()}</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://example.com/image.png" /></FormControl>
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