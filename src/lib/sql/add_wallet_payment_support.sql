-- Add wallet_balance to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10, 2) DEFAULT 0.00;

-- Add purchased_for_user_id to orders if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS purchased_for_user_id UUID REFERENCES auth.users(id);

-- Create a function to process wallet payments atomically
CREATE OR REPLACE FUNCTION public.process_wallet_payment(
  p_order_id UUID,
  p_admin_id UUID,
  p_client_id UUID,
  p_amount DECIMAL(10, 2),
  p_current_balance DECIMAL(10, 2)
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance DECIMAL(10, 2);
  v_order_exists BOOLEAN;
  v_result JSONB;
BEGIN
  -- Check if the order exists and is in a valid state
  SELECT EXISTS (
    SELECT 1 
    FROM public.orders 
    WHERE id = p_order_id 
    AND status = 'pending'
  ) INTO v_order_exists;

  IF NOT v_order_exists THEN
    RAISE EXCEPTION 'Invalid or already processed order';
  END IF;

  -- Calculate new balance
  v_new_balance := p_current_balance - p_amount;
  
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  -- Update admin's wallet balance
  UPDATE public.profiles
  SET wallet_balance = v_new_balance
  WHERE id = p_admin_id
  RETURNING jsonb_build_object(
    'new_balance', wallet_balance,
    'admin_id', p_admin_id
  ) INTO v_result;

  -- Update order status
  UPDATE public.orders
  SET 
    status = 'completed',
    payment_gateway = 'admin_wallet',
    payment_method = 'admin_wallet',
    purchased_for_user_id = NULLIF(p_client_id, '')::UUID,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Payment processing failed: %', SQLERRM;
END;
$$;
