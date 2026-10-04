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
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import {
  ref as databaseRef,
  set as databaseSet,
  get as databaseGet,
} from "firebase/database";
import { ref as storageRef, uploadString, getBytes } from "firebase/storage";
let env: RulesTestEnvironment;
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-satsuniccode",
    firestore: {
      host: "127.0.0.1",
      port: Number(process.env.FIRESTORE_TEST_PORT ?? 8080),
      rules: readFileSync("firestore.rules", "utf8"),
    },
    database: {
      host: "127.0.0.1",
      port: Number(process.env.DATABASE_TEST_PORT ?? 9000),
      rules: readFileSync("database.rules.json", "utf8"),
    },
    storage: {
      host: "127.0.0.1",
      port: Number(process.env.STORAGE_TEST_PORT ?? 9199),
      rules: readFileSync("storage.rules", "utf8"),
    },
  });
  await env.clearFirestore();
});
afterAll(async () => {
  await env?.cleanup();
});
function draft(uid: string) {
  return {
    source: "let x = 1;",
    language: "javascript",
    challengeRevision: "peak-requests-v1",
    context: "learning",
    revision: 0,
    createdBy: uid,
    changedBy: uid,
    createdDate: serverTimestamp(),
    changedDate: serverTimestamp(),
    schemaVersion: 1,
  };
}
describe("Firestore privacy and transitions", () => {
  it("owner creates and reads draft; other user cannot read/list/write", async () => {
    const a = env.authenticatedContext("alice").firestore(),
      b = env.authenticatedContext("bob").firestore();
    const path = "users/alice/drafts/peak-requests-v1-javascript-learning";
    await assertSucceeds(setDoc(doc(a, path), draft("alice")));
    await assertSucceeds(getDoc(doc(a, path)));
    await assertFails(getDoc(doc(b, path)));
    await assertFails(getDocs(collection(b, "users/alice/drafts")));
    await assertFails(setDoc(doc(b, path), draft("bob")));
    await assertFails(
      getDoc(doc(env.unauthenticatedContext().firestore(), path)),
    );
  });
  it("rejects forged verdict/role, owner, oversized data and wrong context", async () => {
    const a = env.authenticatedContext("negative").firestore(),
      path = "users/negative/drafts/peak-requests-v1-javascript-learning";
    for (const mutation of [
      { verdict: "ACCEPTED" },
      { createdBy: "victim" },
      { source: "x".repeat(100001) },
      { context: "interview" },
    ])
      await assertFails(
        setDoc(doc(a, path), { ...draft("negative"), ...mutation }),
      );
    await assertFails(setDoc(doc(a, "users/negative"), { role: "admin" }));
    await assertFails(
      setDoc(doc(a, "users/negative/progress/arrays"), { status: "VERIFIED" }),
    );
  });
  it("requires monotonic revision and immutable creation fields", async () => {
    const a = env.authenticatedContext("revision").firestore(),
      r = doc(a, "users/revision/drafts/peak-requests-v1-javascript-learning");
    await assertSucceeds(setDoc(r, draft("revision")));
    await assertSucceeds(
      updateDoc(r, {
        source: "changed",
        revision: 1,
        changedDate: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(r, {
        source: "stale",
        revision: 1,
        changedDate: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(r, {
        createdBy: "other",
        revision: 2,
        changedDate: serverTimestamp(),
      }),
    );
  });
  it("published catalog readable but private tests and raw community denied", async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await setDoc(doc(c.firestore(), "catalog/public"), {
        publicationState: "PUBLISHED",
      });
      await setDoc(doc(c.firestore(), "catalog/draft"), {
        publicationState: "DRAFT",
      });
    });
    const publicDb = env.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(publicDb, "catalog/public")));
    await assertFails(getDoc(doc(publicDb, "catalog/draft")));
    for (const path of [
      "privateChallengeTests/test",
      "privateSalarySubmissions/raw",
      "assistantConversations/chat",
      "organizations/tenant",
    ])
      await assertFails(
        getDoc(doc(env.authenticatedContext("alice").firestore(), path)),
      );
  });
});
describe("unimplemented transport/artifacts deny default", () => {
  it("RTDB rejects direct room read and write", async () => {
    const d = env.authenticatedContext("alice").database();
    await assertFails(
      databaseSet(databaseRef(d, "rooms/other"), { code: "x" }),
    );
    await assertFails(databaseGet(databaseRef(d, "rooms/other")));
  });
  it("Storage rejects artifact upload/download", async () => {
    const s = env.authenticatedContext("alice").storage();
    await assertFails(uploadString(storageRef(s, "artifacts/other"), "x"));
    await assertFails(getBytes(storageRef(s, "artifacts/other")));
  });
});

