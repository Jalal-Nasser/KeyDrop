import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminClientsPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    console.error("Error fetching admin profile:", profileError)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Clients</CardTitle>
          <CardDescription>
            There was an error verifying admin status. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!profile?.is_admin) {
    redirect("/account")
  }

  // Select only existing columns and order by name
  const { data: clients, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, company_name')
    .order('first_name', { ascending: true })

  if (error) {
    console.error("Error fetching clients:", error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Clients</CardTitle>
          <CardDescription>
            There was an error loading the clients list. Please check your database permissions and RLS policies.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clients</CardTitle>
        <CardDescription>List of registered clients with details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{(client.first_name || '') + ' ' + (client.last_name || '')}</TableCell>
                <TableCell>{client.company_name || 'N/A'}</TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/clients/${client.id}/orders`}>View Client Orders</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}