import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string;
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

// Simple base64url encoding
function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Convert hex string to Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Convert Uint8Array to base64url
function uint8ArrayToBase64Url(arr: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return base64UrlEncode(binary);
}

// Base64url decode
function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function sendWebPush(
  subscription: PushSubscription,
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<boolean> {
  try {
    const endpoint = subscription.endpoint;
    const url = new URL(endpoint);
    const audience = `${url.protocol}//${url.host}`;

    // Create JWT header and payload
    const header = { alg: 'ES256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      aud: audience,
      exp: now + 12 * 60 * 60, // 12 hours
      sub: vapidSubject,
    };

    // Encode header and payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;

    // Import private key for signing
    const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
    
    // Create the raw private key in PKCS8 format
    const privateKeyPKCS8 = new Uint8Array([
      0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
      0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
      0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02, 0x01, 0x01, 0x04, 0x20,
      ...privateKeyBytes,
      0xa1, 0x44, 0x03, 0x42, 0x00, 0x04,
      ...base64UrlDecode(vapidPublicKey),
    ]);

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyPKCS8,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    // Sign the token
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      cryptoKey,
      new TextEncoder().encode(unsignedToken)
    );

    // Convert signature from DER to raw format (if needed) and encode
    const signatureArray = new Uint8Array(signature);
    const encodedSignature = uint8ArrayToBase64Url(signatureArray);
    const jwt = `${unsignedToken}.${encodedSignature}`;

    // Prepare the push message body
    const body = JSON.stringify(payload);

    // Send the push notification
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
        'TTL': '86400',
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Push failed for ${subscription.user_id}:`, response.status, errorText);
      
      // If subscription is invalid, we might want to delete it
      if (response.status === 404 || response.status === 410) {
        console.log(`Subscription expired for user ${subscription.user_id}`);
      }
      return false;
    }

    console.log(`Push sent successfully to user ${subscription.user_id}`);
    return true;
  } catch (error) {
    console.error('Error sending push:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@preveja.br';

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_ids, title, body, url, tag } = await req.json();

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'user_ids array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all subscriptions for the given users
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth, user_id')
      .in('user_id', user_ids);

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: PushPayload = { title, body, url, tag };
    
    // Send push to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        sendWebPush(sub as PushSubscription, payload, vapidPublicKey, vapidPrivateKey, vapidSubject)
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    const failed = results.length - sent;

    console.log(`Push notifications: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ message: 'Push notifications processed', sent, failed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
