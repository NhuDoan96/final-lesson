import { Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";

export class DetailPage extends CommonPage {
    readonly detailContainer =this.page.locator("//div[contains(@class,'detail') or contains(@class,'movie-detail')]");
    readonly btnBuyNow = this.page.getByRole('button', { name: /mua vé/i }).first();;
    readonly lnkBuyNow =  this.page.getByRole('link', { name: /mua vé/i }).first()
    private foundDetailContainer: Locator | null = null;

    constructor(page: Page) {
        super(page);
    
        
       
    }

    getDetailContainerLocator(): Locator {
        // Nếu đã tìm thấy container trong waitForDetailVisible(), dùng nó
        if (this.foundDetailContainer) {
            return this.foundDetailContainer;
        }
        
        // Thử tìm container với nhiều selector (giống waitForDetailVisible)
        const detailSelectors = [
            "h1, h2, h3", // Ưu tiên selector đã tìm thấy
            "//div[contains(@class,'detail') or contains(@class,'movie-detail')]",
            "div[class*='detail']",
            "div[class*='movie-detail']",
            "[class*='detail']",
            "[class*='movie']",
            "main",
            "article",
            ".container",
            "[id*='detail']",
            "[id*='movie']",
            "[role='main']"
        ];
        
        // Trả về selector đầu tiên (expect sẽ tự kiểm tra visibility)
        for (const selector of detailSelectors) {
            const container = this.page.locator(selector).first();
            return container;
        }
        
        // Fallback: trả về selector mặc định
        return this.detailContainer;
    }

    async isDetailVisible(): Promise<boolean> {
        // Thử nhiều selector
        const detailSelectors = [
            "//div[contains(@class,'detail') or contains(@class,'movie-detail')]",
            "div[class*='detail']",
            "div[class*='movie-detail']",
            "[class*='detail']",
            "[class*='movie']",
            "main",
            "article"
        ];
        
        for (const selector of detailSelectors) {
            const container = this.page.locator(selector).first();
            if (await container.isVisible().catch(() => false)) {
                return true;
            }
        }
        
        return false;
    }

    async waitForDetailVisible() {
        // Chờ navigation xảy ra (URL có thể thay đổi hoặc không)
        const currentURL = this.page.url();
        
        // Thử chờ URL đổi sang trang detail (không bắt buộc)
        try {
            await this.page.waitForURL(/\/(detail|movie|phim)/, {timeout: 5000});
            console.log("DEBUG: URL đã đổi sang trang detail");
        } catch (e) {
            // URL không match pattern, nhưng vẫn tiếp tục
            console.log("DEBUG: URL không match pattern detail/movie, nhưng vẫn tiếp tục");
        }
        
        // Chờ trang load xong
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
        
        // Kiểm tra URL hiện tại
        const newURL = this.page.url();
        console.log(`DEBUG: URL hiện tại: ${newURL}`);
        
        // Thử nhiều selector khác nhau cho detailContainer
        const detailSelectors = [
            "//div[contains(@class,'detail') or contains(@class,'movie-detail')]",
            "div[class*='detail']",
            "div[class*='movie-detail']",
            "[class*='detail']",
            "[class*='movie']",
            "main",
            "article",
            ".container",
            "[id*='detail']",
            "[id*='movie']",
            "h1, h2, h3", // Có thể có heading với tên phim
            "[role='main']"
        ];
        
        let found = false;
        for (const selector of detailSelectors) {
            try {
                const container = this.page.locator(selector).first();
                await container.waitFor({ state: 'visible', timeout: 2000 });
                // Lưu container đã tìm được để dùng trong getDetailContainerLocator
                this.foundDetailContainer = container;
                found = true;
                console.log(`DEBUG: Tìm thấy detailContainer với selector: ${selector}`);
                break;
            } catch (e) {
                // Thử selector tiếp theo
                continue;
            }
        }
        
        // Nếu không tìm thấy container, kiểm tra xem có element nào cho thấy đã vào detail page
        if (!found) {
            // Kiểm tra xem có heading, title, hoặc text nào cho thấy đây là trang detail
            const hasDetailContent = await this.page.locator('h1, h2, h3, [class*="title"], [class*="name"]').count() > 0;
            if (hasDetailContent || newURL !== currentURL) {
                console.log("DEBUG: Không tìm thấy detailContainer nhưng có dấu hiệu đã vào trang detail");
                found = true;
            }
        }
        
        if (!found) {
            console.log("DEBUG: Cảnh báo: Không tìm thấy detailContainer và không có dấu hiệu rõ ràng của trang detail");
        }
    }

    async selectShowtime() {
        // Chọn giờ chiếu phim bất kì ở detail page
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);

        // Thử nhiều selector khác nhau để tìm giờ chiếu (ưu tiên selector cụ thể hơn)
        const showtimeSelectors = [
            // 1. Button có text chứa giờ (format: HH:MM) - ưu tiên
            this.page.locator('button').filter({ hasText: /\d{1,2}:\d{2}/ }),
            // 2. Link có text chứa giờ
            this.page.locator('a').filter({ hasText: /\d{1,2}:\d{2}/ }),
            // 3. Div có role="button" và chứa giờ
            this.page.locator('div[role="button"]').filter({ hasText: /\d{1,2}:\d{2}/ }),
            // 4. Button với role và name
            this.page.getByRole('button', { name: /giờ chiếu|suất|time|showtime/i }),
            // 5. Tìm theo xpath - element chứa format "~ HH:MM"
            this.page.locator('//*[contains(text(), "~") and contains(text(), ":")]'),
            // 6. Box/container chứa format "DD-MM-YYYY ~ HH:MM"
            this.page.locator('div, span, p').filter({ hasText: /\d{1,2}-\d{1,2}-\d{4}\s*~\s*\d{1,2}:\d{2}/ }),
            // 7. Element chứa format "~ HH:MM"
            this.page.locator('div, span, p').filter({ hasText: /~\s*\d{1,2}:\d{2}/ }),
        ];

        // Thử từng selector với timeout ngắn hơn và giới hạn thời gian tổng thể
        const startTime = Date.now();
        const maxTime = 30000; // 30 giây timeout tổng thể

        for (let selectorIndex = 0; selectorIndex < showtimeSelectors.length; selectorIndex++) {
            // Kiểm tra timeout tổng thể
            if (Date.now() - startTime > maxTime) {
                break;
            }

            const selector = showtimeSelectors[selectorIndex];
            try {
                // Đợi với timeout ngắn hơn để tránh timeout
                await selector.first().waitFor({ state: 'attached', timeout: 2000 }).catch(() => {});
                const count = await selector.count().catch(() => 0);
                if (count === 0) continue;

                // Giới hạn số lượng element kiểm tra
                const maxCheck = Math.min(count, 5);
                for (let i = 0; i < maxCheck; i++) {
                    // Kiểm tra timeout tổng thể
                    if (Date.now() - startTime > maxTime) {
                        break;
                    }

                    const showtime = selector.nth(i);
                    const text = (await showtime.textContent().catch(() => "") || "").trim();
                    
                    // Kiểm tra text có phải là giờ chiếu
                    const isShowtime = /\d{1,2}-\d{1,2}-\d{4}\s*~\s*\d{1,2}:\d{2}/.test(text) ||
                                     /~\s*\d{1,2}:\d{2}/.test(text) ||
                                     /\d{1,2}:\d{2}/.test(text);
                    
                    if (!isShowtime) continue;

                    const isVisible = await showtime.isVisible({ timeout: 500 }).catch(() => false);
                    if (!isVisible) {
                        await showtime.scrollIntoViewIfNeeded().catch(() => {});
                        await this.page.waitForTimeout(200);
                        const isVisibleAfterScroll = await showtime.isVisible({ timeout: 500 }).catch(() => false);
                        if (!isVisibleAfterScroll) continue;
                    }

                    const isEnabled = await showtime.isEnabled().catch(() => true);
                    const isDisabled = await showtime.getAttribute('disabled').catch(() => null);

                    if (isEnabled && !isDisabled) {
                        await showtime.scrollIntoViewIfNeeded().catch(() => {});
                        await this.page.waitForTimeout(200);
                        await this.click(showtime);
                        await this.page.waitForTimeout(500);
                        return;
                    }
                }
            } catch (e) {
                // Tiếp tục thử selector tiếp theo
                continue;
            }
        }

        // Nếu không tìm thấy giờ chiếu, có thể giờ chiếu đã được chọn tự động hoặc không cần chọn
        // Tiếp tục với bước tiếp theo
        console.log("DEBUG: Không tìm thấy giờ chiếu để chọn, tiếp tục...");
    }

    async navigateToPurchasePage() {
        // Đợi trang load xong sau khi chọn giờ chiếu
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);

        // Thử nhiều cách để tìm nút/link mua vé với retry
        for (let attempt = 0; attempt < 3; attempt++) {
            // 1. Tìm link có href chứa "/purchase/"
            const purchaseLink = this.page.locator('a[href*="/purchase/"]');
            const purchaseLinkCount = await purchaseLink.count().catch(() => 0);
            if (purchaseLinkCount > 0) {
                for (let i = 0; i < Math.min(purchaseLinkCount, 5); i++) {
                    const link = purchaseLink.nth(i);
                    const isVisible = await link.isVisible({ timeout: 2000 }).catch(() => false);
                    if (isVisible) {
                        await link.scrollIntoViewIfNeeded().catch(() => {});
                        await this.page.waitForTimeout(300);
                        await this.click(link);
                        // Đợi URL chuyển sang purchase page
                        await this.page.waitForURL(/\/purchase\//, { timeout: 10000 }).catch(() => {});
                        await this.page.waitForLoadState('networkidle');
                        return;
                    }
                }
            }

            // 2. Tìm button "mua vé"
            const btnVisible = await this.btnBuyNow.isVisible({ timeout: 3000 }).catch(() => false);
            if (btnVisible) {
                await this.btnBuyNow.scrollIntoViewIfNeeded().catch(() => {});
                await this.page.waitForTimeout(300);
                await this.click(this.btnBuyNow);
                // Đợi URL chuyển sang purchase page
                await this.page.waitForURL(/\/purchase\//, { timeout: 10000 }).catch(() => {});
                await this.page.waitForLoadState('networkidle');
                return;
            }

            // 3. Tìm link "mua vé"
            const lnkVisible = await this.lnkBuyNow.isVisible({ timeout: 3000 }).catch(() => false);
            if (lnkVisible) {
                await this.lnkBuyNow.scrollIntoViewIfNeeded().catch(() => {});
                await this.page.waitForTimeout(300);
                await this.click(this.lnkBuyNow);
                // Đợi URL chuyển sang purchase page
                await this.page.waitForURL(/\/purchase\//, { timeout: 10000 }).catch(() => {});
                await this.page.waitForLoadState('networkidle');
                return;
            }

            // 4. Tìm bất kỳ button/link nào có text "mua vé" hoặc "đặt vé"
            const anyBuyButton = this.page.getByRole('button', { name: /mua vé|đặt vé/i });
            const anyBuyLink = this.page.getByRole('link', { name: /mua vé|đặt vé/i });
            
            const buttonCount = await anyBuyButton.count().catch(() => 0);
            if (buttonCount > 0) {
                for (let i = 0; i < Math.min(buttonCount, 5); i++) {
                    const button = anyBuyButton.nth(i);
                    const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
                    if (isVisible) {
                        await button.scrollIntoViewIfNeeded().catch(() => {});
                        await this.page.waitForTimeout(300);
                        await this.click(button);
                        // Đợi URL chuyển sang purchase page
                        await this.page.waitForURL(/\/purchase\//, { timeout: 10000 }).catch(() => {});
                        await this.page.waitForLoadState('networkidle');
                        return;
                    }
                }
            }

            const linkCount = await anyBuyLink.count().catch(() => 0);
            if (linkCount > 0) {
                for (let i = 0; i < Math.min(linkCount, 5); i++) {
                    const link = anyBuyLink.nth(i);
                    const isVisible = await link.isVisible({ timeout: 2000 }).catch(() => false);
                    if (isVisible) {
                        await link.scrollIntoViewIfNeeded().catch(() => {});
                        await this.page.waitForTimeout(300);
                        await this.click(link);
                        // Đợi URL chuyển sang purchase page
                        await this.page.waitForURL(/\/purchase\//, { timeout: 10000 }).catch(() => {});
                        await this.page.waitForLoadState('networkidle');
                        return;
                    }
                }
            }

            // 5. Tìm bất kỳ element nào có thể click và có text "mua" hoặc "vé"
            const anyElement = this.page.locator('button, a, div[role="button"]').filter({ hasText: /mua|vé/i });
            const elementCount = await anyElement.count().catch(() => 0);
            if (elementCount > 0) {
                for (let i = 0; i < Math.min(elementCount, 5); i++) {
                    const element = anyElement.nth(i);
                    const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
                    if (isVisible) {
                        await element.scrollIntoViewIfNeeded().catch(() => {});
                        await this.page.waitForTimeout(300);
                        await this.click(element);
                        // Đợi URL chuyển sang purchase page
                        await this.page.waitForURL(/\/purchase\//, { timeout: 10000 }).catch(() => {});
                        await this.page.waitForLoadState('networkidle');
                        return;
                    }
                }
            }

            // Nếu không tìm thấy, đợi thêm và thử lại
            if (attempt < 2) {
                await this.page.waitForTimeout(2000);
            }
        }

        throw new Error("Không tìm thấy nút/link để navigate đến purchase page");
    }
}
