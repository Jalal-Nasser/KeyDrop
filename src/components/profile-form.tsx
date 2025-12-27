"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CountrySelect } from "@/components/country-select"
import { getCurrentUserProfile, updateCurrentUserProfile } from "@/app/account/actions"
import { Tables } from "@/types/supabase"
import { useSession } from "@/context/session-context" // Import useSession

// Define the schema for profile validation
const profileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  company_name: z.string().optional(),
  vat_number: z.string().optional(),
  address_line_1: z.string().trim().min(1, "Address is required"),
  address_line_2: z.string().optional(),
  city: z.string().trim().min(1, "City is required"),
  state_province_region: z.string().trim().min(1, "State/Province/Region is required"),
  postal_code: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().length(2, "Country is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type Profile = Tables<'profiles'>;

interface ProfileFormProps {
  initialProfile?: Profile | null;
  onProfileUpdated?: () => void;
}

export function ProfileForm({ initialProfile, onProfileUpdated }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSession(); // Get supabase from context

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      first_name: initialProfile?.first_name || "",
      last_name: initialProfile?.last_name || "",
      company_name: initialProfile?.company_name || "",
      vat_number: initialProfile?.vat_number || "",
      address_line_1: initialProfile?.address_line_1 || "",
      address_line_2: initialProfile?.address_line_2 || "",
      city: initialProfile?.city || "",
      state_province_region: initialProfile?.state_province_region || "",
      postal_code: initialProfile?.postal_code || "",
      country: initialProfile?.country || "",
    },
  });

  // Reset form with new initialProfile data if it changes
  useEffect(() => {
    if (initialProfile) {
      form.reset({
        first_name: initialProfile.first_name || "",
        last_name: initialProfile.last_name || "",
        company_name: initialProfile.company_name || "",
        vat_number: initialProfile.vat_number || "",
        address_line_1: initialProfile.address_line_1 || "",
        address_line_2: initialProfile.address_line_2 || "",
        city: initialProfile.city || "",
        state_province_region: initialProfile.state_province_region || "",
        postal_code: initialProfile.postal_code || "",
        country: initialProfile.country || "",
      });
    }
  }, [initialProfile, form]);

  async function onSubmit(values: ProfileFormValues) {
    // Client-side validation
    const validation = profileSchema.safeParse(values);
    if (!validation.success) {
      const errors = validation.error.issues.map(issue => issue.message).join('\n');
      toast.error(`Please fix the following errors:\n${errors}`);
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Saving profile...");

    try {
      const result = await updateCurrentUserProfile(validation.data);

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Profile updated successfully!", { id: toastId });
      onProfileUpdated?.(); // Notify parent component
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile. Please check all required fields.", { 
        id: toastId,
        duration: 5000 // Show error for 5 seconds
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Your Profile & Billing Details</CardTitle>
        <CardDescription>
          Update your personal and billing information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                control={form.control} 
                name="first_name" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        required 
                        disabled={isLoading}
                        placeholder="John"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              <FormField 
                control={form.control} 
                name="last_name" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        required 
                        disabled={isLoading}
                        placeholder="Doe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                control={form.control} 
                name="company_name" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={isLoading}
                        placeholder="Company Name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              <FormField 
                control={form.control} 
                name="vat_number" 
                render={({ field, formState }) => (
                <FormItem>
                  <FormLabel>VAT Number (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={isLoading}
                      className={formState.errors.vat_number ? "border-red-500" : ""}
                    />
                  </FormControl>
                  {formState.errors.vat_number && (
                    <FormMessage>{formState.errors.vat_number.message}</FormMessage>
                  )}
                </FormItem>
              )} />
            </div>
            <FormField 
              control={form.control} 
              name="address_line_1" 
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel>Address Line 1 *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Street address" 
                      {...field} 
                      required 
                      disabled={isLoading}
                      className={formState.errors.address_line_1 ? "border-red-500" : ""}
                    />
                  </FormControl>
                  {formState.errors.address_line_1 && (
                    <FormMessage>{formState.errors.address_line_1.message}</FormMessage>
                  )}
                </FormItem>
              )} 
            />
            <FormField control={form.control} name="address_line_2" render={({ field, formState }) => (
              <FormItem>
                <FormLabel>Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Apartment, suite, etc." 
                    {...field} 
                    className={formState.errors.address_line_2 ? "border-red-500" : ""}
                  />
                </FormControl>
                {formState.errors.address_line_2 && (
                  <FormMessage>{formState.errors.address_line_2.message}</FormMessage>
                )}
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                control={form.control}
                name="city" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        required 
                        disabled={isLoading}
                        placeholder="New York"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              <FormField 
                control={form.control} 
                name="state_province_region" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province / Region *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        required 
                        disabled={isLoading}
                        placeholder="NY"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                control={form.control} 
                name="postal_code" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        required 
                        disabled={isLoading}
                        placeholder="10001"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              <FormField 
                control={form.control} 
                name="country" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CountrySelect 
                          value={field.value || ''} 
                          onChange={field.onChange} 
                          disabled={isLoading}
                        />
                        {!field.value && (
                          <div className="absolute inset-0 border border-red-500 rounded-md pointer-events-none"></div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}