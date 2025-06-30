import { GraphQLClient, gql } from "graphql-request"
import { ShoppingCart } from "lucide-react"

const graphqlAPI = process.env.WORDPRESS_API_URL

const GET_PRODUCTS = gql`
  query GetProducts {
    products(first: 8) {
      nodes {
        id
        name
        slug
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
        }
        ... on ExternalProduct {
          price
          regularPrice
          salePrice
        }
      }
    }
  }
`

export async function WeeklyProducts() {
  let products = []

  if (graphqlAPI) {
    const graphQLClient = new GraphQLClient(graphqlAPI)
    try {
      const data: any = await graphQLClient.request(GET_PRODUCTS)
      products = data.products.nodes
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  // Fallback products matching the screenshot
  const fallbackProducts = [
    {
      id: "1",
      name: "Windows Server 2022",
      price: "69.99 $",
      image: "/placeholder.svg?height=200&width=200&text=Windows+Server+2022",
      slug: "windows-server-2022",
    },
    {
      id: "2",
      name: "Windows Server 2019",
      price: "53.85 $",
      image: "/placeholder.svg?height=200&width=200&text=Windows+Server+2019",
      slug: "windows-server-2019",
    },
    {
      id: "3",
      name: "Windows 11 Pro",
      price: "28.00 $",
      image: "/placeholder.svg?height=200&width=200&text=Windows+11+Pro",
      slug: "windows-11-pro",
    },
    {
      id: "4",
      name: "Windows 10 Pro",
      price: "25.00 $ 19.00 $",
      image: "/placeholder.svg?height=200&width=200&text=Windows+10+Pro",
      slug: "windows-10-pro",
      onSale: true,
    },
    {
      id: "5",
      name: "PIA: Privet Internet Access",
      price: "79.38 $",
      image: "/placeholder.svg?height=200&width=200&text=PIA",
      slug: "pia-private-internet-access",
      onSale: true,
      salePercent: "42%",
    },
    {
      id: "6",
      name: "Office365",
      price: "39.99 $",
      image: "/placeholder.svg?height=200&width=200&text=Office365",
      slug: "office365",
      onSale: true,
      salePercent: "11%",
    },
    {
      id: "7",
      name: "Office 2021 Pro...",
      price: "45.00 $",
      image: "/placeholder.svg?height=200&width=200&text=Office+2021",
      slug: "office-2021-pro",
    },
    {
      id: "8",
      name: "Office 2019 Plus",
      price: "49.00 $",
      image: "/placeholder.svg?height=200&width=200&text=Office+2019",
      slug: "office-2019-plus",
    },
  ]

  const displayProducts = products.length > 0 ? products : fallbackProducts

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-blue-600 mb-2">Weekly Products</h2>
        <div className="w-16 h-0.5 bg-blue-600 mb-8"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.slice(0, 8).map((product: any) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow relative group"
            >
              {/* Sale badge */}
              {product.onSale && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                    SALE {product.salePercent || ""}
                  </span>
                </div>
              )}

              {/* Product image */}
              <div className="aspect-square mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={product.image?.sourceUrl || product.image}
                  alt={product.image?.altText || product.name}
                  className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Product name */}
              <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>

              {/* Price */}
              <div className="text-lg font-semibold text-gray-900 mb-4">
                <span dangerouslySetInnerHTML={{ __html: product.price }} />
              </div>

              {/* Quick view button */}
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded text-sm font-medium hover:bg-gray-200 transition-colors mb-3">
                QUICK VIEW
              </button>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center justify-between">
                <div className="flex items-center border border-gray-300 rounded">
                  <button className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm">-</button>
                  <input type="number" value="1" className="w-12 text-center border-0 text-sm py-1" readOnly />
                  <button className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm">+</button>
                </div>
                <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
