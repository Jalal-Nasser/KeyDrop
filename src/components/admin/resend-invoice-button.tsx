"use client"

import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { reSendInvoice } from "@/app/admin/orders/actions"

interface ReSendInvoiceButtonProps {
  orderId: string;
}

export function ReSendInvoiceButton({ orderId }: ReSendInvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    const { success, message } = await reSendInvoice(orderId)
    if (success) {
      toast.success(message)
    } else {
      toast.error(message)
    }
    setIsLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center gap-1"
    >
      {isLoading ? (
        <span className="animate-spin">⚙️</span> // Simple spinner
      ) : (
        <Mail className="h-4 w-4" />
      )}
      <span className="sr-only">Re-send Invoice</span> {/* Accessible label */}
    </Button>
  )
}