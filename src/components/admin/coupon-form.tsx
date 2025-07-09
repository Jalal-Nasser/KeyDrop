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
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { createCoupon } from "@/app/admin/coupons/actions"

interface CouponFormProps {
  coupon?: {
    id: string;
    code: string;
    discount_percent: number;
    assigned_user_id: string | null;
    is_applied: boolean;
  };
}

const couponSchema = z.object({
  discount_percent: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Discount must be at least 1%").max(100, "Discount cannot exceed 100%")
  ),
  assigned_user_id: z.string().nullable().optional(),
})

type CouponFormValues = z.infer<typeof couponSchema>

export function CouponForm({ coupon }: CouponFormProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<{id: string, first_name: string | null, last_name: string | null}[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      discount_percent: coupon?.discount_percent || 0,
      assigned_user_id: coupon?.assigned_user_id ?? "public",
    },
  })

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true)
        const response = await fetch('/api/admin/fetch-users')
        if (!response.ok) throw new Error('Failed to fetch users')
        const { data } = await response.json()
        setUsers(data || [])
      } catch (error) {
        toast.error("Failed to load users")
      } finally {
        setIsLoadingUsers(false)
      }
    }

    if (open) loadUsers()
  }, [open])

  const onSubmit = async (values: CouponFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await createCoupon(null, {
        discount_percent: values.discount_percent,
        assigned_user_id: values.assigned_user_id === "public" ? null : values.assigned_user_id
      })
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      toast.success("Coupon created successfully!")
      setOpen(false)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || "Failed to create coupon")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={coupon ? "outline" : "default"}>
          {coupon ? "Edit" : "Create Coupon"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="discount_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Percentage</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="10" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assigned_user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to User</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || "public"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public (Any user)</SelectItem>
                      {isLoadingUsers ? (
                        <div className="p-2 text-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        users.map((user) => (
                          <SelectItem 
                            key={user.id} 
                            value={user.id}
                          >
                            {user.first_name} {user.last_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {coupon ? "Update" : "Create"} Coupon
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}