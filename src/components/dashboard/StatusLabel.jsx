import { AlertTriangle, CheckCircle2, Clock, FileEdit } from 'lucide-react';

const STATUS_MAP = {
  Approved: {
    textClass: 'text-emerald-700',
    Icon: CheckCircle2,
  },
  Confirmed: {
    textClass: 'text-emerald-700',
    Icon: CheckCircle2,
  },
  Completed: {
    textClass: 'text-emerald-700',
    Icon: CheckCircle2,
  },
  Active: {
    textClass: 'text-emerald-700',
    Icon: CheckCircle2,
  },
  'On Track': {
    textClass: 'text-emerald-700',
    Icon: CheckCircle2,
  },
  'In Progress': {
    textClass: 'text-[#2563EB]',
    Icon: Clock,
  },
  'Review Ready': {
    textClass: 'text-[#2563EB]',
    Icon: FileEdit,
  },
  'Pending Review': {
    textClass: 'text-amber-700',
    Icon: Clock,
  },
  'Pending Approval': {
    textClass: 'text-amber-700',
    Icon: Clock,
  },
  Pending: {
    textClass: 'text-[#64748B]',
    Icon: Clock,
  },
  Paused: {
    textClass: 'text-[#64748B]',
    Icon: Clock,
  },
  'Revision Requested': {
    textClass: 'text-amber-700',
    Icon: AlertTriangle,
  },
  'Needs Attention': {
    textClass: 'text-red-700',
    Icon: AlertTriangle,
  },
  Cancelled: {
    textClass: 'text-red-700',
    Icon: AlertTriangle,
  },
  Suspended: {
    textClass: 'text-red-700',
    Icon: AlertTriangle,
  },
  Rejected: {
    textClass: 'text-red-700',
    Icon: AlertTriangle,
  },
};

export default function StatusLabel({ status }) {
  const cfg = STATUS_MAP[status] || { textClass: 'text-[#64748B]', Icon: Clock };
  const Icon = cfg.Icon;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cfg.textClass} whitespace-nowrap`}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}
