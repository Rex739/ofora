import { expect, test } from "@playwright/test";

const mobile = { width: 390, height: 844 };

const routes = [
  "/",
  "/#solutions",
  "/dashboard",
  "/tenders",
  "/tenders/new",
  "/tenders/OFR-2026-041",
  "/tenders/OFR-2026-041?evaluation=1",
  "/supplier",
  "/supplier/submit/OFR-2026-041",
  "/awards",
  "/audit",
  "/audit/audit-ofr-2026-041",
  "/settings",
  "/demo"
];

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => {
    const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    return scrollWidth - window.innerWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe("mobile responsiveness", () => {
  test.use({ viewport: mobile });

  test("mobile menu opens, navigates, and closes", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /Open navigation/i }).click();
    await expect(page.getByRole("navigation", { name: /Mobile navigation/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await page.getByRole("link", { name: "Tenders" }).click();
    await expect(page).toHaveURL(/\/tenders$/);
    await expect(page.getByRole("navigation", { name: /Mobile navigation/i })).toBeHidden();
  });

  test("drawer closes with Escape and exposes the required routes", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /Open navigation/i }).click();
    for (const name of ["Dashboard", "Tenders", "Awards", "Audit Records", "Settings"]) {
      await expect(page.getByRole("link", { name })).toBeVisible();
    }
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: /Mobile navigation/i })).toBeHidden();
  });

  for (const route of routes) {
    test(`has no page-level horizontal overflow at 390px on ${route}`, async ({ page }) => {
      await page.goto(route);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("tender detail actions and receipt stay within mobile viewport", async ({ page }) => {
    await page.goto("/tenders/OFR-2026-041");
    await expect(page.getByRole("link", { name: /Validate award/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Validate award/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/tenders/OFR-2026-041?evaluation=1");
    await page.getByRole("button", { name: /Nova Relief Systems/i }).click();
    await page.getByRole("button", { name: /Validate award/i }).click();
    await expect(page.getByRole("heading", { name: /Demo Award Summary|Fair Award Receipt/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("supplier portal form works at 390px", async ({ page }) => {
    await page.goto("/supplier");
    await page.getByLabel(/Company information/i).fill("Nova Relief Systems");
    await page.getByLabel(/Proposed price/i).fill("9400");
    await page.getByLabel(/Delivery timeline/i).fill("7");
    await page.getByLabel(/Stock availability/i).fill("100");
    await page.getByLabel(/Quality certification/i).fill("IEC certified");
    await page.getByLabel(/Local supplier contribution/i).fill("88");
    await page.getByRole("button", { name: /^Submit$/i }).click();
    await expect(page.getByText(/Submission received/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("demo scene navigation works at 390px", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.getByText("01 Lock the rules")).toBeVisible();
    await page.getByRole("button", { name: /Next scene/i }).click();
    await expect(page.getByText("02 Receive confidential submissions")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("solutions hash lands below the header on mobile", async ({ page }) => {
    await page.goto("/#solutions");
    const geometry = await page.evaluate(() => {
      const header = document.querySelector("header");
      const section = document.querySelector("#solutions");
      const heading = section?.querySelector("h2");
      return {
        headerBottom: header?.getBoundingClientRect().bottom ?? 0,
        sectionTop: section?.getBoundingClientRect().top ?? 0,
        headingTop: heading?.getBoundingClientRect().top ?? 0
      };
    });
    expect(geometry.sectionTop).toBeGreaterThanOrEqual(geometry.headerBottom);
    expect(geometry.headingTop).toBeGreaterThan(geometry.headerBottom);
    await expectNoHorizontalOverflow(page);
  });
});
