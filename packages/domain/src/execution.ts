export type Verdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "COMPILE_ERROR"
  | "RUNTIME_ERROR"
  | "TIME_LIMIT"
  | "MEMORY_LIMIT";
export type RunRequest = {
  source: string;
  runtimeId: string;
  input: string;
  sourceHash: string;
  requestId: string;
};
export interface CodeExecutionProvider {
  submit(request: RunRequest): Promise<{ providerJobId: string }>;
  status(
    jobId: string,
  ): Promise<{
    state: "QUEUED" | "RUNNING" | "EVALUATED" | "FAILED_INFRA";
    verdict?: Verdict;
  }>;
}
// There is intentionally no local eval, child process, vm, public demo runner or canned verdict.
export class UnavailableRunner implements CodeExecutionProvider {
  async submit(_request: RunRequest): Promise<{ providerJobId: string }> {
    throw new Error("BLOCKED_EXTERNAL: approved isolated runner required");
  }
  async status(
    _jobId: string,
  ): Promise<{
    state: "QUEUED" | "RUNNING" | "EVALUATED" | "FAILED_INFRA";
    verdict?: Verdict;
  }> {
    throw new Error("BLOCKED_EXTERNAL: approved isolated runner required");
  }
}
export function applyJobState(current: string, next: string): string {
  const transitions: Record<string, string[]> = {
    QUEUED: ["RUNNING", "FAILED_INFRA", "CANCELLED"],
    RUNNING: ["EVALUATED", "FAILED_INFRA", "CANCELLED"],
  };
  if (current === next) return current;
  if (!transitions[current]?.includes(next))
    throw new Error("INVALID_TRANSITION");
  return next;
}
