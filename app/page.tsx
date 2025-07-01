import { GraphQLClient, gql } from "graphql-request"
import { HeroSlider } from "@/components/hero-slider"
import { WeeklyProducts } from "@/components/weekly-products"

// Define your WordPress GraphQL endpoint
const graphqlAPI = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "http://localhost:8888/wordpress/graphql" // Replace with your actual WordPress URL

// Define your GraphQL query
const GET_POSTS = gql`
  query GetPosts {
    posts(first: 5) {
      nodes {
        id
        title
        excerpt
        uri
      }
    }
  }
`

export default async function Home() {
  if (!graphqlAPI) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Configuration Error</h1>
        <p className="text-lg">
          Please set the `NEXT_PUBLIC_WORDPRESS_API_URL` environment variable in your `.env.local` file.
        </p>
        <p className="text-md mt-2">
          Example: `NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-domain.com/graphql`
        </p>
      </main>
    )
  }

  const graphQLClient = new GraphQLClient(graphqlAPI)

  let posts = []
  let errorFetching = false
  try {
    const data: any = await graphQLClient.request(GET_POSTS)
    posts = data.posts.nodes
  } catch (error) {
    console.error("Error fetching posts from WordPress:", error)
    errorFetching = true
  }

  if (errorFetching) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Error Connecting to WordPress</h1>
        <p className="text-lg text-gray-700">
          Could not fetch data from the WordPress API. Please ensure your WordPress GraphQL endpoint is running and accessible at:
        </p>
        <p className="text-md font-mono bg-gray-100 p-2 rounded mt-2">{graphqlAPI}</p>
        <p className="text-md mt-4">
          Check your internet connection, the API URL in `.env.local`, and that your WordPress server is online.
        </p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <HeroSlider />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-semibold mb-8" style={{ color: "#1e73be" }}>
          Weekly Products
        </h2>
      </div>
      <WeeklyProducts />

      {/* Removed Latest Posts Section */}
    </main>
  )
}