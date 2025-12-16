import { Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";

export class PurchasePage extends CommonPage {

    readonly btnShowtime = this.page.getByRole('button', { name: /giờ chiếu|suất/i });
    readonly btnSeat = this.page.locator("[class*='ghe']:not(.disabled):not([disabled])");
    readonly btnBook = this.page.getByRole('button', { name: /đặt vé/i }).first();
    readonly lblSuccessMsg = this.page.getByText(/đặt vé thành công|đặt vé thành công|thành công/i).first();

    // Seats: prefer non-disabled seat elements
    private readonly seatAvailableGroups: Locator[] = [
        // Selector đơn giản nhất - tìm bất kỳ element nào có class chứa "ghe" hoặc "seat"
        this.page.locator("[class*='ghe']"),
        this.page.locator("[class*='seat']"),
        this.page.locator("[class*='Ghe']"),
        this.page.locator("[class*='Seat']"),
        // Tìm button có class chứa ghe/seat
        this.page.locator("button[class*='ghe']"),
        this.page.locator("button[class*='seat']"),
        this.page.locator("button[class*='Ghe']"),
        this.page.locator("button[class*='Seat']"),
        // Tìm div có class chứa ghe/seat
        this.page.locator("div[class*='ghe']"),
        this.page.locator("div[class*='seat']"),
        this.page.locator("div[class*='Ghe']"),
        this.page.locator("div[class*='Seat']"),
        // Tìm span có class chứa ghe/seat
        this.page.locator("span[class*='ghe']"),
        this.page.locator("span[class*='seat']"),
        // Tìm trong container ghế
        this.page.locator("div[class*='ghe'] button"),
        this.page.locator("div[class*='seat'] button"),
        this.page.locator("div[class*='ghe'] > *"),
        this.page.locator("div[class*='seat'] > *"),
        // Tìm button trong seat-map hoặc seat-container
        this.page.locator("[class*='seat-map'] button"),
        this.page.locator("[class*='seat-container'] button"),
        this.page.locator("[class*='ghe-map'] button"),
        this.page.locator("[class*='ghe-container'] button"),
        // Tìm tất cả button có thể click được (fallback cuối cùng)
        this.page.locator("button:not([disabled])"),
        // Tìm div có role button
        this.page.locator("div[role='button']"),
        // Tìm bất kỳ element nào có thể click
        this.page.locator("[onclick]"),
    ];

    constructor(page: Page) {
        super(page);
    }

    getSuccessMsgLocator(): Locator {
        return this.lblSuccessMsg;
    }
    
    async waitForSuccessMessage(timeout: number = 10000): Promise<Locator> {
        // Thử nhiều selector để tìm success message
        const successSelectors = [
            this.page.getByText(/đặt vé thành công/i),
            this.page.getByText(/thành công/i),
            this.page.getByText(/success/i),
            this.page.locator("[class*='success']").first(),
            this.page.locator("[class*='thành-công']").first(),
            this.page.locator("[class*='thanh-cong']").first(),
            this.page.locator("div, span, p").filter({ hasText: /đặt vé thành công/i }).first(),
        ];
        
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            for (const selector of successSelectors) {
                try {
                    const isVisible = await selector.isVisible({ timeout: 1000 }).catch(() => false);
                    if (isVisible) {
                        return selector;
                    }
                } catch (e) {
                    continue;
                }
            }
            await this.page.waitForTimeout(100);
        }
        
        // Trả về locator mặc định nếu không tìm thấy
        return this.lblSuccessMsg;
    }

    async selectShowtime() {
        // Chọn giờ chiếu phim bất kì
        // Đợi trang load xong
        await this.page.waitForLoadState('networkidle');

        // Thử nhiều selector khác nhau để tìm giờ chiếu
        const showtimeSelectors = [
            // 1. Box/container chứa format "DD-MM-YYYY ~ HH:MM" (ưu tiên nhất)
            this.page.locator('*').filter({ hasText: /\d{1,2}-\d{1,2}-\d{4}\s*~\s*\d{1,2}:\d{2}/ }),
            // 2. Element chứa format "~ HH:MM" (có thể là box giờ chiếu)
            this.page.locator('*').filter({ hasText: /~\s*\d{1,2}:\d{2}/ }),
            // 3. Button có text chứa giờ (format: HH:MM)
            this.page.locator('button').filter({ hasText: /\d{1,2}:\d{2}/ }),
            // 4. Link có text chứa giờ
            this.page.locator('a').filter({ hasText: /\d{1,2}:\d{2}/ }),
            // 5. Div có role="button" và chứa giờ
            this.page.locator('div[role="button"]').filter({ hasText: /\d{1,2}:\d{2}/ }),
            // 6. Button với role và name
            this.page.getByRole('button', { name: /giờ chiếu|suất|time|showtime/i }),
            // 7. Button trong container có class chứa "showtime", "time", "schedule"
            this.page.locator('button[class*="showtime"], button[class*="time"], button[class*="schedule"]'),
            // 8. Div/span có thể click được chứa giờ
            this.page.locator('[class*="showtime"], [class*="time-slot"], [class*="schedule"]').filter({ hasText: /\d{1,2}:\d{2}/ }),
            // 9. Bất kỳ element nào có thể click và chứa giờ
            this.page.locator('button, a, div[role="button"], span[role="button"]').filter({ hasText: /\d{1,2}:\d{2}/ }),
            // 10. Tìm theo xpath - element chứa format "~ HH:MM"
            this.page.locator('//*[contains(text(), "~") and contains(text(), ":")]'),
            // 11. Tìm theo xpath - button chứa text giờ
            this.page.locator('//button[contains(text(), ":")]'),
            // 12. Tìm theo xpath - a tag chứa text giờ
            this.page.locator('//a[contains(text(), ":")]'),
            // 13. Tìm tất cả button trên trang
            this.page.locator('button'),
            // 14. Tìm tất cả link trên trang
            this.page.locator('a'),
        ];

        // Thử từng selector với retry
        for (let attempt = 0; attempt < 3; attempt++) {
            for (let selectorIndex = 0; selectorIndex < showtimeSelectors.length; selectorIndex++) {
                const selector = showtimeSelectors[selectorIndex];
                try {
                    // Đợi ít nhất một element xuất hiện với timeout dài hơn
                    await selector.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
                    
                    const count = await selector.count().catch(() => 0);
                    if (count === 0) continue;

                    // Tìm giờ chiếu đầu tiên có thể click được
                    for (let i = 0; i < Math.min(count, 50); i++) {
                        const showtime = selector.nth(i);
                        
                        // Kiểm tra text có phải là giờ không
                        const text = (await showtime.textContent().catch(() => "") || "").trim();
                        
                        // Kiểm tra text có phải là giờ chiếu
                        let isShowtime = false;
                        
                        // Format "DD-MM-YYYY ~ HH:MM" (ví dụ: 09-10-2021 ~ 02:40) - ưu tiên nhất
                        if (/\d{1,2}-\d{1,2}-\d{4}\s*~\s*\d{1,2}:\d{2}/.test(text)) {
                            isShowtime = true;
                        }
                        // Format "~ HH:MM" (ví dụ: ~ 02:40)
                        else if (/~\s*\d{1,2}:\d{2}/.test(text)) {
                            isShowtime = true;
                        }
                        // Format HH:MM (ví dụ: 06:30, 14:00)
                        else if (/\d{1,2}:\d{2}/.test(text)) {
                            isShowtime = true;
                        }
                        // Format số giờ (ví dụ: 06, 07, 11, 12, 13, 14, 15, 16, 17, 18)
                        else if (/^\d{1,2}$/.test(text)) {
                            const hour = parseInt(text);
                            // Giờ hợp lệ từ 0-23
                            if (hour >= 0 && hour <= 23) {
                                isShowtime = true;
                            }
                        }
                        // Bỏ qua các text không phải giờ chiếu
                        else if (/^[Xx]$/.test(text) || text.length > 50 || text === "") {
                            continue;
                        }
                        
                        // Nếu selector là tất cả button/link (selector 13, 14), chỉ chấp nhận nếu là giờ chiếu
                        if (selectorIndex >= 13 && !isShowtime) {
                            continue;
                        }
                        // Nếu selector khác, chỉ chấp nhận nếu có format giờ
                        else if (selectorIndex < 13 && !isShowtime) {
                            continue;
                        }
                        
                        const isVisible = await showtime.isVisible({ timeout: 2000 }).catch(() => false);
                        if (!isVisible) {
                            // Thử scroll để thấy element
                            await showtime.scrollIntoViewIfNeeded().catch(() => {});
                            await this.page.waitForTimeout(100);
                            const isVisibleAfterScroll = await showtime.isVisible({ timeout: 1000 }).catch(() => false);
                            if (!isVisibleAfterScroll) continue;
                        }
                        
                        const isEnabled = await showtime.isEnabled().catch(() => true);
                        const isDisabled = await showtime.getAttribute('disabled').catch(() => null);
                        
                        if (isEnabled && !isDisabled) {
                            await showtime.scrollIntoViewIfNeeded().catch(() => {});
                            await this.click(showtime);
                            // Đợi trang cập nhật sau khi click
                            await this.page.waitForLoadState('networkidle').catch(() => {});
                            return;
                        }
                    }
                } catch (e) {
                    // Tiếp tục thử selector tiếp theo
                    continue;
                }
            }
            
            // Nếu không tìm thấy, đợi thêm và thử lại
            if (attempt < 2) {
                await this.page.waitForLoadState('networkidle').catch(() => {});
            }
        }

        // Fallback: Thử lại với selector gốc
        try {
            await this.btnShowtime.first().waitFor({ state: 'visible', timeout: 5000 });
            const showtimeCount = await this.btnShowtime.count();
            if (showtimeCount > 0) {
                const firstShowtime = this.btnShowtime.first();
                await firstShowtime.scrollIntoViewIfNeeded().catch(() => {});
                await this.click(firstShowtime);
                await this.page.waitForLoadState('networkidle').catch(() => {});
                return;
            }
        } catch (e) {
            // Tiếp tục
        }

        throw new Error("Không tìm thấy giờ chiếu nào");
    }

    async selectSeat() {
        // Chọn ghế thường hoặc ghế VIP bất kì
        await this.page.waitForLoadState('networkidle');
        // Đợi ghế render - đợi ít nhất một ghế xuất hiện
        await this.page.locator("[class*='ghe'], [class*='seat']").first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
        
        const maxAttempts = 5; // Tăng số lần thử
        const startTime = Date.now();
        const maxTime = 60000; // Tăng timeout lên 60 giây

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Kiểm tra timeout tổng thể
            if (Date.now() - startTime > maxTime) {
                break;
            }

            // Wait for any seat group to appear
            for (let groupIndex = 0; groupIndex < this.seatAvailableGroups.length; groupIndex++) {
                // Kiểm tra timeout tổng thể
                if (Date.now() - startTime > maxTime) {
                    break;
                }

                const group = this.seatAvailableGroups[groupIndex];
                try {
                    // Đợi element xuất hiện với timeout dài hơn
                    await group.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
                } catch (e) {
                    continue;
                }
                const count = await group.count().catch(() => 0);
                if (!count) continue;

                // Try first N seats to find an available one (tăng lên 100)
                const tryCount = Math.min(100, count);
                for (let i = 0; i < tryCount; i++) {
                    // Kiểm tra timeout tổng thể
                    if (Date.now() - startTime > maxTime) {
                        break;
                    }

                    const seatCandidate = group.nth(i);
                    const attached = await seatCandidate.waitFor({ state: 'attached', timeout: 1000 }).then(() => true).catch(() => false);
                    if (!attached) continue;

                    const text = (await seatCandidate.textContent().catch(() => "")) || "";
                    // Bỏ qua ghế đã đặt, hết - chỉ bỏ qua nếu text rõ ràng
                    // Bỏ qua text "X" (có thể là ghế đã đặt)
                    if (text && /^(hết|đã đặt|reserved|full|sold|x)$/i.test(text)) continue;
                    
                    // Kiểm tra class để xác định loại ghế
                    const className = await seatCandidate.getAttribute('class').catch(() => "") || "";
                    // Bỏ qua ghế bị disabled (chỉ nếu class có disabled rõ ràng)
                    if (className && /(^|\s)disabled(\s|$)/i.test(className)) continue;

                    const isDisabled = await seatCandidate.getAttribute('disabled').catch(() => null);
                    // Chỉ bỏ qua nếu rõ ràng là disabled
                    if (isDisabled !== null) continue;
                    
                    // Kiểm tra aria-disabled
                    const ariaDisabled = await seatCandidate.getAttribute('aria-disabled').catch(() => null);
                    if (ariaDisabled === 'true') continue;

                    const visible = await seatCandidate.isVisible({ timeout: 1000 }).catch(() => false);
                    if (!visible) {
                        await seatCandidate.scrollIntoViewIfNeeded().catch(() => {});
                        const isVisibleAfterScroll = await seatCandidate.isVisible({ timeout: 500 }).catch(() => false);
                        if (!isVisibleAfterScroll) continue;
                    }

                    // Click vào ghế
                    await seatCandidate.scrollIntoViewIfNeeded().catch(() => {});
                    try {
                        await seatCandidate.click({ force: true, timeout: 5000 });
                        return;
                    } catch (clickError) {
                        continue;
                    }
                }
            }

            // small wait then retry
            if (attempt < maxAttempts - 1) {
                // Đợi thêm để trang có thể load thêm elements
                await this.page.waitForLoadState('networkidle').catch(() => {});
            }
        }

        // Trước khi throw error, thử tìm bất kỳ element nào có thể là ghế
        // Tìm các element có thể là ghế (có class chứa "ghe" hoặc "seat", hoặc nằm trong container ghế)
        const allPossibleSeats = this.page.locator("button[class*='ghe'], button[class*='seat'], div[role='button'][class*='ghe'], div[role='button'][class*='seat'], [onclick][class*='ghe'], [onclick][class*='seat']");
        const allCount = await allPossibleSeats.count().catch(() => 0);
        
        if (allCount > 0) {
            // Thử click vào các element có thể là ghế
            const maxTry = Math.min(20, allCount);
            for (let i = 0; i < maxTry; i++) {
                const seat = allPossibleSeats.nth(i);
                const text = (await seat.textContent().catch(() => "") || "").trim();
                const className = await seat.getAttribute('class').catch(() => "") || "";
                
                // Bỏ qua nếu text là "đặt vé", "book", hoặc các text không phải ghế
                if (text && /^(đặt vé|book|book ticket|mua vé|buy)$/i.test(text)) continue;
                
                // Bỏ qua nếu disabled
                const isDisabled = await seat.getAttribute('disabled').catch(() => null);
                if (isDisabled !== null) continue;
                
                const isVisible = await seat.isVisible({ timeout: 1000 }).catch(() => false);
                if (isVisible) {
                    try {
                        await seat.scrollIntoViewIfNeeded().catch(() => {});
                        await seat.click({ force: true, timeout: 5000 });
                        return;
                    } catch (e) {
                        continue;
                    }
                }
            }
        }
        
        // Fallback cuối cùng: tìm bất kỳ button nào (nhưng ưu tiên các button nhỏ, có thể là ghế)
        const fallbackButtons = this.page.locator("button:not([disabled])");
        const fallbackCount = await fallbackButtons.count().catch(() => 0);
        
        if (fallbackCount > 0) {
            // Thử click vào button nhỏ (có thể là ghế)
            const maxTry = Math.min(30, fallbackCount);
            for (let i = 0; i < maxTry; i++) {
                const button = fallbackButtons.nth(i);
                const text = (await button.textContent().catch(() => "") || "").trim();
                
                // Bỏ qua các button có text rõ ràng không phải ghế
                if (text && /^(đặt vé|book|book ticket|mua vé|buy|login|đăng nhập|register|đăng ký)$/i.test(text)) continue;
                
                const isVisible = await button.isVisible({ timeout: 1000 }).catch(() => false);
                if (isVisible) {
                    try {
                        // Kiểm tra kích thước - ghế thường nhỏ
                        const box = await button.boundingBox().catch(() => null);
                        if (box && (box.width > 200 || box.height > 100)) {
                            // Button quá lớn, có thể không phải ghế
                            continue;
                        }
                        
                        await button.scrollIntoViewIfNeeded().catch(() => {});
                        await button.click({ force: true, timeout: 5000 });
                        return;
                    } catch (e) {
                        continue;
                    }
                }
            }
        }

        throw new Error("Không tìm thấy ghế thường hoặc ghế VIP nào");
    }

    async clickBookTicket() {
        // Nhấn đặt vé
        await this.page.waitForLoadState('networkidle');
        
        // Thử nhiều cách để tìm nút "Đặt vé"
        const bookButtonSelectors = [
            // 1. Button với text "đặt vé"
            this.page.getByRole('button', { name: /đặt vé/i }),
            // 2. Button với text "book" hoặc "book ticket"
            this.page.getByRole('button', { name: /book/i }),
            // 3. Link với text "đặt vé"
            this.page.getByRole('link', { name: /đặt vé/i }),
            // 4. Button có class chứa "book" hoặc "dat-ve"
            this.page.locator("button[class*='book'], button[class*='dat-ve'], button[class*='datve']"),
            // 5. Button có id chứa "book" hoặc "dat-ve"
            this.page.locator("button[id*='book'], button[id*='dat-ve'], button[id*='datve']"),
            // 6. Tìm button có text chứa "đặt" hoặc "vé"
            this.page.locator("button").filter({ hasText: /đặt|vé/i }),
        ];

        for (let i = 0; i < bookButtonSelectors.length; i++) {
            try {
                const button = bookButtonSelectors[i];
                const count = await button.count().catch(() => 0);
                if (count > 0) {
                    const firstButton = button.first();
                    const isVisible = await firstButton.isVisible({ timeout: 3000 }).catch(() => false);
                    if (isVisible) {
                        await firstButton.scrollIntoViewIfNeeded().catch(() => {});
                        await this.click(firstButton);
                        // Đợi sau khi click để message hiển thị
                        await this.page.waitForLoadState('networkidle').catch(() => {});
                        return;
                    }
                }
            } catch (e) {
                continue;
            }
        }

        // Fallback: thử click vào btnBook gốc
        try {
            await this.btnBook.waitFor({ state: 'visible', timeout: 5000 });
            await this.click(this.btnBook);
            await this.page.waitForLoadState('networkidle').catch(() => {});
        } catch (e) {
            throw new Error("Không tìm thấy nút 'Đặt vé'");
        }
    }

    async purchaseTicket() {
        // Tại màn hình purchase (giờ chiếu đã được chọn ở detail page)
        // Đợi trang load xong
        await this.page.waitForLoadState('networkidle');
        
        // Step 1: Chọn ghế thường hoặc ghế VIP bất kì
        await this.selectSeat();
        // Step 2: Nhấn đặt vé
        await this.clickBookTicket();
    }

    async getSuccessMessage(): Promise<string | null> {
        return await this.getText(this.lblSuccessMsg);
    }
}

