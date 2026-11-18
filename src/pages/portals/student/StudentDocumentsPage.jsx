import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, FileText, FileUp, GitBranch, Layers } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import {
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { useToast } from '../../../context/ToastContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

function incrementVersionLabel(versionStr) {
  const match = String(versionStr || 'v1').match(/v?(\d+)/i);
  const nextNum = match ? Number(match[1]) + 1 : 2;
  return `v${nextNum}`;
}

export default function StudentDocumentsPage() {
  const { session, activeMembership } = useDemoSession();
  const { showToast } = useToast();
  const { state, submitDocumentChapter, respondToRevision } = useDemoAppState();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const project = projectKey ? state.projectsByInstitution[projectKey] : null;
  const mutationInstitution = projectKey || institutionName;

  const milestones = project?.milestones || [];
  const submissions = project?.submissions || [];

  const [milestoneId, setMilestoneId] = useState(milestones[0]?.id || '');
  const [targetGroupId, setTargetGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('v1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [studentNote, setStudentNote] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [responseDrafts, setResponseDrafts] = useState({});

  // Group submissions by documentGroupId so version history stacks together cleanly
  const documentGroups = useMemo(() => {
    const map = new Map();
    submissions.forEach((sub) => {
      const groupKey = sub.documentGroupId || sub.title;
      if (!map.has(groupKey)) {
        map.set(groupKey, []);
      }
      map.get(groupKey).push(sub);
    });

    return Array.from(map.entries()).map(([groupId, versions]) => ({
      groupId,
      latest: versions[0],
      previousVersions: versions.slice(1),
      allVersions: versions,
    }));
  }, [submissions]);

  if (!project) {
    return (
      <PortalLayout navItems={getPortalNavItems('student')}>
        <EmptyState
          icon={FileText}
          title="No active student documents workspace"
          description={`No student document repository is assigned under ${institutionName}. Switch institution membership or reset demo data if needed.`}
        />
      </PortalLayout>
    );
  }

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedFile) {
      setFormError('Enter a document title and attach a PDF/DOCX file before submitting.');
      return;
    }

    const sizeMb = Math.max(0.1, selectedFile.size / (1024 * 1024)).toFixed(1);
    submitDocumentChapter(mutationInstitution, {
      documentGroupId: targetGroupId || undefined,
      milestoneId: milestoneId || project.milestones[0]?.id,
      title: title.trim(),
      version: version.trim() || 'v1',
      fileName: selectedFile.name,
      fileSize: `${sizeMb} MB`,
      studentNote: studentNote.trim() || 'Submitted for supervisor review.',
    });

    const submittedVersion = version.trim() || 'v1';
    const submittedTitle = title.trim();
    setTitle('');
    setVersion('v1');
    setTargetGroupId('');
    setSelectedFile(null);
    setStudentNote('');
    setFormError('');
    setSuccessMsg(
      'New document version recorded in immutable submission history. Uploaded manuscripts will use cloud storage when live persistence is connected.'
    );
    showToast({
      type: 'success',
      title: `Uploaded ${submittedVersion}`,
      message: `${submittedTitle} submitted for supervisor review.`,
    });
  };

  const handlePrepareNewVersion = (group) => {
    const latest = group.latest;
    setTargetGroupId(group.groupId);
    setMilestoneId(latest.milestoneId || project.milestones[0]?.id || '');
    setTitle(latest.title);
    setVersion(incrementVersionLabel(latest.version));
    setStudentNote('');
    setFormError('');
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSendRevisionResponse = (subId) => {
    const text = (responseDrafts[subId] || '').trim();
    if (!text) return;
    respondToRevision(mutationInstitution, subId, text);
    setResponseDrafts((prev) => ({ ...prev, [subId]: '' }));
    setSuccessMsg('Revision response sent to your supervisor for re-review.');
    showToast({
      type: 'info',
      title: 'Revision response sent',
      message: 'Your supervisor was notified for re-review.',
    });
  };

  const toggleGroupExpand = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <PortalLayout navItems={getPortalNavItems('student')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">
          {project.code} · {institutionName}
        </p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Documents &amp; Versioned Chapter Submissions
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Upload chapter drafts, stack immutable revisions (v1 → v2 → v3), and respond to {project.supervisorName}’s review feedback.
        </p>
      </div>

      {successMsg && (
        <StatusAlert type="success" title="Submission recorded">
          {successMsg}
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleUploadSubmit}
          className="lg:col-span-5 spt-surface rounded-2xl p-5 sm:p-6 space-y-4 self-start"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              {targetGroupId ? 'Upload New Document Version' : 'Submit Document / Chapter'}
            </h2>
            {targetGroupId && (
              <button
                type="button"
                onClick={() => {
                  setTargetGroupId('');
                  setTitle('');
                  setVersion('v1');
                }}
                className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                New document instead
              </button>
            )}
          </div>

          {formError && (
            <StatusAlert type="error" title="Missing document details">
              {formError}
            </StatusAlert>
          )}

          <FormField
            id="sub-milestone"
            as="select"
            label="Target milestone"
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
            options={project.milestones.map((m) => ({ value: m.id, label: m.title }))}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <FormField
                id="sub-title"
                label="Document / chapter title"
                placeholder="e.g. Chapter 4: Prototype Evaluation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <FormField
              id="sub-version"
              label="Version tag"
              placeholder="v1"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sub-file" className="block text-sm font-medium text-[var(--text-primary)]">
              Attach manuscript file (PDF / DOCX) *
            </label>
            <label
              htmlFor="sub-file"
              className="flex min-h-[56px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4 py-3 text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <FileUp className="h-4 w-4 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
              <span className="truncate">
                {selectedFile ? selectedFile.name : 'Tap to choose file from device'}
              </span>
              <input
                id="sub-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="sr-only"
              />
            </label>
          </div>

          <FormField
            id="sub-note"
            as="textarea"
            rows={3}
            label="Version changelog / submission note"
            placeholder="Summarize changes made in this version..."
            value={studentNote}
            onChange={(e) => setStudentNote(e.target.value)}
          />

          <Button type="submit" variant="primary" size="lg" fullWidth>
            Submit {version || 'draft'} to supervisor
          </Button>
        </form>

        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Versioned Documents ({documentGroups.length} documents · {project.submissions.length}{' '}
              versions)
            </h2>
          </div>

          {documentGroups.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents submitted yet"
              description="Attach a chapter draft or manuscript on the left to start your immutable submission history."
            />
          ) : (
            <div className="space-y-4">
              {documentGroups.map((group) => {
                const latest = group.latest;
                const isExpanded = Boolean(expandedGroups[group.groupId]);
                const nextVersion = incrementVersionLabel(latest.version);

                return (
                  <article
                    key={group.groupId}
                    className="spt-surface rounded-2xl p-5 space-y-3.5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[var(--accent-primary)]">
                            <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                            Latest: {latest.version}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] tabular-nums">
                            ({group.allVersions.length} version
                            {group.allVersions.length === 1 ? '' : 's'})
                          </span>
                        </div>
                        <p className="font-display text-base font-bold text-[var(--text-primary)]">
                          {latest.title}
                        </p>
                        <p className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                          {latest.fileName} · {latest.fileSize} · Submitted {latest.submittedAt}
                        </p>
                      </div>
                      <StatusLabel status={latest.status} />
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {latest.studentNote}
                    </p>

                    {latest.supervisorFeedback && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                          Supervisor Feedback ({latest.version})
                        </p>
                        <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                          {latest.supervisorFeedback}
                        </p>
                      </div>
                    )}

                    {latest.studentResponse && (
                      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 space-y-1">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                          Your Revision Response
                        </p>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                          {latest.studentResponse}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handlePrepareNewVersion(group)}
                      >
                        <Layers className="h-3.5 w-3.5 inline mr-1.5" aria-hidden="true" />
                        Upload {nextVersion}
                      </Button>

                      {group.previousVersions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleGroupExpand(group.groupId)}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          <span>
                            {isExpanded
                              ? 'Hide previous versions'
                              : `View ${group.previousVersions.length} older version${
                                  group.previousVersions.length === 1 ? '' : 's'
                                }`}
                          </span>
                        </button>
                      )}
                    </div>

                    {latest.status === 'Revision Requested' && (
                      <div className="border-t border-[var(--border-subtle)] pt-3 space-y-2.5">
                        <FormField
                          id={`resp-${latest.id}`}
                          label="Quick reply to revision request"
                          placeholder="Explain how you addressed the requested changes..."
                          value={responseDrafts[latest.id] || ''}
                          onChange={(e) =>
                            setResponseDrafts((prev) => ({ ...prev, [latest.id]: e.target.value }))
                          }
                        />
                        <Button
                          type="button"
                          variant="navy"
                          size="sm"
                          onClick={() => handleSendRevisionResponse(latest.id)}
                        >
                          Send response &amp; request re-review
                        </Button>
                      </div>
                    )}

                    {/* Immutable Version History Timeline */}
                    {isExpanded && group.previousVersions.length > 0 && (
                      <div className="border-t border-[var(--border-subtle)] pt-4 space-y-3">
                        <p className="text-xs font-bold text-[var(--text-secondary)]">
                          Archived Version History (Immutable)
                        </p>
                        <div className="space-y-2.5">
                          {group.previousVersions.map((oldVer) => (
                            <div
                              key={oldVer.id}
                              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 space-y-1.5 text-xs"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-mono font-bold text-[var(--text-primary)]">
                                  {oldVer.version} · {oldVer.fileName} ({oldVer.fileSize})
                                </span>
                                <StatusLabel status={oldVer.status} />
                              </div>
                              <p className="text-[var(--text-secondary)] tabular-nums">
                                Submitted {oldVer.submittedAt} — {oldVer.studentNote}
                              </p>
                              {oldVer.supervisorFeedback && (
                                <p className="text-[var(--text-primary)]">
                                  <strong className="font-semibold">Feedback:</strong>{' '}
                                  {oldVer.supervisorFeedback}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PortalLayout>
  );
}

