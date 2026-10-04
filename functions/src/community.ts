import { z } from "zod";
import {
  validatedCompanyLogo,
  logoDigest,
  savePrivateLogo,
  deletePrivateLogo,
  readOwnedLogo,
  stageCompanyLogo,
  publishCompanyLogo,
} from "./company-logo";
import { createHash, randomUUID } from "node:crypto";
import {
  FieldValue,
  getFirestore,
  type Transaction,
} from "firebase-admin/firestore";
import {
  HttpsError,
  onCall,
  type CallableRequest,
} from "firebase-functions/https";
import {
  companyProfileInput,
  communityRequest,
  reviewInput,
  salaryInput,
  type Contribution,
  type PublicReview,
  type SalaryInput,
} from "../../packages/contracts/src/community";
import { publicReview, companyKey } from "../../packages/domain/src/community";
import {
  cohortKey,
  normalizeSalary,
  safeSnapshot,
  salaryStats,
} from "../../packages/domain/src/compensation";
const local = process.env.FUNCTIONS_EMULATOR === "true";
export const communityOptions = {
  region: "us-central1",
  enforceAppCheck: !local,
  maxInstances: 2,
};
export function actor(request: CallableRequest, moderator = false) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  if (
    (request.auth.token.firebase as { sign_in_provider?: string } | undefined)
      ?.sign_in_provider === "anonymous"
  )
    throw new HttpsError("permission-denied", "A learner account is required.");
  if (!local && process.env.COMMUNITY_PROGRESS_ENABLED !== "true")
    throw new HttpsError("unavailable", "This service is not activated.");
  if (moderator && request.auth.token.communityModerator !== true)
    throw new HttpsError("permission-denied", "Moderator access required.");
  return request.auth.uid;
}
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const collectionFor = (kind: string) =>
  kind === "review"
    ? "reviewSubmissions"
    : kind === "salary"
      ? "salarySubmissions"
      : kind === "report"
        ? "communityReports"
        : "companySuggestions";
