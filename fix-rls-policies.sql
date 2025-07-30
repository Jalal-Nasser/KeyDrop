-- PROFILES TABLE POLICIES
DROP POLICY IF EXISTS "Users can select their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.profiles;

CREATE POLICY "Users can select their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can select all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p2
    WHERE p2.id = auth.uid() AND p2.is_admin = true
  )
);

-- STORE_NOTICES TABLE POLICIES
DROP POLICY IF EXISTS "Store notices are viewable by everyone." ON public.store_notices;

CREATE POLICY "Store notices are viewable by everyone." ON public.store_notices
FOR SELECT USING (true);

-- ORDERS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders." ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders." ON public.orders;
DROP POLICY IF EXISTS "Admins can insert orders for any user." ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders." ON public.orders;

CREATE POLICY "Users can view their own orders." ON public.orders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders." ON public.orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders." ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p2
    WHERE p2.id = auth.uid() AND p2.is_admin = true
  )
);

CREATE POLICY "Admins can insert orders for any user." ON public.orders
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles AS p2
    WHERE p2.id = auth.uid() AND p2.is_admin = true
  )
);

CREATE POLICY "Admins can update all orders." ON public.orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p2
    WHERE p2.id = auth.uid() AND p2.is_admin = true
  )
);

-- ORDER_ITEMS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view items in their own orders." ON public.order_items;
DROP POLICY IF EXISTS "Users can insert items into their own new orders." ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items." ON public.order_items;
DROP POLICY IF EXISTS "Admins can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can update all order items." ON public.order_items;

CREATE POLICY "Users can view items in their own orders." ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert items into their own new orders." ON public.order_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all order items." ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p2
    WHERE p2.id = auth.uid() AND p2.is_admin = true
  )
);

CREATE POLICY "Admins can insert order items" ON public.order_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles AS p2
    WHERE p2.id = auth.uid() AND p2.is_admin = true
  )
);

CREATE POLICY "Admins can update all order items." ON public.order_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p2
    WHERE p2.id = auth.uid() AND p2.is_admin = true
  )
);

-- WISHLIST_ITEMS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view their own wishlist items." ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can insert their own wishlist items." ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can delete their own wishlist items." ON public.wishlist_items;

CREATE POLICY "Users can view their own wishlist items." ON public.wishlist_items
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items." ON public.wishlist_items
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items." ON public.wishlist_items
FOR DELETE USING (auth.uid() = user_id);

-- COUPONS TABLE POLICIES
DROP POLICY IF EXISTS "Admins can manage all coupons." ON public.coupons;
DROP POLICY IF EXISTS "Users can view their own unapplied coupons." ON public.coupons;
DROP POLICY IF EXISTS "Users can mark their own assigned coupons as applied." ON public.coupons;

CREATE POLICY "Admins can manage all coupons." ON public.coupons
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p2
    WHERE p2.id = auth.uid() AND p2.is_admin = true
  )
);

CREATE POLICY "Users can view their own unapplied coupons." ON public.coupons
FOR SELECT USING (auth.uid() = assigned_user_id AND is_applied = false);

CREATE POLICY "Users can mark their own assigned coupons as applied." ON public.coupons
FOR UPDATE USING (auth.uid() = assigned_user_id);