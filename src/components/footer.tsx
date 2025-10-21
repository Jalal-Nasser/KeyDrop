export function Footer() {
  return (
    <footer className="text-white py-12" style={{ backgroundColor: "#1e73be" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
