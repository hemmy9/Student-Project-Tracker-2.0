import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check, LogOut, Mail, Phone, Shield, User, X } from 'lucide-react';
import { useDemoAppState } from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import { getDashboardPathForRole } from '../../utils/roleRouting';
import Button from '../ui/Button';

export default function ProfileQuickView({ open, onClose }) {
  const { session, activeMembership, switchMembership, signOutDemo } = useDemoSession();
  const { state, updateUserProfile } = useDemoAppState();
  const navigate = useNavigate();

  const savedProfile = session ? state.userProfiles[session.email] || {} : {};
  const [phone, setPhone] = useState(savedProfile.phone || '');
  const [bio, setBio] = useState(savedProfile.bio || '');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (!session) return;
    const current = state.userProfiles[session.email] || {};
    setPhone(current.phone || '');
    setBio(current.bio || '');
    setSavedNotice(false);
  }, [open, session, state.userProfiles]);

  if (!open || !session || !activeMembership) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(session.email, { phone, bio });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleSwitchMembership = (mem) => {
    switchMembership(mem.id);
    onClose();
    navigate(getDashboardPathForRole(mem.roleKey));
  };

  const handleSignOut = () => {
    onClose();
    signOutDemo();
    navigate('/login');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Profile quick view"
    >
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#172554] text-white">
              <User className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#172554]">
                Profile Quick View
              </h2>
              <p className="text-xs text-[#64748B]">Account &amp; role settings</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile panel"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#64748B] hover:bg-slate-100 hover:text-[#172554] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Identity Summary */}
          <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-2.5">
            <div>
              <p className="font-display text-lg font-bold text-[#172554]">{session.fullName}</p>
              <p className="flex items-center gap-1.5 text-xs text-[#64748B] mt-0.5">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{session.email}</span>
              </p>
            </div>
            <div className="border-t border-slate-200 pt-2.5 space-y-1 text-xs">
              <p className="flex items-center gap-1.5 font-semibold text-[#172554]">
                <Shield className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                <span>Active Role: {activeMembership.roleLabel}</span>
              </p>
              <p className="flex items-center gap-1.5 text-[#64748B]">
                <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{activeMembership.institutionName}</span>
              </p>
            </div>
          </div>

          {/* Institutional Memberships */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#64748B]">
              Approved Memberships ({session.memberships.length})
            </h3>
            <div className="space-y-2">
              {session.memberships.map((mem) => {
                const isActive = mem.id === activeMembership.id;
                return (
                  <button
                    key={mem.id}
                    type="button"
                    onClick={() => handleSwitchMembership(mem)}
                    className={`w-full min-h-[44px] rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'border-[#2563EB] bg-blue-50/70'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#172554]">{mem.roleLabel}</span>
                      <span className="text-[11px] font-semibold text-[#2563EB]">
                        {isActive ? 'Active' : 'Switch'}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">{mem.institutionName}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Profile Details */}
          <form onSubmit={handleSaveProfile} className="space-y-3 border-t border-slate-200 pt-5">
            <h3 className="text-xs font-semibold text-[#64748B]">Quick Profile Settings</h3>
            <div className="space-y-1">
              <label htmlFor="pqv-phone" className="flex items-center gap-1.5 text-xs font-medium text-[#172554]">
                <Phone className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
                <span>Contact number</span>
              </label>
              <input
                id="pqv-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 text-base sm:text-sm text-[#172554] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="pqv-bio" className="block text-xs font-medium text-[#172554]">
                Academic profile note
              </label>
              <textarea
                id="pqv-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base sm:text-sm text-[#172554] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            {savedNotice && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Profile preview updated locally.</span>
              </p>
            )}

            <Button type="submit" variant="primary" size="md" fullWidth>
              Save profile changes
            </Button>
          </form>
        </div>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-[#172554] hover:bg-slate-50 cursor-pointer"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
