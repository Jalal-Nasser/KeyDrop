"use client"

import { useState, useTransition } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateOrderStatus } from "@/app/admin/orders/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(currentStatus)

  const handleStatusChange = (newStatus: string) => {
    startTransition(() => {
      updateOrderStatus(orderId, newStatus).then((result) => {
        if (result.success) {
          toast.success(result.message)
          setStatus(newStatus)
        } else {
          toast.error(result.message)
        }
      })
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={handleStatusChange} disabled={isPending || status === 'completed'}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Change status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          {/* 'Completed' is now set automatically when all items are fulfilled */}
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  )
}