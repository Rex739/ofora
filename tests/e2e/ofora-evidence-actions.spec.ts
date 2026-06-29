import { expect, test } from "@playwright/test";

const evidence = {
  verificationTx: "6daf9e1a7d2b4d237771352be4c392bb0febc3d72ddd3de375ef8693199d33f2",
  finalizationTx: "e95f7d95fa716c24f4123f87c57ab478f3db1ffa92dcfa2ffaf4e1a1dbde527e",
  verifierContract: "CDGHNWSNU43NOBSH7PBOJ7F25LJ66UXPZKL6I3C6PXCP6JBZHH4JFS4E",
  registryContract: "CACEBZHKO5ONJSBFY372FOZQADRKNR23JXFYG7KQOAMGYZPN7ISCHDRS"
};

const urls = {
  verificationTx: `https://stellar.expert/explorer/testnet/tx/${evidence.verificationTx}`,
  finalizationTx: `https://stellar.expert/explorer/testnet/tx/${evidence.finalizationTx}`,
  verifierContract: `https://stellar.expert/explorer/testnet/contract/${evidence.verifierContract}`,
  registryContract: `https://stellar.expert/explorer/testnet/contract/${evidence.registryContract}`
};

test.describe("Fair Award Record evidence actions", () => {
  test("real mode exposes copyable Stellar testnet evidence actions", async ({ browser, page, context }) => {
    test.skip(process.env.NEXT_PUBLIC_OFORA_VERIFICATION_MODE !== "real", "Run with NEXT_PUBLIC_OFORA_VERIFICATION_MODE=real.");

    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/audit/audit-ofr-2026-041");

    await expect(page.getByText("Verified on Stellar testnet")).toBeVisible();
    await expect(page.getByText("6daf9e1a7d...199d33f2")).toBeVisible();
    await expect(page.getByText("e95f7d95fa...dbde527e")).toBeVisible();

    const expectedLinks = [
      ["Verification receipt transaction", urls.verificationTx],
      ["Award-record finalization transaction", urls.finalizationTx],
      ["Verifier receipt contract", urls.verifierContract],
      ["Registry contract", urls.registryContract]
    ] as const;

    for (const [label, href] of expectedLinks) {
      const link = page.getByLabel(`Open ${label} in Stellar Explorer`);
      await expect(link).toHaveAttribute("href", href);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(link).toHaveAttribute("rel", /noreferrer/);
    }

    const copyVerificationButton = page.getByLabel("Copy full Verification receipt transaction");
    await copyVerificationButton.click();
    await expect(copyVerificationButton).toContainText("Copied");
    const copiedReference = await page.evaluate(() => navigator.clipboard.readText());
    expect(copiedReference).toBe(evidence.verificationTx);

    const pagePromise = context.waitForEvent("page");
    await page.getByLabel("Open Award-record finalization transaction in Stellar Explorer").click();
    const explorerPage = await pagePromise;
    await explorerPage.waitForLoadState("domcontentloaded");
    expect(explorerPage.url()).toBe(urls.finalizationTx);
    await explorerPage.close();

    await browser.newContext({ viewport: { width: 390, height: 844 } }).then(async (mobileContext) => {
      const mobilePage = await mobileContext.newPage();
      await mobilePage.goto("http://127.0.0.1:3100/audit/audit-ofr-2026-041");
      const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await mobileContext.close();
    });
  });

  test("mock mode does not expose testnet evidence actions", async ({ page }) => {
    test.skip(process.env.NEXT_PUBLIC_OFORA_VERIFICATION_MODE === "real", "Mock-mode assertion only runs without real verification mode.");

    await page.goto("/audit/audit-ofr-2026-041");

    await expect(page.getByRole("heading", { name: "Local demo verification" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open .* Stellar Explorer/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Copy/i })).toHaveCount(0);
  });
});
