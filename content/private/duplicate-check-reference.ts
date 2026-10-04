// Trusted author test reference, not execution of submitted code, never browser imported.
export function hasRepeatedEvent(codes: number[]): boolean {
  const seen = new Set<number>();
  for (const code of codes) {
    if (!Number.isInteger(code) || code < -2147483648 || code > 2147483647)
      throw Error("Invalid event code");
    if (seen.has(code)) return true;
    seen.add(code);
  }
  return false;
}
