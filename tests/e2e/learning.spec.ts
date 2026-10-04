import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const stamp = Date.now();
test.beforeEach(async ({ page }, info) => {
  if (info.title.startsWith("English default")) return;
  await page.addInitScript(() => {
    localStorage.setItem("satsuniccode.locale", "vi");
    localStorage.setItem("satsuniccode.editor", "textarea");
  });
});
async function syntheticIdentity(
  page: import("@playwright/test").Page,
  email: string,
) {
  await page.evaluate(async (email) => {
    const fixture = await import(
      /* @vite-ignore */ String(
        "/@fs/Users/hunpeo97/Desktop/Workspace/Coder/SatsunicCode/tests/e2e/fixtures/emulator-identity.ts",
      )
    );
    await fixture.createSyntheticIdentity(email);
  }, email);
}
test("homepage track destinations, composer draft/minimize, locale and responsive keyboard", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/SatsunicCode/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Chọn lộ trình",
  );
  await page.getByRole("radio", { name: "Kỹ sư AI", exact: true }).check();
  await page
    .getByRole("link", { name: "Khám phá lộ trình", exact: false })
    .click();
  await expect(page).toHaveURL(/roadmaps\/ai-engineer/);
  await expect(
    page.getByText("Chưa có bài được công bố.", { exact: false }),
  ).toBeVisible();
  await page.goto("/");
  await page.getByLabel("Hỏi Ask Satsunic").fill("Giải thích sliding window");
  await page.getByRole("button", { name: "Ẩn Ask Satsunic" }).click();
  await page.getByRole("button", { name: "Ask Satsunic", exact: true }).click();
  await expect(page.getByLabel("Hỏi Ask Satsunic")).toHaveValue(
    "Giải thích sliding window",
  );
  await page.getByRole("button", { name: "Gửi câu hỏi" }).click();
  await expect(page.locator(".satsunic-toast-content p")).toContainText("chưa có câu trả lời hoặc lịch sử được lưu");
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Hỏi Ask Satsunic")).toBeFocused();
  await page.getByRole("button", { name: "Đổi ngôn ngữ" }).click();
  await expect(page.getByPlaceholder("Ask anything…")).toBeVisible();
  await page.screenshot({
    path: "docs/evidence/homepage-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle light/dark theme" }).click();
  await page.screenshot({
    path: "docs/evidence/homepage-dark.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Send question" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/evidence/homepage-mobile.png",
    fullPage: true,
  });
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
  expect(errors).toEqual([]);
});
test("Synthetic emulator identity (not Google OAuth) → enrollment → next action → save draft → refresh → independent user isolation", async ({
  page,
  browser,
}) => {
  await page.goto("/settings");
  await syntheticIdentity(page, `learner-${stamp}@example.test`);
  await expect(page.getByRole("button", { name: "Tài khoản Google", exact: true })).toBeVisible();
  await page.goto("/roadmaps/dsa");
  await page.getByRole("button", { name: "Theo học DSA" }).click();
  await expect(page.locator(".satsunic-toast-content p")).toContainText("Đã lưu lộ trình DSA");
  await page.getByRole("button", { name: "Theo học DSA" }).click();
  await expect(page.locator(".satsunic-toast-content p")).toContainText("Đã lưu lộ trình DSA");
  await page.goto("/progress");
  await page.getByRole("link", { name: "Tiếp tục học" }).click();
  await expect(page).toHaveURL(/peak-requests/);
  await page
    .getByLabel("Mã của bạn", { exact: true })
    .fill("// private draft A\nfunction peakRequests(){ return 123; }");
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(page.locator(".satsunic-toast-content p")).toContainText("Đã đồng bộ");
  await page.reload();
  await expect(page.getByLabel("Mã của bạn", { exact: true })).toContainText(
    "private draft A",
  );
  await page
    .getByRole("button", { name: "Kiểm tra khả năng chấm", exact: true })
    .click();
  await expect(page.locator(".satsunic-toast-content p")).toContainText(
    "Mã chưa được chạy hoặc chấm",
  );
  await page.screenshot({
    path: "docs/evidence/practice-draft.png",
    fullPage: true,
  });
  const other = await browser.newContext();
  await other.addInitScript(() => {
    localStorage.setItem("satsuniccode.locale", "vi");
    localStorage.setItem("satsuniccode.editor", "textarea");
  });
  const b = await other.newPage();
  await b.goto("/settings");
  await syntheticIdentity(b, `other-${stamp}@example.test`);
  await expect(b.getByRole("button", { name: "Tài khoản Google", exact: true })).toBeVisible();
  await b.goto("/practice/peak-requests");
  await expect(b.getByLabel("Mã của bạn", { exact: true })).not.toContainText(
    "private draft A",
  );
  await other.close();
  await page.goto("/settings");
  await page.getByRole("button", { name: "Tài khoản Google", exact: true }).click();
  await page.getByRole("menuitem", { name: "Đăng xuất", exact: true }).click();
  await page.goto("/practice/peak-requests");
  await expect(
    page.getByLabel("Mã của bạn", { exact: true }),
  ).not.toContainText("private draft A");
});
test("DSA full reference graph, topic drawer, sets and workspace tabs", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/roadmaps/dsa");
  await expect(page.locator(".dsa-topic")).toHaveCount(18);
  await page.getByRole("button", { name: "Hai con trỏ", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveURL(/topic=Two/);
  await expect(
    page.getByRole("dialog").getByRole("heading", { level: 2 }),
  ).toContainText("Hai con trỏ");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Phóng to", exact: true }).click();
  await page.getByRole("button", { name: "Đặt lại sơ đồ" }).click();
  await page.selectOption("#dsa-set", "blind75");
  await expect(page.locator(".dsa-ring")).toContainText("/75");
  await page.selectOption("#dsa-set", "all");
  await expect(page.locator(".dsa-ring")).toContainText("/450");
  await page.selectOption("#dsa-set", "neetcode150");
  await page.screenshot({
    path: "docs/evidence/roadmap-graph.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Mảng & bảng băm", exact: true })
    .click();
  await expect(page.getByRole("dialog").locator("tbody tr")).toHaveCount(9);
  await page.screenshot({
    path: "docs/evidence/roadmap-topic-drawer.png",
    fullPage: true,
  });
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Contains Duplicate", exact: true })
    .click();
  await expect(page).toHaveURL(/practice\/contains-duplicate/);
  await expect(
    page.getByRole("tab", { name: "Đề bài", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Bài nộp", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Đăng nhập để xem bài nộp",
  );
  await page.getByRole("button", { name: "Chạy", exact: true }).click();
  await expect(page.locator(".satsunic-toast-content p")).toContainText("chưa được chạy");
  await page.getByRole("tab", { name: "Đề bài", exact: true }).click();
  await page.screenshot({
    path: "docs/evidence/reference-workspace.png",
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.goto("/practice");
  await page.getByLabel("Tìm bài tập").fill("không có bài này");
  await expect(page.getByRole("status").first()).toContainText("Không có bài tập khớp");
  await page.getByLabel("Tìm bài tập").fill("");
  await expect(
    page.getByRole("link", { name: "Đỉnh lưu lượng yêu cầu" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Kỹ sư AI", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "chưa có bài được công bố",
  );
  await page.getByRole("button", { name: "DSA & Phỏng vấn lập trình" }).click();
  await page.screenshot({
    path: "docs/evidence/practice-catalog.png",
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("all target viewports and bundled Monaco editor fallback", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const width of [1440, 1280, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.getByLabel("Hỏi Ask Satsunic")).toBeVisible();
    const scan = await new AxeBuilder({ page }).analyze();
    expect(scan.violations).toEqual([]);
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/practice/peak-requests");
  await page.getByRole("button", { name: "Mở Monaco Editor" }).click();
  await expect(page.locator(".monaco-editor").first()).toBeVisible({
    timeout: 30000,
  });
  await page.screenshot({
    path: "docs/evidence/practice-monaco.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Dùng ô nhập mã" }).click();
  await expect(page.getByLabel("Mã của bạn", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("clean navigation, footer credit and Google-only availability", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".footer-brand")).toContainText("by HunpeoLabs");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/satsunic-mark.svg",
  );
  for (const icon of await page.locator(".brand-icon img").all()) {
    await expect(icon).toHaveJSProperty("complete", true);
    expect(
      await icon.evaluate((el) => (el as HTMLImageElement).naturalWidth),
    ).toBeGreaterThan(0);
  }
  const iconResponse = await page.request.get("/satsunic-mark.svg");
  expect(iconResponse.ok()).toBeTruthy();
  expect(iconResponse.headers()["content-type"]).toContain("image/svg+xml");
  const header = page.locator(".clean-header");
  await expect(header).toHaveCSS("position", "fixed");
  await page.evaluate(() => window.scrollTo(0, 180));
  await expect(header).toHaveClass(/is-compact/);
  await expect(header).toHaveCSS("min-height", "50px");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).not.toHaveClass(/is-compact/);
  await expect(header).toHaveCSS("min-height", "58px");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(header).toHaveCSS("transition-duration", "0s");

  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "Mở menu điều hướng" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("navigation", { name: "Điều hướng di động" })
    .getByRole("link", { name: "Luyện tập", exact: true })
    .click();
  await expect(page).toHaveURL(/practice$/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await page.goto("/settings");
  await expect(
    page.getByRole("heading", { name: "Cài đặt", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator("input[type=email],input[type=password]"),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: "docs/evidence/google-one-tap-availability.png",
    fullPage: true,
  });
});

test("track switcher: six real destinations and native keyboard", async ({
  page,
}) => {
  await page.goto("/");
  const choices = page.getByRole("radio");
  await expect(choices).toHaveCount(6);
  await expect(choices.nth(0)).toBeChecked();
  await choices.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(choices.nth(1)).toBeChecked();
  const slugs = [
    "dsa",
    "ai-engineer",
    "cybersecurity",
    "web-developer",
    "mobile-developer",
    "game-developer",
  ];
  for (let i = 0; i < 6; i++) {
    await choices.nth(i).check();
    await expect(
      page.getByRole("link", { name: "Khám phá lộ trình", exact: false }),
    ).toHaveAttribute("href", `/roadmaps/${slugs[i]}`);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await choices.nth(0).check();
  await page.screenshot({
    path: "docs/evidence/track-switcher-mobile.png",
    fullPage: true,
  });
});

test("English default and persistent language without mixed route labels", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("satsuniccode.locale"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Choose your path",
  );
  await expect(
    page.getByRole("radio", { name: "AI Engineer", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Change language" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(
    page.getByRole("radio", { name: "Kỹ sư AI", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("radio", { name: "An ninh mạng", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Company Reviews", exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await page.getByRole("button", { name: "Đổi ngôn ngữ" }).click();
  await page.goto("/practice");
  await expect(page.getByLabel("Search challenges")).toBeVisible();
  await expect(page.getByText("Dễ", { exact: true })).toHaveCount(0);
});

test("owner bookmark persists after Firebase ack and stays isolated across users", async ({
  page,
  browser,
}) => {
  await page.goto("/settings");
  await syntheticIdentity(page, `bookmark-${stamp}@example.test`);
  await page.goto("/practice/contains-duplicate");
  const star = page.getByRole("button", {
    name: "Đánh dấu bài tập",
    exact: true,
  });
  await expect(star).toHaveAttribute("aria-pressed", "false");
  await star.click();
  await expect(star).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(star).toHaveAttribute("aria-pressed", "true");
  const ctx = await browser.newContext();
  await ctx.addInitScript(() =>
    localStorage.setItem("satsuniccode.locale", "vi"),
  );
  const other = await ctx.newPage();
  await other.goto("/settings");
  await syntheticIdentity(other, `bookmark-other-${stamp}@example.test`);
  await other.goto("/practice/contains-duplicate");
  await expect(
    other.getByRole("button", { name: "Đánh dấu bài tập", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await ctx.close();
});
