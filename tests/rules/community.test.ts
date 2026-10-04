import { beforeAll, afterAll, describe, it } from "vitest";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  limit,
} from "firebase/firestore";
let env: RulesTestEnvironment;
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-community-rules",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, "companies/public"), {
      publicationState: "PUBLISHED",
      name: "Fixture",
    });
    await setDoc(doc(db, "companies/pending"), {
      publicationState: "PENDING_MODERATION",
    });
    await setDoc(doc(db, "publicReviews/public"), { rating: 4 });
    await setDoc(doc(db, "salaryAggregates/cohort"), {
      available: true,
      baseMedian: 100,
    });
    await setDoc(doc(db, "users/alice/topicStatuses/arrays"), {
      status: "LEARNING",
    });
    await setDoc(doc(db, "users/alice/learningActivity/resume"), {
      path: "/learn/request-window",
    });
    for (const p of [
      "reviewSubmissions/private",
      "salarySubmissions/private",
      "reviewPublicMappings/public",
      "salaryAggregateState/cohort",
      "communityAudit/private",
      "communityReports/private",
      "communityVotes/private",
    ]) {
      await setDoc(doc(db, p), { ownerUid: "alice" });
    }
  });
});
afterAll(async () => {
  await env?.cleanup();
});
describe("community projection privacy", () => {
  it("public projections only; company lists constrained to published and capped", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, "companies/public")));
    await assertFails(getDoc(doc(db, "companies/pending")));
    await assertSucceeds(
      getDocs(
        query(
          collection(db, "companies"),
          where("publicationState", "==", "PUBLISHED"),
          limit(30),
        ),
      ),
    );
    await assertFails(getDocs(collection(db, "companies")));
    await assertFails(
      getDocs(
        query(
          collection(db, "companies"),
          where("publicationState", "==", "PUBLISHED"),
          limit(51),
        ),
      ),
    );
    await assertSucceeds(getDoc(doc(db, "publicReviews/public")));
    await assertFails(getDocs(collection(db, "publicReviews")));
    await assertSucceeds(
      getDocs(query(collection(db, "publicReviews"), limit(20))),
    );
    await assertSucceeds(getDoc(doc(db, "salaryAggregates/cohort")));
    await assertFails(
      getDocs(query(collection(db, "salaryAggregates"), limit(20))),
    );
  });
  it("raw submissions/mappings/audit stay API-only even for owner and moderator SDK", async () => {
    for (const c of [
      env.unauthenticatedContext(),
      env.authenticatedContext("alice"),
      env.authenticatedContext("moderator", { communityModerator: true }),
    ]) {
      const db = c.firestore();
      for (const group of [
        "reviewSubmissions",
        "salarySubmissions",
        "reviewPublicMappings",
        "salaryAggregateState",
        "communityAudit",
        "communityReports",
        "communityVotes",
      ]) {
        await assertFails(
          getDoc(
            doc(
              db,
              `${group}/${group === "reviewPublicMappings" ? "public" : group === "salaryAggregateState" ? "cohort" : "private"}`,
            ),
          ),
        );
        await assertFails(getDocs(query(collection(db, group), limit(20))));
      }
    }
  });
  it("self-reported statuses owner-only and server writes, graded writes still denied", async () => {
    const a = env.authenticatedContext("alice").firestore(),
      b = env.authenticatedContext("bob").firestore();
    await assertSucceeds(getDoc(doc(a, "users/alice/topicStatuses/arrays")));
    await assertFails(getDoc(doc(b, "users/alice/topicStatuses/arrays")));
    await assertFails(
      setDoc(doc(a, "users/alice/topicStatuses/arrays"), {
        status: "VERIFIED",
      }),
    );
    await assertFails(
      setDoc(doc(a, "users/alice/progress/arrays"), { status: "VERIFIED" }),
    );
    await assertFails(setDoc(doc(a, "publicReviews/forged"), { rating: 5 }));
    await assertFails(
      setDoc(doc(a, "salaryAggregates/forged"), { available: true }),
    );
    await assertFails(
      setDoc(doc(a, "users/alice"), { communityModerator: true }),
    );
  });
});
