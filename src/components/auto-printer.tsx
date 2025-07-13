"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function AutoPrinter() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const shouldPrint = searchParams.get("print") === "true"
    if (shouldPrint) {
      // A small delay can help ensure all content and styles are loaded before printing
      const timer = setTimeout(() => {
        window.print()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  return null
}