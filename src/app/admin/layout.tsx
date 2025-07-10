import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client" // Import the new client component

export const dynamic = 'force-dynamic'; // Force dynamic rendering for this route segment

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()

  // 1. Check session and redirect if not authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    console.log("AdminLayout: No active session or session error, redirecting to /account");
    redirect("/account"); // This throws an error internally, stopping execution
  }

  const user = session.user; // User is guaranteed to exist here if we reach this point

  // 2. Check admin status and deny access if not admin
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

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
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    );
  } catch (e: any) {
    console.error("AdminLayout: Unexpected error during admin check:", e);
    // This catch block is for errors during the profile fetch, not for redirects
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-red-500">An unexpected error occurred.</h1>
        <p className="text-muted-foreground">
          We are unable to load the admin panel at this time. Please try again later.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-sm text-red-400 mt-4">{e.message}</p>
        )}
      </div>
    );
  }
}