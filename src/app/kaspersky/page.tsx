"use client"

import { ShieldCheck, Cloud, Settings, Bug, Zap, DollarSign, RefreshCcw, Scale, Users, Award, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

const BASE_PRICE = 1495;
const PRICE_PER_EXTRA_USER = 230;
const DISCOUNT_RATE = 0.10;

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

  // Pricing plan state
  const [foundationsUsers, setFoundationsUsers] = useState(5);
  const [foundationsYears, setFoundationsYears] = useState(1);
  const [foundationsAutoRenew, setFoundationsAutoRenew] = useState(true);

  const [optimumUsers, setOptimumUsers] = useState(5);
  const [optimumYears, setOptimumYears] = useState(1);
  const [optimumAutoRenew, setOptimumAutoRenew] = useState(true);

  // Calculate price with discount
  function calculatePrice(users: number, years: number) {
    const extraUsers = Math.max(0, users - 5);
    const priceBeforeDiscount = (BASE_PRICE + extraUsers * PRICE_PER_EXTRA_USER) * years;
    const discountAmount = priceBeforeDiscount * DISCOUNT_RATE;
    return {
      priceBeforeDiscount,
      discountAmount,
      finalPrice: priceBeforeDiscount - discountAmount,
    };
  }

  const foundationsPrice = calculatePrice(foundationsUsers, foundationsYears);
  const optimumPrice = calculatePrice(optimumUsers, optimumYears);

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

      {/* Compare Our Plans Section */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold mb-8">Compare Our Kaspersky Next EDR Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="border border-gray-300 p-4 text-left font-semibold">Feature</th>
                  {kasperskyPlansData.map((plan) => (
                    <th key={plan.id} className="border border-gray-300 p-4 font-semibold text-center">
                      <div className="text-lg">{plan.name}</div>
                      <div className="text-sm font-normal mt-1">{plan.description}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featuresList.map((feature, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                    <td className="border border-gray-300 p-4 font-medium text-left">{feature.name}</td>
                    <td className="border border-gray-300 p-4 text-center">
                      {feature.foundations ? <Check className="mx-auto text-green-600" /> : <X className="mx-auto text-red-600" />}
                    </td>
                    <td className="border border-gray-300 p-4 text-center">
                      {feature.optimum ? <Check className="mx-auto text-green-600" /> : <X className="mx-auto text-red-600" />}
                    </td>
                    <td className="border border-gray-300 p-4 text-center">
                      {feature.expert ? <Check className="mx-auto text-green-600" /> : <X className="mx-auto text-red-600" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* New Pricing Plans Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Foundations Plan */}
            <div className="border rounded-lg p-6 bg-green-50 relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  <img src="/images/kaspersky-logo.svg" alt="Kaspersky Logo" className="mx-auto h-12" />
                </div>
                <h3 className="text-xl font-bold mb-2">Kaspersky Next EDR Foundations</h3>
                <p className="mb-6 text-muted-foreground max-w-xs">
                  Provides core protection and controls for all your endpoints.
                </p>

                <div className="flex justify-center gap-4 mb-4">
                  <label className="flex flex-col items-center">
                    <span className="mb-1 font-semibold">Users</span>
                    <select
                      className="border rounded px-3 py-1"
                      value={foundationsUsers}
                      onChange={(e) => setFoundationsUsers(parseInt(e.target.value))}
                    >
                      {[5,6,7,8,9,10,15,20,25,30].map((num) => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col items-center">
                    <span className="mb-1 font-semibold">Years</span>
                    <div className="flex space-x-2">
                      {[1,2,3].map((year) => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => setFoundationsYears(year)}
                          className={`rounded-full border px-3 py-1 font-semibold ${foundationsYears === year ? 'bg-yellow-400 text-black' : 'bg-white text-gray-700'}`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>

                <div className="mb-4">
                  <div className="inline-block bg-yellow-400 text-black font-bold px-4 py-1 rounded mb-2">Save 10%</div>
                  <div className="text-sm line-through text-gray-500 mb-1">
                    ${foundationsPrice.priceBeforeDiscount.toFixed(2)}
                  </div>
                  <div className="text-3xl font-extrabold">
                    ${foundationsPrice.finalPrice.toFixed(2)}
                  </div>
                </div>

                <label className="flex items-center space-x-2 mb-6">
                  <input
                    type="checkbox"
                    checked={foundationsAutoRenew}
                    onChange={() => setFoundationsAutoRenew(!foundationsAutoRenew)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm text-gray-700">Auto-Renewal</span>
                  <button
                    type="button"
                    aria-label="Auto-Renewal info"
                    className="ml-1 text-gray-400 hover:text-gray-600"
                    onClick={() => alert("Auto-renewal means your subscription will automatically renew at the end of the term.")}
                  >
                    ?
                  </button>
                </label>

                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded">
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Optimum Plan */}
            <div className="border rounded-lg p-6 bg-blue-50 relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-black font-bold px-3 py-1 rounded-bl-lg">
                Recommended
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  <img src="/images/kaspersky-logo.svg" alt="Kaspersky Logo" className="mx-auto h-12" />
                </div>
                <h3 className="text-xl font-bold mb-2">Kaspersky Next EDR Optimum</h3>
                <p className="mb-6 text-muted-foreground max-w-xs">
                  Intermediate security offering simplicity and automation.
                </p>

                <div className="flex justify-center gap-4 mb-4">
                  <label className="flex flex-col items-center">
                    <span className="mb-1 font-semibold">Users</span>
                    <select
                      className="border rounded px-3 py-1"
                      value={optimumUsers}
                      onChange={(e) => setOptimumUsers(parseInt(e.target.value))}
                    >
                      {[5,6,7,8,9,10,15,20,25,30].map((num) => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col items-center">
                    <span className="mb-1 font-semibold">Years</span>
                    <div className="flex space-x-2">
                      {[1,2].map((year) => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => setOptimumYears(year)}
                          className={`rounded-full border px-3 py-1 font-semibold ${optimumYears === year ? 'bg-yellow-400 text-black' : 'bg-white text-gray-700'}`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>

                <div className="mb-4">
                  <div className="inline-block bg-yellow-400 text-black font-bold px-4 py-1 rounded mb-2">Save 10%</div>
                  <div className="text-sm line-through text-gray-500 mb-1">
                    ${optimumPrice.priceBeforeDiscount.toFixed(2)}
                  </div>
                  <div className="text-3xl font-extrabold">
                    ${optimumPrice.finalPrice.toFixed(2)}
                  </div>
                </div>

                <label className="flex items-center space-x-2 mb-6">
                  <input
                    type="checkbox"
                    checked={optimumAutoRenew}
                    onChange={() => setOptimumAutoRenew(!optimumAutoRenew)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm text-gray-700">Auto-Renewal</span>
                  <button
                    type="button"
                    aria-label="Auto-Renewal info"
                    className="ml-1 text-gray-400 hover:text-gray-600"
                    onClick={() => alert("Auto-renewal means your subscription will automatically renew at the end of the term.")}
                  >
                    ?
                  </button>
                </label>

                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded">
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}