import { Page, Locator } from "@playwright/test";
import { CommonPage } from "./CommonPage";

export class HomePage extends CommonPage {
    constructor(page: Page) {
        super(page);
    }
    
    // Helper function để click element với fallback
    private async clickWithFallback(locator: Locator): Promise<boolean> {
        try {
            await locator.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(300);
            await locator.click({ force: true, timeout: 5000 });
            return true;
        } catch (e) {
            // Fallback: JavaScript click
            try {
                await locator.evaluate((el: HTMLElement) => {
                    (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
                await this.page.waitForTimeout(500);
                await locator.evaluate((el: HTMLElement) => {
                    if (el instanceof HTMLAnchorElement || el instanceof HTMLButtonElement) {
                        el.click();
                    }
                });
                return true;
            } catch (e2) {
                return false;
            }
        }
    }
    
    async clickBuyTicketAnyMovie() {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
        
        // 1. Tìm link có href="/detail/" và text chứa "MUA VÉ"
        const directLinks = this.page.locator('a[href*="/detail/"]');
        const directCount = await directLinks.count();
        
        for (let i = 0; i < directCount; i++) {
            const link = directLinks.nth(i);
            const text = await link.textContent().catch(() => "");
            
            if (text && /mua vé/i.test(text.trim())) {
                if (await this.clickWithFallback(link)) {
                    return;
                }
            }
        }
        
        // 2. Tìm bất kỳ link nào có href="/detail/" (không cần text)
        if (directCount > 0) {
            const firstLink = directLinks.first();
            const isVisible = await firstLink.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
                if (await this.clickWithFallback(firstLink)) {
                    return;
                }
            }
        }
        
        // 3. Tìm bằng getByRole - link
        try {
            const roleLink = this.page.getByRole('link', { name: /mua vé/i });
            const linkCount = await roleLink.count().catch(() => 0);
            if (linkCount > 0) {
                const firstRoleLink = roleLink.first();
                const isVisible = await firstRoleLink.isVisible({ timeout: 2000 }).catch(() => false);
                if (isVisible) {
                    if (await this.clickWithFallback(firstRoleLink)) {
                        return;
                    }
                }
            }
        } catch (e) {
            // Tiếp tục
        }
        
        // 4. Tìm bằng getByRole - button
        try {
            const roleButton = this.page.getByRole('button', { name: /mua vé/i });
            const buttonCount = await roleButton.count().catch(() => 0);
            if (buttonCount > 0) {
                const firstButton = roleButton.first();
                const isVisible = await firstButton.isVisible({ timeout: 2000 }).catch(() => false);
                if (isVisible) {
                    if (await this.clickWithFallback(firstButton)) {
                        return;
                    }
                }
            }
        } catch (e) {
            // Tiếp tục
        }
        
        // 5. Tìm bất kỳ link/button nào có text chứa "mua" hoặc "vé"
        try {
            const anyLink = this.page.locator('a, button').filter({ hasText: /mua|vé/i });
            const anyCount = await anyLink.count().catch(() => 0);
            if (anyCount > 0) {
                const firstAny = anyLink.first();
                const isVisible = await firstAny.isVisible({ timeout: 2000 }).catch(() => false);
                if (isVisible) {
                    if (await this.clickWithFallback(firstAny)) {
                        return;
                    }
                }
            }
        } catch (e) {
            // Tiếp tục
        }
        
        // 6. Thử dùng TopBarNavigation
        try {
            await this.topBarNavigation.navigateDetailFromHome();
            return;
        } catch (e) {
            // Tiếp tục
        }
        
        throw new Error("Không tìm thấy nút 'Mua vé' nào ở HomePage!");
    }

    // Nếu muốn chọn phim theo tên (vd: phim có tiêu đề/alt riêng)
    async clickBuyTicketOfMovie(movieName: string) {
        // Tìm link MUA VÉ gần với thẻ hiển thị tên phim nhất
        const movieBlock = this.page.locator(`:scope >> text=${movieName}`);
        const buyLink = movieBlock.locator('xpath=..').locator('a[href*="/detail/"]', { hasText: "Mua vé" });
        if (await buyLink.first().isVisible().catch(() => false)) {
            await buyLink.first().click({ force: true });
        } else {
            throw new Error(`Không tìm thấy link 'Mua vé' cho phim ${movieName}!`);
        }
    }
}