-- Create enum for order side (yes/no bet)
CREATE TYPE public.order_side AS ENUM ('yes', 'no');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'filled', 'cancelled');

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  side order_side NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  price NUMERIC NOT NULL CHECK (price >= 0 AND price <= 1),
  status order_status NOT NULL DEFAULT 'pending',
  filled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all orders (for market transparency)
CREATE POLICY "Anyone can view orders"
ON public.orders
FOR SELECT
USING (true);

-- Policy: Authenticated users can create their own orders
CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending orders
CREATE POLICY "Users can update their own pending orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Policy: Users can cancel (delete) their own pending orders
CREATE POLICY "Users can delete their own pending orders"
ON public.orders
FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_orders_market_id ON public.orders(market_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);