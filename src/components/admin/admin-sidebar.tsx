"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function AdminSidebar() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/products", label: "Products", icon: Package },
  ]

  return (
    <aside className="w-64 bg-background border-r">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
      </div>
      <nav className="flex flex-col p-4 space-y-2">
        {navItems.map((item: NavItem) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === item.href && "bg-muted text-primary"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}