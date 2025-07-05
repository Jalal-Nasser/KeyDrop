import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()

  let session = null;
  try {
    const { data: { session: fetchedSession }, error } = await supabase.auth.getSession();
    if (error) throw error;
    session = fetchedSession;
    console.log("AdminLayout: Session fetched:", session ? "Exists" : "Null");
    if (session) {
      console.log("AdminLayout: Session user ID:", session.user.id);
    }
  } catch (error) {
    console.error("AdminLayout: Error fetching session:", error);
    redirect("/account"); // Redirect to account page on session fetch error
  }

  if (!session) {
    console.log("AdminLayout: No session, redirecting to /account");
    redirect("/account");
  }

  let profile = null;
  try {
    const { data: fetchedProfile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();
    if (error) throw error;
    profile = fetchedProfile;
    console.log("AdminLayout: Profile fetched:", profile);
  } catch (error) {
    console.error("AdminLayout: Error fetching profile:", error);
    // If profile fetch fails, assume not admin or redirect to account
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
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/40">
        {children}
      </main>
    </div>
  )
}