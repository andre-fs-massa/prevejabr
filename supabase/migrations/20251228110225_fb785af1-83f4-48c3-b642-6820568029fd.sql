-- Create function to recalculate market probability based on orders
CREATE OR REPLACE FUNCTION public.recalculate_market_probability()
RETURNS TRIGGER AS $$
DECLARE
  total_yes_amount NUMERIC;
  total_no_amount NUMERIC;
  total_amount NUMERIC;
  new_probability NUMERIC;
BEGIN
  -- Get total amounts for YES and NO sides
  SELECT 
    COALESCE(SUM(CASE WHEN side = 'yes' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN side = 'no' THEN amount ELSE 0 END), 0)
  INTO total_yes_amount, total_no_amount
  FROM public.orders
  WHERE market_id = COALESCE(NEW.market_id, OLD.market_id)
    AND status != 'cancelled';
  
  total_amount := total_yes_amount + total_no_amount;
  
  -- Calculate new probability (if no orders, keep at 50%)
  IF total_amount > 0 THEN
    new_probability := total_yes_amount / total_amount;
  ELSE
    new_probability := 0.5;
  END IF;
  
  -- Update market with new probability and total volume
  UPDATE public.markets
  SET 
    yes_probability = new_probability,
    total_volume = total_amount,
    updated_at = now()
  WHERE id = COALESCE(NEW.market_id, OLD.market_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to recalculate probability on order changes
CREATE TRIGGER recalculate_probability_on_order_change
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_market_probability();