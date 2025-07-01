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
    const errorMessage = "The WordPress API URL is not configured. Please set the NEXT_PUBLIC_WORDPRESS_API_URL environment variable in your project settings and restart the server.";
    console.error(errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  try {
    // The previous approach of passing items directly to the checkout mutation failed.
    // This is typical for WooCommerce, which expects items to be in a server-side cart session.
    // As a diagnostic step, we are now calling checkout without items.
    // We expect this to either go to an empty checkout page or return a "cart is empty" error.
    // This will confirm that we need to implement server-side cart synchronization.

    // const { items } = (await req.json()) as { items: CartItem[] };
    // if (!items || items.length === 0) {
    //   return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    // }
    // const lineItems = items.map(item => ({
    //   productId: parseInt(item.id, 10),
    //   quantity: item.quantity,
    // }));

    const client = new GraphQLClient(endpoint);

    const data = await client.request(CREATE_CHECKOUT_MUTATION, {
      input: {
        // Most WPGraphQL mutations require a clientMutationId.
        clientMutationId: "dyad-checkout-attempt"
      },
    });

    // The response structure `data.checkout.redirect` is also an assumption.
    // It might be `data.checkout.checkoutUrl` or something similar.
    const checkoutUrl = data?.checkout?.redirect;

    if (checkoutUrl) {
      return NextResponse.json({ checkoutUrl });
    } else {
      console.error("Checkout URL not found in GraphQL response:", data);
      // It's possible the error is inside the data object, e.g., data.checkout.result === 'failure'
      return NextResponse.json({ error: 'Could not create a checkout session. The server did not provide a redirect URL.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating checkout:', error);
    // We can inspect the error to see if it's a "cart is empty" error.
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    if (errorMessage.toLowerCase().includes("cart is empty")) {
        return NextResponse.json({ error: "Cannot proceed to checkout because the server-side cart is empty." }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred while creating checkout.' }, { status: 500 });
  }
}