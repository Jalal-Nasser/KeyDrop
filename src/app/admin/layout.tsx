import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()

  try {
    // 1. Check session and redirect if not authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("AdminLayout: Session data:", session); // Added log
    if (sessionError || !session?.user) {
      console.log("AdminLayout: No active session or session error, redirecting to /account");
      redirect("/account");
    }

    const user = session.user; // User is guaranteed to exist here

    // 2. Check admin status and deny access if not admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    console.log("AdminLayout: Profile data:", profile); // Added log
    if (profileError || !profile?.is_admin) {
      console.log("AdminLayout: User is not admin or profile error, showing access denied.");
      return (
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have permission to view this page.
          </p>
        </div>
      );
    }

    // If we reach here, the user is authenticated and is an admin
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-muted/40">
          {children}
        </main>
      </div>
    );
  } catch (e: any) {
    console.error("AdminLayout: Unexpected error during server-side rendering:", e);
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-red-500">An unexpected error occurred.</h1>
        <p className="text-muted-foreground">
          We are unable to load the admin panel at this time. Please try again later.
        </p>
        {/* Optionally, display more details in development */}
        {process.env.NODE_ENV === 'development' && (
          <p className="text-sm text-red-400 mt-4">{e.message}</p>
        )}
      </div>
    );
  }
}