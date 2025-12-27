"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Clock } from "lucide-react"
import { FacebookPagePlugin } from "./facebook-page-plugin"

export function ContactInfoCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden h-full flex flex-col border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold tracking-tight">Get In Touch</h2>
          <p className="text-blue-100/90 mt-1 text-sm">We're here to help with any questions or inquiries</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="space-y-5">
          {/* Contact Item */}
          <div className="flex items-start space-x-4 group">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1.5">Our Location</h3>
              <div className="space-y-1 text-gray-600 text-sm">
                <p>123 Digital Key Street, Suite 456</p>
                <p>Tech City, TX 78701, USA</p>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>
          
          {/* Phone Item */}
          <div className="flex items-start space-x-4 group">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1.5">Phone Support</h3>
              <div className="space-y-1">
                <a href="tel:+13107778808" className="block text-blue-600 hover:text-blue-700 hover:underline text-sm transition-colors">
                  +1 (310) 777 8808
                </a>
                <a href="tel:+13108887708" className="block text-blue-600 hover:text-blue-700 hover:underline text-sm transition-colors">
                  +1 (310) 888 7708
                </a>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>
          
          {/* Hours Item */}
          <div className="flex items-start space-x-4 group">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1.5">Working Hours</h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p className="flex items-center">
                  <span className="inline-block w-28">Mon - Fri:</span>
                  <span>8:00 AM - 6:00 PM</span>
                </p>
                <p className="flex items-center">
                  <span className="inline-block w-28">Weekend:</span>
                  <span>Closed</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Facebook Banner */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h3 className="font-medium text-gray-800 mb-3">Follow Us</h3>
          <a 
            href="https://www.facebook.com/dropskeey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="relative h-24 rounded-lg overflow-hidden border border-gray-200">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="flex justify-center mb-1">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Dropskey</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <div className="flex items-center justify-center space-x-1 text-white">
                  <span className="text-xs font-medium">Visit Page</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}