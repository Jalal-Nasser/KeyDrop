import { GraphQLClient, gql } from "graphql-request"
import Image from "next/image" // Import Next.js Image component for optimization

const graphqlAPI = process.env.WORDPRESS_API_URL

// GraphQL query to get a single product by its slug
const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      name
      slug
      description
      price
      image {
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
      galleryImages {
        nodes {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      # Add more fields as needed, e.g., categories, tags, reviews
    }
  }
`

// Function to get all product slugs for static paths (for build time)
export async function generateStaticParams() {
  if (!graphqlAPI) {
    console.error("WORDPRESS_API_URL is not defined for generateStaticParams.")
    return []
  }
  const graphQLClient = new GraphQLClient(graphqlAPI)
  const GET_ALL_PRODUCT_SLUGS = gql`
    query GetAllProductSlugs {
      products(first: 100) { # Fetch enough slugs, adjust as needed
        nodes {
          slug
        }
      }
    }
  `
  try {
    const data: any = await graphQLClient.request(GET_ALL_PRODUCT_SLUGS)
    return data.products.nodes.map((product: { slug: string }) => ({
      slug: product.slug,
    }))
  } catch (error) {
    console.error("Error fetching product slugs for static params:", error)
    return []
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  if (!graphqlAPI) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Configuration Error</h1>
        <p className="text-lg">Please set the `WORDPRESS_API_URL` environment variable in your `.env.local` file.</p>
      </main>
    )
  }

  const graphQLClient = new GraphQLClient(graphqlAPI)
  let product: any = null
  let errorFetching = false

  try {
    const data: any = await graphQLClient.request(GET_PRODUCT_BY_SLUG, { slug })
    product = data.product
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error)
    errorFetching = true
  }

  if (errorFetching || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Product Not Found</h1>
        <p className="text-lg text-gray-700">
          We could not find the product you are looking for, or there was an error fetching it.
        </p>
        <a href="/" className="mt-6 text-blue-600 hover:underline">
          Go back to Home
        </a>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {product.image && (
          <div className="relative w-full h-96 rounded-lg overflow-hidden">
            <Image
              src={product.image.sourceUrl || "/placeholder.svg"}
              alt={product.image.altText || product.name}
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
        )}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{product.name}</h1>
          {product.price && <p className="text-3xl font-semibold text-green-600 mb-6">{product.price}</p>}
          {product.description && (
            <div
              className="text-gray-700 leading-relaxed mb-6 prose"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
          {/* Add a simple Add to Cart button placeholder */}
          <button className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors duration-300 text-lg font-medium">
            Add to Cart
          </button>
        </div>
      </div>

      {product.galleryImages && product.galleryImages.nodes.length > 0 && (
        <section className="max-w-6xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Product Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {product.galleryImages.nodes.map((img: any) => (
              <div key={img.sourceUrl} className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={img.sourceUrl || "/placeholder.svg"}
                  alt={img.altText || product.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
