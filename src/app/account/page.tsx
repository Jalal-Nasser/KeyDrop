"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useSession } from "@/context/session-context"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import md5 from "crypto-js/md5"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Link from "next/link"

const profileSchema = z.object({
  first_name: z.string().nullable().transform(val => val === null ? "" : val).pipe(z.string().min(1, "First name is required")),
  last_name: z.string().nullable().transform(val => val === null ? "" : val).pipe(z.string().min(1, "Last name is required")),
  company_name: z.string().nullable().optional().transform(val => val === null ? "" : val),
  vat_number: z.string().nullable().optional().transform(val => val === null ? "" : val),
  address_line_1: z.string().nullable().transform(val => val === null ? "" : val).pipe(z.string().min(1, "Address is required")),
  address_line_2: z.string().nullable().optional().transform(val => val === null ? "" : val),
  city: z.string().nullable().transform(val => val === null ? "" : val).pipe(z.string().min(1, "City is required")),
  state_province_region: z.string().nullable().transform(val => val === null ? "" : val).pipe(z.string().min(1, "State/Province/Region is required")),
  postal_code: z.string().nullable().transform(val => val === null ? "" : val).pipe(z.string().min(1, "Postal code is required")),
  country: z.string().nullable().transform(val => val === null ? "" : val).pipe(z.string().min(1, "Country is required")),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function AccountPage() {
  const { session, supabase } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      company_name: "",
      vat_number: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state_province_region: "",
      postal_code: "",
      country: "",
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (data) {
          // Explicitly convert nulls to empty strings for form fields
          const cleanedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, value === null ? "" : value])
          ) as ProfileFormValues; // Cast back to ProfileFormValues
          form.reset(cleanedData);
          setIsAdmin(data.is_admin || false);
        }
        if (error && error.code !== 'PGRST116') {
          toast.error("Could not fetch your profile information.")
        }
      }
    }
    fetchProfile()
  }, [session, supabase, form])

  const onSubmit = async (values: ProfileFormValues) => {
    if (!session) return

    const { error } = await supabase
      .from("profiles")
      .update(values)
      .eq("id", session.user.id)

    if (error) {
      toast.error(`Failed to update profile: ${error.message}`)
    } else {
      toast.success("Profile updated successfully!")
    }
  }

  const getGravatarUrl = (email: string) => {
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=64`;
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center py-12 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must be signed in to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please sign in using the button in the header to access your account details.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Image 
              src={getGravatarUrl(session.user.email || "")}
              alt="Profile Avatar"
              width={64}
              height={64}
              className="rounded-full border"
            />
            <div>
              <CardTitle>Your Account</CardTitle>
              <CardDescription>
                Manage your profile and order history.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="first_name" render={({ field }) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="last_name" render={({ field }) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="company_name" render={({ field }) => (
                  <FormItem><FormLabel>Company Name (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="vat_number" render={({ field }) => (
                  <FormItem><FormLabel>VAT Number (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="address_line_1" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Street address" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="address_line_2" render={({ field }) => (
                <FormItem><FormLabel>Apartment, suite, etc. (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="state_province_region" render={({ field }) => (
                  <FormItem><FormLabel>State / Province</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="postal_code" render={({ field }) => (
                  <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
                <Button type="submit" className="w-full sm:w-auto">Update Profile</Button>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                   {isAdmin && (
                    <Button asChild className="w-full sm:w-auto">
                      <Link href="/admin">Admin Panel</Link>
                    </Button>
                  )}
                   <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href="/account/orders">View Order History</Link>
                  </Button>
                  <Button onClick={() => supabase.auth.signOut()} variant="secondary" className="w-full sm:w-auto">
                    Sign Out
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}