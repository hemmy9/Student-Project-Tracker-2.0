import {
  BookText,
  CalendarClock,
  CheckSquare,
  FileUp,
  MessageSquare,
  Printer,
} from 'lucide-react';
import { FadeInSection, PerspectiveCard, StaggerGroup, StaggerItem } from '../ui/MotionPrimitives';

const FEATURES = [
  {
    code: '01',
    icon: CheckSquare,
    title: 'Milestones & Task Tracking',
    description:
      'Break ND and HND projects into structured milestones, assign target deadlines, and measure real completion progress.',
  },
  {
    code: '02',
    icon: BookText,
    title: 'Weekly Progress Journals',
    description:
      'Students log weekly accomplishments, blockers, and next steps so supervisors can identify stalled work early.',
  },
  {
    code: '03',
    icon: FileUp,
    title: 'Chapter & Document Submissions',
    description:
      'Upload proposals, literature reviews, and project chapters while preserving version history and review timestamps.',
  },
  {
    code: '04',
    icon: MessageSquare,
    title: 'Supervisor Reviews & AI Assistance',
    description:
      'Review chapters, request targeted revisions, and summarize supervisor feedback with direct student-supervisor messaging.',
  },
  {
    code: '05',
    icon: CalendarClock,
    title: 'Office Hours Scheduling',
    description:
      'Supervisors publish weekly consultation slots while students book and confirm dedicated academic feedback sessions.',
  },
  {
    code: '06',
    icon: Printer,
    title: 'Institutional Reports & Audits',
    description:
      'Generate clean academic progress summaries ready for departmental reviews, project defence, and institutional oversight.',
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <FadeInSection className="max-w-2xl space-y-3 mb-10">
          <p className="font-mono text-xs font-semibold tracking-wider text-[var(--accent-primary)]">
            CORE PLATFORM CAPABILITIES
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] text-balance">
            Everything required to take a Grace Polytechnic project from proposal to defence.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Built around real polytechnic supervision workflows so students stay accountable and departments maintain clear institutional oversight.
          </p>
        </FadeInSection>

        <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.code}>
                <PerspectiveCard maxTilt={3} hoverLift={-3} className="h-full">
                  <div className="h-full rounded-2xl spt-surface p-6 space-y-3 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-[var(--accent-primary)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="font-mono text-xs font-medium text-[var(--text-muted)] tabular-nums">
                        {feature.code}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </PerspectiveCard>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
