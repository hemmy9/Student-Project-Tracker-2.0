import { useCallback, useMemo } from 'react';
import { useDemoSession } from '../context/DemoSessionContext';
import { getDashboardPathForRole } from '../utils/roleRouting';

export function useAuthGuard({ allowedRoles = [], requireApproved = true } = {}) {
  const { session, activeMembership, isLiveSupabase } = useDemoSession();

  const isAuthenticated = Boolean(session && activeMembership);
  const normalizedStatus = String(activeMembership?.status || '').toLowerCase();
  const isApproved = normalizedStatus === 'approved';

  const hasRoleAccess = useMemo(() => {
    if (!isAuthenticated) return false;
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return true;
    return allowedRoles.includes(activeMembership.roleKey);
  }, [isAuthenticated, allowedRoles, activeMembership]);

  const isAuthorized = isAuthenticated && (!requireApproved || isApproved) && hasRoleAccess;

  let denialReason = null;
  if (!isAuthenticated) {
    denialReason = 'unauthenticated';
  } else if (requireApproved && !isApproved) {
    denialReason = 'unapproved';
  } else if (!hasRoleAccess) {
    denialReason = 'forbidden';
  }

  const redirectPath = isAuthenticated
    ? getDashboardPathForRole(activeMembership?.roleKey)
    : '/login';

  const canAccessRole = useCallback(
    (roles = []) => {
      if (!isAuthenticated || (requireApproved && !isApproved)) return false;
      if (!Array.isArray(roles) || roles.length === 0) return true;
      return roles.includes(activeMembership.roleKey);
    },
    [isAuthenticated, requireApproved, isApproved, activeMembership]
  );

  return {
    session,
    activeMembership,
    isLiveSupabase,
    isAuthenticated,
    isApproved,
    hasRoleAccess,
    isAuthorized,
    denialReason,
    redirectPath,
    canAccessRole,
  };
}
