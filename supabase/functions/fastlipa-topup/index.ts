import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.88.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TopupRequest {
  amount: number;
  phone_number: string;
  user_id: string;
  name: string;
}

interface CheckStatusRequest {
  transaction_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Fastlipa API key from api_settings table
    const { data: apiSettings, error: apiError } = await supabase
      .from('api_settings')
      .select('api_key')
      .eq('name', 'fastlipa')
      .eq('is_active', true)
      .single();

    if (apiError || !apiSettings) {
      console.error('Failed to get Fastlipa API key:', apiError);
      return new Response(
        JSON.stringify({ error: 'Fastlipa API not configured. Please contact admin.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = apiSettings.api_key;
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'create') {
      // Create a new topup transaction
      const body: TopupRequest = await req.json();
      console.log('Creating topup transaction:', body);

      if (!body.amount || body.amount < 500) {
        return new Response(
          JSON.stringify({ error: 'Minimum topup amount is Tsh 500' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Call Fastlipa API to create transaction
      const fastlipaResponse = await fetch('https://api.fastlipa.com/api/create-transaction', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: body.phone_number,
          amount: body.amount,
          name: body.name || 'User',
        }),
      });

      const fastlipaData = await fastlipaResponse.json();
      console.log('Fastlipa response:', fastlipaData);

      if (!fastlipaResponse.ok) {
        return new Response(
          JSON.stringify({ error: fastlipaData.message || 'Failed to initiate topup' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Store transaction in database
      const { data: transaction, error: transactionError } = await supabase
        .from('topup_transactions')
        .insert({
          user_id: body.user_id,
          amount: body.amount,
          phone_number: body.phone_number,
          transaction_id: fastlipaData.tranid || fastlipaData.transaction_id,
          status: 'pending',
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Failed to store transaction:', transactionError);
        return new Response(
          JSON.stringify({ error: 'Failed to store transaction' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          transaction_id: fastlipaData.tranid || fastlipaData.transaction_id,
          message: 'Topup initiated. Please complete the payment on your phone.',
          db_id: transaction.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'check-status') {
      // Check transaction status
      const body: CheckStatusRequest = await req.json();
      console.log('Checking transaction status:', body);

      if (!body.transaction_id) {
        return new Response(
          JSON.stringify({ error: 'Transaction ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Call Fastlipa API to check status
      const statusResponse = await fetch(
        `https://api.fastlipa.com/api/status-transaction?tranid=${body.transaction_id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      const statusData = await statusResponse.json();
      console.log('Status response:', statusData);

      return new Response(
        JSON.stringify(statusData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update-balance') {
      // Update user balance after successful payment
      const body = await req.json();
      console.log('Updating balance:', body);

      const { transaction_id, user_id, amount } = body;

      // Update transaction status
      await supabase
        .from('topup_transactions')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('transaction_id', transaction_id);

      // Get current balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', user_id)
        .single();

      const currentBalance = profile?.balance || 0;

      // Update user balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: currentBalance + amount })
        .eq('user_id', user_id);

      if (updateError) {
        console.error('Failed to update balance:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update balance' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, new_balance: currentBalance + amount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'mark-failed') {
      const body = await req.json();
      
      await supabase
        .from('topup_transactions')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('transaction_id', body.transaction_id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'balance') {
      // Check Fastlipa account balance
      const balanceResponse = await fetch('https://api.fastlipa.com/api/balance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const balanceData = await balanceResponse.json();
      console.log('Balance response:', balanceData);

      return new Response(
        JSON.stringify(balanceData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
