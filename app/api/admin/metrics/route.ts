import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'dummy_url',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
  );
  try {
    // 1. Verify that the logged in user is actually an admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileErr } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    // 2. Fetch metrics using service role client (bypassing RLS)
    
    // Total users
    const { count: totalUsers, error: usersErr } = await supabaseService
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersErr) throw usersErr;

    // Subscriptions count grouped by plan
    const { data: subs, error: subsErr } = await supabaseService
      .from('subscriptions')
      .select('plan, status');

    if (subsErr) throw subsErr;

    const subStats = {
      free: 0,
      pro: 0,
      institutional: 0
    };

    subs?.forEach(s => {
      if (s.plan in subStats && s.status === 'active') {
        subStats[s.plan as keyof typeof subStats]++;
      }
    });

    // Recent signups
    const { data: recentSignups, error: signupsErr } = await supabaseService
      .from('profiles')
      .select('full_name, company_name, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (signupsErr) throw signupsErr;

    // Total API usage logs today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { count: usageToday, error: usageErr } = await supabaseService
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfToday.toISOString());

    if (usageErr) throw usageErr;

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      subStats,
      recentSignups: recentSignups || [],
      usageToday: usageToday || 0
    });
  } catch (error: any) {
    console.error('Admin Metrics API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch admin metrics' }, { status: 500 });
  }
}
