"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export function ContactInfoCard() {
  return (
    <Card className="h-full shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Our Contact Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-start space-x-4 group">
          <MapPin className="h-7 w-7 text-blue-600 flex-shrink-0 mt-1 group-hover:text-blue-800 transition-colors" />
          <div>
            <h3 className="font-semibold text-xl text-gray-800 group-hover:text-blue-800 transition-colors">Address</h3>
            <p className="text-gray-700 group-hover:text-gray-900 transition-colors">123 Digital Key Street</p>
            <p className="text-gray-700 group-hover:text-gray-900 transition-colors">Suite 456</p>
            <p className="text-gray-700 group-hover:text-gray-900 transition-colors">Tech City, TX 78701</p>
            <p className="text-gray-700 group-hover:text-gray-900 transition-colors">USA</p>
          </div>
        </div>
        <div className="flex items-start space-x-4 group">
          <Phone className="h-7 w-7 text-blue-600 flex-shrink-0 mt-1 group-hover:text-blue-800 transition-colors" />
          <div>
            <h3 className="font-semibold text-xl text-gray-800 group-hover:text-blue-800 transition-colors">Phone</h3>
            <p className="text-gray-700 group-hover:text-gray-900 transition-colors">+1 (310) 777 8808</p>
            <p className="text-gray-700 group-hover:text-gray-900 transition-colors">+1 (310) 888 7708</p>
          </div>
        </div>
        <div className="flex items-start space-x-4 group">
          <Mail className="h-7 w-7 text-blue-600 flex-shrink-0 mt-1 group-hover:text-blue-800 transition-colors" />
          <div>
            <h3 className="font-semibold text-xl text-gray-800 group-hover:text-blue-800 transition-colors">Email</h3>
            <p className="text-gray-700 group-hover:text-gray-900 transition-colors">support@dropskey.com</p>
          </div>
        </div>
        <div className="flex items-start space-x-4 group">
          <Clock className="h-7 w-7 text-blue-600 flex-shrink-0 mt-1 group-hover:text-blue-800 transition-colors" />
          <div>
            <h3 className="font-semibold text-xl text-gray-800 group-hover:text-blue-800 transition-colors">Business Hours</h3>
            <p className="text-gray-700 group-hover:text-gray-900 transition-colors">Mon - Fri: 8:00 AM - 6:00 PM</p>
            <p className="text-gray-700 group-hover:text-gray-900 transition-colors">Sat - Sun: Closed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}