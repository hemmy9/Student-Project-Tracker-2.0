async function postAiJson(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `AI request failed (${response.status})`);
    error.code = data.code || 'AI_ERROR';
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function checkAiHealth() {
  const response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error('Backend health endpoint unavailable');
  }
  return response.json();
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
