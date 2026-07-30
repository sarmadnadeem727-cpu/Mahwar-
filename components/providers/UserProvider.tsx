"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Profile, Subscription } from "@/hooks/useUser";

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  subscription: Subscription | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  subscription: null,
  isLoading: true,
  refresh: async () => {},
});

const supabase = createClient();

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (currentUser: User) => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);
      }

      const { data: subData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (subData) {
        setSubscription(subData as Subscription);
      } else {
        setSubscription({
          id: "",
          user_id: currentUser.id,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          plan: "free",
          status: "active",
          current_period_end: null,
        });
      }
    } catch (err) {
      console.error("Error in UserProvider fetch:", err);
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

  return (
    <UserContext.Provider value={{ user, profile, subscription, isLoading, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
