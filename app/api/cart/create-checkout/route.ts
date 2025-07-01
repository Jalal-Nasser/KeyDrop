import { NextRequest, NextResponse } from 'next/server';
import { GraphQLClient, gql } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

// Mutation to add multiple items to the server-side cart.
// This is a common pattern for WooCommerce GraphQL extensions.
const ADD_ITEMS_TO_CART_MUTATION = gql`
  mutation AddCartItems($input: AddCartItemsInput!) {
    addCartItems(input: $input) {
      clientMutationId
      cart {
        contents {
          nodes {
            key # We can use the key to confirm items were added
          }
        }
      }
    }
  }
`;

// Mutation to get the checkout URL after a cart has been established
const CHECKOUT_MUTATION = gql`
  mutation Checkout($input: CheckoutInput!) {
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
  if (!endpoint) {
    const errorMessage = "WordPress API URL not configured.";
    console.error(errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  const client = new GraphQLClient(endpoint);

  try {
    const { items } = (await req.json()) as { items: CartItem[] };
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    const lineItems = items.map(item => ({
      productId: parseInt(item.id, 10),
      quantity: item.quantity,
    }));

    // Step 1: Add items to the cart to create a server-side session.
    // We use rawRequest to access the response headers.
    const addCartResponse = await client.rawRequest(ADD_ITEMS_TO_CART_MUTATION, {
      input: {
        clientMutationId: "dyad-add-to-cart",
        items: lineItems,
      },
    });

    // Extract the session cookie from the response. This is crucial.
    const setCookieHeader = addCartResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      console.error("No session cookie returned after adding items to cart.", addCartResponse.data);
      // Check for specific errors from the addCartItems mutation
      const errorMessages = (addCartResponse.errors || []).map((e: any) => e.message).join(', ');
      throw new Error(`Failed to establish a cart session. Server response: ${errorMessages || 'No error message provided.'}`);
    }

    // Step 2: Call the checkout mutation, passing the session cookie back.
    const checkoutResponse = await client.rawRequest(CHECKOUT_MUTATION, 
      {
        input: {
          clientMutationId: "dyad-checkout-attempt",
        },
      },
      {
        // Pass the cookie to maintain the session
        'cookie': setCookieHeader,
      }
    );

    const checkoutUrl = checkoutResponse.data?.checkout?.redirect;

    if (checkoutUrl) {
      // On successful checkout creation, we should clear the local cart
      // as the user is now being redirected to the payment page.
      return NextResponse.json({ checkoutUrl });
    } else {
      console.error("Checkout URL not found in GraphQL response:", checkoutResponse.data);
      throw new Error('Could not create a checkout session after populating cart.');
    }

  } catch (error) {
    console.error('Error creating checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}