import { deflateSync } from "node:zlib";
export function crc(b: Buffer) {
  let v = 0xffffffff;
  for (const x of b) {
    v ^= x;
    for (let i = 0; i < 8; i++) v = (v >>> 1) ^ (v & 1 ? 0xedb88320 : 0);
  }
  return (v ^ 0xffffffff) >>> 0;
}
export function chunk(type: string, data: Buffer) {
  const b = Buffer.alloc(data.length + 12);
  b.writeUInt32BE(data.length);
  b.write(type, 4);
  data.copy(b, 8);
  b.writeUInt32BE(crc(b.subarray(4, b.length - 4)), b.length - 4);
  return b;
}
export function logoPng(width = 2, height = 2, metadata = false) {
  const h = Buffer.alloc(13);
  h.writeUInt32BE(width);
  h.writeUInt32BE(height, 4);
  h[8] = 8;
  h[9] = 6;
  const pixels = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = y * (width * 4 + 1) + 1 + x * 4;
      pixels[i] = 22;
      pixels[i + 1] = 60;
      pixels[i + 2] = 255;
      pixels[i + 3] = 255;
    }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", h),
    ...(metadata ? [chunk("tEXt", Buffer.from("private note"))] : []),
    chunk("IDAT", deflateSync(pixels)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
