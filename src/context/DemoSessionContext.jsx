import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { fetchUserMemberships, signOutSupabase } from '../services/supabaseService';
import { normalizeAppError } from '../utils/errorHandler';

const STORAGE_KEY = 'spt_stage1_demo_session';

const DemoSessionContext = createContext(null);

const ROLE_LABELS = {
  student: 'Student',
  supervisor: 'Supervisor',
  institution_admin: 'Institution Admin',
  platform_admin: 'Platform Admin',
};

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
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState('');

  const syncSupabaseUser = useCallback(async (supaUser) => {
    if (!supaUser) {
      setSession(null);
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    try {
      let memberships = await fetchUserMemberships(supaUser.id);
      if (!memberships || memberships.length === 0) {
        const requestedRole = supaUser.user_metadata?.requested_role || 'student';
        memberships = [
          {
            id: `pending-${supaUser.id}`,
            roleKey: requestedRole,
            roleLabel: ROLE_LABELS[requestedRole] || 'Member',
            institutionId: null,
            institutionName:
              supaUser.user_metadata?.institution_name || 'Pending Institutional Verification',
            status: 'pending_approval',
          },
        ];
      }

      setSession({
        isDemoPreview: false,
        userId: supaUser.id,
        fullName: supaUser.user_metadata?.full_name || supaUser.email,
        email: supaUser.email,
        memberships,
        activeMembershipId: memberships[0]?.id || null,
        signedInAt: new Date().toISOString(),
      });
    } catch (err) {
      setAuthError(normalizeAppError(err, 'Failed to synchronize Supabase account memberships.'));
      setSession(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      let active = true;

      supabase.auth
        .getUser()
        .then(({ data, error }) => {
          if (!active) return;
          if (error) {
            setAuthLoading(false);
            return;
          }
          if (data?.user) {
            syncSupabaseUser(data.user);
          } else {
            setAuthLoading(false);
          }
        })
        .catch((err) => {
          if (!active) return;
          setAuthError(normalizeAppError(err, 'Unable to check Supabase authentication status.'));
          setAuthLoading(false);
        });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, authSession) => {
        if (!active) return;
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
  }, [session, syncSupabaseUser]);

  const signInDemo = (account) => {
    const initialMembership = account.memberships[0];
    setAuthError('');
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
      try {
        await signOutSupabase();
      } catch (err) {
        setAuthError(normalizeAppError(err, 'Failed to close Supabase session.'));
      }
    }
    setSession(null);
  };

  const refreshMemberships = async () => {
    if (isSupabaseConfigured && supabase && session?.userId) {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        await syncSupabaseUser(data.user);
      }
    }
  };

  const clearAuthError = () => setAuthError('');

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
        authLoading,
        authError,
        clearAuthError,
        refreshMemberships,
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
