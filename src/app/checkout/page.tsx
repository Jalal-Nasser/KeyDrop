"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { useSession } from "@/context/session-context"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { PayPalCartButton } from "@/components/paypal-cart-button"
import { toast } from "sonner"
import { PromoCodeForm } from "@/components/promo-code-form"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

const checkoutSchema = z.object({
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

type CheckoutFormValues = z.infer<typeof checkoutSchema>

const getImagePath = (image: string | string[] | undefined): string => {
  if (!image) return "/placeholder.jpg"
  if (Array.isArray(image)) return image[0]
  return image
}

const Stepper = ({ step }: { step: number }) => {
  const steps = ["Shopping Cart", "Checkout", "Order Status"]
  return (
    <div className="flex items-center justify-center w-full py-4">
      <div className="flex items-center justify-between w-full max-w-md">
        {steps.map((name, index) => (
          <React.Fragment key={name}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index + 1 === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <p className={`mt-2 text-sm ${index + 1 === step ? "font-semibold text-primary" : "text-muted-foreground"}`}>{name}</p>
            </div>
            {index < steps.length - 1 && <div className="flex-1 h-px bg-border mx-2" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, cartTotal, cartCount } = useCart()
  const { session, supabase } = useSession()
  const [profile, setProfile] = useState<CheckoutFormValues | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      first_name: "", last_name: "", company_name: "", vat_number: "",
      address_line_1: "", address_line_2: "", city: "",
      state_province_region: "", postal_code: "", country: "",
    },
  })

  useEffect(() => {
    if (cartCount === 0) {
      toast.info("Your cart is empty. Redirecting to shop...")
      router.push("/shop")
    }
  }, [cartCount, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        setIsLoadingProfile(true)
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (data) {
          form.reset(data)
          setProfile(data)
        }
        if (error && error.code !== 'PGRST116') {
          toast.error("Could not fetch your profile information.")
        }
        setIsLoadingProfile(false)
      } else {
        setIsLoadingProfile(false)
      }
    }
    fetchProfile()
  }, [session, supabase, form])

  const processingFee = cartTotal * 0.15
  const finalCartTotal = cartTotal + processingFee
  const isProfileValid = checkoutSchema.safeParse(profile).success

  const parsePrice = (price: string): number => {
    return parseFloat(price.replace(/[^0-9.-]+/g, ""))
  }

  if (cartCount === 0) {
    return <div className="container mx-auto text-center py-20"><p>Your cart is empty.</p></div>
  }

  // Logged-in user view
  if (session) {
    if (isLoadingProfile) {
      return (
        <div className="container mx-auto flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4">Loading your details...</p>
        </div>
      )
    }

    if (!isProfileValid) {
      return (
        <div className="container mx-auto py-20">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>Your billing information is incomplete. Please update your profile to proceed with the checkout.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/account">Go to Your Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="bg-muted/40">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Stepper step={2} />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mt-8">
            <div className="lg:col-span-3 space-y-8">
              <Card>
                <CardHeader><CardTitle>Your Order</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-white">
                            <Image src={getImagePath(item.image)} alt={item.name} fill className="object-contain p-1" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">
                          ${((item.is_on_sale && item.sale_price ? parsePrice(item.sale_price) : parsePrice(item.price)) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Promo Code</CardTitle></CardHeader>
                <CardContent><PromoCodeForm /></CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader><CardTitle>Cart Totals</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex justify-between text-base"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-base"><span>Process Fees 15%</span><span>${processingFee.toFixed(2)}</span></div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${finalCartTotal.toFixed(2)}</span></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
                <CardContent>
                  <PayPalCartButton cartTotal={finalCartTotal} cartItems={cartItems} billingDetails={form.watch()} isFormValid={form.formState.isValid} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Guest user view
  return (
    <div className="bg-muted/40">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="mx-auto max-w-4xl text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Secure Checkout</h1>
          <p className="text-muted-foreground">Please fill in your details to complete your purchase.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader><CardTitle>Billing & Shipping Details</CardTitle></CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="company_name" render={({ field }) => (<FormItem><FormLabel>Company Name (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="vat_number" render={({ field }) => (<FormItem><FormLabel>VAT Number (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="address_line_1" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Street address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="address_line_2" render={({ field }) => (<FormItem><FormLabel>Apartment, suite, etc. (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="state_province_region" render={({ field }) => (<FormItem><FormLabel>State / Province</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="postal_code" render={({ field }) => (<FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader><CardTitle>Your Order</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-white"><Image src={getImagePath(item.image)} alt={item.name} fill className="object-contain p-1" /></div>
                        <div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">Qty: {item.quantity}</p></div>
                      </div>
                      <p className="font-medium">
                        ${((item.is_on_sale && item.sale_price ? parsePrice(item.sale_price) : parsePrice(item.price)) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-base"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-base"><span>Process Fees 15%</span><span>${processingFee.toFixed(2)}</span></div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${finalCartTotal.toFixed(2)}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Promo Code</CardTitle></CardHeader>
              <CardContent><PromoCodeForm /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
              <CardContent>
                {!session ? (
                  <div className="text-center text-destructive">
                    <p>You must be signed in to complete your purchase.</p>
                    <p>Please <Link href="/account" className="underline font-bold">sign in or create an account</Link>.</p>
                  </div>
                ) : (
                  <PayPalCartButton cartTotal={finalCartTotal} cartItems={cartItems} billingDetails={form.watch()} isFormValid={form.formState.isValid} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}