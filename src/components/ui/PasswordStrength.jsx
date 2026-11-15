import { getPasswordStrength } from '../../utils/validation';

const BAR_COLORS = [
  'bg-slate-200',
  'bg-red-500',
  'bg-amber-500',
  'bg-[#2563EB]',
  'bg-emerald-600',
];

export default function PasswordStrength({ password }) {
  const { score, label } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="space-y-1.5 pt-1" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={`h-1.5 rounded-full transition-colors ${
              score >= segment ? BAR_COLORS[score] : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-[#64748B]">
        Password strength: <span className="font-medium text-[#172554]">{label}</span>
      </p>
    </div>
  );
}
