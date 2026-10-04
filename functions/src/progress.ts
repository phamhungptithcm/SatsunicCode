import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/https";
import { actor, communityOptions } from "./community";
import {
  learningRequest,
  type LearningStatus,
  type ProgressSummary,
} from "../../packages/contracts/src/progress";
import { dsaProblems } from "../../packages/domain/src/dsa-catalog";
import {
  validLearningPath,
  learningTopics,
} from "../../packages/domain/src/progress";
const known = new Set(dsaProblems.map((p) => p.slug));
export const changeLearningProgress = onCall(
  communityOptions,
  async (request) => {
    const uid = actor(request),
      parsed = learningRequest.safeParse(request.data);
    if (!parsed.success)
      throw new HttpsError("invalid-argument", "Invalid learning update.");
    const data = parsed.data;
    if (
      data.action === "status" &&
      !learningTopics.some((t) => t.id === data.topicId)
    )
      throw new HttpsError("invalid-argument", "Unknown topic.");
    if (data.action === "activity" && !validLearningPath(data.path, known))
      throw new HttpsError("invalid-argument", "Unknown learning destination.");
    const db = getFirestore(),
      ref = db.doc(
        data.action === "status"
          ? `users/${uid}/topicStatuses/${data.topicId}`
          : `users/${uid}/learningActivity/resume`,
      );
    return db.runTransaction(async (tx) => {
      const receipt = db.doc(`users/${uid}/learningRequests/${data.requestId}`),
        seen = await tx.get(receipt);
      if (seen.exists) {
        if (seen.data()!.payload !== JSON.stringify(data))
          throw new HttpsError("already-exists", "Request ID already used.");
        return { saved: true };
      }
      const rate = db.doc(`users/${uid}/learningRate/current`),
        prev = await tx.get(rate),
        minute = Math.floor(Date.now() / 60000),
        count = prev.data()?.minute === minute ? prev.data()!.count : 0;
      if (count >= 60)
        throw new HttpsError(
          "resource-exhausted",
          "Too many learning updates.",
        );
      tx.set(ref, {
        ...(data.action === "status"
          ? {
              status: data.status,
              topicId: data.topicId,
              source: "SELF_REPORTED",
            }
          : { path: data.path }),
        changedDate: FieldValue.serverTimestamp(),
        schemaVersion: 1,
      });
      tx.set(rate, { minute, count: count + 1 });
      tx.create(receipt, {
        payload: JSON.stringify(data),
        createdDate: FieldValue.serverTimestamp(),
      });
      return { saved: true };
    });
  },
);
export const getLearningProgress = onCall(communityOptions, async (request) => {
  const uid = actor(request),
    db = getFirestore(),
    root = db.doc(`users/${uid}`);
  const [user, statuses, resume, drafts, saved] = await Promise.all([
    root.get(),
    root.collection("topicStatuses").limit(30).get(),
    root.collection("learningActivity").doc("resume").get(),
    root.collection("drafts").orderBy("changedDate", "desc").limit(10).get(),
    root.collection("bookmarks").where("starred", "==", true).limit(10).get(),
  ]);
  const result: ProgressSummary = {
    activePlan: user.data()?.activePlan ?? null,
    statuses: Object.fromEntries(
      statuses.docs.map((d) => [d.id, d.data().status as LearningStatus]),
    ),
    resume: resume.data()?.path ?? null,
    drafts: drafts.docs.map((d) => ({
      id: d.id,
      language: d.data().language,
      challengeRevision: d.data().challengeRevision,
    })),
    saved: saved.docs.map((d) => ({ id: d.id })),
  };
  return result;
});
