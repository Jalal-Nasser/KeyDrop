import { CreditCard, Bitcoin } from "lucide-react"

export function Footer() {
  return (
    <footer className="text-white py-12" style={{ backgroundColor: "#1e73be" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Our Partner - Kaspersky */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Our Partner</h3>
            <div className="space-y-4">
              <div className="relative group">
                <a 
                  href="#" 
                  className="inline-block"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('/images/Kasper Registered Partner Certificate.png', '_blank');
                  }}
                >
                  <img 
                    src="/images/kaspersky_b2b_registered_partner-dropskey.png" 
                    alt="Kaspersky B2B Registered Partner"
                    className="h-auto w-48 cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </a>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Click to view certificate
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-t-gray-800 border-l-transparent border-r-transparent"></div>
                </div>
              </div>
            </div>
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
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="text-blue-100 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-blue-100 hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="mt-8 pt-6 border-t border-blue-500/30">
          <h3 className="font-semibold mb-4 text-white text-center">We Accept</h3>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-blue-100">
              <CreditCard className="w-8 h-8" />
              <span className="text-sm">Credit Cards</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.72-4.509z"/>
              </svg>
              <span className="text-sm">PayPal</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-sm">Apple Pay</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Bitcoin className="w-8 h-8" />
              <span className="text-sm">Cryptocurrency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright section - EXACT styling */}
      <div className="bg-gray-800 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            Copyright © {new Date().getFullYear()} Dropskey
          </p>
        </div>
      </div>
    </footer>
  )
}
