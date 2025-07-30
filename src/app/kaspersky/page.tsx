"use client"

import { ShieldCheck, Cloud, Settings, Bug, Zap, DollarSign, RefreshCcw, Scale, Users, Award, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

const BASE_PRICE = 1495;
const PRICE_PER_EXTRA_USER = 230;
const DISCOUNT_RATE = 0.10;

// Updated KasperskyLogo component with hexagon and 'k' letter, green gradient fill
function KasperskyLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Kaspersky Logo"
    >
      <defs>
        <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00FF9F" />
          <stop offset="100%" stopColor="#00BFA6" />
        </linearGradient>
      </defs>
      {/* Outer hexagon */}
      <path
        d="M48 2 L88 26 L88 70 L48 94 L8 70 L8 26 Z"
        fill="url(#greenGradient)"
        stroke="#00BFA6"
        strokeWidth="2"
      />
      {/* Inner hexagon */}
      <path
        d="M48 18 L76 34 L76 62 L48 78 L20 62 L20 34 Z"
        fill="url(#greenGradient)"
        stroke="#008F8A"
        strokeWidth="2"
      />
      {/* Letter K */}
      <path
        d="M38 32 L38 64 L44 64 L44 48 L54 64 L60 64 L50 48 L60 32 L54 32 L44 44 L44 32 Z"
        fill="#000000"
      />
    </svg>
  );
}

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
      {/* ... other sections unchanged ... */}

      {/* Compare Our Plans Section */}
      <section className="py-16 bg-white text-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Compare Our Kaspersky Next EDR Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg shadow-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-4 text-left font-semibold">Feature</th>
                  {kasperskyPlansData.map((plan) => (
                    <th key={plan.id} className="border border-gray-300 p-4 font-semibold text-center">
                      <div className="text-lg font-medium">{plan.name}</div>
                      <div className="text-sm font-normal text-gray-600 mt-1">{plan.description}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featuresList.map((feature, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 p-4 font-medium">{feature.name}</td>
                    <td className="border border-gray-300 p-4 text-center">
                      {feature.foundations ? <Check className="mx-auto text-green-600" size={20} /> : <X className="mx-auto text-red-600" size={20} />}
                    </td>
                    <td className="border border-gray-300 p-4 text-center">
                      {feature.optimum ? <Check className="mx-auto text-green-600" size={20} /> : <X className="mx-auto text-red-600" size={20} />}
                    </td>
                    <td className="border border-gray-300 p-4 text-center">
                      {feature.expert ? <Check className="mx-auto text-green-600" size={20} /> : <X className="mx-auto text-red-600" size={20} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Plans Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Foundations Plan */}
            <div className="border rounded-lg p-6 bg-green-50 relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  <KasperskyLogo className="mx-auto h-12 w-auto" />
                </div>
                <h3 className="text-xl font-bold mb-2">Kaspersky Next EDR Foundations</h3>
                <p className="mb-6 text-gray-700 max-w-xs">
                  Provides core protection and controls for all your endpoints.
                </p>

                <div className="flex justify-center gap-4 mb-4">
                  <label className="flex flex-col items-center">
                    <span className="mb-1 font-semibold text-gray-900">Users</span>
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
                    <span className="mb-1 font-semibold text-gray-900">Years</span>
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
                  <div className="text-3xl font-extrabold text-gray-900">
                    ${foundationsPrice.finalPrice.toFixed(2)}
                  </div>
                </div>

                <label className="flex items-center space-x-2 mb-6 text-gray-900">
                  <input
                    type="checkbox"
                    checked={foundationsAutoRenew}
                    onChange={() => setFoundationsAutoRenew(!foundationsAutoRenew)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm">Auto-Renewal</span>
                  <button
                    type="button"
                    aria-label="Auto-Renewal info"
                    className="ml-1 text-gray-500 hover:text-gray-700"
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
                  <KasperskyLogo className="mx-auto h-12 w-auto" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Kaspersky Next EDR Optimum</h3>
                <p className="mb-6 text-gray-700 max-w-xs">
                  Intermediate security offering simplicity and automation.
                </p>

                <div className="flex justify-center gap-4 mb-4">
                  <label className="flex flex-col items-center">
                    <span className="mb-1 font-semibold text-gray-900">Users</span>
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
                    <span className="mb-1 font-semibold text-gray-900">Years</span>
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
                  <div className="text-3xl font-extrabold text-gray-900">
                    ${optimumPrice.finalPrice.toFixed(2)}
                  </div>
                </div>

                <label className="flex items-center space-x-2 mb-6 text-gray-900">
                  <input
                    type="checkbox"
                    checked={optimumAutoRenew}
                    onChange={() => setOptimumAutoRenew(!optimumAutoRenew)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm">Auto-Renewal</span>
                  <button
                    type="button"
                    aria-label="Auto-Renewal info"
                    className="ml-1 text-gray-500 hover:text-gray-700"
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