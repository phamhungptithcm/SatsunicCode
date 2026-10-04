export type LocalDraft = {
  source: string;
  revision: number;
  updatedAt: number;
};
export function draftKey(owner: string, problem: string, language: string) {
  return `satsuniccode.draft.v1:${encodeURIComponent(owner)}:${encodeURIComponent(problem)}:${encodeURIComponent(language)}`;
}
export function parseDraft(raw: string | null): LocalDraft | null {
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw);
    return typeof draft.source === "string" &&
      draft.source.length <= 100000 &&
      Number.isSafeInteger(draft.revision) &&
      draft.revision >= 0 &&
      typeof draft.updatedAt === "number" &&
      Number.isFinite(draft.updatedAt)
      ? draft
      : null;
  } catch {
    return null;
  }
}
