import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Columns3,
  List,
  Plus,
  Square,
  Trash2,
} from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { useToast } from '../../../context/ToastContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

const TODAY_ISO = '2026-11-14';

const PRIORITY_STYLES = {
  High: 'text-red-700 bg-red-50 border-red-200',
  Medium: 'text-[#2563EB] bg-blue-50 border-blue-200',
  Low: 'text-[#64748B] bg-slate-100 border-slate-200',
};

const KANBAN_COLUMNS = [
  { key: 'todo', label: 'To Do', accent: 'border-slate-300' },
  { key: 'in_progress', label: 'In Progress', accent: 'border-[#2563EB]' },
  { key: 'in_review', label: 'In Review', accent: 'border-amber-500' },
  { key: 'done', label: 'Completed', accent: 'border-emerald-600' },
];

export default function StudentTasksPage() {
  const { activeMembership } = useDemoSession();
  const { showToast } = useToast();
  const {
    state,
    addProjectTask,
    toggleProjectTask,
    moveProjectTaskStatus,
    deleteProjectTask,
    addMilestone,
    updateMilestoneDueDate,
  } = useDemoAppState();

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const project =
    state.projectsByInstitution[institutionName] ||
    state.projectsByInstitution['University of Westbridge'];

  const [viewMode, setViewMode] = useState('kanban');
  const [filter, setFilter] = useState('all');
  const [milestoneFilter, setMilestoneFilter] = useState('all');
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskStage, setTaskStage] = useState('todo');
  const [taskMilestoneId, setTaskMilestoneId] = useState(project.milestones[0]?.id || '');
  const [taskError, setTaskError] = useState('');

  const [msTitle, setMsTitle] = useState('');
  const [msDueDate, setMsDueDate] = useState('');
  const [msError, setMsError] = useState('');
  const [editingMsId, setEditingMsId] = useState('');
  const [editingMsDate, setEditingMsDate] = useState('');
  const [feedbackBanner, setFeedbackBanner] = useState('');

  const normalizedTasks = useMemo(() => {
    return project.tasks.map((t) => ({
      ...t,
      status: t.status || (t.completed ? 'done' : 'todo'),
    }));
  }, [project.tasks]);

  const completedCount = normalizedTasks.filter((t) => t.completed).length;
  const overdueCount = normalizedTasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < TODAY_ISO
  ).length;
  const completionPct = normalizedTasks.length
    ? Math.round((completedCount / normalizedTasks.length) * 100)
    : 0;

  const visibleTasks = useMemo(() => {
    return normalizedTasks.filter((t) => {
      if (milestoneFilter !== 'all' && t.milestoneId !== milestoneFilter) return false;
      if (filter === 'open') return !t.completed;
      if (filter === 'done') return t.completed;
      if (filter === 'overdue') return !t.completed && t.dueDate && t.dueDate < TODAY_ISO;
      return true;
    });
  }, [normalizedTasks, filter, milestoneFilter]);

  const milestonesWithProgress = useMemo(() => {
    return project.milestones.map((ms, index) => {
      const linked = normalizedTasks.filter((t) => t.milestoneId === ms.id);
      const done = linked.filter((t) => t.completed).length;
      const pct =
        linked.length > 0
          ? Math.round((done / linked.length) * 100)
          : ms.status === 'Approved'
            ? 100
            : 0;
      const isOverdue = ms.status !== 'Approved' && ms.dueDate < TODAY_ISO;
      return { ...ms, index: index + 1, done, total: linked.length, pct, isOverdue };
    });
  }, [project.milestones, normalizedTasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate) {
      setTaskError('Enter both a task description and a target due date.');
      return;
    }
    addProjectTask(institutionName, {
      title: taskTitle.trim(),
      dueDate: taskDueDate,
      priority: taskPriority,
      status: taskStage,
      completed: taskStage === 'done',
      milestoneId: taskMilestoneId || project.milestones[0]?.id,
    });
    setTaskTitle('');
    setTaskDueDate('');
    setTaskPriority('Medium');
    setTaskStage('todo');
    setTaskError('');
    setFeedbackBanner('Task added to your project workspace.');
    showToast({
      type: 'success',
      title: 'Task created',
      message: taskTitle.trim(),
    });
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!msTitle.trim() || !msDueDate) {
      setMsError('Enter a milestone title and due date.');
      return;
    }
    addMilestone(institutionName, {
      title: msTitle.trim(),
      dueDate: msDueDate,
    });
    setMsTitle('');
    setMsDueDate('');
    setMsError('');
    setFeedbackBanner('New milestone added to your project timeline.');
    showToast({
      type: 'success',
      title: 'Milestone added',
      message: msTitle.trim(),
    });
  };

  const handleSaveMilestoneDate = (msId) => {
    if (!editingMsDate) return;
    updateMilestoneDueDate(institutionName, msId, editingMsDate);
    setEditingMsId('');
    setEditingMsDate('');
    setFeedbackBanner('Milestone target completion date updated.');
    showToast({
      type: 'info',
      title: 'Target date updated',
      message: `Milestone rescheduled to ${editingMsDate}.`,
    });
  };

  const handleDropOnColumn = (columnKey) => {
    if (!draggedTaskId) return;
    moveProjectTaskStatus(institutionName, draggedTaskId, columnKey);
    setDraggedTaskId(null);
    const colLabel = KANBAN_COLUMNS.find((c) => c.key === columnKey)?.label || columnKey;
    setFeedbackBanner(`Moved task to "${colLabel}".`);
    showToast({
      type: 'info',
      title: 'Kanban card moved',
      message: `Moved task to ${colLabel}.`,
    });
  };

  return (
    <PortalLayout navItems={getPortalNavItems('student')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-xs font-medium text-[#2563EB]">
            {project.code} · {institutionName}
          </p>
          <h1 className="font-display text-2xl font-bold text-[#172554]">
            Tasks, Kanban Board &amp; Milestones Tracker
          </h1>
          <p className="text-sm text-[#64748B]">
            Switch between Kanban board and list view, create prioritized tasks, and track milestone completion.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div
          role="tablist"
          aria-label="Task workspace view mode"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'kanban'}
            onClick={() => setViewMode('kanban')}
            className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 text-xs font-semibold cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-[#172554] text-white'
                : 'text-[#64748B] hover:text-[#172554]'
            }`}
          >
            <Columns3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Kanban Board</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 text-xs font-semibold cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#172554] text-white'
                : 'text-[#64748B] hover:text-[#172554]'
            }`}
          >
            <List className="h-3.5 w-3.5" aria-hidden="true" />
            <span>List View</span>
          </button>
        </div>
      </div>

      {feedbackBanner && (
        <StatusAlert type="success" title="Updated">
          {feedbackBanner}
        </StatusAlert>
      )}

      {/* Summary Progress Strip */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[#172554]">Overall Task Completion</span>
            <span className="font-mono font-bold text-[#172554] tabular-nums">
              {completedCount} / {normalizedTasks.length} ({completionPct}%)
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#64748B]">Attention Check</p>
            <p className="font-display text-xl font-bold text-[#172554] tabular-nums mt-0.5">
              {overdueCount} overdue task{overdueCount === 1 ? '' : 's'}
            </p>
          </div>
          {overdueCount > 0 ? (
            <AlertCircle className="h-7 w-7 text-amber-600 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Create Task Form */}
      <form
        onSubmit={handleAddTask}
        className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
      >
        <h2 className="font-display text-base font-bold text-[#172554]">Create New Task</h2>
        {taskError && (
          <StatusAlert type="error" title="Missing task details">
            {taskError}
          </StatusAlert>
        )}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <FormField
              id="new-task-title"
              label="Task description"
              placeholder="e.g. Run unit tests on edge sensor calibration"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>
          <div className="lg:col-span-3">
            <FormField
              id="new-task-milestone"
              as="select"
              label="Linked milestone"
              value={taskMilestoneId}
              onChange={(e) => setTaskMilestoneId(e.target.value)}
              options={project.milestones.map((m) => ({
                value: m.id,
                label: m.title,
              }))}
            />
          </div>
          <div className="lg:col-span-2">
            <FormField
              id="new-task-stage"
              as="select"
              label="Board column"
              value={taskStage}
              onChange={(e) => setTaskStage(e.target.value)}
              options={KANBAN_COLUMNS.map((c) => ({ value: c.key, label: c.label }))}
            />
          </div>
          <div className="lg:col-span-1">
            <FormField
              id="new-task-priority"
              as="select"
              label="Priority"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
              options={['High', 'Medium', 'Low']}
            />
          </div>
          <div className="lg:col-span-2">
            <FormField
              id="new-task-due"
              type="date"
              label="Target due date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" variant="primary" size="md">
          <Plus className="h-4 w-4 inline mr-1" aria-hidden="true" />
          Add task
        </Button>
      </form>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <section aria-label="Kanban board" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[#172554]">
              Project Kanban Board
            </h2>
            <select
              aria-label="Filter Kanban cards by milestone"
              value={milestoneFilter}
              onChange={(e) => setMilestoneFilter(e.target.value)}
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-base sm:text-xs font-medium text-[#172554] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="all">All milestones</option>
              {project.milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {KANBAN_COLUMNS.map((col) => {
              const colTasks = normalizedTasks.filter(
                (t) =>
                  t.status === col.key &&
                  (milestoneFilter === 'all' || t.milestoneId === milestoneFilter)
              );

              return (
                <div
                  key={col.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnColumn(col.key)}
                  className={`rounded-2xl border border-slate-200 border-t-4 ${col.accent} bg-white p-4 flex flex-col gap-3 min-h-[260px]`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-[#172554]">{col.label}</h3>
                    <span className="font-mono text-xs font-semibold text-[#64748B] tabular-nums">
                      {colTasks.length}
                    </span>
                  </div>

                  {colTasks.length === 0 ? (
                    <div className="flex-1 rounded-xl border border-dashed border-slate-200 bg-[#F8FAFC] p-4 flex items-center justify-center text-center text-xs text-[#64748B]">
                      No tasks in {col.label}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {colTasks.map((task) => {
                        const ms = project.milestones.find((m) => m.id === task.milestoneId);
                        const isOverdue = !task.completed && task.dueDate && task.dueDate < TODAY_ISO;
                        const priority = task.priority || 'Medium';

                        return (
                          <article
                            key={task.id}
                            draggable
                            onDragStart={() => setDraggedTaskId(task.id)}
                            className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5 space-y-2.5 cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                                  PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium
                                }`}
                              >
                                {priority}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteProjectTask(institutionName, task.id);
                                  setFeedbackBanner(`Removed task "${task.title}".`);
                                }}
                                aria-label={`Delete task ${task.title}`}
                                className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>

                            <p
                              className={`text-sm font-semibold leading-snug ${
                                task.completed ? 'line-through text-[#64748B]' : 'text-[#172554]'
                              }`}
                            >
                              {task.title}
                            </p>

                            <div className="space-y-0.5 text-[11px] text-[#64748B] tabular-nums">
                              <p className="truncate">{ms ? ms.title : 'General'}</p>
                              <p className={isOverdue ? 'font-semibold text-red-700' : ''}>
                                Due {task.dueDate}
                                {isOverdue ? ' · Overdue' : ''}
                              </p>
                            </div>

                            {/* Touch-friendly column mover for mobile */}
                            <div className="pt-1 border-t border-slate-200/80">
                              <label htmlFor={`move-${task.id}`} className="sr-only">
                                Move task column
                              </label>
                              <select
                                id={`move-${task.id}`}
                                value={task.status}
                                onChange={(e) => {
                                  moveProjectTaskStatus(institutionName, task.id, e.target.value);
                                  const nextLabel =
                                    KANBAN_COLUMNS.find((c) => c.key === e.target.value)?.label ||
                                    e.target.value;
                                  setFeedbackBanner(`Moved "${task.title}" to ${nextLabel}.`);
                                  showToast({
                                    type: 'info',
                                    title: `Moved to ${nextLabel}`,
                                    message: task.title,
                                  });
                                }}
                                className="min-h-[38px] w-full rounded-lg border border-slate-300 bg-white px-2.5 text-base sm:text-xs font-medium text-[#172554] focus:border-[#2563EB] focus:outline-none"
                              >
                                {KANBAN_COLUMNS.map((c) => (
                                  <option key={c.key} value={c.key}>
                                    Column: {c.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* List View + Milestones Tracker */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {viewMode === 'list' && (
          <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 self-start">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-base font-bold text-[#172554]">
                Project Tasks ({visibleTasks.length})
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filter tasks by milestone"
                  value={milestoneFilter}
                  onChange={(e) => setMilestoneFilter(e.target.value)}
                  className="min-h-[36px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-[#172554] focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="all">All milestones</option>
                  {project.milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'open', label: 'Open' },
                    { key: 'overdue', label: 'Overdue' },
                    { key: 'done', label: 'Done' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setFilter(tab.key)}
                      className={`min-h-[32px] rounded-md px-2.5 text-xs font-medium cursor-pointer ${
                        filter === tab.key ? 'bg-white text-[#172554] shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {visibleTasks.length === 0 ? (
              <EmptyState
                title="No tasks match this filter"
                description="Create a new task above or reset your filters."
                actionLabel="Show all tasks"
                onAction={() => {
                  setFilter('all');
                  setMilestoneFilter('all');
                }}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {visibleTasks.map((task) => {
                  const ms = project.milestones.find((m) => m.id === task.milestoneId);
                  const isOverdue = !task.completed && task.dueDate && task.dueDate < TODAY_ISO;
                  const priority = task.priority || 'Medium';
                  return (
                    <div
                      key={task.id}
                      className="py-3.5 flex items-start justify-between gap-2 hover:bg-slate-50/70 rounded-lg px-2 -mx-2"
                    >
                      <button
                        type="button"
                        onClick={() => toggleProjectTask(institutionName, task.id)}
                        className="min-h-[44px] flex-1 text-left flex items-start gap-3 cursor-pointer"
                      >
                        {task.completed ? (
                          <CheckSquare
                            className="h-5 w-5 mt-0.5 shrink-0 text-[#2563EB]"
                            aria-hidden="true"
                          />
                        ) : (
                          <Square
                            className="h-5 w-5 mt-0.5 shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                        )}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              className={`text-sm font-medium ${
                                task.completed ? 'line-through text-[#64748B]' : 'text-[#172554]'
                              }`}
                            >
                              {task.title}
                            </p>
                            <span
                              className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                                PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium
                              }`}
                            >
                              {priority}
                            </span>
                            {isOverdue && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700">
                                <Clock className="h-3 w-3" aria-hidden="true" />
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748B] tabular-nums">
                            {ms ? ms.title : 'General'} · Due {task.dueDate}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          deleteProjectTask(institutionName, task.id);
                          setFeedbackBanner(`Removed task "${task.title}".`);
                        }}
                        aria-label={`Delete task ${task.title}`}
                        className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-700 cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Milestones Tracker */}
        <section
          className={`${
            viewMode === 'list' ? 'lg:col-span-5' : 'lg:col-span-12'
          } grid grid-cols-1 gap-6 ${viewMode === 'kanban' ? 'lg:grid-cols-12' : ''}`}
        >
          <div
            className={`${
              viewMode === 'kanban' ? 'lg:col-span-7' : ''
            } rounded-2xl border border-slate-200 bg-white p-5 space-y-4`}
          >
            <div>
              <h2 className="font-display text-base font-bold text-[#172554]">
                Milestones Tracker ({milestonesWithProgress.length})
              </h2>
              <p className="text-xs text-[#64748B]">
                Live completion calculated from tasks linked to each stage.
              </p>
            </div>

            <ol className="space-y-4">
              {milestonesWithProgress.map((ms) => (
                <li
                  key={ms.id}
                  className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#172554] font-mono text-xs font-bold text-white tabular-nums">
                        {ms.index}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#172554] leading-snug">
                          {ms.title}
                        </p>
                        <p className="font-mono text-xs text-[#64748B] tabular-nums mt-0.5">
                          Due {ms.dueDate}
                          {ms.isOverdue ? ' · Past target date' : ''}
                        </p>
                      </div>
                    </div>
                    <StatusLabel status={ms.status} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] tabular-nums">
                      <span>
                        {ms.total > 0
                          ? `${ms.done} of ${ms.total} linked tasks done`
                          : 'No linked tasks yet'}
                      </span>
                      <span className="font-mono font-semibold text-[#172554]">{ms.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          ms.status === 'Approved' ? 'bg-emerald-600' : 'bg-[#2563EB]'
                        }`}
                        style={{ width: `${ms.pct}%` }}
                      />
                    </div>
                  </div>

                  {editingMsId === ms.id ? (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <input
                        type="date"
                        value={editingMsDate}
                        onChange={(e) => setEditingMsDate(e.target.value)}
                        aria-label="New target date"
                        className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-2.5 text-base sm:text-xs text-[#172554]"
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleSaveMilestoneDate(ms.id)}
                      >
                        Save date
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingMsId('')}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    ms.status !== 'Approved' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMsId(ms.id);
                          setEditingMsDate(ms.dueDate);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                      >
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Adjust target date</span>
                      </button>
                    )
                  )}
                </li>
              ))}
            </ol>
          </div>

          <form
            onSubmit={handleAddMilestone}
            className={`${
              viewMode === 'kanban' ? 'lg:col-span-5 self-start' : ''
            } rounded-2xl border border-slate-200 bg-white p-5 space-y-4`}
          >
            <h2 className="font-display text-base font-bold text-[#172554]">Add New Milestone</h2>
            {msError && (
              <StatusAlert type="error" title="Missing milestone details">
                {msError}
              </StatusAlert>
            )}
            <FormField
              id="new-ms-title"
              label="Milestone title"
              placeholder="e.g. Chapter 5: Final Evaluation"
              value={msTitle}
              onChange={(e) => setMsTitle(e.target.value)}
              required
            />
            <FormField
              id="new-ms-due"
              type="date"
              label="Target completion date"
              value={msDueDate}
              onChange={(e) => setMsDueDate(e.target.value)}
              required
            />
            <Button type="submit" variant="navy" size="md" fullWidth>
              Add milestone
            </Button>
          </form>
        </section>
      </div>
    </PortalLayout>
  );
}
