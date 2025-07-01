import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

if (!endpoint) {
  throw new Error("NEXT_PUBLIC_WORDPRESS_API_URL is not defined");
}

export const client = new GraphQLClient(endpoint);