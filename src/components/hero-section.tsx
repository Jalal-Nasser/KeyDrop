"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ShoppingCart } from "lucide-react"

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20 lg:py-32">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-in slide-in-from-left duration-700">
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                            Premium Software Keys <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                Instant Delivery
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 max-w-xl leading-relaxed">
                            Unlock your potential with genuine software licenses.
                            Windows, Office, and antivirus keys at unbeatable prices.
                            100% secure and guaranteed.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-blue-900/50 transition-all hover:scale-105">
                                <Link href="/shop">
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Shop Now
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="border-blue-400 text-blue-100 hover:bg-blue-900/50 hover:text-white px-8 py-6 text-lg rounded-full ">
                                <Link href="#features">
                                    Learn More
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                        <div className="pt-8 flex items-center gap-8 text-sm font-medium text-blue-200">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                Instant Email Delivery
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                24/7 Support
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block relative animate-in slide-in-from-right duration-700 delay-200">
                        <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/20 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold">500+</div>
                                    <div className="text-sm text-blue-100">Products</div>
                                </div>
                                <div className="bg-white/20 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold">24/7</div>
                                    <div className="text-sm text-blue-100">Support</div>
                                </div>
                                <div className="bg-white/20 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold">99%</div>
                                    <div className="text-sm text-blue-100">Uptime</div>
                                </div>
                                <div className="bg-white/20 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold">1M+</div>
                                    <div className="text-sm text-blue-100">Users</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
