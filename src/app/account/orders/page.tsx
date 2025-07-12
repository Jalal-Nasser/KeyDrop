const { data, error } = await supabase
  .from('orders')
  .select(`
    id, created_at, total, status,
    order_items!inner(id, product_id, quantity, price_at_purchase, 
      products:products!inner(name)
    )
  `)
  .eq('user_id', session.user.id)
  .order('created_at', { ascending: false });