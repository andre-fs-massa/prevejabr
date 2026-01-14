import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find and close expired markets
    const { data: expiredMarkets, error: fetchError } = await supabase
      .from('markets')
      .select('id, title, created_by')
      .eq('status', 'open')
      .lt('end_date', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired markets:', fetchError);
      throw fetchError;
    }

    if (!expiredMarkets || expiredMarkets.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No expired markets found', closed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to closed
    const marketIds = expiredMarkets.map((m) => m.id);
    const { error: updateError } = await supabase
      .from('markets')
      .update({ status: 'closed' })
      .in('id', marketIds);

    if (updateError) {
      console.error('Error updating markets:', updateError);
      throw updateError;
    }

    // Send push notifications to market creators
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (vapidPublicKey && vapidPrivateKey) {
      const creatorIds = [...new Set(expiredMarkets.map((m) => m.created_by))];
      
      for (const market of expiredMarkets) {
        try {
          // Call the send-push-notification function
          const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              user_ids: [market.created_by],
              title: 'Mercado Expirado',
              body: `Seu mercado "${market.title}" expirou. Resolva o resultado!`,
              url: `/markets/${market.id}`,
              tag: `market-expired-${market.id}`,
            }),
          });

          if (!pushResponse.ok) {
            console.error(`Failed to send push for market ${market.id}:`, await pushResponse.text());
          }
        } catch (pushError) {
          console.error(`Error sending push notification for market ${market.id}:`, pushError);
        }
      }
    }

    console.log(`Closed ${expiredMarkets.length} expired markets`);

    return new Response(
      JSON.stringify({
        message: 'Expired markets closed successfully',
        closed: expiredMarkets.length,
        market_ids: marketIds,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in close-expired-markets:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
