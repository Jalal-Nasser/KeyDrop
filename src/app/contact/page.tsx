import ContactForm from "./ContactForm";
import { ContactInfoCard } from "@/components/contact-info-card";

export default function ContactPage() {
  return (
    <div className="bg-muted/40 min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch with Dropskey</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            We're here to help! Whether you have a question about our products, need support, or just want to say hello, feel free to reach out.
          </p>
        </div>
      </section>

      {/* Main Content - Two Columns */}
      <section className="container mx-auto px-4 py-12 md:py-16">
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