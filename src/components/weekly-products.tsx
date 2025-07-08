// Find the Button component in the WeeklyProducts file and update its style prop:
<Button 
  className="w-full bg-blue-600 hover:bg-blue-700"
  style={{ backgroundColor: "#805da8", color: "white" }}
  onClick={() => addToCart(product)}
>
  <ShoppingCart className="w-4 h-4 mr-2" />
  Add to Cart
</Button>