import { AlertTriangle, CheckCircle2, Clock, FileEdit } from 'lucide-react';

const STATUS_MAP = {
  Approved: {
    textClass: 'text-emerald-700 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  Confirmed: {
    textClass: 'text-emerald-700 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  Completed: {
    textClass: 'text-emerald-700 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  Active: {
    textClass: 'text-emerald-700 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  'On Track': {
    textClass: 'text-emerald-700 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  'In Progress': {
    textClass: 'text-[#2563EB] dark:text-[#60A5FA]',
    Icon: Clock,
  },
  'Review Ready': {
    textClass: 'text-[#2563EB] dark:text-[#60A5FA]',
    Icon: FileEdit,
  },
  'Pending Review': {
    textClass: 'text-amber-700 dark:text-amber-400',
    Icon: Clock,
  },
  'Pending Approval': {
    textClass: 'text-amber-700 dark:text-amber-400',
    Icon: Clock,
  },
  Pending: {
    textClass: 'text-slate-600 dark:text-slate-300',
    Icon: Clock,
  },
  Paused: {
    textClass: 'text-slate-600 dark:text-slate-300',
    Icon: Clock,
  },
  'Revision Requested': {
    textClass: 'text-amber-700 dark:text-amber-400',
    Icon: AlertTriangle,
  },
  'Needs Attention': {
    textClass: 'text-red-700 dark:text-red-400',
    Icon: AlertTriangle,
  },
  Cancelled: {
    textClass: 'text-red-700 dark:text-red-400',
    Icon: AlertTriangle,
  },
  Suspended: {
    textClass: 'text-red-700 dark:text-red-400',
    Icon: AlertTriangle,
  },
  Rejected: {
    textClass: 'text-red-700 dark:text-red-400',
    Icon: AlertTriangle,
  },
};

export default function StatusLabel({ status }) {
  const cfg = STATUS_MAP[status] || {
    textClass: 'text-slate-600 dark:text-slate-300',
    Icon: Clock,
  };
  const Icon = cfg.Icon;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cfg.textClass} whitespace-nowrap`}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}
