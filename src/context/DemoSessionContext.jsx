import { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { fetchUserMemberships, signOutSupabase } from '../services/supabaseService';

const STORAGE_KEY = 'spt_stage1_demo_session';

const DemoSessionContext = createContext(null);

export function DemoSessionProvider({ children }) {
  const [session, setSession] = useState(() => {
    if (isSupabaseConfigured) return null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      let active = true;

      const syncSupabaseUser = async (supaUser) => {
        if (!supaUser) {
          if (active) setSession(null);
          return;
        }
        try {
          const memberships = await fetchUserMemberships(supaUser.id);
          if (!active) return;
          setSession({
            isDemoPreview: false,
            userId: supaUser.id,
            fullName: supaUser.user_metadata?.full_name || supaUser.email,
            email: supaUser.email,
            memberships,
            activeMembershipId: memberships[0]?.id || null,
            signedInAt: new Date().toISOString(),
          });
        } catch {
          if (active) setSession(null);
        }
      };

      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) syncSupabaseUser(data.user);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, authSession) => {
        syncSupabaseUser(authSession?.user || null);
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    }

    try {
      if (session) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors in restricted browsing modes
    }
  }, [session]);

  const signInDemo = (account) => {
    const initialMembership = account.memberships[0];
    setSession({
      isDemoPreview: true,
      userId: account.id,
      fullName: account.fullName,
      email: account.email,
      memberships: account.memberships,
      activeMembershipId: initialMembership.id,
      signedInAt: new Date().toISOString(),
    });
  };

  const switchMembership = (membershipId) => {
    setSession((prev) => {
      if (!prev) return null;
      const exists = prev.memberships.some((m) => m.id === membershipId);
      if (!exists) return prev;
      return { ...prev, activeMembershipId: membershipId };
    });
  };

  const signOutDemo = async () => {
    if (isSupabaseConfigured) {
      await signOutSupabase();
    }
    setSession(null);
  };

  const activeMembership =
    session?.memberships?.find((m) => m.id === session.activeMembershipId) ||
    session?.memberships?.[0] ||
    null;

  return (
    <DemoSessionContext.Provider
      value={{
        session,
        activeMembership,
        isLiveSupabase: isSupabaseConfigured,
        signInDemo,
        switchMembership,
        signOutDemo,
      }}
    >
      {children}
    </DemoSessionContext.Provider>
  );
}

export function useDemoSession() {
  const ctx = useContext(DemoSessionContext);
  if (!ctx) {
    throw new Error('useDemoSession must be used inside DemoSessionProvider');
  }
  return ctx;
}