const time = () => FieldValue.serverTimestamp();
function conflict() {
  throw new HttpsError(
    "aborted",
    "This item changed. Reload before trying again.",
  );
}
function fail(message: string): never {
  throw new HttpsError("failed-precondition", message);
}
type Writes = (() => void)[];
/** All Firestore reads precede queued writes, including cross-projection updates. */
async function aggregate(
  tx: Transaction,
  writes: Writes,
  key: string,
  changedId: string,
  replacement: Record<string, unknown> | null,
) {
  const db = getFirestore(),
    publicRef = db.doc(`salaryAggregates/${key}`),
    stateRef = db.doc(`salaryAggregateState/${key}`);
  const [rows, state] = await Promise.all([
    tx.get(
      db
        .collection("salarySubmissions")
        .where("cohort", "==", key)
        .where("status", "==", "PUBLISHED")
        .limit(251),
    ),
    tx.get(stateRef),
  ]);
  const values = rows.docs
    .filter((d) => d.id !== changedId)
    .map((d) => ({ id: d.id, ...d.data() }));
  if (replacement?.status === "PUBLISHED")
    values.push({ id: changedId, ...replacement });
  const approved = values as unknown as {
    id: string;
    ownerUid: string;
    input: SalaryInput;
    revision: number;
  }[];
  const members = Object.fromEntries(
    approved.map((r) => [r.ownerUid, hash(JSON.stringify(r.input))]),
  );
  const previous = state.data(),
    week = Math.floor(Date.now() / (7 * 86400000));
  const removedOrChanged =
    !!previous &&
    Object.entries(previous.members as Record<string, string>).some(
      ([uid, fingerprint]) => members[uid] !== fingerprint,
    );
  const stats = salaryStats(approved, week);
  if (values.length > 250 || !stats.available || removedOrChanged)
    writes.push(() => tx.delete(publicRef));
  if (
    values.length <= 250 &&
    stats.available &&
    safeSnapshot(previous?.members ?? {}, members, previous?.week, week)
  ) {
    writes.push(
      () => tx.set(publicRef, stats),
      () => tx.set(stateRef, { members, week, changedDate: time() }),
    );
  }
  // Keep last-published fingerprint even after suppression to resist differencing.
}
async function reviewAggregate(
  tx: Transaction,
  writes: Writes,
  old: Record<string, unknown> | undefined,
  next: Record<string, unknown> | null,
) {
  const input = (next?.input ?? old?.input) as
    { companyId: string } | undefined;
  if (!input) return;
  const ref = getFirestore().doc(`companyReviewStats/${input.companyId}`),
    snap = await tx.get(ref);
  const value = snap.data() ?? {
    employee: { count: 0, sum: 0, distribution: [0, 0, 0, 0, 0] },
    interview: { count: 0, sum: 0, distribution: [0, 0, 0, 0, 0] },
  };
  for (const [record, delta] of [
    [old, -1],
    [next, 1],
  ] as const) {
    if (record?.status !== "PUBLISHED") continue;
    const ri = record.input as { kind: string; rating: number };
    const k = ri.kind === "INTERVIEW" ? "interview" : "employee",
      v = value[k];
    v.count += delta;
    v.sum += delta * ri.rating;
    v.distribution[ri.rating - 1] += delta;
  }
  writes.push(() => tx.set(ref, value));
}
export async function runCommunity(request: CallableRequest) {
  const uid = actor(request),
    parsed = communityRequest.safeParse(request.data);
  if (!parsed.success)
    throw new HttpsError("invalid-argument", "Check the fields and try again.");
  const input = parsed.data;
  if (
    input.action === "saveReview" &&
    !input.draft &&
    !reviewInput.safeParse(input.input).success
  )
    throw new HttpsError(
      "invalid-argument",
      "Complete the review and acknowledge the policy before submitting.",
    );
  if (input.action === "moderate") actor(request, true);
  if (
    (input.action === "saveReview" || input.action === "saveSalary") &&
    input.input.year > new Date().getUTCFullYear()
  )
    throw new HttpsError(
      "invalid-argument",
      "Future reporting years are not allowed.",
    );
  const db = getFirestore(),
    receiptRef = db.doc(`users/${uid}/communityRequests/${input.requestId}`),
    limitRef = db.doc(`communityLimits/${uid}`),
    fingerprint = hash(JSON.stringify(input));
  if (input.action === "suggestCompany" && !local)
    fail("A complete company profile is required.");
  const prior = await receiptRef.get();
  if (prior.exists) {
    if (prior.data()!.fingerprint !== fingerprint)
      throw new HttpsError("already-exists", "Request ID already used.");
    const result = prior.data()!.result;
    if (result.logoPath) await publishCompanyLogo(result.logoPath);
    return result;
  }
  let digest: string | undefined, stagedPath: string | undefined;
  if (input.action === "suggestCompanyProfile")
    digest = logoDigest(await readOwnedLogo(uid, input.input.logoUploadId));
  if (
    input.action === "moderate" &&
    input.kind === "company" &&
    input.decision === "PUBLISHED"
  ) {
    const proposal = (
      await db.doc(`companySuggestions/${input.id}`).get()
    ).data();
    if (proposal?.input.logoUploadId) {
      if (proposal.revision !== input.revision) conflict();
      const profile = companyProfileInput.parse(proposal.input);
      stagedPath = await stageCompanyLogo(
        proposal.ownerUid,
        profile.logoUploadId,
        input.id,
        input.requestId,
        proposal.logoDigest,
      );
    }
  }
  const outcome = await db.runTransaction(async (tx) => {
    const [receipt, limit] = await Promise.all([
      tx.get(receiptRef),
      tx.get(limitRef),
    ]);
    if (receipt.exists) {
      if (receipt.data()!.fingerprint !== fingerprint)
        throw new HttpsError("already-exists", "Request ID already used.");
      return receipt.data()!.result;
    }
    const hour = Math.floor(Date.now() / 3600000),
      current = limit.data(),
      count = current?.hour === hour ? current.count : 0;
    if (count >= (input.action === "moderate" ? 120 : 30))
      throw new HttpsError(
        "resource-exhausted",
        "Too many changes. Try again later.",
      );
    const writes: Writes = [];
    let result: {
      id: string;
      revision?: number;
      status?: string;
      logoPath?: string;
    } = {
      id: input.requestId,
    };
    if (
      input.action === "suggestCompany" ||
      input.action === "suggestCompanyProfile"
    ) {
      const id = hash(companyKey(input.input.name, input.input.country)).slice(
          0,
          40,
        ),
        ref = db.doc(`companySuggestions/${id}`),
        company = db.doc(`companies/${id}`);
      const [suggestion, published] = await Promise.all([
        tx.get(ref),
        tx.get(company),
      ]);
      if (suggestion.exists || published.exists)
        throw new HttpsError(
          "already-exists",
          "This company is already listed or awaiting review.",
        );
      if (input.action === "suggestCompanyProfile") {
        const uploadRef = db.doc(
            `companyLogoUploads/${uid}_${input.input.logoUploadId}`,
          ),
          upload = await tx.get(uploadRef);
        if (
          upload.data()?.state !== "READY" ||
          upload.data()?.claimedCompanyId ||
          upload.data()?.digest !== digest
        )
          fail("Upload the company logo again.");
        writes.push(() => tx.update(uploadRef, { claimedCompanyId: id }));
      }
      writes.push(() =>
        tx.create(ref, {
          ownerUid: uid,
          input: input.input,
          ...(digest ? { logoDigest: digest } : {}),
          status: "PENDING_MODERATION",
          revision: 0,
          createdDate: time(),
          changedDate: time(),
          schemaVersion: 1,
        }),
      );
      result = { id, status: "PENDING_MODERATION", revision: 0 };
    } else if (input.action === "saveReview" || input.action === "saveSalary") {
      const salary = input.action === "saveSalary",
        kind = salary ? "salary" : "review";
      const naturalKey = salary
        ? cohortKey(input.input as SalaryInput)
        : `${input.input.companyId}_${(input.input as { kind: string }).kind}`;
      const id = input.id ?? hash(`${uid}:${kind}:${naturalKey}`).slice(0, 40),
        ref = db.doc(`${collectionFor(kind)}/${id}`),
        companyRef = db.doc(`companies/${input.input.companyId}`);
      const [existing, company] = await Promise.all([
        tx.get(ref),
        tx.get(companyRef),
      ]);
      if (company.data()?.publicationState !== "PUBLISHED")
        fail("Choose a published company first.");
      const old = existing.data();
      if (old && old.ownerUid !== uid)
        throw new HttpsError(
          "permission-denied",
          "You cannot edit this contribution.",
        );
      if (old && input.revision !== old.revision) conflict();
      if (!old && (input.revision !== undefined || input.id !== undefined))
        conflict();
      if (
        !salary &&
        old &&
        old.input.kind !== (input.input as { kind: string }).kind
      )
        fail(
          "The experience type cannot be changed. Create the other experience separately.",
        );
      if (old && old.input.companyId !== input.input.companyId)
        fail("A contribution cannot be moved to another company.");
      if (salary && old && old.cohort !== naturalKey)
        fail(
          "A contribution cannot be moved to another cohort. Withdraw and create a new contribution.",
        );
      const revision = old ? old.revision + 1 : 0,
        status =
          input.action === "saveReview" && input.draft
            ? "DRAFT"
            : "PENDING_MODERATION";
      const data = {
        ownerUid: uid,
        input: input.input,
        companyName: company.data()!.name,
        status,
        revision,
        reason: null,
        publicId: old?.publicId ?? randomUUID(),
        createdDate: old?.createdDate ?? time(),
        changedDate: time(),
        schemaVersion: 1,
        ...(salary
          ? {
              cohort: naturalKey,
              normalized: normalizeSalary(input.input as SalaryInput),
            }
          : {}),
      };
      if (!salary) await reviewAggregate(tx, writes, old, null);
      if (!salary && old?.publicId)
        writes.push(() => tx.delete(db.doc(`publicReviews/${old.publicId}`)));
      if (salary && old?.status === "PUBLISHED")
        await aggregate(tx, writes, naturalKey, id, null);
      writes.push(() => tx.set(ref, data));
      result = { id, revision, status };
    } else if (input.action === "withdraw" || input.action === "appeal") {
      const kind = input.action === "appeal" ? "review" : input.kind,
        ref = db.doc(`${collectionFor(kind)}/${input.id}`),
        snap = await tx.get(ref),
        old = snap.data();
      if (!old || old.ownerUid !== uid)
        throw new HttpsError(
          "permission-denied",
          "This contribution is not available.",
        );
      if (old.revision !== input.revision) conflict();
      if (
        input.action === "appeal" &&
        !["REJECTED", "CHANGES_REQUESTED"].includes(old.status)
      )
        fail("Only a moderation decision can be appealed.");
      const status = input.action === "withdraw" ? "REMOVED" : "APPEALED",
        revision = old.revision + 1;
      if (kind === "review") await reviewAggregate(tx, writes, old, null);
      if (kind === "review")
        writes.push(() => tx.delete(db.doc(`publicReviews/${old.publicId}`)));
      if (kind === "salary" && old.status === "PUBLISHED")
        await aggregate(tx, writes, old.cohort, input.id, null);
      writes.push(() =>
        tx.update(ref, {
          status,
          revision,
          changedDate: time(),
          ...(input.action === "appeal" ? { appeal: input.reason } : {}),
        }),
      );
      result = {
        id: input.id,
        revision,
        status,
        ...(stagedPath ? { logoPath: stagedPath } : {}),
      };
    } else if (input.action === "vote" || input.action === "report") {
      const pubRef = db.doc(`publicReviews/${input.id}`),
        mapRef = db.doc(`reviewPublicMappings/${input.id}`);
      const [pub, map] = await Promise.all([tx.get(pubRef), tx.get(mapRef)]);
      if (!pub.exists || !map.exists)
        fail("This review is no longer available.");
      const own = await tx.get(
        db.doc(`reviewSubmissions/${map.data()!.submissionId}`),
      );
      if (input.action === "vote" && own.data()?.ownerUid === uid)
        fail("You cannot vote for your own review.");
      const id = hash(`${input.id}:${uid}`),
        ref = db.doc(
          `${input.action === "vote" ? "communityVotes" : "communityReports"}/${id}`,
        ),
        existing = await tx.get(ref);
      if (!existing.exists) {
        if (input.action === "vote") {
          writes.push(
            () =>
              tx.create(ref, {
                ownerUid: uid,
                reviewId: input.id,
                createdDate: time(),
              }),
            () => tx.update(pubRef, { helpful: FieldValue.increment(1) }),
          );
        } else
          writes.push(() =>
            tx.create(ref, {
              ownerUid: uid,
              input: { reviewId: input.id, reason: input.reason },
              status: "PENDING_MODERATION",
              revision: 0,
              changedDate: time(),
            }),
          );
      }
      result = { id };
    } else if (input.action === "moderate") {
      const ref = db.doc(`${collectionFor(input.kind)}/${input.id}`),
        snap = await tx.get(ref),
        old = snap.data();
      if (!old) throw new HttpsError("not-found", "Contribution not found.");
      if (old.revision !== input.revision) conflict();
      if (!["PENDING_MODERATION", "APPEALED", "PUBLISHED"].includes(old.status))
        fail("This item is not awaiting a moderation decision.");
      const revision = old.revision + 1,
        status = input.decision;
      if (input.kind === "company") {
        if (status === "PUBLISHED")
          writes.push(() =>
            tx.set(db.doc(`companies/${input.id}`), {
              id: input.id,
              name: old.input.name,
              country: old.input.country,
              industry: old.input.industry,
              ...(old.input.logoUploadId
                ? {
                    logoPath: stagedPath,
                    headquarters: old.input.headquarters,
                    phone: old.input.phone,
                    ...(old.input.website
                      ? { website: old.input.website }
                      : {}),
                  }
                : {}),
              publicationState: "PUBLISHED",
              source: "COMMUNITY_SUGGESTION",
            }),
          );
        // Company removal is intentionally not a moderation shortcut: published dependencies remain intact.
        else if (old.status === "PUBLISHED")
          fail("Published company removal needs a separate impact review.");
      } else if (input.kind === "review") {
        await reviewAggregate(
          tx,
          writes,
          old,
          status === "PUBLISHED" ? { ...old, status } : null,
        );
        const publicRef = db.doc(`publicReviews/${old.publicId}`),
          votes = await tx.get(
            db
              .collection("communityVotes")
              .where("reviewId", "==", old.publicId)
              .limit(1001),
          );
        if (votes.size > 1000) fail("Review vote maintenance limit reached.");
        if (status === "PUBLISHED")
          writes.push(
            () =>
              tx.set(
                publicRef,
                publicReview(old.publicId, old.input, votes.size),
              ),
            () =>
              tx.set(db.doc(`reviewPublicMappings/${old.publicId}`), {
                submissionId: input.id,
              }),
          );
        else writes.push(() => tx.delete(publicRef));
      } else if (input.kind === "salary") {
        await aggregate(
          tx,
          writes,
          old.cohort,
          input.id,
          status === "PUBLISHED" ? { ...old, status, revision } : null,
        );
      } else {
        const reviewId = old.input.reviewId,
          map = await tx.get(db.doc(`reviewPublicMappings/${reviewId}`));
        if (status === "PUBLISHED" && map.exists) {
          const reviewRef = db.doc(
              `reviewSubmissions/${map.data()!.submissionId}`,
            ),
            review = await tx.get(reviewRef);
          if (review.exists && review.data()!.status === "PUBLISHED") {
            await reviewAggregate(tx, writes, review.data(), null);
            writes.push(
              () =>
                tx.update(reviewRef, {
                  status: "CHANGES_REQUESTED",
                  reason: input.reason,
                  revision: review.data()!.revision + 1,
                  changedDate: time(),
                }),
              () => tx.delete(db.doc(`publicReviews/${reviewId}`)),
            );
          }
        }
      }
      writes.push(() =>
        tx.update(ref, {
          status,
          revision,
          reason: input.reason,
          changedDate: time(),
        }),
      );
      result = {
        id: input.id,
        revision,
        status,
        ...(stagedPath ? { logoPath: stagedPath } : {}),
      };
    }
    for (const write of writes) write();
    tx.set(limitRef, { hour, count: count + 1 });
    tx.create(receiptRef, { fingerprint, result, createdDate: time() });
    tx.create(db.collection("communityAudit").doc(), {
      actorUid: uid,
      action: input.action,
      itemId: result.id,
      createdDate: time(),
      schemaVersion: 1,
    });
    return result;
  });
  if (outcome.logoPath) await publishCompanyLogo(outcome.logoPath);
  return outcome;
}
export const changeCommunity = onCall(communityOptions, runCommunity);
export const listCommunityContributions = onCall(
  communityOptions,
  async (request) => {
    const uid = actor(request),
      moderator = request.data?.moderation === true;
    if (moderator) actor(request, true);
    if (
      request.data &&
      Object.keys(request.data).some(
        (k) => !["moderation", "cursor"].includes(k),
      )
    )
      throw new HttpsError("invalid-argument", "Invalid query.");
    const cursor =
      typeof request.data?.cursor === "string" ? request.data.cursor : null;
    if (cursor && !/^[a-zA-Z0-9_-]{1,100}$/.test(cursor))
      throw new HttpsError("invalid-argument", "Invalid cursor.");
    const db = getFirestore(),
      results: Contribution[] = [];
    // Fixed per-kind cap and cursor; cursor applies to each kind without exposing ownership to guests.
    for (const kind of ["company", "review", "salary", "report"] as const) {
      let q = db
        .collection(collectionFor(kind))
        .where(
          moderator ? "status" : "ownerUid",
          moderator ? "in" : "==",
          moderator ? ["PENDING_MODERATION", "APPEALED"] : uid,
        )
        .orderBy("__name__")
        .limit(30);
      if (cursor) q = q.startAfter(cursor);
      const rows = await q.get();
      for (const r of rows.docs) {
        const v = r.data();
        const reported =
          moderator && kind === "report"
            ? await db.doc(`publicReviews/${v.input.reviewId}`).get()
            : null;
        results.push({
          ...(reported
            ? {
                reportedReview: reported.exists
                  ? ({ ...reported.data(), id: reported.id } as PublicReview)
                  : null,
              }
            : {}),
          id: r.id,
          kind,
          revision: v.revision,
          status: v.status,
          input: v.input,
          ...(kind === "company" && v.input.logoUploadId
            ? {
                logoUploadPath: `companyUploads/${v.ownerUid}/${v.input.logoUploadId}/logo.png`,
              }
            : {}),
          reason: v.reason ?? null,
          ...(v.companyName ? { companyName: v.companyName } : {}),
        });
      }
    }
    results.sort((a, b) => a.id.localeCompare(b.id));
    return {
      items: results.slice(0, 30),
      nextCursor: results.length >= 30 ? results[29]!.id : null,
    };
  },
);

