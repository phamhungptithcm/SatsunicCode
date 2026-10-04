import { beforeAll, describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import {
  initializeApp as initAdmin,
  getApps as adminApps,
} from "firebase-admin/app";
import { getAuth as adminAuth } from "firebase-admin/auth";
import { getFirestore as adminDb } from "firebase-admin/firestore";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getIdToken,
} from "firebase/auth";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
import {
  salaryInput,
  reviewInput,
} from "../../packages/contracts/src/community";
if (
  process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080" ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9099"
)
  throw new Error(
    "Integration tests require explicit localhost emulator hosts",
  );
const project = "demo-satsuniccode",
  admin =
    adminApps().find((a) => a.name === "community-test") ??
    initAdmin({ projectId: project }, "community-test"),
  db = adminDb(admin),
  prefix = `community-${Date.now()}`;
async function client(name: string, moderator = false) {
  const app = initializeApp(
      { projectId: project, apiKey: "demo-not-a-secret" },
      `${prefix}-${name}`,
    ),
    auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  const { user } = await createUserWithEmailAndPassword(
    auth,
    `${prefix}-${name}@example.test`,
    "test-emulator-only-123",
  );
  if (moderator) {
    await adminAuth(admin).setCustomUserClaims(user.uid, {
      communityModerator: true,
    });
    await getIdToken(user, true);
  }
  const f = getFunctions(app, "us-central1");
  connectFunctionsEmulator(f, "127.0.0.1", 5001);
  return {
    uid: user.uid,
    change: async (d: Record<string, unknown>) =>
      (
        await httpsCallable<Record<string, unknown>, any>(
          f,
          "changeCommunity",
        )({ requestId: crypto.randomUUID(), ...d })
      ).data,
    list: async (moderation = false) =>
      (
        await httpsCallable<any, any>(
          f,
          "listCommunityContributions",
        )({ moderation })
      ).data,
    progress: async (d: Record<string, unknown>) =>
      (
        await httpsCallable(
          f,
          "changeLearningProgress",
        )({ requestId: crypto.randomUUID(), ...d })
      ).data,
    summary: async () =>
      (await httpsCallable<any, any>(f, "getLearningProgress")({})).data,
  };
}
let owner: Awaited<ReturnType<typeof client>>,
  other: Awaited<ReturnType<typeof client>>,
  mod: Awaited<ReturnType<typeof client>>,
  companyId: string;
beforeAll(async () => {
  owner = await client("owner");
  other = await client("other");
  mod = await client("mod", true);
  const c = await owner.change({
    action: "suggestCompany",
    input: { name: prefix, country: "VN", industry: "Test fixture" },
  });
  companyId = c.id;
  await mod.change({
    action: "moderate",
    kind: "company",
    id: c.id,
    revision: 0,
    decision: "PUBLISHED",
    reason: "Synthetic emulator fixture only",
  });
}, 30000);
const review = () =>
  reviewInput.parse({
    companyId,
    kind: "EMPLOYEE",
    employment: "CURRENT",
    role: "Engineering",
    year: 2026,
    rating: 4,
    cultureRating: 4,
    growthRating: 3,
    headline: "Useful test review",
    pros: "Team shares useful knowledge",
    cons: "Planning could be clearer",
    acknowledged: true,
  });
const salary = () =>
  salaryInput.parse({
    companyId,
    country: "VN",
    role: "SOFTWARE_ENGINEER",
    level: "MID",
    experience: "3_5",
    employmentType: "FULL_TIME",
    currency: "VND",
    basis: "GROSS",
    year: 2026,
    base: 30e6,
    period: "MONTH",
    payPeriods: 12,
    bonus: 0,
    bonusKind: "ACTUAL",
    equity: 0,
    equityKind: "ANNUAL_VESTED",
    signOn: null,
    acknowledged: true,
  });
