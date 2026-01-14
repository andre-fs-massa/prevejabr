-- Create trigger to validate orders are only placed on open, non-expired markets
CREATE OR REPLACE FUNCTION public.validate_order_market_open()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.markets 
    WHERE id = NEW.market_id 
    AND (status != 'open' OR end_date < now())
  ) THEN
    RAISE EXCEPTION 'Market is not accepting orders';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on orders table
CREATE TRIGGER check_market_before_order
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.validate_order_market_open();