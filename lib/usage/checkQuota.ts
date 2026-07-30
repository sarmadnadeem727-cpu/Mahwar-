import { createClient } from '@supabase/supabase-js';
import { PLAN_LIMITS } from '@/lib/billing/plan-limits';

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkQuota(userId: string, endpoint: 'ai_research' | 'saved_models' | 'live_market') {
  try {
    // 1. Fetch user subscription
    const { data: subscription, error: subError } = await supabaseService
      .from('subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .maybeSingle();

    if (subError) throw subError;

    const plan = (subscription?.plan || 'free') as 'free' | 'pro' | 'institutional';
    const planConfig = PLAN_LIMITS[plan];

    let limit = Infinity;
    if (endpoint === 'ai_research') {
      limit = planConfig.aiReportLimit;
    } else if (endpoint === 'saved_models') {
      limit = planConfig.savedModelsLimit;
    }

    // 2. Count usage in the rolling 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    let count = 0;
    if (limit !== Infinity) {
      if (endpoint === 'saved_models') {
        // For saved models, check total count currently in database
        const { count: modelsCount, error: countError } = await supabaseService
          .from('saved_models')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (countError) throw countError;
        count = modelsCount || 0;
      } else {
        // For metered API endpoints like AI research
        const { count: logsCount, error: countError } = await supabaseService
          .from('usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('endpoint', endpoint)
          .gte('created_at', startDate.toISOString());

        if (countError) throw countError;
        count = logsCount || 0;
      }
    }

    if (count >= limit) {
      return { allowed: false, plan, count, limit };
    }

    // 3. Log usage if metered (don't log model saves here since it's verified here but logged in saved_models table insert)
    if (endpoint !== 'saved_models') {
      const { error: logError } = await supabaseService
        .from('usage_logs')
        .insert({
          user_id: userId,
          endpoint
        });
      if (logError) throw logError;
    }

    return { allowed: true, plan, count, limit };
  } catch (error) {
    console.error('Error checking quota:', error);
    // On database failure, fail-safe to allow request or throw
    return { allowed: true, plan: 'free', count: 0, limit: Infinity };
  }
}
