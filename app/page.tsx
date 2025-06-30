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
      <h1 className="text-5xl font-bold mb-8">Welcome to Dropskey!</h1>
      <p className="text-xl mb-12 text-center max-w-2xl">This content is powered by your Headless WordPress.</p>

      <section className="w-full max-w-4xl">
        <h2 className="text-3xl font-semibold mb-6">Latest Posts</h2>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: post.excerpt }} />
                <a href={post.uri} className="text-blue-600 hover:underline">
                  Read more
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            No posts found. Make sure your WordPress is running and WPGraphQL is configured.
          </p>
        )}
      </section>
    </main>
  )
}
