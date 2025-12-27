"use client"

import { Shield, Zap, Users, Award } from "lucide-react"

export function FeaturesSection() {
    const features = [
        {
            icon: Shield,
            title: "Secure & Reliable",
            description: "Enterprise-grade security with 99.9% uptime guarantee for all our services.",
        },
        {
            icon: Zap,
            title: "Instant Delivery",
            description: "Get your product keys delivered to your email instantly after purchase.",
        },
        {
            icon: Award,
            title: "Premium Quality",
            description: "Only genuine, verified software keys from authorized distributors.",
        },
        {
            icon: Users,
            title: "24/7 Support",
            description: "Our dedicated team is available round the clock to assist you.",
        },
    ]

    return (
        <section id="features" className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Why Choose Us?</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We provide the best service in the industry with instant delivery and guaranteed satisfaction.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="text-center group p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
