import {
  Bell,
  BookText,
  CheckSquare,
  FileUp,
  MessageSquare,
  Printer,
} from 'lucide-react';

const FEATURES = [
  {
    code: '01',
    icon: CheckSquare,
    title: 'Milestones & Task Tracking',
    description:
      'Break final-year or postgraduate research into structured milestones, assign target deadlines, and measure real completion progress.',
  },
  {
    code: '02',
    icon: BookText,
    title: 'Weekly Progress Journals',
    description:
      'Students log weekly accomplishments, blockers, and next steps so supervisors can spot stalled work before submission deadlines.',
  },
  {
    code: '03',
    icon: FileUp,
    title: 'Document & Chapter Submissions',
    description:
      'Upload proposals, literature reviews, and thesis chapters while preserving complete version history and review timestamps.',
  },
  {
    code: '04',
    icon: MessageSquare,
    title: 'Supervisor Reviews & Messaging',
    description:
      'Approve chapters or request targeted revisions with clear written feedback and direct student-supervisor messaging.',
  },
  {
    code: '05',
    icon: Bell,
    title: 'Actionable Notifications',
    description:
      'Receive timely alerts when documents are reviewed, revisions are requested, milestones approach, or memberships are approved.',
  },
  {
    code: '06',
    icon: Printer,
    title: 'Printable Progress Reports',
    description:
      'Generate clean, formatted academic progress summaries ready for departmental reviews, viva preparation, or institutional audits.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="border-t border-slate-200 bg-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-2xl space-y-3 mb-10">
          <p className="text-xs font-semibold tracking-wide text-[#2563EB]">
            Core Platform Capabilities
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172554] text-balance">
            Everything required to take an academic project from proposal to final approval.
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            Built around real university supervision workflows so students stay accountable and departments maintain complete institutional oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.code}
                className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-xs font-medium text-[#64748B] tabular-nums">
                    {feature.code}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#172554]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
