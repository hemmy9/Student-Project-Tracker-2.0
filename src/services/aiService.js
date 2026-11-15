import { normalizeAppError } from '../utils/errorHandler';

const REQUEST_TIMEOUT_MS = 25000;

async function postAiJson(endpoint, payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errObj = {
        status: response.status,
        code: data.code || 'AI_ERROR',
        message: data.error || `AI request failed (${response.status})`,
      };
      const error = new Error(normalizeAppError(errObj));
      error.code = errObj.code;
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (err) {
    const error = new Error(normalizeAppError(err, 'Unable to reach the AI endpoint.'));
    error.code = err?.code || (err?.name === 'AbortError' ? 'AI_TIMEOUT' : 'NETWORK_ERROR');
    error.status = err?.status || null;
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkAiHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch('/api/health', { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Health check failed (${response.status})`);
    }
    return response.json();
  } catch (err) {
    throw new Error(normalizeAppError(err, 'Backend health endpoint unavailable'));
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchProjectInsights({ roleKey, institutionName, contextData }) {
  return postAiJson('/api/ai/project-insights', {
    roleKey,
    institutionName,
    contextData,
  });
}

export async function fetchAiDraft({ draftType, contextData, promptNote }) {
  return postAiJson('/api/ai/draft-assistant', {
    draftType,
    contextData,
    promptNote,
  });
}

export async function sendAiAdvisorMessage({
  roleKey,
  institutionName,
  message,
  history,
  contextData,
}) {
  return postAiJson('/api/ai/chat', {
    roleKey,
    institutionName,
    message,
    history,
    contextData,
  });
}
