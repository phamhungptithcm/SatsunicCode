import { createHash } from "node:crypto";
import { inflateSync, deflateSync } from "node:zlib";
import { getStorage } from "firebase-admin/storage";
import { HttpsError } from "firebase-functions/https";
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
function crc(bytes: Buffer) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let i = 0; i < 8; i++)
      value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}
/** Bounded decoded PNG validation; strip all ancillary metadata before publication. */
export function validatedCompanyLogo(bytes: Buffer) {
  const invalid = () => {
    throw new HttpsError(
      "invalid-argument",
      "Use a valid PNG logo up to 2 MiB and 1024 pixels.",
    );
  };
  if (bytes.length > 2 * 1024 * 1024 || !bytes.subarray(0, 8).equals(signature))
    return invalid();
  const kept: Buffer[] = [],
    data: Buffer[] = [];
  let offset = 8,
    width = 0,
    height = 0,
    channels = 0,
    ended = false,
    hadData = false,
    closedData = false;
  while (offset + 12 <= bytes.length) {
    const size = bytes.readUInt32BE(offset),
      end = offset + 12 + size;
    if (end > bytes.length) return invalid();
    const type = bytes.toString("ascii", offset + 4, offset + 8),
      payload = bytes.subarray(offset + 8, offset + 8 + size);
    if (
      crc(bytes.subarray(offset + 4, offset + 8 + size)) !==
      bytes.readUInt32BE(offset + 8 + size)
    )
      return invalid();
    if (type === "IHDR") {
      if (offset !== 8 || size !== 13) return invalid();
      width = payload.readUInt32BE(0);
      height = payload.readUInt32BE(4);
      channels = payload[9] === 6 ? 4 : payload[9] === 2 ? 3 : 0;
      if (
        !width ||
        !height ||
        width > 1024 ||
        height > 1024 ||
        payload[8] !== 8 ||
        !channels ||
        payload[10] !== 0 ||
        payload[11] !== 0 ||
        payload[12] !== 0
      )
        return invalid();
      kept.push(bytes.subarray(offset, end));
    } else if (type === "IDAT") {
      if (!width || closedData) return invalid();
      hadData = true;
      data.push(payload);
      kept.push(bytes.subarray(offset, end));
    } else if (type === "IEND") {
      if (size !== 0 || !hadData || end !== bytes.length) return invalid();
      ended = true;
      kept.push(bytes.subarray(offset, end));
      break;
    } else {
      if (!width || !(bytes[offset + 4]! & 32)) return invalid();
      if (hadData) closedData = true;
    }
    offset = end;
  }
  if (!ended) return invalid();
  const row = width * channels + 1,
    expected = row * height;
  let decoded: Buffer;
  try {
    decoded = inflateSync(Buffer.concat(data), { maxOutputLength: expected });
  } catch {
    return invalid();
  }
  if (decoded.length !== expected) return invalid();
  for (let at = 0; at < decoded.length; at += row)
    if (decoded[at]! > 4) return invalid();
  const compressed = deflateSync(decoded),
    idat = Buffer.alloc(compressed.length + 12);
  idat.writeUInt32BE(compressed.length);
  idat.write("IDAT", 4);
  compressed.copy(idat, 8);
  idat.writeUInt32BE(crc(idat.subarray(4, idat.length - 4)), idat.length - 4);
  return Buffer.concat([signature, kept[0]!, idat, kept[kept.length - 1]!]);
}
function bucket() {
  return getStorage().bucket(
    process.env.FUNCTIONS_EMULATOR === "true"
      ? "demo-satsuniccode.appspot.com"
      : undefined,
  );
}
export async function readOwnedLogo(uid: string, uploadId: string) {
  try {
    const file = bucket().file(`companyUploads/${uid}/${uploadId}/logo.png`),
      [metadata] = await file.getMetadata();
    if (
      Number(metadata.size) > 2 * 1024 * 1024 ||
      metadata.contentType !== "image/png"
    )
      throw new Error("Invalid metadata");
    const [bytes] = await file.download({ validation: "crc32c" });
    return validatedCompanyLogo(bytes);
  } catch (e) {
    if (e instanceof HttpsError) throw e;
    throw new HttpsError(
      "failed-precondition",
      "The private logo could not be validated. Upload it again.",
    );
  }
}
export const logoDigest = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");
export async function savePrivateLogo(
  uid: string,
  uploadId: string,
  bytes: Buffer,
) {
  const file = bucket().file(`companyUploads/${uid}/${uploadId}/logo.png`);
  try {
    await file.save(bytes, {
      contentType: "image/png",
      resumable: false,
      preconditionOpts: { ifGenerationMatch: 0 },
      metadata: { cacheControl: "private,no-store" },
    });
  } catch (e) {
    if (![409, 412].includes(Number((e as { code?: number }).code))) throw e;
    const [existing] = await file.download();
    if (logoDigest(existing) !== logoDigest(bytes))
      throw new HttpsError("already-exists", "Upload ID already used.");
  }
}
export async function deletePrivateLogo(uid: string, uploadId: string) {
  await bucket()
    .file(`companyUploads/${uid}/${uploadId}/logo.png`)
    .delete({ ignoreNotFound: true });
}
export async function stageCompanyLogo(
  uid: string,
  uploadId: string,
  companyId: string,
  publicationId: string,
  digest: string,
) {
  const bytes = await readOwnedLogo(uid, uploadId);
  if (logoDigest(bytes) !== digest)
    throw new HttpsError(
      "failed-precondition",
      "Logo changed. Submit a new profile.",
    );
  const path = `companyLogos/${companyId}/${publicationId}/logo.png`,
    file = bucket().file(path);
  try {
    await file.save(bytes, {
      contentType: "image/png",
      resumable: false,
      preconditionOpts: { ifGenerationMatch: 0 },
      metadata: {
        metadata: { published: "false" },
        cacheControl: "public,max-age=3600",
      },
    });
  } catch (e) {
    if (![409, 412].includes(Number((e as { code?: number }).code))) throw e;
    const [existing] = await file.download();
    if (logoDigest(existing) !== digest)
      throw new HttpsError("already-exists", "Publication ID already used.");
  }
  return path;
}
export async function publishCompanyLogo(path: string) {
  await bucket()
    .file(path)
    .setMetadata({ metadata: { published: "true" } });
}