/** Reads the caller's canonical contribution; private IDs are never accepted from another actor. */
export const getOwnCommunityContribution = onCall(
  communityOptions,
  async (request) => {
    const uid = actor(request),
      v = request.data;
    if (!v || !["review", "salary"].includes(v.kind))
      throw new HttpsError("invalid-argument", "Invalid contribution query.");
    let naturalKey: string;
    if (v.kind === "review") {
      if (
        typeof v.companyId !== "string" ||
        !/^[a-zA-Z0-9_-]{1,100}$/.test(v.companyId) ||
        !["EMPLOYEE", "INTERVIEW"].includes(v.experienceKind) ||
        Object.keys(v).some(
          (k) => !["kind", "companyId", "experienceKind"].includes(k),
        )
      )
        throw new HttpsError("invalid-argument", "Invalid review query.");
      naturalKey = `${v.companyId}_${v.experienceKind}`;
    } else {
      const parsed = salaryInput.safeParse(v.input);
      if (
        !parsed.success ||
        Object.keys(v).some((k) => !["kind", "input"].includes(k))
      )
        throw new HttpsError("invalid-argument", "Invalid compensation query.");
      naturalKey = cohortKey(parsed.data);
    }
    const id = hash(`${uid}:${v.kind}:${naturalKey}`).slice(0, 40),
      snap = await getFirestore()
        .doc(`${collectionFor(v.kind)}/${id}`)
        .get();
    if (!snap.exists) return { item: null };
    const r = snap.data()!;
    const item: Contribution = {
      id,
      kind: v.kind,
      revision: r.revision,
      status: r.status,
      input: r.input,
      reason: r.reason ?? null,
      companyName: r.companyName,
    };
    return { item };
  },
);

