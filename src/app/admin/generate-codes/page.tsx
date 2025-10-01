import { createServerClient } from "@/lib/supabase/server" // Updated import
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { generateCouponCode } from "./actions"
import { Tables } from "@/types/supabase" // Import Tables type

export default async function GenerateCodesPage() {
  const supabase = await createServerClient() // Await the client
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single() as { data: Pick<Tables<'profiles'>, 'is_admin'> | null, error: any }; // Explicitly type profile

  if (!profile?.is_admin) {
    redirect("/account")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Generate Codes</h1>
          <p className="text-muted-foreground">Create promo codes for users</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate Single Code</CardTitle>
            <CardDescription>Create a single promo code for a specific user</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={generateCouponCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount Percentage</Label>
                <Input 
                  type="number" 
                  id="discount" 
                  name="discount" 
                  min="1" 
                  max="100" 
                  required 
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userId">User ID (Optional)</Label>
                <Input 
                  type="text" 
                  id="userId" 
                  name="userId" 
                  placeholder="Leave empty for general use"
                />
              </div>
              <Button type="submit" className="w-full">
                Generate Code
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Generate Codes</CardTitle>
            <CardDescription>Generate multiple codes at once (CSV download)</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/admin/generate-bulk-codes" method="POST" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="count">Number of Codes</Label>
                <Input 
                  type="number" 
                  id="count" 
                  name="count" 
                  min="1" 
                  max="100" 
                  required 
                  defaultValue="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountBulk">Discount Percentage</Label>
                <Input 
                  type="number" 
                  id="discountBulk" 
                  name="discount" 
                  min="1" 
                  max="100" 
                  required 
                  placeholder="10"
                />
              </div>
              <Button type="submit" className="w-full">
                Generate & Download CSV
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}