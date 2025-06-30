import { GraphQLClient, gql } from "graphql-request"
import { HeroSlider } from "@/components/hero-slider"
import { WeeklyProducts } from "@/components/weekly-products"

// Define your WordPress GraphQL endpoint
const graphqlAPI = process.env.WORDPRESS_API_URL || "http://localhost:8888/wordpress/graphql" // Replace with your actual WordPress URL

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
  const graphQLClient = new GraphQLClient(graphqlAPI)

  let posts = []
  try {
    const data: any = await graphQLClient.request(GET_POSTS)
    posts = data.posts.nodes
  } catch (error) {
    console.error("Error fetching posts from WordPress:", error)
    // Handle error, e.g., display a message to the user
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <HeroSlider />
      <WeeklyProducts />

      {/* Removed Latest Posts Section */}
    </main>
  )
}
