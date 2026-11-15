import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Bot, RefreshCw, Send, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { useAiAssistant } from '../../hooks/useAiAssistant';

const ROLE_PROMPTS = {
  student: [
    'What should I prioritize before my next deadline?',
    'Summarize blockers across my active milestone and tasks',
    'What should I discuss in my next supervisor office hour?',
  ],
  supervisor: [
    'Which students need immediate intervention this week?',
    'Summarize my pending document review priorities',
    'Draft a checklist for upcoming office hour consultations',
  ],
  institution_admin: [
    'Summarize pending approvals and unassigned project risks',
    'Which department has the highest supervision workload?',
  ],
  platform_admin: [
    'Summarize pending institution applications requiring verification',
    'Highlight tenant onboarding and governance priorities',
  ],
};

export default function AiProjectCopilot({
  roleKey = 'student',
  institutionName = 'University of Westbridge',
  contextData = {},
  title = 'AI Project Intelligence & Copilot',
  subtitle = 'Server-side Gemini insights grounded in your live milestones, tasks, and supervision logs.',
}) {
  const {
    insights,
    insightsMeta,
    insightsLoading,
    insightsError,
    analyzeWorkspace,
    chatHistory,
    chatLoading,
    chatError,
    askAdvisor,
    clearChat,
  } = useAiAssistant();

  const [question, setQuestion] = useState('');
  const quickPrompts = ROLE_PROMPTS[roleKey] || ROLE_PROMPTS.student;

  const handleAnalyze = () => {
    analyzeWorkspace({ roleKey, institutionName, contextData });
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || chatLoading) return;
    const text = question.trim();
    setQuestion('');
    await askAdvisor({ roleKey, institutionName, message: text, contextData });
  };

  const handleQuickPrompt = async (promptText) => {
    if (chatLoading) return;
    await askAdvisor({ roleKey, institutionName, message: promptText, contextData });
  };

  return (
    <section
      aria-label="AI project copilot"
      className="h-full rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold text-[#172554]">{title}</h2>
            </div>
            <p className="text-xs text-[#64748B]">{subtitle}</p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAnalyze}
            disabled={insightsLoading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 inline mr-1.5 ${insightsLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {insightsLoading ? 'Analyzing...' : insights ? 'Refresh AI Insights' : 'Analyze Workspace'}
          </Button>
        </div>

        {/* Insights Error */}
        {insightsError && (
          <div
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex items-start justify-between gap-3 text-xs text-amber-900"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" aria-hidden="true" />
              <div className="space-y-0.5">
                <p className="font-semibold">AI Analysis Notice</p>
                <p className="leading-relaxed">{insightsError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={insightsLoading}
              className="shrink-0 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Structured AI Insights Card */}
        {insights ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-sm font-bold text-[#172554]">{insights.headline}</p>
              <span className="font-mono text-[11px] font-semibold text-[#2563EB]">
                {insights.healthLabel || 'Analyzed'}
                {insightsMeta?.model ? ` · ${insightsMeta.model}` : ''}
              </span>
            </div>

            <p className="text-xs text-[#172554] leading-relaxed">{insights.healthSummary}</p>

            {Array.isArray(insights.riskAlerts) && insights.riskAlerts.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                  Key Attention Signals
                </p>
                <ul className="space-y-1 text-xs text-[#172554]">
                  {insights.riskAlerts.map((alert, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(insights.priorityActions) && insights.priorityActions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Recommended Actions
                </p>
                <div className="space-y-1.5">
                  {insights.priorityActions.map((act, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-[#172554]">{act.title}</p>
                        <p className="text-[11px] text-[#64748B]">{act.rationale}</p>
                      </div>
                      {act.targetRoute && (
                        <Link
                          to={act.targetRoute}
                          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline mt-0.5"
                        >
                          <span>Go</span>
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-[#F8FAFC] p-4 space-y-2">
            <p className="text-xs font-semibold text-[#172554]">
              On-demand AI Workspace Briefing
            </p>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Click <strong>Analyze Workspace</strong> to evaluate active milestones, overdue deliverables, review bottlenecks, and upcoming consultation priorities with Gemini.
            </p>
          </div>
        )}

        {/* Quick Prompts + Interactive Advisor */}
        <div className="space-y-2.5 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#172554]">
              <Bot className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
              <span>Ask Project Advisor</span>
            </p>
            {chatHistory.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                className="text-[11px] font-semibold text-[#64748B] hover:text-[#172554] cursor-pointer"
              >
                Clear chat
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((promptText) => (
              <button
                key={promptText}
                type="button"
                disabled={chatLoading}
                onClick={() => handleQuickPrompt(promptText)}
                className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#172554] hover:border-[#2563EB] hover:bg-blue-50/40 disabled:opacity-60 cursor-pointer transition-colors"
              >
                {promptText}
              </button>
            ))}
          </div>

          {chatHistory.length > 0 && (
            <div className="max-h-52 overflow-y-auto space-y-2 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3">
              {chatHistory.map((turn, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    turn.role === 'user'
                      ? 'bg-[#172554] text-white ml-6'
                      : 'bg-white border border-slate-200 text-[#172554] mr-4 whitespace-pre-line'
                  }`}
                >
                  {turn.text}
                </div>
              ))}
              {chatLoading && (
                <p className="text-[11px] font-mono text-[#2563EB]">Advisor thinking...</p>
              )}
            </div>
          )}

          {chatError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {chatError}
            </p>
          )}

          <form onSubmit={handleAsk} className="flex items-center gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about milestones, deadlines, or next steps..."
              aria-label="Ask AI project advisor"
              className="min-h-[40px] flex-1 rounded-lg border border-slate-300 bg-white px-3 text-base sm:text-xs text-[#172554] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
            />
            <Button
              type="submit"
              variant="navy"
              size="sm"
              disabled={chatLoading || !question.trim()}
            >
              <Send className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
              Ask
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
