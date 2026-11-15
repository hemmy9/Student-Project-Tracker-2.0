import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import {
  fetchAiDraft,
  fetchProjectInsights,
  sendAiAdvisorMessage,
} from '../services/aiService';

export function useAiAssistant() {
  const { showToast } = useToast();
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsMeta, setInsightsMeta] = useState(null);
  const [insightsError, setInsightsError] = useState('');

  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const [draftLoading, setDraftLoading] = useState(false);

  const analyzeWorkspace = async ({ roleKey, institutionName, contextData }) => {
    setInsightsLoading(true);
    setInsightsError('');
    try {
      const res = await fetchProjectInsights({ roleKey, institutionName, contextData });
      setInsights(res.insights || null);
      setInsightsMeta({ model: res.model, generatedAt: res.generatedAt });
      showToast({
        type: 'success',
        title: 'AI workspace insights ready',
        message: `Generated with ${res.model}`,
      });
      return res.insights;
    } catch (err) {
      const msg = err.message || 'Unable to generate AI insights right now.';
      setInsightsError(msg);
      showToast({
        type: 'error',
        title: 'AI analysis unavailable',
        message: msg,
      });
      return null;
    } finally {
      setInsightsLoading(false);
    }
  };

  const askAdvisor = async ({ roleKey, institutionName, message, contextData }) => {
    const trimmed = String(message || '').trim();
    if (!trimmed) return null;

    const nextHistory = [...chatHistory, { role: 'user', text: trimmed }];
    setChatHistory(nextHistory);
    setChatLoading(true);
    setChatError('');

    try {
      const res = await sendAiAdvisorMessage({
        roleKey,
        institutionName,
        message: trimmed,
        history: chatHistory,
        contextData,
      });
      const reply = res.reply || 'No response received.';
      setChatHistory([...nextHistory, { role: 'assistant', text: reply }]);
      return reply;
    } catch (err) {
      const msg = err.message || 'AI Advisor could not answer right now.';
      setChatError(msg);
      showToast({
        type: 'error',
        title: 'AI Advisor error',
        message: msg,
      });
      return null;
    } finally {
      setChatLoading(false);
    }
  };

  const generateDraft = async ({ draftType, contextData, promptNote }) => {
    setDraftLoading(true);
    try {
      const res = await fetchAiDraft({ draftType, contextData, promptNote });
      showToast({
        type: 'success',
        title: 'AI draft prepared',
        message: `Drafted using ${res.model}. Review before saving.`,
      });
      return res.draft || null;
    } catch (err) {
      showToast({
        type: 'error',
        title: 'AI draft failed',
        message: err.message || 'Could not reach AI drafting endpoint.',
      });
      return null;
    } finally {
      setDraftLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setChatError('');
  };

  return {
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
    draftLoading,
    generateDraft,
  };
}
