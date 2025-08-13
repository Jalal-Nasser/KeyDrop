import { FileText, Gavel, Users, Shield, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="bg-background min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20 md:py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
            Terms and Conditions
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto opacity-90">
            Understanding the rules that govern your use of Dropskey.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16 md:py-20 bg-background">
        <div className="max-w-4xl mx-auto space-y-10">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <FileText className="h-6 w-6 text-blue-600" /> Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Welcome to Dropskey! These Terms and Conditions ("Terms") govern your access to and use of the Dropskey website, products, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our Service.
              </p>
              <p>
                Dropskey is operated by [Your Company Name], a company registered in [Your Country/State]. We specialize in providing authentic digital keys and software licenses.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Gavel className="h-6 w-6 text-blue-600" /> Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                By creating an account, making a purchase, or otherwise using the Service, you affirm that you are at least 18 years old and are legally capable of entering into a binding agreement. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Users className="h-6 w-6 text-blue-600" /> User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                To access certain features of the Service, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for any activities or actions under your account.
              </p>
              <p>
                Dropskey reserves the right to suspend or terminate your account and refuse any and all current or future use of the Service if you provide untrue, inaccurate, not current, or incomplete information, or if we have reasonable grounds to suspect that such information is untrue, inaccurate, not current, or incomplete.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Shield className="h-6 w-6 text-blue-600" /> Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                All content on the Dropskey website, including text, graphics, logos, images, and software, is the property of Dropskey or its content suppliers and is protected by international copyright laws. The compilation of all content on this site is the exclusive property of Dropskey.
              </p>
              <p>
                You may not reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service, use of the Service, or access to the Service without express written permission from Dropskey.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Lightbulb className="h-6 w-6 text-blue-600" /> Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We reserve the right to modify these Terms at any time. If we make changes, we will post the revised Terms on the Service and update the "Last Updated" date at the top of these Terms. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Users className="h-6 w-6 text-blue-600" /> Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                If you have any questions about these Terms, please contact us at support@dropskey.com.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}