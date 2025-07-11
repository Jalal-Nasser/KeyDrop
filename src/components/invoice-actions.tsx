"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function InvoiceActions() {
  return (
    <div className="print:hidden flex justify-end gap-2 mb-4">
      <Button onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Print / Download PDF
      </Button>
    </div>
  )
}