import Link from 'next/link';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            SkyFly Admin
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavLink href="/admin/orders" icon={<ShoppingCart size={20} />} label="Orders" />
          <NavLink href="/admin/products" icon={<Package size={20} />} label="Products" />
          <NavLink href="/admin/clients" icon={<Users size={20} />} label="Clients" />
          <NavLink href="/admin/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
            <LogOut size={20} className="mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors"
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
