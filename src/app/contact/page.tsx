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
import { ContactInfoCard } from "@/components/contact-info-card"

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(1, "Subject is required."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(1000, "Message cannot exceed 1000 characters."),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

function ContactFormComponent() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
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

      const data = await res.json()

      if (res.ok) {
        toast.success("Message sent successfully!", { id: toastId })
        form.reset()
        setTurnstileToken(null)
      } else {
        toast.error(`Failed to send message: ${data.error || "An unknown error occurred."}`, { id: toastId })
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Your Email</FormLabel><FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="subject" render={({ field }) => (
              <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="Regarding my order..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="message" render={({ field }) => (
              <FormItem><FormLabel>Your Message</FormLabel><FormControl><Textarea placeholder="Tell us how we can help you..." className="min-h-[120px] resize-y" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <Turnstile
              sitekey={(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string) || ((typeof window !== 'undefined' && (window as any).__PUBLIC_ENV?.NEXT_PUBLIC_TURNSTILE_SITE_KEY) as string)}
              onVerify={(token: string) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => toast.error("CAPTCHA challenge failed. Please refresh the page.")}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting || !turnstileToken}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
              ) : ( "Send Message" )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default function ContactPage() {
  return (
    <div className="bg-background min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20 md:py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">Contact Us</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto opacity-90">
            We're here to help! Whether you have a question about our products, need support, or just want to say hello, feel free to reach out.
          </p>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16 md:py-20 bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ContactFormComponent />
          <ContactInfoCard />
        </div>
      </section>
    </div>
  );
}