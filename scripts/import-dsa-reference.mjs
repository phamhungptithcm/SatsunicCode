import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const catalog = JSON.parse(
  readFileSync("content/reference/neetcode-catalog.json", "utf8"),
);
const provenance = JSON.parse(
  readFileSync("content/reference/provenance.json", "utf8"),
);
if (
  process.argv[2] !== "--production-authorized" ||
  catalog.length !== 450 ||
  new Set(catalog.map((p) => p.slug)).size !== 450
)
  throw Error("Explicit authorized production metadata import required");
const token = execFileSync("gcloud", ["auth", "print-access-token"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
}).trim();
const fields = (v) =>
  Object.fromEntries(
    Object.entries(v).map(([k, val]) => [
      k,
      typeof val === "boolean"
        ? { booleanValue: val }
        : typeof val === "number"
          ? { integerValue: String(val) }
          : { stringValue: String(val) },
    ]),
  );
// Metadata only; no authoring approval, fake users, solved state or test verdict.
const writes = catalog.map((p) => ({
  update: {
    name: `projects/satsuniccode/databases/(default)/documents/dsaReferences/${p.slug}`,
    fields: fields({
      ...p,
      sourceSha256: provenance.sourceSha256,
      license: "MIT",
      schemaVersion: 1,
    }),
  },
  currentDocument: { exists: false },
}));
const r = await fetch(
  "https://firestore.googleapis.com/v1/projects/satsuniccode/databases/(default)/documents:commit",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ writes }),
  },
);
if (!r.ok) throw Error(`Metadata import blocked: HTTP${r.status}`);
const body = await r.json();
console.log(
  JSON.stringify({
    projectId: "satsuniccode",
    metadataWrites: body.writeResults?.length,
    commitTime: body.commitTime,
    contentState: "REFERENCE_ONLY",
  }),
);
