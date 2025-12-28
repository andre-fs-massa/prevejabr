-- Create enum for market status
CREATE TYPE public.market_status AS ENUM ('open', 'closed', 'resolved');

-- Create markets table
CREATE TABLE public.markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status public.market_status NOT NULL DEFAULT 'open',
  outcome BOOLEAN,
  yes_probability DECIMAL(5,4) NOT NULL DEFAULT 0.5,
  total_volume DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view markets
CREATE POLICY "Anyone can view markets"
ON public.markets
FOR SELECT
USING (true);

-- Policy: Authenticated users can create markets
CREATE POLICY "Authenticated users can create markets"
ON public.markets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Policy: Creators can update their own markets
CREATE POLICY "Creators can update their own markets"
ON public.markets
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_markets_updated_at
BEFORE UPDATE ON public.markets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();