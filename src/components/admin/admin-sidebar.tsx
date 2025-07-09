"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, Tag, X } from "lucide-react" // Import Tag icon
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/coupons", label: "Coupons", icon: Tag }, // New nav item
  ]

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r flex flex-col transition-transform duration-300 ease-in-out",
        "lg:relative lg:translate-x-0", // Always visible on large screens
        isOpen ? "translate-x-0" : "-translate-x-full" // Slide in/out on small screens
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden" // Only show close button on small screens
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex flex-col p-4 space-y-2 flex-grow">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === item.href && "bg-muted text-primary"
            )}
            onClick={onClose} // Close sidebar on navigation click
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}