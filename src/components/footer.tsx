import Image from "next/image"; // Import Image component

export function Footer() {
  return (
    <footer className="text-white py-12" style={{ backgroundColor: "#1e73be" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kaspersky Partner Logo */}
          <div className="flex justify-center md:justify-start items-center">
            <Image
              src="/kaspersky_b2b_registered_partner-dropskey.png"
              alt="Kaspersky B2B Registered Partner Dropskey"
              width={150} // Adjust width as needed
              height={100} // Adjust height as needed
              style={{ objectFit: "contain" }}
              className="max-w-full h-auto"
            />
          </div>

          {/* Terms and Conditions - EXACT content */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/terms" className="text-blue-100 hover:text-white transition-colors">
                  Terms and Conditions
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-blue-100 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/refund" className="text-blue-100 hover:text-white transition-colors">
                  Refund and Returns Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links - EXACT content */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-blue-100 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/shop" className="text-blue-100 hover:text-white transition-colors">
                  Shop
                </a>
              </li>
              <li>
                <a href="/about" className="text-blue-100 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-blue-100 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info - EXACT content */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Contact</h3>
            <div className="space-y-2 text-sm text-blue-100">
              <p>+1 (310) 777 8808</p>
              <p>+1 (310) 888 7708</p>
              <p>support@dropskey.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright section - EXACT styling */}
      <div className="bg-gray-800 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">Copyright © 2025 Dropskey</p>
        </div>
      </div>
    </footer>
  )
}