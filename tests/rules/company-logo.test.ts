import { beforeAll, afterAll, it } from "vitest";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import { ref, uploadBytes, getBytes, deleteObject } from "firebase/storage";
let env: RulesTestEnvironment;
const id = "cf2de531-cd17-4bf0-8297-6ddf82e0e62d",
  privatePath = `companyUploads/owner/${id}/logo.png`,
  publicPath = `companyLogos/${"a".repeat(40)}/${id}/logo.png`;
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-logo-rules",
    storage: {
      host: "127.0.0.1",
      port: 9199,
      rules: readFileSync("storage.rules", "utf8"),
    },
  });
  await env.withSecurityRulesDisabled(async (c) => {
    await uploadBytes(ref(c.storage(), privatePath), new Uint8Array([1]), {
      contentType: "image/png",
    });
    await uploadBytes(ref(c.storage(), publicPath), new Uint8Array([1]), {
      customMetadata: { published: "false" },
    });
  });
});
afterAll(async () => {
  await env?.cleanup();
});
it("denies all direct client media writes, other-user and anonymous private reads", async () => {
  const owner = env
      .authenticatedContext("owner", {
        firebase: { sign_in_provider: "password" },
      })
      .storage(),
    other = env
      .authenticatedContext("other", {
        firebase: { sign_in_provider: "password" },
      })
      .storage(),
    anon = env.unauthenticatedContext().storage();
  await assertSucceeds(getBytes(ref(owner, privatePath)));
  await assertFails(getBytes(ref(other, privatePath)));
  await assertFails(getBytes(ref(anon, privatePath)));
  await assertFails(
    uploadBytes(
      ref(owner, `companyUploads/owner/${crypto.randomUUID()}/logo.png`),
      new Uint8Array([1]),
    ),
  );
  await assertFails(deleteObject(ref(owner, privatePath)));
  await assertFails(getBytes(ref(anon, publicPath)));
});
it("permits trusted moderator preview and only post-commit published public media", async () => {
  await assertSucceeds(
    getBytes(
      ref(
        env
          .authenticatedContext("mod", {
            communityModerator: true,
            firebase: { sign_in_provider: "password" },
          })
          .storage(),
        privatePath,
      ),
    ),
  );
  await env.withSecurityRulesDisabled(async (c) => {
    await uploadBytes(ref(c.storage(), publicPath), new Uint8Array([1]), {
      customMetadata: { published: "true" },
    });
  });
  await assertSucceeds(
    getBytes(ref(env.unauthenticatedContext().storage(), publicPath)),
  );
});