describe("DSA metadata and bookmarks", () => {
  it("only reference-only metadata is public and clients cannot publish it", async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await setDoc(doc(c.firestore(), "dsaReferences/contains-duplicate"), {
        contentState: "REFERENCE_ONLY",
      });
      await setDoc(doc(c.firestore(), "dsaReferences/private-preview"), {
        contentState: "DRAFT",
      });
    });
    const guest = env.unauthenticatedContext().firestore();
    await assertSucceeds(
      getDoc(doc(guest, "dsaReferences/contains-duplicate")),
    );
    await assertFails(getDoc(doc(guest, "dsaReferences/private-preview")));
    await assertFails(
      setDoc(doc(guest, "dsaReferences/forged"), {
        contentState: "REFERENCE_ONLY",
      }),
    );
  });
  it("owner bookmark only, strict schema, valid catalog slug, no mastery forgery", async () => {
    const a = env.authenticatedContext("bookmark-alice").firestore(),
      b = env.authenticatedContext("bookmark-bob").firestore();
    const value = {
      problemSlug: "contains-duplicate",
      starred: true,
      changedBy: "bookmark-alice",
      changedDate: serverTimestamp(),
      schemaVersion: 1,
    };
    const ref = doc(a, "users/bookmark-alice/bookmarks/contains-duplicate");
    await assertSucceeds(setDoc(ref, value));
    await assertSucceeds(getDoc(ref));
    await assertFails(
      getDoc(doc(b, "users/bookmark-alice/bookmarks/contains-duplicate")),
    );
    await assertFails(setDoc(ref, { ...value, verified: true }));
    await assertFails(
      setDoc(doc(a, "users/bookmark-alice/bookmarks/missing"), {
        ...value,
        problemSlug: "missing",
      }),
    );
  });
});

describe("workspace authored draft and submission ownership", () => {
  it("allows duplicate-check draft only for its owner and exact revision key", async () => {
    const a = env.authenticatedContext("workspace-alice").firestore(),
      b = env.authenticatedContext("workspace-bob").firestore();
    const value = {
      ...draft("workspace-alice"),
      challengeRevision: "duplicate-check-v1",
    };
    const path =
      "users/workspace-alice/drafts/duplicate-check-v1-javascript-learning";
    await assertSucceeds(setDoc(doc(a, path), value));
    await assertSucceeds(getDoc(doc(a, path)));
    await assertFails(getDoc(doc(b, path)));
    await assertFails(
      setDoc(doc(a, "users/workspace-alice/drafts/wrong-id"), value),
    );
  });
  it("rejects client-created verdicts and cross-user submission history", async () => {
    const a = env.authenticatedContext("workspace-alice").firestore(),
      b = env.authenticatedContext("workspace-bob").firestore();
    await env.withSecurityRulesDisabled(async (c) => {
      await setDoc(
        doc(c.firestore(), "users/workspace-alice/submissions/fixture"),
        { verdict: "ACCEPTED", problemRevision: "duplicate-check-v1" },
      );
    });
    await assertSucceeds(
      getDoc(doc(a, "users/workspace-alice/submissions/fixture")),
    );
    await assertFails(
      getDoc(doc(b, "users/workspace-alice/submissions/fixture")),
    );
    await assertFails(
      setDoc(doc(a, "users/workspace-alice/submissions/forged"), {
        verdict: "ACCEPTED",
      }),
    );
  });
});
