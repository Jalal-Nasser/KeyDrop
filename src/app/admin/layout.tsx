import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { cookies } from "next/headers" // Import cookies here to log them

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()

  // Log raw cookies to see if they are present
  const allCookies = cookies().getAll();
  console.log("AdminLayout: All cookies:", allCookies.map(c => c.name));
  const sbCookie = allCookies.find(c => c.name.startsWith('sb-') && c.name.endsWith('-access-token'));
  console.log("AdminLayout: Supabase access token cookie found:", !!sbCookie);


  let user = null;
  try {
    // Use getSession() directly from the server client
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    user = session?.user || null; // Get user from session
    console.log("AdminLayout: User fetched:", user ? "Exists" : "Null");
    if (user) {
      console.log("AdminLayout: User ID:", user.id);
    }
  } catch (error) {
    console.error("AdminLayout: Error fetching user session:", error);
    redirect("/account"); // Redirect to account page on session fetch error
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
    console.log("AdminLayout: Profile fetched:", profile);
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
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/40">
        {children}
      </main>
    </div>
  )
}