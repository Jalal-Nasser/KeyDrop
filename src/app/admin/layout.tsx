import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { cookies } from "next/headers"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // New import
import { Button } from "@/components/ui/button" // New import
import { Menu } from "lucide-react" // New import

export const dynamic = 'force-dynamic'; // Force dynamic rendering for this route segment

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()

  let user = null;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    user = session?.user || null;
  } catch (error) {
    console.error("AdminLayout: Error fetching user session:", error);
    redirect("/account");
  }

  if (!user) {
    console.log("AdminLayout: No user session, redirecting to /account");
    redirect("/account");
  }

  let profile = null;
  try {
    const { data: fetchedProfile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    profile = fetchedProfile;
  } catch (error) {
    console.error("AdminLayout: Error fetching profile:", error);
    redirect("/account");
  }

  if (!profile?.is_admin) {
    console.log("AdminLayout: User is not admin, showing access denied.");
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Trigger and Sheet */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Admin Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-8 bg-muted/40 lg:ml-64"> {/* Add margin for desktop sidebar */}
        {/* Add padding-top for mobile to account for fixed menu button */}
        <div className="lg:pt-0 pt-16">
          {children}
        </div>
      </main>
    </div>
  )
}