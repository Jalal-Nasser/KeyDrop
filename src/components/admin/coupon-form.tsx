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
    // ... existing onSubmit logic ...
  }

  const handleDelete = async () => {
    // ... existing delete logic ...
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ... existing dialog content ... */}
    </Dialog>
  )
}