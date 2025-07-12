// ... existing imports ...

// Update the customer name cell
<TableCell>
  {order.profiles?.[0]?.first_name || 'Unknown'} {order.profiles?.[0]?.last_name || ''}
</TableCell>

// ... rest of file ...