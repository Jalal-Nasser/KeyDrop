import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-lg text-gray-700 mb-8">Get in touch with us!</p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}