import { ShieldCheck, Cloud, Settings, Bug, Zap, DollarSign, RefreshCcw, Scale, Users, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function KasperskyPage() {
  return (
    <div className="bg-background min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20 md:py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
            Kaspersky Endpoint Security Cloud
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto opacity-90">
            Powerful, cloud-managed cybersecurity for small and medium businesses.
          </p>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-20 bg-background">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Key Features</h2>
          <p className="text-lg text-muted-foreground">
            Protect your business with essential security capabilities, all managed from the cloud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <ShieldCheck className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <CardTitle>Comprehensive Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced antivirus, anti-ransomware, and firewall capabilities to defend against all threats.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Cloud className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <CardTitle>Cloud Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Deploy and manage your security from anywhere with an intuitive cloud console.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Settings className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <CardTitle>Endpoint Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Control web access, device usage, and application launches to enhance security policies.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Bug className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <CardTitle>Vulnerability & Patch</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Identify and fix software vulnerabilities automatically to close security gaps.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-card py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Benefits for Your Business</h2>
            <p className="text-lg text-muted-foreground">
              Simplify your cybersecurity and focus on what matters most: growing your business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <Zap className="h-10 w-10 text-green-600 mx-auto mb-4" />
                <CardTitle>Simplicity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Easy to deploy and manage, even without dedicated IT security expertise.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <DollarSign className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                <CardTitle>Cost-Effective</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Affordable, scalable protection that grows with your business without breaking the bank.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <RefreshCcw className="h-10 w-10 text-orange-600 mx-auto mb-4" />
                <CardTitle>Always Up-to-Date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatic updates and real-time threat intelligence ensure continuous protection.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <Scale className="h-10 w-10 text-red-600 mx-auto mb-4" />
                <CardTitle>Flexible Licensing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Adapt your security to your evolving needs with flexible licensing options.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Dropskey Section */}
      <section className="container mx-auto px-4 py-16 md:py-20 bg-background">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Why Purchase from Dropskey?</h2>
          <p className="text-lg text-muted-foreground">
            As a trusted Kaspersky partner, we ensure a smooth and secure purchasing experience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Award className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <CardTitle>Authentic Licenses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Receive genuine Kaspersky licenses directly from an authorized partner.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Zap className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <CardTitle>Instant Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get your digital key immediately after purchase, no waiting required.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <CardTitle>Expert Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our team is ready to assist you with any questions regarding your Kaspersky product.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Business?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Explore our Kaspersky Endpoint Security Cloud offerings and find the perfect plan for your needs.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            <Link href="/shop">View Kaspersky Products</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}