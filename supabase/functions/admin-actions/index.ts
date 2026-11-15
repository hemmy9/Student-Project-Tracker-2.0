// Stage 4: Supabase Edge Function for Privileged Governance Operations
// Deploy with: `supabase functions deploy admin-actions`

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, payload } = await req.json();

    // Verify caller is an active platform_admin before allowing platform actions
    const { data: platformAdmin } = await adminClient
      .from('platform_admins')
      .select('id, full_name')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (action === 'decide_institution_application') {
      if (!platformAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden: Platform Admin required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { institutionId, nextStatus } = payload;
      const { error: updateErr } = await adminClient
        .from('institutions')
        .update({
          status: nextStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', institutionId);

      if (updateErr) throw updateErr;

      await adminClient.from('audit_logs').insert({
        actor_id: user.id,
        actor_name: platformAdmin.full_name,
        action: `Updated institution status to ${nextStatus}`,
        target: institutionId,
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'grant_platform_admin') {
      if (!platformAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden: Platform Admin required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { targetUserId, email, fullName } = payload;
      const { error: insertErr } = await adminClient.from('platform_admins').insert({
        user_id: targetUserId,
        email,
        full_name: fullName,
        granted_by: user.id,
      });

      if (insertErr) throw insertErr;

      await adminClient.from('audit_logs').insert({
        actor_id: user.id,
        actor_name: platformAdmin.full_name,
        action: 'Granted platform administrator privilege via trusted Edge Function',
        target: email,
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: `Unsupported action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
