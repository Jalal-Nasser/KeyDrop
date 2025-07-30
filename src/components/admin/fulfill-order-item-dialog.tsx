"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { fulfillOrderItem } from "@/app/admin/orders/actions"
import { Loader2 } from "lucide-react"

interface FulfillOrderItemDialogProps {
  orderItemId: string
  productName: string
  children: React.ReactNode
}

export function FulfillOrderItemDialog({ orderItemId, productName, children }: FulfillOrderItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [productKey, setProductKey] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (!productKey.trim()) {
      toast.error("Product key cannot be empty.")
      return
    }

    startTransition(() => {
      fulfillOrderItem(orderItemId, productKey.trim()).then((result) => {
        if (result.success) {
          toast.success(result.message)
          setIsOpen(false)
          setProductKey("")
        } else {
          toast.error(result.message)
        }
      })
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fulfill Item: {productName}</DialogTitle>
          <DialogDescription>
            Paste the product key below. This will be sent to the customer immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product-key" className="text-right">
              Product Key
            </Label>
            <Textarea
              id="product-key"
              value={productKey}
              onChange={(e) => setProductKey(e.target.value)}
              className="col-span-3"
              placeholder="Paste product key here"
              disabled={isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}