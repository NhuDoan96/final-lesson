import { Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";

export class PurchasePage extends CommonPage {

    readonly btnBook = this.page.getByRole('button', { name: /đặt vé/i }).first();
    readonly popupSuccess = this.page.getByText(/đặt vé thành công/i).first();

    // Seats: prefer non-disabled seat elements
    readonly seatAvailableGroups: Locator[] = [
        this.page.locator("[class*='ghe']:not(.disabled):not([disabled])"),
        this.page.locator("[class*='seat']:not(.disabled):not([disabled])"),
        this.page.locator(".ghe-trong"),
        this.page.locator("[class*='ghe-trong']"),
        this.page.locator(".seat-available"),
        this.page.getByRole('button', { name: /ghế trống/i }),
        this.page.locator("//div[contains(@class,'seat') and not(contains(@class,'disabled'))]"),
        // Fallback: any button inside seat area that is enabled
        this.page.locator("//button[not(@disabled) and not(contains(@class,'disabled')) and ancestor::*[contains(@class,'seat') or contains(@class,'ghe')]]"),
        // Fallback: seats marked by aria-checked or aria-pressed false (not yet selected)
        this.page.locator("[role='button'][aria-pressed='false']"),
        this.page.locator("[role='button'][aria-checked='false']"),
    ];

    constructor(page: Page) {
        super(page);
    }

    async selectFirstAvailableSeat() {
        // Retry multiple times to handle lazy-loaded seat map
        const maxAttempts = 5;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Wait for any seat group to appear
            const anyGroup = this.seatAvailableGroups[0];
            await anyGroup.first().waitFor({ state: 'attached' }).catch(() => {});

            for (const group of this.seatAvailableGroups) {
                const count = await group.count().catch(() => 0);
                if (!count) continue;

                // Try first N seats to find an available one
                const tryCount = Math.min(15, count);
                for (let i = 0; i < tryCount; i++) {
                    const seatCandidate = group.nth(i);
                    const attached = await seatCandidate.waitFor({ state: 'attached' }).then(() => true).catch(() => false);
                    if (!attached) continue;

                    const text = (await seatCandidate.textContent().catch(() => "")) || "";
                    if (/hết|đã đặt|reserved|full|sold/i.test(text)) continue;

                    const visible = await seatCandidate.isVisible().catch(() => false);
                    if (visible) {
                        await seatCandidate.scrollIntoViewIfNeeded().catch(() => {});
                        await seatCandidate.click({ force: true });
                        return;
                    }
                }
            }

            // small wait then retry
            await this.delay(500);
        }

        throw new Error("No available seat found");
    }

    async bookTicket() {
        await this.selectFirstAvailableSeat();
        await this.btnBook.waitFor({ state: 'visible' });
        await this.btnBook.click({ force: true });
    }

    async waitForSuccessPopup() {
        await this.popupSuccess.waitFor({ state: 'visible' });
    }

    private async delay(ms: number) {
        return new Promise<void>((resolve) => setTimeout(resolve, ms));
    }
}

