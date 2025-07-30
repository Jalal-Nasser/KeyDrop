import { ShieldCheck, Cloud, Settings, Bug, Zap, DollarSign, RefreshCcw, Scale, Users, Award, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function KasperskyPage() {
  const kasperskyPlansData = [
    { id: 'foundations', name: 'Foundations', description: 'Essential EDR for SMBs', link: '/shop?search=kaspersky+next+edr+foundations' },
    { id: 'optimum', name: 'Optimum', description: 'Advanced EDR with more control', link: '/shop?search=kaspersky+next+edr+optimum' },
    { id: 'expert', name: 'Expert', description: 'Comprehensive EDR for complex environments', link: '/shop?search=kaspersky+next+edr+expert' },
  ];

  const featuresList = [
    { name: "Endpoint Protection", foundations: true, optimum: true, expert: true },
    { name: "Basic EDR", foundations: true, optimum: true, expert: true },
    { name: "Cloud Management", foundations: true, optimum: true, expert: true },
    { name: "Advanced EDR", foundations: false, optimum: true, expert: true },
    { name: "Threat Hunting", foundations: false, optimum: true, expert: true },
    { name: "Application Control", foundations: false, optimum: true, expert: true },
    { name: "XDR Capabilities", foundations: false, optimum: false, expert: true },
    { name: "Managed Detection and Response (MDR)", foundations: false, optimum: false, expert: true },
  ];

  return (
    <div className="bg-background min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20 md:py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
            Kaspersky Next EDR Foundations
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
              </CardHeader> {/* Added missing closing tag here */}
              <CardTitle>Cost-Effective</CardTitle>
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

      {/* Compare Our Plans Section */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Compare Our Kaspersky Next EDR Plans</h2>
          <div className="overflow-x-auto">
            <Table className="min-w-full bg-white text-foreground rounded-lg shadow-lg">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-[200px] text-left font-bold text-lg text-foreground">Feature</TableHead>
                  {kasperskyPlansData.map((plan) => (
                    <TableHead key={plan.id} className="text-center font-bold text-lg text-foreground">
                      <div>
                        {plan.name}
                        <p className="text-sm font-normal text-muted-foreground mt-1">{plan.description}</p>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {featuresList.map((feature, index) => (
                  <TableRow key={index} className="border-b border-gray-200">
                    <TableCell className="font-medium text-left py-3">{feature.name}</TableCell>
                    <TableCell className="text-center py-3">
                      {feature.foundations ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      {feature.optimum ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      {feature.expert ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50">
                  <TableCell className="text-left font-bold text-lg py-4">Action</TableCell>
                  {kasperskyPlansData.map((plan) => (
                    <TableCell key={plan.id} className="text-center py-4">
                      <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <Link href={plan.link}>View Products</Link>
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
}