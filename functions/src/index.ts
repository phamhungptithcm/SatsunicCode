import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError, onCallGenkit } from "firebase-functions/https";
import { genkit, z } from "genkit";
import {
  enrollSchema,
  executionInputSchema,
} from "../../packages/contracts/src";
import { dsaNodes } from "../../packages/domain/src/catalog";
import { nextActions } from "../../packages/domain/src/learning";
initializeApp();
const db = getFirestore();
const local = process.env.FUNCTIONS_EMULATOR === "true";
const opts = {
  region: "us-central1",
  enforceAppCheck: !local,
  maxInstances: 2,
};
function requireLearner(
  auth: { uid: string; token: Record<string, unknown> } | undefined,
) {
  if (!auth) throw new HttpsError("unauthenticated", "Sign in first.");
  if (!local)
    throw new HttpsError(
      "unavailable",
      "Staging authorization/readiness is not approved yet.",
    );
  if (
    (auth.token.firebase as { sign_in_provider?: string } | undefined)
      ?.sign_in_provider === "anonymous"
  )
    throw new HttpsError(
      "permission-denied",
      "Create a learner account first.",
    );
  return auth.uid;
}
export const enrollRoadmap = onCall(opts, async (request) => {
  const uid = requireLearner(request.auth);
  const parsed = enrollSchema.safeParse(request.data);
  if (!parsed.success)
    throw new HttpsError("invalid-argument", "Invalid enrollment.");
  const input = parsed.data;
  if (input.trackSlug !== "dsa" || input.roadmapVersion !== "dsa-v1")
    throw new HttpsError(
      "failed-precondition",
      "This roadmap is not available yet.",
    );
  const userRef = db.doc(`users/${uid}`),
    ref = userRef.collection("enrollments").doc(input.roadmapVersion);
  return db.runTransaction(async (tx) => {
    const [existing, catalog, user] = await Promise.all([
      tx.get(ref),
      tx.get(db.doc("catalog/dsa-v1")),
      tx.get(userRef),
    ]);
    if (!catalog.exists || catalog.data()?.publicationState !== "PUBLISHED")
      throw new HttpsError("failed-precondition", "Roadmap unavailable.");
    if (!existing.exists)
      tx.create(ref, {
        ownerUid: uid,
        trackSlug: input.trackSlug,
        roadmapVersion: input.roadmapVersion,
        requestId: input.requestId,
        createdBy: uid,
        changedBy: uid,
        createdDate: FieldValue.serverTimestamp(),
        changedDate: FieldValue.serverTimestamp(),
        schemaVersion: 1,
      });
    tx.set(
      userRef,
      {
        activePlan: input.roadmapVersion,
        createdBy: uid,
        createdDate: user.exists
          ? user.data()?.createdDate
          : FieldValue.serverTimestamp(),
        changedBy: uid,
        changedDate: FieldValue.serverTimestamp(),
        schemaVersion: 1,
      },
      { merge: true },
    );
    return { enrollmentId: input.roadmapVersion };
  });
});
export const getNextActions = onCall(opts, async (request) => {
  const uid = requireLearner(request.auth);
  const user = await db.doc(`users/${uid}`).get();
  if (user.data()?.activePlan !== "dsa-v1") return { actions: [] };
  // No verified progress can be minted until a trusted evaluator exists.
  return { actions: nextActions(dsaNodes, {}) };
});
export const createSubmission = onCall(opts, async (request) => {
  requireLearner(request.auth);
  const parsed = executionInputSchema.safeParse(request.data);
  if (!parsed.success || parsed.data.mode !== "submit")
    throw new HttpsError("invalid-argument", "Invalid submission.");
  throw new HttpsError(
    "unavailable",
    "Code execution requires an approved isolated runner. No verdict has been recorded.",
  );
});
// The actual exported streaming callable is fail-closed until quota, assessment,
// App Check and approved model/project evidence are complete. No canned response.
const ai = genkit({ plugins: [] });
const assistantFlow = ai.defineFlow(
  {
    name: "sendAssistantMessage",
    inputSchema: z
      .object({
        message: z.string().min(1).max(8000),
        clientRequestId: z.string().uuid(),
        locale: z.enum(["vi", "en"]),
      })
      .strict(),
    outputSchema: z.string(),
    streamSchema: z.string(),
  },
  async () => {
    throw new HttpsError(
      "unavailable",
      "Ask Satsunic has no approved Gemini configuration yet.",
    );
  },
);
export const sendAssistantMessage = onCallGenkit(
  { ...opts, authPolicy: (auth) => !!auth },
  assistantFlow,
);

// Availability exposes no secrets and never creates jobs or graded evidence.
export const getExecutionCapabilities = onCall(opts, async () => ({
  available: false,
  reason: "RUNNER_NOT_CONFIGURED",
  runtimes: [],
  gradingAvailable: false,
}));

export const createRun = onCall(opts, async (request) => {
  requireLearner(request.auth);
  const parsed = executionInputSchema.safeParse(request.data);
  if (!parsed.success || parsed.data.mode !== "run")
    throw new HttpsError("invalid-argument", "Invalid run request.");
  throw new HttpsError(
    "unavailable",
    "No approved isolated runner is configured. Code was not executed.",
  );
});
