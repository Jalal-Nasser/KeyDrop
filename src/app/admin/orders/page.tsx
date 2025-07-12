// ... existing imports ...

interface OrderItem {
  product_id: number;
  quantity: number;
  products: { name: string } | null; // Changed to single product object
}

// ... rest of existing code ...

// Update the items display in the table
<TableCell>
  {order.order_items.map((item, index) => (
    <div key={item.product_id}>
      {item.quantity} x {item.products?.name || `Product ${item.product_id}`}
      {index < order.order_items.length - 1 ? ',' : ''}
    </div>
  ))}
</TableCell>

// ... rest of file ...