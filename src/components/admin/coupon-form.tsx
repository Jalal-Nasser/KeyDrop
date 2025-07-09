"use client"

import { useState, useEffect } from "react"
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
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCoupon, assignCoupon, fetchUsersForAssignment, deleteCoupon } from "@/app/admin/coupons/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const couponSchema = z.object({
  discount_percent: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Discount must be at least 1%").max(100, "Discount cannot exceed 100%")
  ),
  assigned_user_id: z.string().nullable().optional(),
})

type CouponFormValues = z.infer<typeof couponSchema>

interface CouponFormProps {
  coupon?: {
    id: string;
    code: string;
    discount_percent: number;
    assigned_user_id: string | null;
    is_applied: boolean;
    profiles?: { first_name: string | null; last_name: string | null }[];
  };
}

export function CouponForm({ coupon }: CouponFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState<{ id: string; first_name: string | null; last_name: string | null }[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      discount_percent: coupon?.discount_percent || 0,
      assigned_user_id: coupon?.assigned_user_id ?? "", // Set default to empty string for Select component
    },
  })

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true)
      const { data, error } = await fetchUsersForAssignment()
      if (error) {
        toast.error(`Failed to load users: ${error}`)
      } else {
        setUsers(data || [])
      }
      setIsLoadingUsers(false)
    }
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  const onSubmit = async (values: CouponFormValues) => {
    const toastId = toast.loading(coupon ? "Updating coupon..." : "Generating coupon...")
    try {
      let result;
      if (coupon) {
        // If editing an existing coupon, only assignment can be changed via this form
        result = await assignCoupon(undefined, {
          coupon_id: coupon.id,
          assigned_user_id: values.assigned_user_id === "" ? null : values.assigned_user_id,
        });
      } else {
        // Creating a new coupon
        result = await createCoupon(undefined, {
          discount_percent: values.discount_percent,
          assigned_user_id: values.assigned_user_id === "" ? null : values.assigned_user_id,
        });
      }

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success(`Coupon ${coupon ? "updated" : "generated"} successfully!`, { id: toastId })
      setIsOpen(false)
      form.reset() // Reset form after successful submission
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.", { id: toastId })
    }
  }

  const handleDelete = async () => {
    if (!coupon) return;
    const toastId = toast.loading("Deleting coupon...")
    try {
      const result = await deleteCoupon(coupon.id);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success("Coupon deleted successfully!", { id: toastId });
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon.", { id: toastId });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={coupon ? "outline" : "default"}>
          {coupon ? "Edit" : "Generate New Coupon"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit Coupon" : "Generate New Coupon"}</DialogTitle>
          <DialogDescription>
            {coupon ? `Coupon Code: ${coupon.code}` : "Create a new discount coupon."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {!coupon && ( // Only show discount percent field when creating new coupon
              <FormField
                control={form.control}
                name="discount_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Percentage (%)</FormLabel>
                    <FormControl>
                      {/* Ensure value is always a string for the Input component */}
                      <Input type="number" step="1" min="1" max="100" {...field} value={String(field.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="assigned_user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to User (Optional)</FormLabel>
                  {/* Ensure value is string for the Select component */}
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select a user"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Use empty string for the "No specific user" option */}
                      <SelectItem value="">No specific user (public)</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.id.substring(0, 8)}...)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              {coupon && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">
                {coupon ? "Update Assignment" : "Generate Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}