export function Footer() {
  return (
    <footer className="bg-[#1e73be] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4 lg:px-8">
        <div>
          <h3 className="mb-4 font-semibold">My account</h3>
          <a className="block text-sm text-blue-100 hover:text-white" href="#">
            Register
          </a>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Legal</h3>
          {["Terms and Conditions", "Privacy Policy", "Refund and Returns Policy"].map((t) => (
            <a key={t} className="block text-sm text-blue-100 hover:text-white" href="#">
              {t}
            </a>
          ))}
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Quick Links</h3>
          {["Home", "Shop", "About Us", "Contact"].map((t) => (
            <a key={t} className="block text-sm text-blue-100 hover:text-white" href="#">
              {t}
            </a>
          ))}
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Contact</h3>
          <p className="text-sm text-blue-100">+1 (310) 777 8808</p>
          <p className="text-sm text-blue-100">+1 (310) 888 7708</p>
          <p className="text-sm text-blue-100">support@dropskey.com</p>
        </div>
      </div>
      <div className="bg-gray-800 py-4 text-center text-xs text-gray-400">© 2025 Dropskey</div>
    </footer>
  )
}
