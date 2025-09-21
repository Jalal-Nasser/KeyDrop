import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { applyUserDiscount } from "./actions"

export default async function UserDiscountsPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (!profile?.is_admin) {
    redirect("/account")
  }

  // Fetch users for the dropdown
  const { data: users } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Discounts</h1>
          <p className="text-muted-foreground">Apply special discounts to user accounts</p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Apply User Discount</CardTitle>
          <CardDescription>Apply a special discount to a user's account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={applyUserDiscount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Select User</Label>
              <select
                id="userId"
                name="userId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select a user...</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <select
                id="discountType"
                name="discountType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">Discount Value</Label>
              <Input 
                type="number" 
                id="discountValue" 
                name="discountValue" 
                min="0.01" 
                step="0.01"
                required 
                placeholder="10.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
              <Input 
                type="datetime-local" 
                id="expiresAt" 
                name="expiresAt" 
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  name="isActive" 
                  defaultChecked
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>Active</span>
              </Label>
            </div>

            <Button type="submit" className="w-full">
              Apply Discount
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
