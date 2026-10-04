import { httpsCallable } from "firebase/functions";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { functions, db, auth } from "../../firebase";
import type {
  Company,
  Contribution,
  PublicReview,
  SalaryInput,
  SalaryStats,
} from "../../../../../packages/contracts/src/community";
import type { ProgressSummary } from "../../../../../packages/contracts/src/progress";
import { cohortKey } from "../../../../../packages/domain/src/compensation";
const retryIds = new Map<string, string>();
export async function changeCommunity(input: Record<string, unknown>) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(input)),
  );
  const key = `${auth.currentUser?.uid}:${Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")}`;
  if (retryIds.size >= 50 && !retryIds.has(key))
    retryIds.delete(retryIds.keys().next().value!);
  const requestId = retryIds.get(key) ?? crypto.randomUUID();
  retryIds.set(key, requestId);
  const result = await httpsCallable<
    Record<string, unknown>,
    { id: string; revision?: number; status?: string }
  >(
    functions,
    "changeCommunity",
  )({ ...input, requestId });
  retryIds.delete(key);
  return result.data;
}
export async function loadCompanies(cursor?: string) {
  const q = query(
    collection(db, "companies"),
    where("publicationState", "==", "PUBLISHED"),
    orderBy("__name__"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(30),
  );
  return (await getDocs(q)).docs.map(
    (d) => ({ ...d.data(), id: d.id }) as Company,
  );
}
export async function loadCompany(id: string) {
  const s = await getDoc(doc(db, "companies", id));
  return s.exists() ? ({ ...s.data(), id: s.id } as Company) : null;
}
export async function loadReviews(companyId: string, cursor?: string) {
  const q = query(
    collection(db, "publicReviews"),
    where("companyId", "==", companyId),
    orderBy("__name__"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(20),
  );
  return (await getDocs(q)).docs.map(
    (d) => ({ ...d.data(), id: d.id }) as PublicReview,
  );
}
export async function loadContributions(moderation = false, cursor?: string) {
  return (
    await httpsCallable<
      { moderation: boolean; cursor?: string },
      { items: Contribution[]; nextCursor: string | null }
    >(
      functions,
      "listCommunityContributions",
    )({ moderation, ...(cursor ? { cursor } : {}) })
  ).data;
}
export async function loadSalaryStats(
  input: Pick<
    SalaryInput,
    | "companyId"
    | "country"
    | "role"
    | "level"
    | "currency"
    | "basis"
    | "year"
    | "employmentType"
  >,
) {
  const s = await getDoc(doc(db, "salaryAggregates", cohortKey(input)));
  return s.exists() ? (s.data() as SalaryStats) : { available: false };
}
export async function getProgress() {
  return (
    await httpsCallable<unknown, ProgressSummary>(
      functions,
      "getLearningProgress",
    )({})
  ).data;
}
export async function changeProgress(input: Record<string, unknown>) {
  return (
    await httpsCallable(
      functions,
      "changeLearningProgress",
    )({ ...input, requestId: crypto.randomUUID() })
  ).data;
}

export async function loadCompanyStats(id: string) {
  const s = await getDoc(doc(db, "companyReviewStats", id));
  return s.exists()
    ? (s.data() as {
        employee: { count: number; sum: number; distribution: number[] };
        interview: { count: number; sum: number; distribution: number[] };
      })
    : null;
}

export async function getOwnContribution(input: Record<string, unknown>) {
  return (
    await httpsCallable<Record<string, unknown>, { item: Contribution | null }>(
      functions,
      "getOwnCommunityContribution",
    )(input)
  ).data.item;
}
