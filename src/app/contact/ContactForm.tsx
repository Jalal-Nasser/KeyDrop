"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import Turnstile from "react-turnstile"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(1000, "Message cannot exceed 1000 characters."),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

export default function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true)
    const toastId = toast.loading("Sending your message...")

    try {
      const res = await fetch("/contact/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken })
      })

      if (res.ok) {
        toast.success("Message sent successfully!", { id: toastId })
        form.reset()
        // Reset turnstile after successful submission if needed, though it's often handled automatically
      } else {
        const errorData = await res.json()
        toast.error(`Failed to send message: ${errorData.error || "An unknown error occurred."}`, { id: toastId })
      }
    } catch (error: any) {
      console.error("Error sending contact form:", error)
      toast.error(`Failed to send message: ${error.message || "Network error."}`, { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-lg mx-auto shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Get in Touch</CardTitle>
        <CardDescription>We'd love to hear from you! Fill out the form below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us how we can help you..."
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Turnstile
              sitekey={(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string) || ((typeof window !== 'undefined' && (window as any).__PUBLIC_ENV?.NEXT_PUBLIC_TURNSTILE_SITE_KEY) as string)}
              onVerify={(token: string) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => toast.error("Turnstile challenge failed. Please refresh the page.")}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting || !turnstileToken}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}