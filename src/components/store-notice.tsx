import { X } from "lucide-react"

export function StoreNotice() {
  return (
    <div className="bg-red-600 text-white py-2 relative" style={{ backgroundColor: "#dc3545" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm flex items-center justify-center">
          <span className="mr-2">📋</span>
          <span>Start order without waiting approval</span>
        </div>
      </div>
      <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
