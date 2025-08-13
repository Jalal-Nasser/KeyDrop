import { RefreshCcw, DollarSign, HelpCircle, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RefundPage() {
  return (
    <div className="bg-background min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20 md:py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
            Refund and Returns Policy
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto opacity-90">
            Our commitment to your satisfaction with digital products.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16 md:py-20 bg-background">
        <div className="max-w-4xl mx-auto space-y-10">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <RefreshCcw className="h-6 w-6 text-blue-600" /> Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Thank you for shopping at Dropskey. We understand that sometimes a digital product may not meet your expectations or might encounter issues. This policy outlines the conditions under which refunds and returns are processed for digital goods purchased from our website.
              </p>
              <p>
                Please note that due to the nature of digital products (software licenses, keys, etc.), our refund policy differs from physical goods. Once a digital key or license has been delivered and activated, it is generally not eligible for a refund.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <DollarSign className="h-6 w-6 text-blue-600" /> Eligibility for Refund
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>A refund may be considered under the following circumstances:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <strong>Non-Delivery of Product:</strong> If you have not received your digital key/license within 24 hours of purchase, and after checking your spam/junk folders.
                </li>
                <li>
                  <strong>Product Not as Described:</strong> If the digital product received is fundamentally different from its description on our website (e.g., wrong version, incorrect region).
                </li>
                <li>
                  <strong>Defective or Non-Functional Key:</strong> If the digital key/license provided is proven to be invalid or non-functional upon first activation attempt, and our support team cannot resolve the issue. You must provide clear evidence (e.g., screenshots of error messages) within 72 hours of purchase.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <HelpCircle className="h-6 w-6 text-blue-600" /> Non-Refundable Situations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Refunds will generally NOT be issued for:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Change of mind after the key has been delivered.</li>
                <li>Compatibility issues with your system if the product requirements were clearly stated.</li>
                <li>Purchases made by mistake or accidental purchases.</li>
                <li>If the key has already been activated or redeemed.</li>
                <li>If more than 72 hours have passed since the purchase date for defective keys.</li>
                <li>Issues arising from user error (e.g., incorrect installation, lost key after delivery).</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Mail className="h-6 w-6 text-blue-600" /> How to Request a Refund
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                To request a refund, please contact our support team at support@dropskey.com within the eligible timeframe. You must provide:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Your order number.</li>
                <li>The email address used for the purchase.</li>
                <li>A detailed explanation of the issue.</li>
                <li>Any relevant evidence (e.g., screenshots of error messages, proof of non-delivery).</li>
              </ul>
              <p>
                Our team will review your request and may require additional information to verify the claim.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <DollarSign className="h-6 w-6 text-blue-600" /> Processing Refunds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                If your refund request is approved, the refund will be processed, and a credit will automatically be applied to your original method of payment, within a certain amount of days. Please note that it may take some time for your bank or credit card company to post the refund.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Mail className="h-6 w-6 text-blue-600" /> Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                If you have any questions about our Refund and Returns Policy, please contact us at support@dropskey.com.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}