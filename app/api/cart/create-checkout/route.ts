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
  id: number; // Changed to number
  quantity: number;
}

/**
 * Returns the numeric database ID directly, as it's now expected to be a number.
 * @param id The product ID from the cart context (now always a number).
 * @returns The numeric database ID.
 */
function getDatabaseId(id: number): number {
  return id; // Simplified, as ID is now always numeric
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
      productId: getDatabaseId(item.id), // Use helper to get correct ID
      quantity: item.quantity,
    }));

    // Step 1: Add items to the cart to create a server-side session.
    const addCartResponse = await client.rawRequest(ADD_ITEMS_TO_CART_MUTATION, {
      input: {
        clientMutationId: "dyad-add-to-cart",
        items: lineItems,
      },
    });

    const setCookieHeader = addCartResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      const errorMessages = (addCartResponse.errors || []).map((e: any) => e.message).join(', ');
      console.error("No 'set-cookie' header found in addCartResponse. Errors:", errorMessages);
      throw new Error(`Failed to establish a cart session. Server response: ${errorMessages || 'No error message provided.'}`);
    }

    console.log("Original set-cookie header:", setCookieHeader);

    // Split by comma to get individual cookie strings (e.g., "name=value; Path=/", "name2=value2; HttpOnly")
    const individualCookieStrings = setCookieHeader.split(',');

    // For each cookie string, extract only the "name=value" part (before the first ';')
    const parsedCookies = individualCookieStrings
      .map(cookieString => cookieString.split(';')[0].trim())
      .filter(Boolean) // Remove any empty strings that might result from extra commas
      .join('; '); // Join them with '; ' for the 'cookie' request header

    console.log("Parsed cookie header for next request:", parsedCookies);

    // Step 2: Call the checkout mutation, passing the parsed session cookie back.
    const checkoutResponse = await client.rawRequest(CHECKOUT_MUTATION, 
      {
        input: {
          clientMutationId: "dyad-checkout-attempt",
        },
      },
      {
        'cookie': parsedCookies,
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