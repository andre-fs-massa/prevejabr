-- Function to distribute winnings when a market is resolved
CREATE OR REPLACE FUNCTION public.distribute_market_winnings(market_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  market_outcome BOOLEAN;
  market_status market_status;
  order_record RECORD;
  payout NUMERIC;
BEGIN
  -- Get market outcome and status
  SELECT outcome, status INTO market_outcome, market_status
  FROM public.markets
  WHERE id = market_id_param;
  
  -- Verify market is resolved and has an outcome
  IF market_status != 'resolved' OR market_outcome IS NULL THEN
    RAISE EXCEPTION 'Market is not resolved or has no outcome';
  END IF;
  
  -- Process each filled order
  FOR order_record IN 
    SELECT id, user_id, side, amount, price, status
    FROM public.orders
    WHERE market_id = market_id_param
      AND status = 'filled'
  LOOP
    -- Check if this order is a winner
    IF (market_outcome = TRUE AND order_record.side = 'yes') OR 
       (market_outcome = FALSE AND order_record.side = 'no') THEN
      
      -- Calculate payout: amount / probability
      -- For YES winners: amount / yes_probability (stored as price)
      -- For NO winners: amount / (1 - yes_probability)
      IF order_record.side = 'yes' THEN
        payout := order_record.amount / order_record.price;
      ELSE
        payout := order_record.amount / (1 - order_record.price);
      END IF;
      
      -- Round to 2 decimal places
      payout := ROUND(payout, 2);
      
      -- Credit the winner's wallet
      UPDATE public.wallets
      SET balance = balance + payout,
          updated_at = now()
      WHERE user_id = order_record.user_id;
      
    END IF;
    -- Losers don't get anything back (their bet was already deducted when placing the order)
  END LOOP;
END;
$$;

-- Grant execute permission to authenticated users (needed for RPC call)
GRANT EXECUTE ON FUNCTION public.distribute_market_winnings(UUID) TO authenticated;