-- profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  preferred_language text default 'en', -- 'en' | 'ar'
  preferred_currency text default 'SAR',
  role text default 'member', -- 'owner' | 'admin' | 'member'
  created_at timestamptz default now()
);

-- subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free', -- 'free' | 'pro' | 'institutional'
  status text not null default 'active', -- 'active' | 'past_due' | 'canceled' | 'trialing'
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- saved_models (DCF / LBO / Three-Statement saves)
create table public.saved_models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  model_type text not null, -- 'dcf' | 'lbo' | 'three_statement'
  ticker text,
  name text not null,
  inputs jsonb not null,   -- the model's assumption inputs
  outputs jsonb,           -- last computed result, cached for quick reload
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- watchlists
create table public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique,
  name text not null default 'My Watchlist',
  tickers text[] not null default '{}',
  created_at timestamptz default now()
);

-- ai_research_reports (cache/history of generated Gemini equity memos)
create table public.ai_research_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  ticker text not null,
  language text default 'en',
  content text not null,
  created_at timestamptz default now()
);

-- usage_logs (for rate limiting + plan enforcement + analytics)
create table public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  endpoint text not null, -- e.g. 'ai_research', 'dcf', 'live_market'
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.saved_models enable row level security;
alter table public.watchlists enable row level security;
alter table public.ai_research_reports enable row level security;
alter table public.usage_logs enable row level security;

-- RLS Policies

-- profiles policies
create policy "Users can view their own profiles"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profiles"
  on public.profiles for update
  using (auth.uid() = id);

-- subscriptions policies (only readable by user, never writable by client directly)
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- saved_models policies
create policy "Users can perform all actions on their own saved models"
  on public.saved_models for all
  using (auth.uid() = user_id);

-- watchlists policies
create policy "Users can perform all actions on their own watchlists"
  on public.watchlists for all
  using (auth.uid() = user_id);

-- ai_research_reports policies
create policy "Users can perform all actions on their own research reports"
  on public.ai_research_reports for all
  using (auth.uid() = user_id);

-- usage_logs policies (only select and insert by user)
create policy "Users can view their own usage logs"
  on public.usage_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own usage logs"
  on public.usage_logs for insert
  with check (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, company_name, preferred_language, preferred_currency, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'company_name', ''),
    coalesce(new.raw_user_meta_data->>'preferred_language', 'en'),
    coalesce(new.raw_user_meta_data->>'preferred_currency', 'SAR'),
    'member'
  );

  -- Also auto-create a default free subscription for the user
  insert into public.subscriptions (user_id, plan, status, current_period_end)
  values (
    new.id,
    'free',
    'active',
    now() + interval '1 year'
  );

  -- Also auto-create a default empty watchlist for the user
  insert into public.watchlists (user_id, name, tickers)
  values (
    new.id,
    'My Watchlist',
    array[]::text[]
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