describe("real emulator callable lifecycle", () => {
  it("draft/pending/privacy, actor checks, replay, publish, vote, edit, appeal and withdraw", async () => {
    const rid = crypto.randomUUID(),
      request = {
        action: "saveReview",
        input: {
          ...review(),
          headline: "",
          pros: "",
          cons: "",
          acknowledged: false,
        },
        draft: true,
        requestId: rid,
      };
    const draft = await owner.change(request);
    await expect(
      owner.change({
        ...request,
        requestId: crypto.randomUUID(),
        draft: false,
      }),
    ).rejects.toThrow();
    await expect(
      mod.change({
        action: "moderate",
        kind: "review",
        id: draft.id,
        revision: 0,
        decision: "PUBLISHED",
        reason: "Cannot publish an unfinished draft",
      }),
    ).rejects.toThrow();
    expect(await owner.change(request)).toEqual(draft);
    await expect(
      owner.change({ ...request, input: { ...review(), rating: 5 } }),
    ).rejects.toThrow();
    const ref = db.doc(`reviewSubmissions/${draft.id}`),
      raw = (await ref.get()).data()!;
    expect((await db.doc(`publicReviews/${raw.publicId}`).get()).exists).toBe(
      false,
    );
    await expect(
      other.change({
        action: "saveReview",
        id: draft.id,
        revision: 0,
        input: review(),
        draft: false,
      }),
    ).rejects.toThrow();
    await expect(
      owner.change({
        action: "moderate",
        kind: "review",
        id: draft.id,
        revision: 0,
        decision: "PUBLISHED",
        reason: "Fake moderator attempt",
      }),
    ).rejects.toThrow();
    const pending = await owner.change({
      action: "saveReview",
      id: draft.id,
      revision: 0,
      input: review(),
      draft: false,
    });
    await mod.change({
      action: "moderate",
      kind: "review",
      id: draft.id,
      revision: pending.revision,
      decision: "PUBLISHED",
      reason: "Content meets policy",
    });
    const pub = (await db.doc(`publicReviews/${raw.publicId}`).get()).data()!;
    expect(pub.ownerUid).toBeUndefined();
    expect(pub.createdBy).toBeUndefined();
    expect(pub.email).toBeUndefined();
    expect(pub.id).not.toBe(draft.id);
    expect(
      (await db.doc(`companyReviewStats/${companyId}`).get()).data()!.employee
        .count,
    ).toBe(1);
    await expect(
      owner.change({ action: "vote", id: raw.publicId }),
    ).rejects.toThrow();
    await other.change({ action: "vote", id: raw.publicId });
    await other.change({ action: "vote", id: raw.publicId });
    expect(
      (await db.doc(`publicReviews/${raw.publicId}`).get()).data()!.helpful,
    ).toBe(1);
    await expect(
      owner.change({
        action: "saveReview",
        id: draft.id,
        revision: pending.revision,
        input: review(),
        draft: false,
      }),
    ).rejects.toThrow();
    const edited = await owner.change({
      action: "saveReview",
      id: draft.id,
      revision: pending.revision + 1,
      input: { ...review(), headline: "Updated test review" },
      draft: false,
    });
    expect((await db.doc(`publicReviews/${raw.publicId}`).get()).exists).toBe(
      false,
    );
    expect(
      (await db.doc(`companyReviewStats/${companyId}`).get()).data()!.employee
        .count,
    ).toBe(0);
    const reject = await mod.change({
      action: "moderate",
      kind: "review",
      id: draft.id,
      revision: edited.revision,
      decision: "CHANGES_REQUESTED",
      reason: "Clarify the experience",
    });
    const appeal = await owner.change({
      action: "appeal",
      id: draft.id,
      revision: reject.revision,
      reason: "Please recheck the experience context",
    });
    await mod.change({
      action: "moderate",
      kind: "review",
      id: draft.id,
      revision: appeal.revision,
      decision: "PUBLISHED",
      reason: "Clarification accepted",
    });
    await other.change({
      action: "report",
      id: raw.publicId,
      reason: "Check this review against the community policy",
    });
    const reportId = createHash("sha256")
      .update(`${raw.publicId}:${other.uid}`)
      .digest("hex");
    const withdrawn = await owner.change({
      action: "withdraw",
      kind: "review",
      id: draft.id,
      revision: appeal.revision + 1,
    });
    expect(withdrawn.status).toBe("REMOVED");
    await mod.change({
      action: "moderate",
      kind: "report",
      id: reportId,
      revision: 0,
      decision: "PUBLISHED",
      reason: "Report upheld after withdrawal",
    });
    expect((await ref.get()).data()!.status).toBe("REMOVED");
    expect((await db.doc(`publicReviews/${raw.publicId}`).get()).exists).toBe(
      false,
    );
  }, 30000);
  it("concurrent withdrawal/moderation has one winner and consistent public projection", async () => {
    const r = await other.change({
      action: "saveReview",
      input: review(),
      draft: false,
    });
    const outcomes = await Promise.allSettled([
      other.change({
        action: "withdraw",
        kind: "review",
        id: r.id,
        revision: 0,
      }),
      mod.change({
        action: "moderate",
        kind: "review",
        id: r.id,
        revision: 0,
        decision: "PUBLISHED",
        reason: "Concurrent moderation fixture",
      }),
    ]);
    expect(outcomes.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    const raw = (await db.doc(`reviewSubmissions/${r.id}`).get()).data()!;
    expect((await db.doc(`publicReviews/${raw.publicId}`).get()).exists).toBe(
      raw.status === "PUBLISHED",
    );
    expect(
      (await db.doc(`companyReviewStats/${companyId}`).get()).data()!.employee
        .count,
    ).toBe(raw.status === "PUBLISHED" ? 1 : 0);
  });
  it("salary threshold, actor separation, revise/withdraw and inference suppression", async () => {
    const contributors = [];
    let cohort = "";
    for (let i = 0; i < 10; i++) {
      const c = await client(`salary-${i}`);
      const s = await c.change({ action: "saveSalary", input: salary() });
      const raw = (await db.doc(`salarySubmissions/${s.id}`).get()).data()!;
      cohort = raw.cohort;
      await mod.change({
        action: "moderate",
        kind: "salary",
        id: s.id,
        revision: 0,
        decision: "PUBLISHED",
        reason: "Synthetic compensation verified for testing",
      });
      contributors.push({ c, s });
      if (i === 8)
        expect((await db.doc(`salaryAggregates/${cohort}`).get()).exists).toBe(
          false,
        );
    }
    const stat = (await db.doc(`salaryAggregates/${cohort}`).get()).data()!;
    expect(stat.baseMedian).toBe(360e6);
    expect(stat.countBand).toBe("10–19");
    expect(JSON.stringify(stat)).not.toContain("ownerUid");
    const { c, s } = contributors[0]!;
    await expect(
      other.change({
        action: "withdraw",
        kind: "salary",
        id: s.id,
        revision: 1,
      }),
    ).rejects.toThrow();
    await c.change({
      action: "withdraw",
      kind: "salary",
      id: s.id,
      revision: 1,
    });
    expect((await db.doc(`salaryAggregates/${cohort}`).get()).exists).toBe(
      false,
    );
    const last = contributors[1]!;
    const edited = await last.c.change({
      action: "saveSalary",
      id: last.s.id,
      revision: 1,
      input: { ...salary(), base: 35e6 },
    });
    await mod.change({
      action: "moderate",
      kind: "salary",
      id: last.s.id,
      revision: edited.revision,
      decision: "PUBLISHED",
      reason: "Revised fixture checked",
    });
    expect((await db.doc(`salaryAggregates/${cohort}`).get()).exists).toBe(
      false,
    );
  }, 60000);
  it("progress persists, owner state isolated, forged verdict and invalid paths refused", async () => {
    await owner.progress({
      action: "status",
      topicId: "arrays-hashing",
      status: "REVIEWED",
    });
    await owner.progress({ action: "activity", path: "/learn/request-window" });
    expect(await owner.summary()).toMatchObject({
      statuses: { "arrays-hashing": "REVIEWED" },
      resume: "/learn/request-window",
    });
    expect((await other.summary()).statuses).toEqual({});
    await expect(
      owner.progress({
        action: "status",
        topicId: "arrays-hashing",
        status: "VERIFIED",
      }),
    ).rejects.toThrow();
    await expect(
      owner.progress({ action: "activity", path: "https://external.test" }),
    ).rejects.toThrow();
    await owner.progress({
      action: "status",
      topicId: "arrays-hashing",
      status: "NOT_STARTED",
    });
    expect((await owner.summary()).statuses["arrays-hashing"]).toBe(
      "NOT_STARTED",
    );
  });
});
