/**
 * Browser autosave for resume edits and studio settings.
 * Every access is wrapped in try/catch: storage can be unavailable (private mode)
 * or full (large uploaded photos), and the app must keep working without it.
 */
const PREFIX = 'cv-studio:v1:';

export function loadSaved(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Returns false when the value could not be stored (e.g. quota exceeded). */
export function save(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function fingerprint(value) {
  const str = JSON.stringify(value);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  return `${str.length}:${hash}`;
}

/**
 * Saved resume edits are tied to the preset content they started from. When the
 * preset itself changes (resumeData.js edited), the stale saved copy is dropped
 * so the updated file content shows up.
 */
export function loadResume(presetKey, presetData) {
  const saved = loadSaved(`data:${presetKey}`, null);
  if (saved && saved.base === fingerprint(presetData) && saved.data) return saved.data;
  return presetData;
}

export function saveResume(presetKey, presetData, data) {
  return save(`data:${presetKey}`, { base: fingerprint(presetData), data });
}

export function removeSaved(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
