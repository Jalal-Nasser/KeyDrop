import ContactForm from "./ContactForm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-gray-700">We're here to help! Reach out to us through the form or directly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Contact Information Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>Our team is ready to assist you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-grow flex flex-col justify-center">
            <div className="flex items-center space-x-4">
              <Mail className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-muted-foreground">support@dropskey.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold">Phone Support</h3>
                <p className="text-muted-foreground">+1 (310) 777 8808</p>
                <p className="text-muted-foreground">+1 (310) 888 7708</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MapPin className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold">Our Location</h3>
                <p className="text-muted-foreground">123 Digital Key Blvd,</p>
                <p className="text-muted-foreground">Suite 400, Tech City, CA 90210</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}