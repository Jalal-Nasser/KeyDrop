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
  DialogDescription,
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
import { useSession } from "@/context/session-context"
import { v4 as uuidv4 } from 'uuid';
import Image from "next/image"
import { getImagePath } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea" // Import Textarea

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // Price is input as string, will be parsed in onSubmit
  price: z.string().min(1, "Price is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  is_on_sale: z.boolean().default(false).optional(),
  // Sale price is input as string, will be parsed in onSubmit
  sale_price: z.string().nullable().optional(),
  sale_percent: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    },
    z.number().nullable().optional()
  ).refine((val) => val === null || val === undefined || (val >= 0 && val <= 100), {
    message: "Sale percent must be between 0 and 100.",
  }),
  tag: z.string().optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
  is_most_sold: z.boolean().default(false).optional(),
  // SEO fields
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  seo_keywords: z.string().nullable().optional(),
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

// Define the type for the form values (what useForm expects)
type ProductFormValues = z.infer<typeof productSchema>;

// Define the type for the data sent to server actions (what createProduct/updateProduct expect)
// This matches the ProductData interface in actions.ts
type ProductServerData = {
  name: string;
  price: number; // This is a number for the server
  description?: string;
  image?: string;
  is_on_sale?: boolean;
  sale_price?: number | null;
  sale_percent?: number | null;
  tag?: string;
  category?: string;
  is_most_sold?: boolean;
  sku?: string;
  seo_title?: string | null; // Added
  seo_description?: string | null; // Added
  seo_keywords?: string | null; // Added
};

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(product?.image ? getImagePath(product.image) : null)
  const { supabase } = useSession()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price?.toString() || "", // Convert number to string for input
      description: product?.description || "",
      image: product?.image ? getImagePath(product.image) : "",
      is_on_sale: product?.is_on_sale || false,
      sale_price: product?.sale_price?.toString() ?? null, // Convert number to string for input
      tag: product?.tag || "",
      category: product?.category || "",
      sku: product?.sku || "",
      is_most_sold: product?.is_most_sold || false,
      sale_percent: product?.sale_percent ?? null, // Use nullish coalescing
      seo_title: product?.seo_title ?? null, // Initialize SEO fields
      seo_description: product?.seo_description ?? null,
      seo_keywords: product?.seo_keywords ?? null,
    },
  })

  const is_on_sale = form.watch("is_on_sale");
  const price = form.watch("price"); // This will be a string from the input
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
      setCurrentImageUrl(URL.createObjectURL(file));
    } else {
      setSelectedImageFile(null);
      setCurrentImageUrl(product?.image ? getImagePath(product.image) : null);
    }
  }, [product?.image]);

  const onSubmit = async (values: ProductFormValues) => {
    const dataToSubmit: ProductServerData = {
      name: values.name,
      price: parseFloat(values.price), // Parse price string to number here
      description: values.description,
      image: values.image,
      is_on_sale: values.is_on_sale,
      sale_percent: values.sale_percent,
      tag: values.tag,
      category: values.category,
      sku: values.sku,
      is_most_sold: values.is_most_sold,
      sale_price: null, // Initialize sale_price as null, will be set conditionally
      seo_title: values.seo_title, // Include SEO fields
      seo_description: values.seo_description,
      seo_keywords: values.seo_keywords,
    };
    const toastId = toast.loading(product ? "Updating product..." : "Creating product...");

    try {
      if (selectedImageFile) {
        if (!supabase) {
          throw new Error("Supabase client not initialized");
        }
        
        const fileExtension = selectedImageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = fileName; // <--- CORRECTED: Removed 'public/' prefix

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, selectedImageFile, {
            cacheControl: '3600',
            upsert: true,
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
        dataToSubmit.image = undefined;
      }

      if (dataToSubmit.is_on_sale) {
        const basePrice = dataToSubmit.price;
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
      setSelectedImageFile(null);
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.", { id: toastId });
    }
  }

  const handleDelete = async () => {
    if (product) {
      const toastId = toast.loading("Deleting product...");
      try {
        if (product.image) {
          const imageUrl = typeof product.image === 'string' ? product.image : product.image[0];
          try {
            const url = new URL(imageUrl);
            const pathSegments = url.pathname.split('/product-images/');
            const pathInBucket = pathSegments.length > 1 ? pathSegments[1] : null;

            if (pathInBucket) {
              if (!supabase) {
                console.warn("Supabase client not initialized, skipping image deletion");
                return;
              }
              
              const { error: deleteImageError } = await supabase.storage
                .from('product-images')
                .remove([pathInBucket]);

              if (deleteImageError) {
                console.warn("Failed to delete image from storage:", deleteImageError.message);
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
          <DialogDescription>
            {product ? "Edit the details of this product." : "Fill in the details to add a new product."}
          </DialogDescription>
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
                    unoptimized={true}
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
                      <FormControl><Input type="number" step="1" {...field} value={field.value?.toString() ?? ""} placeholder="e.g., 15" /></FormControl>
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

            {/* SEO Section */}
            <h3 className="text-lg font-semibold mt-8 mb-4">Search Engine Optimization (SEO)</h3>
            <FormField
              control={form.control}
              name="seo_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Title</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="Catchy title for search engines" /></FormControl>
                  <FormDescription>A concise title (max 60 characters) for search engine results and browser tabs.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seo_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Description</FormLabel>
                  <FormControl><Textarea {...field} value={field.value ?? ""} placeholder="Brief description for search engine snippets" className="resize-y" /></FormControl>
                  <FormDescription>A short summary (max 160 characters) of the product for search engine results.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seo_keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Keywords</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="comma, separated, keywords" /></FormControl>
                  <FormDescription>Relevant keywords to help search engines understand your product's content.</FormDescription>
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