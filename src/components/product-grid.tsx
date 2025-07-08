// Find the Button component in the ProductGrid file and update its style prop:
<Button
  className="w-full"
  style={{ backgroundColor: "#805da8", color: "white" }}
  onClick={() => addToCart(product)}
>
  <ShoppingCart className="w-4 h-4 mr-2" />
  Add to Cart
</Button>