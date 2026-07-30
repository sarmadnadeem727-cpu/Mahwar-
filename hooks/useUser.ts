import { useEffect, useState, createContext, useContext } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  preferred_language: string;
  preferred_currency: string;
  role: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'pro' | 'institutional';
  status: string;
  current_period_end: string | null;
}

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  subscription: Subscription | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const supabase = createClient();

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (currentUser: User) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!profileErr && profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch subscription
      const { data: subData, error: subErr } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (!subErr && subData) {
        setSubscription(subData as Subscription);
      } else {
        // Fallback to free if none is set
        setSubscription({
          id: '',
          user_id: currentUser.id,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          plan: 'free',
          status: 'active',
          current_period_end: null
        });
      }
    } catch (err) {
      console.error('Error fetching user metadata:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    setIsLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      setUser(currentUser);
      await fetchUserData(currentUser);
    } else {
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchUserData(currentUser);
        } else {
          setProfile(null);
          setSubscription(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    subscription,
    isLoading,
    refresh,
  };
}
