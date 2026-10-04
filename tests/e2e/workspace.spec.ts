import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("satsuniccode.locale", "en");
    localStorage.setItem("satsuniccode.editor", "textarea");
  });
});
test("workspace restores independent drafts and exposes real hints/custom input", async ({
  page,
}) => {
  await page.goto("/practice/contains-duplicate");
  const code = page.getByRole("textbox", {
    name: "Your source code",
    exact: true,
  });
  await code.fill("# python draft");
  await page.getByLabel("Programming language").selectOption("javascript");
  await code.fill("// javascript draft");
  await page.getByLabel("Programming language").selectOption("python");
  await expect(code).toHaveValue("# python draft");
  await page.reload();
  await expect(code).toHaveValue("# python draft");
  await page.getByRole("button", { name: "Hint", exact: true }).click();
  await expect(
    page.getByText("What do you need to remember while reading each code?"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset code", exact: true }).click();
  await expect(code).toHaveValue(/def contains_duplicate/);
  await page.getByRole("button", { name: "Undo reset", exact: true }).click();
  await expect(code).toHaveValue("# python draft");
  await page.getByRole("tab", { name: "Solution", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Expected O(n)");
  await page.getByRole("tab", { name: "Submissions", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Sign in to view stored submissions",
  );
  await page.getByRole("button", { name: "Console", exact: false }).click();
  await page.getByLabel("Test case", { exact: true }).selectOption("-1");
  await page.getByRole("textbox", { name: "Test input" }).fill('["invalid"]');
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("32-bit integers");
  await expect(page.getByRole("status")).toBeVisible();
  await page.getByRole("tab", { name: "Question", exact: true }).click();
  await page.getByRole("tab", { name: "Question", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Solution", exact: true }),
  ).toBeFocused();
  expect(
    (await new AxeBuilder({ page }).include(".reference-workspace").analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({
    path: "docs/evidence/workspace-current-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Code", exact: true }).click();
  await expect(code).toBeVisible();
  await page.getByRole("button", { name: "Question", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/evidence/workspace-current-mobile.png",
    fullPage: true,
  });
});
test("workspace handles external-tab conflict without overwriting editor", async ({
  page,
}) => {
  await page.goto("/practice/contains-duplicate");
  const code = page.getByRole("textbox", {
    name: "Your source code",
    exact: true,
  });
  await code.fill("# keep me");
  await expect(
    page.getByText("Stored on this device", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    const key = Object.keys(localStorage).find(
      (key) => key.includes("draft.v1:") && key.endsWith(":python"),
    )!;
    const previous = localStorage.getItem(key);
    const value = JSON.parse(previous!);
    const next = JSON.stringify({
      ...value,
      source: "# other tab",
      revision: value.revision + 1,
    });
    localStorage.setItem(key, next);
    window.dispatchEvent(
      new StorageEvent("storage", { key, oldValue: previous, newValue: next }),
    );
  });
  await expect(page.getByText("Draft conflict", { exact: true })).toBeVisible();
  await expect(code).toHaveValue("# keep me");
  await page.reload();
  await expect(code).toHaveValue("# keep me");
  await expect(page.getByText("Draft conflict", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Load latest draft" }).click();
  await expect(code).toHaveValue("# other tab");
  await page.getByRole("button", { name: "Undo reset" }).click();
  await expect(code).toHaveValue("# keep me");
});

test("Monaco loads selected runtimes, fills pane and releases route UI", async ({
  page,
}) => {
  await page.goto("/practice/contains-duplicate");
  await page.getByRole("button", { name: "Open editor", exact: true }).click();
  await expect(page.locator(".reference-code .monaco-editor")).toBeVisible();
  for (const language of ["javascript", "typescript", "java", "python"]) {
    await page.getByLabel("Programming language").selectOption(language);
    await expect(page.locator(".reference-code .monaco-editor")).toHaveCount(1);
    await expect(page.locator(".reference-code .monaco-editor")).toBeVisible();
  }
  const heights = await page.locator(".reference-code").evaluate((el) => ({
    pane: el.clientHeight,
    editor: el.querySelector(".monaco-editor")?.clientHeight ?? 0,
  }));
  expect(Math.abs(heights.pane - heights.editor)).toBeLessThan(5);
  await page.getByRole("tab", { name: "Question", exact: true }).click();
  await page.screenshot({
    path: "docs/evidence/workspace-monaco.png",
    fullPage: true,
  });
  await page.goto("/practice/peak-requests");
  await page
    .getByRole("button", { name: "Open Monaco Editor", exact: true })
    .click();
  await expect(page.locator(".monaco-editor")).toHaveCount(1);
});

test("emulator-only account sync stores and independently reloads authored draft", async ({
  page,
}) => {
  await page.goto("/practice/contains-duplicate");
  await page.evaluate(async () => {
    const fixture = await import(
      /* @vite-ignore */ String(
        "/@fs/Users/hunpeo97/Desktop/Workspace/Coder/SatsunicCode/tests/e2e/fixtures/emulator-identity.ts",
      )
    );
    await fixture.createSyntheticIdentity(
      `workspace-${crypto.randomUUID()}@example.test`,
    );
  });
  const sync = page.getByRole("button", { name: "Sync draft", exact: true });
  await expect(
    page
      .locator(".editor-toolbar")
      .getByRole("button", { name: "Sync draft", exact: true }),
  ).toHaveCount(1);
  await expect(sync.locator("svg")).toHaveCount(1);
  expect(
    (await page.locator(".editor-toolbar").boundingBox())!.height,
  ).toBeLessThanOrEqual(100);
  await expect(sync).toBeEnabled();
  const code = page.getByRole("textbox", {
    name: "Your source code",
    exact: true,
  });
  await code.fill("# cloud snapshot");
  await sync.click();
  await expect(
    page.getByText("The code snapshot was synced.", { exact: true }),
  ).toBeVisible();
  await code.fill("# different local code");
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Load synced draft", exact: true })
    .click();
  await expect(code).toHaveValue("# cloud snapshot");
  await page.reload();
  await expect(sync).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Load synced draft", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Submissions", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("No submissions yet.");
});

test("pane divider supports keyboard and pointer without altering drafts", async ({
  page,
}) => {
  await page.goto("/practice/contains-duplicate");
  const divider = page.getByRole("separator", { name: "Resize panes" });
  await divider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(divider).toHaveAttribute("aria-valuenow", "46");
  const rect = await divider.boundingBox();
  await page.mouse.move(rect!.x + 6, rect!.y + 40);
  await page.mouse.down();
  await page.mouse.move(rect!.x + 90, rect!.y + 40);
  await page.mouse.up();
  expect(Number(await divider.getAttribute("aria-valuenow"))).toBeGreaterThan(
    46,
  );
});

test("50 language switches keep one editor and bounded worker instances (local fixture)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const stats = { created: 0, active: 0 };
    Object.assign(window, { workspaceWorkerStats: stats });
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      private closed = false;
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options);
        stats.created++;
        stats.active++;
      }
      terminate() {
        if (!this.closed) {
          stats.active--;
          this.closed = true;
        }
        super.terminate();
      }
    };
  });
  await page.goto("/practice/contains-duplicate");
  const started = Date.now();
  await page.getByRole("button", { name: "Open editor", exact: true }).click();
  await expect(page.locator(".reference-code .monaco-editor")).toBeVisible();
  const editorReadyMs = Date.now() - started;
  for (let i = 0; i < 50; i++) {
    await page
      .getByLabel("Programming language")
      .selectOption(["javascript", "typescript", "java", "python"][i % 4]!);
    await expect(page.locator(".reference-code .monaco-editor")).toHaveCount(1);
  }
  const workers = await page.evaluate(
    () =>
      (
        window as unknown as {
          workspaceWorkerStats: { created: number; active: number };
        }
      ).workspaceWorkerStats,
  );
  expect(workers.active).toBeLessThanOrEqual(4);
  console.log(
    JSON.stringify({
      environment: "local Vite development / headless Chromium",
      editorReadyMs,
      switches: 50,
      workers,
    }),
  );
});

test("peak-requests local drafts survive refresh and cloud save remains real", async ({
  page,
}) => {
  await page.goto("/practice/peak-requests");
  await page.evaluate(async () => {
    const fixture = await import(
      /* @vite-ignore */ String(
        "/@fs/Users/hunpeo97/Desktop/Workspace/Coder/SatsunicCode/tests/e2e/fixtures/emulator-identity.ts",
      )
    );
    await fixture.createSyntheticIdentity(
      `workspace-peak-${crypto.randomUUID()}@example.test`,
    );
  });
  const code = page.getByRole("textbox", {
    name: "Your source code",
    exact: true,
  });
  await expect(code).toBeEnabled();
  await code.fill("// authored private snapshot");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Draft synced.");
  await page.reload();
  await expect(code).toHaveValue("// authored private snapshot");
});

test("execution capability reports no configured runner and creates no verdict", async ({
  page,
}) => {
  await page.goto("/practice/contains-duplicate");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Code was not run or graded",
  );
  await expect(
    page.getByRole("textbox", { name: "Your source code", exact: true }),
  ).toHaveValue(/def contains_duplicate/);
});
