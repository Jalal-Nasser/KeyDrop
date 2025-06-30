import { X } from "lucide-react"

export function StoreNotice() {
  return (
    <div className="relative bg-[#dc3545] py-2 text-center text-sm text-white">
      📋 Start order without waiting approval
      <button className="absolute right-4 top-1/2 -translate-y-1/2">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
