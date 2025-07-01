import { NextRequest, NextResponse } from 'next/server';
import { GraphQLClient, gql } from 'graphql-request';

// IMPORTANT: You must set this environment variable to your WordPress GraphQL endpoint.
const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

// This is an assumed GraphQL mutation for creating a checkout with WooCommerce.
// You may need to adjust this based on your specific WPGraphQL for WooCommerce plugin and schema.
const CREATE_CHECKOUT_MUTATION = gql`
  mutation CreateCheckoutMutation($input: CheckoutInput!) {
    checkout(input: $input) {
      redirect
      result
    }
  }
`;

interface CartItem {
  id: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  console.log("NEXT_PUBLIC_WORDPRESS_API_URL:", endpoint); // Added for debugging

  if (!endpoint) {
    console.error("WordPress API URL is not configured in environment variables.");
    return NextResponse.json({ error: 'The store is not configured for checkout.' }, { status: 500 });
  }

  try {
    const { items } = (await req.json()) as { items: CartItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    // Format the cart items into the structure expected by the GraphQL mutation.
    // This assumes product IDs in WordPress are integers.
    const lineItems = items.map(item => ({
      productId: parseInt(item.id, 10),
      quantity: item.quantity,
    }));

    const client = new GraphQLClient(endpoint);

    // Send the request to the WordPress GraphQL API.
    // The variable structure { input: { lineItems: ... } } is an assumption.
    const data = await client.request(CREATE_CHECKOUT_MUTATION, {
      input: {
        lineItems: lineItems,
      },
    });

    // The response structure `data.checkout.redirect` is also an assumption.
    // It might be `data.checkout.checkoutUrl` or something similar.
    const checkoutUrl = data?.checkout?.redirect;

    if (checkoutUrl) {
      return NextResponse.json({ checkoutUrl });
    } else {
      console.error("Checkout URL not found in GraphQL response:", data);
      return NextResponse.json({ error: 'Could not create a checkout session.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json({ error: 'An internal server error occurred while creating checkout.' }, { status: 500 });
  }
}