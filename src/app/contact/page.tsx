import ContactForm from "./ContactForm";
import { ContactInfoCard } from "@/components/contact-info-card";

export default function ContactPage() {
  return (
    <div className="bg-muted/40 min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20 md:py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-0"></div> {/* Subtle overlay */}
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">Get in Touch with Dropskey</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto opacity-90">
            We're here to help! Whether you have a question about our products, need support, or just want to say hello, feel free to reach out.
          </p>
        </div>
      </section>

      {/* Main Content - Two Columns */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form Column */}
          <div>
            <ContactForm />
          </div>

          {/* Contact Info Column */}
          <div>
            <ContactInfoCard />
          </div>
        </div>
      </section>
    </div>
  );
}