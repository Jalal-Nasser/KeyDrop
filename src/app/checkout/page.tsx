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
import { Loader2, ShieldCheck, Lock } from "lucide-react" // Added Lock icon
import { getImagePath } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox" // Import Checkbox
import { WalletCheckoutButton } from "@/components/wallet-checkout-button"
import { Database } from "@/types/supabase"

const profileBillingSchema = z.object({
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
});

const checkoutSchema = profileBillingSchema.extend({
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>
type Profile = Database['public']['Tables']['profiles']['Row']

const Stepper = ({ step }: { step: number }) => {
  const steps = ["Shopping Cart", "Checkout", "Order Status"]
  return (
    <div className="flex items-center justify-center w-full py-4">
      <div className="flex items-center justify-between w-full max-w-md">
        {steps.map((name, index) => (
          <React.Fragment key={name}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
                  ${index + 1 === step
                    ? "bg-blue-600 text-white shadow-md scale-110"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >{index + 1}</div>
              <p className={`mt-2 text-sm transition-colors duration-300
                ${index + 1 === step ? "font-semibold text-blue-600" : "text-muted-foreground"}`}
              >{name}</p>
            </div>
            {index < steps.length - 1 && <div className="flex-1 h-px bg-gray-300 mx-2" />}
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      first_name: "", last_name: "", company_name: "", vat_number: "",
      address_line_1: "", address_line_2: "", city: "",
      state_province_region: "", postal_code: "", country: "",
      agreedToTerms: false, // Default to false
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
          setProfile(data)
          // Set each profile field individually, but do NOT touch agreedToTerms
          form.setValue("first_name", data.first_name || "");
          form.setValue("last_name", data.last_name || "");
          form.setValue("company_name", data.company_name || "");
          form.setValue("vat_number", data.vat_number || "");
          form.setValue("address_line_1", data.address_line_1 || "");
          form.setValue("address_line_2", data.address_line_2 || "");
          form.setValue("city", data.city || "");
          form.setValue("state_province_region", data.state_province_region || "");
          form.setValue("postal_code", data.postal_code || "");
          form.setValue("country", data.country || "");
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
  
  // Validate only the billing profile data, not the agreedToTerms checkbox for this check
  const isProfileDataComplete = profileBillingSchema.safeParse(form.getValues()).success 

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

    // If profile billing data is not complete, prompt user to update
    if (!isProfileDataComplete) {
      return (
        <div className="container mx-auto py-20">
          <Card className="max-w-lg mx-auto shadow-lg rounded-lg">
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
      <div className="bg-gradient-to-br from-blue-50 to-white min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
        {/* Hero Section for Logged-in User */}
        <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white py-16 md:py-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-0"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
              Secure Checkout
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto opacity-90">
              Review your order and complete your purchase.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <Stepper step={2} />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mt-8">
            <div className="lg:col-span-3 space-y-8">
              <Card className="shadow-lg rounded-lg">
                <CardHeader><CardTitle>Your Order</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-white flex-shrink-0">
                            <Image src={getImagePath(item.image)} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg rounded-lg">
                <CardHeader><CardTitle>Promo Code</CardTitle></CardHeader>
                <CardContent><PromoCodeForm /></CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-lg rounded-lg">
                <CardHeader><CardTitle>Cart Totals</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex justify-between text-base"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-base"><span>Process Fees 15%</span><span>${processingFee.toFixed(2)}</span></div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${finalCartTotal.toFixed(2)}</span></div>
                </CardContent>
              </Card>
              <Card className="shadow-lg rounded-lg">
                <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
                <CardContent>
                  {/* Wrap the form fields and PayPal button in a Form component */}
                  <Form {...form}>
                    <form> {/* A dummy form tag is needed for FormField to work */}
                      <FormField
                        control={form.control}
                        name="agreedToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to the{" "}
                                <Link href="/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                  Terms and Conditions
                                </Link>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <PayPalCartButton cartTotal={finalCartTotal} cartItems={cartItems} billingDetails={form.watch()} isFormValid={form.formState.isValid} />
                      {profile?.is_admin && (
                        <>
                          <div className="relative my-6">
                            <Separator />
                            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-sm text-muted-foreground">
                              Admin Only
                            </span>
                          </div>
                          <WalletCheckoutButton
                            cartTotal={finalCartTotal}
                            cartItems={cartItems}
                          />
                        </>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
              <Card className="shadow-lg rounded-lg text-center p-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                <CardHeader className="p-0 pb-4">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-2 text-white" />
                  <CardTitle className="text-xl font-bold text-white">Secure Checkout</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                  <p className="text-sm text-blue-100">Your payment information is encrypted and secure.</p>
                  <div className="flex justify-center items-center gap-2 text-blue-100 text-xs">
                    <Lock className="h-4 w-4" />
                    <span>SSL Secured Transactions</span>
                  </div>
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
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      {/* Hero Section for Guest User */}
      <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white py-16 md:py-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
            Secure Checkout
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto opacity-90">
            Please fill in your details to complete your purchase.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <Stepper step={2} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mt-8">
          <div className="lg:col-span-3">
            <Card className="shadow-lg rounded-lg">
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
                    <FormField
                      control={form.control}
                      name="agreedToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the{" "}
                              <Link href="/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                Terms and Conditions
                              </Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg rounded-lg">
              <CardHeader><CardTitle>Your Order</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-white"><Image src={getImagePath(item.image)} alt={item.name} fill sizes="64px" className="object-contain p-1" /></div>
                        <div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">Qty: {item.quantity}</p></div>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
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
            <Card className="shadow-lg rounded-lg">
              <CardHeader><CardTitle>Promo Code</CardTitle></CardHeader>
              <CardContent><PromoCodeForm /></CardContent>
            </Card>
            <Card className="shadow-lg rounded-lg">
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
            <Card className="shadow-lg rounded-lg text-center p-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                <CardHeader className="p-0 pb-4">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-2 text-white" />
                  <CardTitle className="text-xl font-bold text-white">Secure Checkout</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                  <p className="text-sm text-blue-100">Your payment information is encrypted and secure.</p>
                  <div className="flex justify-center items-center gap-2 text-blue-100 text-xs">
                    <Lock className="h-4 w-4" />
                    <span>SSL Secured Transactions</span>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </div>
  )
}