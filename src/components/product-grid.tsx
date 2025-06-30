import { GraphQLClient, gql } from "graphql-request"

const graphqlAPI = process.env.WORDPRESS_API_URL

const GET_PRODUCTS = gql`
  query GetProducts {
    products(first: 12) {
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
          description
        }
        ... on VariableProduct {
          price
          description
        }
        ... on ExternalProduct {
          price
          description
        }
      }
    }
  }
`

export async function ProductGrid() {
  if (!graphqlAPI) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-red-600">WordPress API not configured</p>
        </div>
      </section>
    )
  }

  const graphQLClient = new GraphQLClient(graphqlAPI)
  let products = []
  let errorFetching = false

  try {
    const data: any = await graphQLClient.request(GET_PRODUCTS)
    products = data.products.nodes
  } catch (error) {
    console.error("Error fetching products:", error)
    errorFetching = true
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular digital solutions and software packages
          </p>
        </div>

        {errorFetching ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">Failed to load products. Please try again later.</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image.sourceUrl || "/placeholder.svg"}
                      alt={product.image.altText || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                      <div className="text-blue-400 text-4xl">📦</div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <button className="bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      <span dangerouslySetInnerHTML={{ __html: product.description }} />
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    {product.price && (
                      <div className="text-lg font-bold text-blue-600">
                        <span dangerouslySetInnerHTML={{ __html: product.price }} />
                      </div>
                    )}
                    <a
                      href={`/products/${product.slug}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
}
