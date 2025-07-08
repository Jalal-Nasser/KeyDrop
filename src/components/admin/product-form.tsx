"use client"

import { useState, useMemo, useCallback } from "react"
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
import { useSession } from "@/context/session-context" // Import useSession
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import Image from "next/image" // Import Image component
import { getImagePath } from "@/lib/utils" // Import getImagePath

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(parseFloat(val)), "Price must be a valid number"),
  description: z.string().optional(),
  image: z.string().optional(), // This will store the URL after upload
  is_on_sale: z.boolean().default(false).optional(),
  sale_price: z.preprocess(
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
  is_most_sold: z.boolean().default(false).optional(),
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
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(product?.image ? getImagePath(product.image) : null)
  const { supabase } = useSession()

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price || "",
      description: product?.description || "",
      image: product?.image ? getImagePath(product.image) : "", // Initialize with existing image URL
      is_on_sale: product?.is_on_sale || false,
      sale_percent: product?.sale_percent || undefined,
      tag: product?.tag || "",
      category: product?.category || "",
      sku: product?.sku || "",
      is_most_sold: product?.is_most_sold || false,
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
        return calculated >= 0 ? calculated.toFixed(2) : "0.00";
      }
    }
    return null;
  }, [is_on_sale, price, sale_percent]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setCurrentImageUrl(URL.createObjectURL(file)); // For immediate preview
    } else {
      setSelectedImageFile(null);
      setCurrentImageUrl(product?.image ? getImagePath(product.image) : null); // Revert to original if no new file
    }
  }, [product?.image]);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    const dataToSubmit = { ...values };
    const toastId = toast.loading(product ? "Updating product..." : "Creating product...");

    try {
      if (selectedImageFile) {
        const fileExtension = selectedImageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `public/${fileName}`; // Store in a 'public' folder within the bucket

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images') // Your bucket name
          .upload(filePath, selectedImageFile, {
            cacheControl: '3600',
            upsert: true, // Overwrite if file with same name exists
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error("Could not get public URL for the uploaded image.");
        }
        dataToSubmit.image = publicUrlData.publicUrl;
      } else if (product && !currentImageUrl) {
        // If it was an existing product and the image was removed
        dataToSubmit.image = undefined; // Or null, depending on your schema's nullability
      }

      if (dataToSubmit.is_on_sale) {
        const basePrice = parseFloat(dataToSubmit.price);
        const discountPercent = dataToSubmit.sale_percent;

        if (!isNaN(basePrice) && discountPercent !== null && discountPercent !== undefined) {
          const calculated = basePrice * (1 - discountPercent / 100);
          dataToSubmit.sale_price = calculated >= 0 ? parseFloat(calculated.toFixed(2)) : 0;
        } else {
          dataToSubmit.sale_price = null;
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
        throw new Error(result.error);
      }

      toast.success(`Product ${product ? "updated" : "created"} successfully!`, { id: toastId });
      setIsOpen(false);
      setSelectedImageFile(null); // Clear selected file after successful submission
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.", { id: toastId });
    }
  }

  const handleDelete = async () => {
    if (product) {
      const toastId = toast.loading("Deleting product...");
      try {
        // Optionally delete image from storage if it exists
        if (product.image) {
          const imageUrl = typeof product.image === 'string' ? product.image : product.image[0];
          try {
            const url = new URL(imageUrl);
            // The path in the bucket starts after /storage/v1/object/public/bucket_name/
            // For 'product-images' bucket, it's after /storage/v1/object/public/product-images/
            const pathSegments = url.pathname.split('/product-images/');
            const pathInBucket = pathSegments.length > 1 ? pathSegments[1] : null;

            if (pathInBucket) {
              const { error: deleteImageError } = await supabase.storage
                .from('product-images')
                .remove([pathInBucket]); // Remove directly using the path in bucket

              if (deleteImageError) {
                console.warn("Failed to delete image from storage:", deleteImageError.message);
                // Don't block product deletion if image deletion fails
              }
            }
          } catch (e) {
            console.warn("Invalid image URL for deletion or parsing error:", imageUrl, e);
          }
        }

        const result = await deleteProduct(product.id);
        if (result.error) {
          throw new Error(result.error);
        }
        toast.success("Product deleted successfully!", { id: toastId });
        setIsOpen(false);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete product.", { id: toastId });
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <Input type="file" onChange={handleFileChange} accept="image/*" />
              </FormControl>
              <FormDescription>Upload an image for your product.</FormDescription>
              <FormMessage />
              {currentImageUrl && (
                <div className="mt-4 relative w-32 h-32 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                  <Image
                    src={currentImageUrl}
                    alt="Product Preview"
                    fill
                    sizes="128px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              )}
            </FormItem>
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
                  name="sale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calculated Sale Price</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          value={calculatedSalePrice !== null ? `$${calculatedSalePrice}` : "N/A"}
                          readOnly
                          disabled
                          className="bg-gray-100 cursor-not-allowed"
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

            <FormField
              control={form.control}
              name="is_most_sold"
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
                      Add to Homepage (Most Sold Products)
                    </FormLabel>
                    <FormDescription>
                      Check this to feature the product on the homepage.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

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