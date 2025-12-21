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

// Normalize Fastlipa status to standard values
function normalizeFastlipaStatus(rawStatus: string | undefined): 'SUCCESS' | 'PENDING' | 'FAILED' | 'UNKNOWN' {
  if (!rawStatus) return 'UNKNOWN';
  
  const status = rawStatus.toLowerCase();
  const successStatuses = ['success', 'completed', 'paid', 'successful'];
  const pendingStatuses = ['pending', 'processing', 'initiated'];
  const failedStatuses = ['failed', 'cancelled', 'reversed', 'canceled', 'rejected'];

  if (successStatuses.includes(status)) {
    return 'SUCCESS';
  }

  if (pendingStatuses.includes(status)) {
    return 'PENDING';
  }

  if (failedStatuses.includes(status)) {
    return 'FAILED';
  }

  return 'UNKNOWN';
}

// Background polling function
async function pollTransactionStatus(
  supabase: any,
  apiKey: string,
  transactionId: string,
  userId: string,
  amount: number,
  dbId: string
) {
  const maxAttempts = 24; // 2 minutes with 5 second intervals
  let attempts = 0;

  console.log(`Starting background poll for transaction ${transactionId}, user ${userId}, amount ${amount}`);

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`Poll attempt ${attempts}/${maxAttempts} for transaction ${transactionId}`);

    try {
      // Check transaction status from Fastlipa
      const statusResponse = await fetch(
        `https://api.fastlipa.com/api/status-transaction?tranid=${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      const statusData = await statusResponse.json();
      console.log(`Poll ${attempts} - Fastlipa response:`, statusData);

      const rawStatus = statusData?.status || statusData?.transaction_status;
      const normalizedStatus = normalizeFastlipaStatus(rawStatus);
      console.log(`Poll ${attempts} - Normalized status: ${normalizedStatus}`);

      if (normalizedStatus === 'SUCCESS') {
        console.log(`Transaction ${transactionId} completed successfully, updating balance...`);
        
        // Get current balance
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('user_id', userId)
          .single();

        const currentBalance = profile?.balance || 0;
        const newBalance = currentBalance + amount;

        // Update user balance
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Failed to update balance:', updateError);
        } else {
          console.log(`Balance updated from ${currentBalance} to ${newBalance}`);
        }

        // Update transaction status
        await supabase
          .from('topup_transactions')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', dbId);

        console.log(`Transaction ${transactionId} marked as completed`);
        return; // Exit polling
      }

      if (normalizedStatus === 'FAILED') {
        console.log(`Transaction ${transactionId} failed`);
        
        // Mark as failed in database
        await supabase
          .from('topup_transactions')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', dbId);

        return; // Exit polling
      }

      // Still pending, wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (err) {
      console.error(`Poll ${attempts} error:`, err);
      // Continue polling on error
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Timeout - mark as failed after 2 minutes
  console.log(`Transaction ${transactionId} timed out after ${maxAttempts} attempts`);
  await supabase
    .from('topup_transactions')
    .update({ status: 'failed', updated_at: new Date().toISOString() })
    .eq('id', dbId);
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

      const transactionId = fastlipaData.tranid || fastlipaData.transaction_id;

      // Store transaction in database with pending status
      const { data: transaction, error: transactionError } = await supabase
        .from('topup_transactions')
        .insert({
          user_id: body.user_id,
          amount: body.amount,
          phone_number: body.phone_number,
          transaction_id: transactionId,
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

      // Start background polling - use globalThis.EdgeRuntime if available
      const runtime = (globalThis as any).EdgeRuntime;
      if (runtime && typeof runtime.waitUntil === 'function') {
        runtime.waitUntil(
          pollTransactionStatus(
            supabase,
            apiKey,
            transactionId,
            body.user_id,
            body.amount,
            transaction.id
          )
        );
      } else {
        // Fallback: run polling without waitUntil (may timeout)
        pollTransactionStatus(
          supabase,
          apiKey,
          transactionId,
          body.user_id,
          body.amount,
          transaction.id
        ).catch(console.error);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          transaction_id: transactionId,
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

      // First check local DB status
      const { data: localTx } = await supabase
        .from('topup_transactions')
        .select('status')
        .eq('transaction_id', body.transaction_id)
        .single();

      if (localTx && (localTx.status === 'completed' || localTx.status === 'failed')) {
        return new Response(
          JSON.stringify({ status: localTx.status, normalized_status: localTx.status === 'completed' ? 'SUCCESS' : 'FAILED' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

      const rawStatus = statusData?.status || statusData?.transaction_status;
      const normalizedStatus = normalizeFastlipaStatus(rawStatus);

      return new Response(
        JSON.stringify({ ...statusData, normalized_status: normalizedStatus }),
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
        .update({ balance: currentBalance + amount, updated_at: new Date().toISOString() })
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
