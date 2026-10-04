import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const file = fileURLToPath(
  new URL("../docs/research/vietnam-company-directory.json", import.meta.url),
);
const bytes = readFileSync(file),
  manifest = JSON.parse(bytes),
  digest = createHash("sha256").update(bytes).digest("hex");
const args = process.argv.slice(2),
  apply = args.includes("--apply");
const project = args.find((x) => x.startsWith("--project="))?.slice(10);
const expected = args
  .find((x) => x.startsWith("--manifest-sha256="))
  ?.slice(18);
if (!["demo-satsuniccode", "satsuniccode"].includes(project))
  throw new Error("Explicit approved project required");
if (apply && expected !== digest)
  throw new Error("Apply requires the exact reviewed manifest SHA256");
if (project === "satsuniccode" && process.env.FIRESTORE_EMULATOR_HOST)
  throw new Error("Production must not use an emulator host");
const domains = new Set([
  "fptsoftware.com",
  "cmcglobal.com.vn",
  "bctn2024.vng.com.vn",
  "www.misa.vn",
  "www.tmasolutions.com",
  "rikkeisoft.com",
  "kms-technology.com",
  "www.nashtechglobal.com",
  "solutions.viettel.vn",
  "vnptit.vn",
  "momo.careers",
]);
if (manifest.companies.length !== 11 || manifest.researchedAt !== "2026-10-04")
  throw new Error("Reviewed manifest shape mismatch");
const rows = manifest.companies.map((row) => {
  const { name, country, industry, sourceUrl } = row;
  if (
    Object.keys(row).sort().join(",") !== "country,industry,name,sourceUrl" ||
    country !== "VN" ||
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 100 ||
    typeof industry !== "string" ||
    !industry.trim() ||
    industry.length > 100
  )
    throw new Error("Invalid public company metadata");
  const source = new URL(sourceUrl);
  if (
    source.protocol !== "https:" ||
    source.username ||
    source.password ||
    !domains.has(source.hostname)
  )
    throw new Error("Unapproved first-party source");
  const key = `${country}-${name.normalize("NFKC").toLocaleLowerCase("en").replace(/\s+/g, " ").trim()}`;
  const id = createHash("sha256").update(key).digest("hex").slice(0, 40);
  return {
    id,
    name,
    country,
    industry,
    sourceUrl,
    source: "OFFICIAL_DIRECTORY",
    publicationState: "PUBLISHED",
    researchedAt: manifest.researchedAt,
  };
});
if (new Set(rows.map((x) => x.id)).size !== 11)
  throw new Error("Duplicate companies in manifest");
async function run() {
  let client;
  const prefix = `projects/${project}/databases/(default)/documents`;
  if (project === "demo-satsuniccode") {
    if (process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080")
      throw new Error("Local import requires explicit localhost emulator");
    client = {
      post: async (path, body) => {
        const response = await fetch("http://127.0.0.1:8080/v1" + path, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "Bearer owner",
          },
          body: JSON.stringify(body),
        });
        if (!response.ok)
          throw Object.assign(new Error("Emulator import failed"), {
            status: response.status,
          });
        return { body: await response.json() };
      },
    };
  } else {
    const root = "firebase-tools/lib/";
    const options = { project, nonInteractive: true };
    const auth = require(root + "auth");
    const account = auth.getGlobalDefaultAccount();
    if (account) auth.setActiveAccount(options, account);
    await require(root + "requireAuth").requireAuth(options);
    const { Client } = require(root + "apiv2");
    client = new Client({
      urlPrefix: "https://firestore.googleapis.com",
      apiVersion: "v1",
      auth: true,
    });
  }
  // Bounded public metadata reads only. Existing company documents are never overwritten.
  const existing = await client.post("/" + prefix + ":batchGet", {
    documents: rows.map((x) => `${prefix}/companies/${x.id}`),
  });
  const responses = Array.isArray(existing.body)
    ? existing.body
    : typeof existing.body === "string"
      ? JSON.parse(existing.body)
      : [existing.body];
  const present = new Map(
    responses
      .filter((x) => x.found)
      .map((x) => [x.found.name.split("/").at(-1), x.found]),
  );
  const pending = rows.filter((x) => !present.has(x.id));
  for (const row of rows) {
    const old = present.get(row.id);
    if (!old) continue;
    for (const [key, value] of Object.entries(row)) {
      if (old.fields?.[key]?.stringValue !== value)
        throw new Error("Existing company collision; no records changed");
    }
  }
  const receipt = {
    checkedAt: new Date().toISOString(),
    projectId: project,
    manifestSha256: digest,
    mode: apply ? "apply" : "dry-run",
    existingCount: present.size,
    createCount: pending.length,
    companies: rows.map(({ id, name, sourceUrl }) => ({ id, name, sourceUrl })),
    mutationsPerformed: false,
  };
  if (apply && pending.length) {
    await client.post("/" + prefix + ":commit", {
      writes: pending.map((row) => ({
        update: {
          name: `${prefix}/companies/${row.id}`,
          fields: Object.fromEntries(
            Object.entries(row).map(([k, v]) => [k, { stringValue: v }]),
          ),
        },
        currentDocument: { exists: false },
        updateTransforms: [
          { fieldPath: "createdDate", setToServerValue: "REQUEST_TIME" },
          { fieldPath: "changedDate", setToServerValue: "REQUEST_TIME" },
        ],
      })),
    });
    receipt.mutationsPerformed = true;
  }
  const out = args.find((x) => x.startsWith("--receipt="))?.slice(10);
  if (out) writeFileSync(out, JSON.stringify(receipt, null, 2) + "\n");
  console.log(
    JSON.stringify({
      projectId: project,
      mode: receipt.mode,
      manifestSha256: digest,
      existingCount: receipt.existingCount,
      createCount: receipt.createCount,
      mutationsPerformed: receipt.mutationsPerformed,
    }),
  );
}
run().catch((e) => {
  console.error(
    "Company directory import stopped:",
    e.status ?? "validation-or-precondition",
    e.message?.startsWith("Existing company")
      ? e.message
      : "No overwrite or fallback attempted.",
  );
  process.exitCode = 1;
});
