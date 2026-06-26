import { expect, test } from "@playwright/test";

const evidence = {
  receiptId: "FAR-OFR-2026-041-NOVA",
  verificationTx: "6daf9e1a7d2b4d237771352be4c392bb0febc3d72ddd3de375ef8693199d33f2",
  finalizationTx: "e95f7d95fa716c24f4123f87c57ab478f3db1ffa92dcfa2ffaf4e1a1dbde527e"
};

test("landing page loads and main CTA reaches the product", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Ofora home/i })).toBeVisible();
  await page.getByRole("link", { name: /^Sign in$/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test("tender creation locks rules and opens submissions", async ({ page }) => {
  await page.goto("/tenders/new");
  await page.getByRole("button", { name: /Budget & timing/i }).click();
  await page.getByRole("button", { name: /Choose how to select/i }).click();
  await page.getByRole("button", { name: /Review and lock/i }).click();
  await page.getByRole("button", { name: /Lock selection rules/i }).click();
  await page.getByLabel(/I understand that these rules/i).check();
  await page.getByRole("button", { name: /Lock rules and open tender/i }).click();
  await expect(page.getByText(/open for supplier submissions/i)).toBeVisible();
});

test("supplier flow records confidential submissions", async ({ page }) => {
  for (const supplier of ["Atlas Supply Group", "Nova Relief Systems", "Meridian Industrial Ltd."]) {
    await page.goto("/supplier");
    await page.getByLabel(/Company information/i).fill(supplier);
    await page.getByLabel(/Proposed price/i).fill("9000");
    await page.getByLabel(/Delivery timeline/i).fill(supplier.includes("Meridian") ? "18" : "9");
    await page.getByLabel(/Stock availability/i).fill("100");
    await page.getByLabel(/Quality certification/i).fill("Certified");
    await page.getByLabel(/Local supplier contribution/i).fill("80");
    await page.getByRole("button", { name: /^Submit$/i }).click();
    await expect(page.getByText(/Submission received/i)).toBeVisible();
  }
  await page.goto("/tenders/OFR-2026-041");
  await expect(page.getByText(/3 confidential submissions/i).first()).toBeVisible();
});

test("evaluation handles Meridian, Atlas, and Nova in mock mode", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("ofora:award-state:v2:OFR-2026-041");
  });
  await page.goto("/tenders/OFR-2026-041?evaluation=1");
  await page.getByRole("button", { name: /Meridian Industrial Ltd\./i }).click();
  await page.getByRole("button", { name: /Validate award/i }).click();
  await expect(page.getByText(/Supplier not eligible for award/i)).toBeVisible();
  await page.getByRole("button", { name: /Atlas Supply Group/i }).click();
  await page.getByRole("button", { name: /Validate award/i }).click();
  await expect(page.getByText("Award blocked", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Nova Relief Systems/i }).click();
  await page.getByRole("button", { name: /Validate award/i }).click();
  await expect(page.getByText("Award validated", { exact: true }).last()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Demo Award Summary|Fair Award Receipt/ })).toBeVisible();
});

test("real evidence mode shows canonical safe evidence", async ({ page }) => {
  test.skip(process.env.NEXT_PUBLIC_OFORA_VERIFICATION_MODE !== "real", "Run with NEXT_PUBLIC_OFORA_VERIFICATION_MODE=real.");
  await page.addInitScript(() => {
    localStorage.removeItem("ofora:award-state:v2:OFR-2026-041");
  });
  await page.goto("/tenders/OFR-2026-041?evaluation=1");
  await page.getByRole("button", { name: /Nova Relief Systems/i }).click();
  await page.getByRole("button", { name: /Validate award/i }).click();
  await expect(page.getByText("VERIFIED ON STELLAR TESTNET").first()).toBeVisible();
  await expect(page.getByText(evidence.receiptId).first()).toBeVisible();
  await expect(page.getByText(evidence.verificationTx.slice(0, 10), { exact: false }).first()).toBeVisible();
  await expect(page.getByText(evidence.finalizationTx.slice(0, 10), { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Payment execution is not included in this hackathon MVP.", { exact: true })).toBeVisible();
});

test("public audit record exposes evidence but not confidential values", async ({ page }) => {
  await page.goto("/audit/audit-ofr-2026-041");
  await expect(page.getByRole("heading", { name: "Award independently validated." }).first()).toBeVisible();
  await expect(page.getByText("Nova Relief Systems")).toBeVisible();
  await expect(page.getByText(evidence.receiptId)).toBeVisible();
  await expect(page.getByText(/Competing bid values/i)).toBeVisible();
  await expect(page.getByText("$")).toHaveCount(0);
  await expect(page.getByText(/831125|747365|654435|18 days/i)).toHaveCount(0);
});

test("demo route renders six scenes and navigates", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByText("01 Lock the rules")).toBeVisible();
  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: /Next scene/i }).click();
  }
  await expect(page.getByText("06 Verify the record on Stellar")).toBeVisible();
  await expect(page.getByText(evidence.receiptId)).toBeVisible();
  await page.getByRole("button", { name: /Restart demo/i }).click();
  await expect(page.getByText("01 Lock the rules")).toBeVisible();
});
