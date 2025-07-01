import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "./contact-form";

export default function ContactPage() {
  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/20 shadow-2xl backdrop-blur-lg">
          <div className="grid lg:grid-cols-2">
            {/* Contact information */}
            <div className="relative px-6 py-10 sm:px-10 lg:p-12 bg-black/30 text-white">
              <h2 className="text-3xl font-bold">Contact Information</h2>
              <p className="mt-4 text-lg text-white/80">
                We'd love to hear from you. Reach out with any questions or feedback.
              </p>
              <dl className="mt-10 space-y-8">
                <div className="flex items-center gap-4">
                  <dt>
                    <span className="sr-only">Phone number</span>
                    <Phone className="h-6 w-6" aria-hidden="true" />
                  </dt>
                  <dd>
                    <a className="hover:text-white/80" href="tel:+1 (310) 777 8808">
                      +1 (310) 777 8808
                    </a>
                  </dd>
                </div>
                <div className="flex items-center gap-4">
                  <dt>
                    <span className="sr-only">Email</span>
                    <Mail className="h-6 w-6" aria-hidden="true" />
                  </dt>
                  <dd>
                    <a className="hover:text-white/80" href="mailto:support@dropskey.com">
                      support@dropskey.com
                    </a>
                  </dd>
                </div>
                <div className="flex items-center gap-4">
                  <dt>
                    <span className="sr-only">Address</span>
                    <MapPin className="h-6 w-6" aria-hidden="true" />
                  </dt>
                  <dd>123 Main St, Anytown, USA 12345</dd>
                </div>
              </dl>
            </div>

            {/* Contact form */}
            <div className="px-6 py-10 sm:px-10 lg:p-12 text-white">
              <h2 className="text-3xl font-bold">Send us a message</h2>
              <p className="mt-2 text-white/80">
                Fill out the form and we'll get back to you shortly.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}