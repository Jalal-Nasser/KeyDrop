export function WeeklyProducts() {
  // simple placeholder section – replace with real data later
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="mb-8 text-2xl font-semibold text-[#1e73be]">Weekly Products</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded border p-4 text-center shadow-sm hover:shadow">
              <div className="mb-4 aspect-square rounded bg-gray-100" />
              <p className="mb-2 text-sm font-medium">Product Name</p>
              <p className="mb-4 font-semibold text-gray-700">$ 0.00</p>
              <button className="rounded bg-gray-100 py-2 text-sm hover:bg-gray-200">QUICK VIEW</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
