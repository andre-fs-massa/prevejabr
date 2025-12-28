-- Create referral_codes table
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL UNIQUE,
  bonus_amount NUMERIC NOT NULL DEFAULT 25,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_codes
CREATE POLICY "Users can view their own referral code"
ON public.referral_codes FOR SELECT
USING (auth.uid() = user_id);

-- RLS policies for referrals
CREATE POLICY "Users can view their referrals"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referrals"
ON public.referrals FOR INSERT
WITH CHECK (true);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Generate 8-character alphanumeric code
  new_code := upper(substring(md5(random()::text) from 1 for 8));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.referral_codes WHERE code = new_code) LOOP
    new_code := upper(substring(md5(random()::text) from 1 for 8));
  END LOOP;
  
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, new_code);
  
  RETURN NEW;
END;
$$;

-- Trigger to create referral code on user signup
CREATE TRIGGER on_auth_user_created_referral
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code();

-- Function to process referral and give bonus
CREATE OR REPLACE FUNCTION public.process_referral(referral_code TEXT, new_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_user_id UUID;
  bonus NUMERIC := 25;
BEGIN
  -- Find referrer by code
  SELECT user_id INTO referrer_user_id
  FROM public.referral_codes
  WHERE code = referral_code;
  
  IF referrer_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Don't allow self-referral
  IF referrer_user_id = new_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Check if already referred
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = new_user_id) THEN
    RETURN FALSE;
  END IF;
  
  -- Create referral record
  INSERT INTO public.referrals (referrer_id, referred_id, bonus_amount)
  VALUES (referrer_user_id, new_user_id, bonus);
  
  -- Give bonus to referrer
  UPDATE public.wallets
  SET balance = balance + bonus
  WHERE user_id = referrer_user_id;
  
  RETURN TRUE;
END;
$$;