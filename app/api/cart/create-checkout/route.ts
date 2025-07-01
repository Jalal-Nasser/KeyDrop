import { NextRequest, NextResponse } from 'next/server';
import { GraphQLClient, gql } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

// Mutation to add multiple items to the server-side cart.
const ADD_ITEMS_TO_CART_MUTATION = gql`
  mutation AddCartItems($input: AddCartItemsInput!) {
    addCartItems(input: $input) {
      clientMutationId
      cart {
        contents {
          nodes {
            key
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
  id: number;
  quantity: number;
}

function getDatabaseId(id: number): number {
  return id;
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
      productId: getDatabaseId(item.id),
      quantity: item.quantity,
    }));

    // Step 1: Add items to the cart to create a server-side session.
    console.log("Sending ADD_ITEMS_TO_CART_MUTATION with items:", JSON.stringify(lineItems, null, 2));
    const addCartResponse = await client.rawRequest(ADD_ITEMS_TO_CART_MUTATION, {
      input: {
        clientMutationId: "dyad-add-to-cart",
        items: lineItems,
      },
    });

    console.log("Full response from addCartItems mutation:", JSON.stringify(addCartResponse, null, 2));

    const setCookieHeader = addCartResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      const errorMessages = (addCartResponse.errors || []).map((e: any) => e.message).join(', ');
      throw new Error(`Failed to establish a cart session. Server response: ${errorMessages || 'No error message provided.'}`);
    }

    console.log("Original set-cookie header:", setCookieHeader);

    // Split the header into individual cookie strings.
    const cookies = setCookieHeader.split(/, (?=[^;]+?=)/);
    console.log("Parsed cookies array:", cookies);

    // Find the specific WooCommerce session cookie. This is the key to the session.
    const sessionCookie = cookies.find(cookie => 
      cookie.trim().startsWith('wp_woocommerce_session_')
    );

    if (!sessionCookie) {
      console.error("WooCommerce session cookie not found in response. The received cookies were:", cookies);
      throw new Error("Could not find the necessary session cookie to proceed with checkout.");
    }

    // Extract just the 'key=value' part of the session cookie.
    const essentialCookie = sessionCookie.split(';')[0].trim();

    console.log("Found and using essential session cookie:", essentialCookie);

    // Step 2: Call the checkout mutation, passing ONLY the essential session cookie back.
    const checkoutResponse = await client.rawRequest(CHECKOUT_MUTATION, 
      {
        input: {
          clientMutationId: "dyad-checkout-attempt",
        },
      },
      {
        'cookie': essentialCookie, // Use only the crucial cookie
      }
    );

    const checkoutUrl = checkoutResponse.data?.checkout?.redirect;

    if (checkoutUrl) {
      return NextResponse.json({ checkoutUrl });
    } else {
      console.error("Checkout URL not found in GraphQL response:", checkoutResponse);
      const errorMessages = (checkoutResponse.errors || []).map((e: any) => e.message).join(', ');
      throw new Error(`Could not create a checkout session. Server response: ${errorMessages || 'No error message provided.'}`);
    }

  } catch (error) {
    console.error('Error creating checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}