"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export function ContactInfoCard() {
  return (
    <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader>
        <CardTitle>Our Contact Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start space-x-4">
          <MapPin className="h-7 w-7 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-lg">Address</h3>
            <p className="text-gray-700">123 Digital Key Street</p>
            <p className="text-gray-700">Suite 456</p>
            <p className="text-gray-700">Tech City, TX 78701</p>
            <p className="text-gray-700">USA</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <Phone className="h-7 w-7 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-lg">Phone</h3>
            <p className="text-gray-700">+1 (310) 777 8808</p>
            <p className="text-gray-700">+1 (310) 888 7708</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <Mail className="h-7 w-7 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-lg">Email</h3>
            <p className="text-gray-700">support@dropskey.com</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <Clock className="h-7 w-7 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-lg">Business Hours</h3>
            <p className="text-gray-700">Mon - Fri: 8:00 AM - 6:00 PM</p>
            <p className="text-gray-700">Sat - Sun: Closed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}