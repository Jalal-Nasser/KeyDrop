import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { SiteSettingsForm } from "@/components/admin/site-settings-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function AdminSettingsPage() {
  const supabase = createSupabaseServerClient()
  const { data: settings, error } = await supabase
    .from("site_settings")
    .select("*")

  if (error) {
    console.error("Error fetching site settings:", error)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings & Integrations</CardTitle>
        <CardDescription>
          Manage global site settings, including analytics and custom scripts.
          Changes here will affect the entire website.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SiteSettingsForm settings={settings || []} />
      </CardContent>
    </Card>
  )
}