"use client"

import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "@/context/session-context"
import Link from "next/link"

export function InvoiceActions() {
  const { session, supabase } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
  const checkAdminStatus = async () => {
      if (session?.user) {
    if (!supabase) return
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()

        if (data && data.is_admin) {
          setIsAdmin(true)
        } else if (error) {
          console.error("Error fetching admin status:", error)
        }
      }
    }
    checkAdminStatus()
  }, [session, supabase])

  const handlePrint = () => {
    window.print()
  }

  const backLink = isAdmin ? "/admin/orders" : "/account/orders"
  const backButtonText = isAdmin ? "Back to Admin Panel" : "Back to Client Area"

  return (
    <div className="flex justify-between items-center mb-6 print:hidden">
      <Button asChild variant="outline">
        <Link href={backLink}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backButtonText}
        </Link>
      </Button>
      <Button onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print Invoice
      </Button>
    </div>
  )
}