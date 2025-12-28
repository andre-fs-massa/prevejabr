-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable realtime for markets table (for probability updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.markets;