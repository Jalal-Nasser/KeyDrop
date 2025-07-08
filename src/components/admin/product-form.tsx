"use client"

import { useState, useMemo } from "react"
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
  FormDescription,
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
  price: z.string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(parseFloat(val)), "Price must be a valid number"),
  description: z.string().optional(),
  image: z.string().optional(),
  is_on_sale: z.boolean().default(false).optional(),
  sale_price: z.preprocess( // This will be calculated, but kept in schema for type safety
    (val) => (val === "" ? null : Number(val)),
    z.number().nullable().optional()
  ).refine((val) => val === null || val === undefined || val >= 0, {
    message: "Sale price must be a non-negative number.",
  }),
  sale_percent: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().nullable().optional()
  ).refine((val) => val === null || val === undefined || (val >= 0 && val <= 100), {
    message: "Sale percent must be between 0 and 100.",
  }),
  tag: z.string().optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.is_on_sale) {
    if (data.sale_percent === null || data.sale_percent === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sale percentage is required when product is on sale.",
        path: ["sale_percent"],
      });
    }
  }
});

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
      sale_percent: product?.sale_percent || undefined,
      tag: product?.tag || "",
      category: product?.category || "",
      sku: product?.sku || "",
    },
  })

  const is_on_sale = form.watch("is_on_sale");
  const price = form.watch("price");
  const sale_percent = form.watch("sale_percent");

  // Calculate sale_price dynamically
  const calculatedSalePrice = useMemo(() => {
    if (is_on_sale && price && sale_percent !== null && sale_percent !== undefined) {
      const basePrice = parseFloat(price);
      if (!isNaN(basePrice)) {
        const discount = sale_percent / 100;
        const calculated = basePrice * (1 - discount);
        return calculated >= 0 ? calculated.toFixed(2) : "0.00"; // Ensure non-negative
      }
    }
    return null;
  }, [is_on_sale, price, sale_percent]);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    const dataToSubmit = { ...values };

    if (dataToSubmit.is_on_sale) {
      const basePrice = parseFloat(dataToSubmit.price);
      const discountPercent = dataToSubmit.sale_percent;

      if (!isNaN(basePrice) && discountPercent !== null && discountPercent !== undefined) {
        const calculated = basePrice * (1 - discountPercent / 100);
        dataToSubmit.sale_price = calculated >= 0 ? parseFloat(calculated.toFixed(2)) : 0;
      } else {
        dataToSubmit.sale_price = null; // Fallback if calculation fails
      }
    } else {
      dataToSubmit.sale_price = null;
      dataToSubmit.sale_percent = null;
    }

    let result;
    if (product) {
      result = await updateProduct(product.id, dataToSubmit);
    } else {
      result = await createProduct(undefined, dataToSubmit);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={product ? "outline" : "default"}>
          {product ? "Edit" : "Add Product"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4"> {/* Added py-4 for internal padding */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., software, antivirus" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., security, productivity" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                    <FormDescription>
                      Check this if the product has a special sale price.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {is_on_sale && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sale_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Percentage</FormLabel>
                      <FormControl><Input type="number" step="1" {...field} value={field.value ?? ""} placeholder="e.g., 15" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sale_price" // This field is now for display
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calculated Sale Price</FormLabel>
                      <FormControl>
                        <Input
                          type="text" // Changed to text as it's display only
                          value={calculatedSalePrice !== null ? `$${calculatedSalePrice}` : "N/A"}
                          readOnly // Make it read-only
                          disabled // Disable it
                          className="bg-gray-100 cursor-not-allowed" // Add styling for disabled
                        />
                      </FormControl>
                      <FormDescription>
                        Automatically calculated based on price and percentage.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {product && product.sku && (
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl><Input {...field} readOnly disabled /></FormControl>
                    <FormDescription>SKU is auto-generated and cannot be changed.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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