const uploadRequest = z
  .object({
    uploadId: z.string().uuid(),
    data: z
      .string()
      .max(2796204)
      .regex(/^[A-Za-z0-9+/]+={0,2}$/),
  })
  .strict();
export const uploadCompanyLogo = onCall(communityOptions, async (request) => {
  const uid = actor(request),
    parsed = uploadRequest.safeParse(request.data);
  if (!parsed.success)
    throw new HttpsError("invalid-argument", "Choose a PNG logo up to 2 MiB.");
  const { uploadId, data } = parsed.data,
    bytes = validatedCompanyLogo(Buffer.from(data, "base64")),
    digest = logoDigest(bytes),
    db = getFirestore(),
    ref = db.doc(`companyLogoUploads/${uid}_${uploadId}`),
    rate = db.doc(`companyLogoUploadRate/${uid}`);
  await db.runTransaction(async (tx) => {
    const [snap, limit] = await Promise.all([tx.get(ref), tx.get(rate)]);
    if (snap.exists) {
      if (snap.data()!.digest !== digest || snap.data()!.state === "DELETED")
        throw new HttpsError("already-exists", "Upload ID already used.");
      return;
    }
    const hour = Math.floor(Date.now() / 3600000),
      count = limit.data()?.hour === hour ? limit.data()!.count : 0;
    if (count >= 10)
      throw new HttpsError(
        "resource-exhausted",
        "Too many uploads. Try again later.",
      );
    tx.create(ref, {
      ownerUid: uid,
      digest,
      state: "PENDING",
      claimedCompanyId: null,
      createdDate: time(),
    });
    tx.set(rate, { hour, count: count + 1 });
  });
  await savePrivateLogo(uid, uploadId, bytes);
  const ready = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.data()?.state === "DELETED") return false;
    tx.update(ref, { state: "READY" });
    return true;
  });
  if (!ready) {
    await deletePrivateLogo(uid, uploadId);
    throw new HttpsError("cancelled", "Upload cancelled.");
  }
  return { uploadId };
});
export const discardCompanyLogo = onCall(communityOptions, async (request) => {
  const uid = actor(request),
    parsed = z
      .object({ uploadId: z.string().uuid() })
      .strict()
      .safeParse(request.data);
  if (!parsed.success)
    throw new HttpsError("invalid-argument", "Invalid upload.");
  const { uploadId } = parsed.data,
    db = getFirestore(),
    ref = db.doc(`companyLogoUploads/${uid}_${uploadId}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.data()?.claimedCompanyId)
      fail("Submitted logos must be retained for moderation.");
    tx.set(ref, { state: "DELETED" }, { merge: true });
  });
  await deletePrivateLogo(uid, uploadId);
  return { discarded: true };
});
