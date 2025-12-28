-- Update the process_referral function to give bonus to both referrer and referred
CREATE OR REPLACE FUNCTION public.process_referral(referral_code text, new_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Give bonus to referred user (new user)
  UPDATE public.wallets
  SET balance = balance + bonus
  WHERE user_id = new_user_id;
  
  RETURN TRUE;
END;
$function$;