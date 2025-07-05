"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import type { ControllerRenderProps } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const promoCodeSchema = z.object({
  promo_code: z.string().min(1, "Please enter a promo code."),
})

type PromoCodeFormValues = z.infer<typeof promoCodeSchema>

export function PromoCodeForm() {
  const form = useForm<PromoCodeFormValues>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      promo_code: "",
    },
  })

  function onSubmit(data: PromoCodeFormValues) {
    console.log("Applying promo code:", data.promo_code)
    // Placeholder functionality
    toast.info("Promo code functionality is not yet implemented.")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2 w-full max-w-xs">
        <FormField
          control={form.control}
          name="promo_code"
          render={({ field }: { field: ControllerRenderProps<PromoCodeFormValues, "promo_code"> }) => (
            <FormItem className="flex-grow">
              <FormLabel className="sr-only">Promo Code</FormLabel>
              <FormControl>
                <Input placeholder="Coupon code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="outline">OK</Button>
      </form>
    </Form>
  )
}