import { Shield, Zap, Users, Award } from "lucide-react"

export function FeaturesSection() {
    const features = [
        {
            icon: Shield,
            title: "Secure & Reliable",
            description: "Enterprise-grade security with 99.9% uptime guarantee for all our digital solutions.",
        },
        {
            icon: Zap,
            title: "Lightning Fast",
            description: "Optimized performance and instant delivery for all digital products and services.",
        },
        {
            icon: Users,
            title: "24/7 Support",
            description: "Round-the-clock customer support from our team of technical experts.",
        },
        {
            icon: Award,
            title: "Premium Quality",
            description: "Carefully curated selection of top-tier software and digital tools.",
        },
    ]

    return (
        <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Dropskey?</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        We provide the best digital solutions with unmatched quality and support
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="text-center group">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 group-hover:bg-blue-600 transition-colors">
                                <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
