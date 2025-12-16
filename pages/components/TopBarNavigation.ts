import { Locator, Page } from "@playwright/test";
import { BasePage } from "../BasePage";

export class TopBarNavigation extends BasePage {

    readonly lnkLogin = this.page.locator("//h3[text()='Đăng Nhập']");
    readonly lnkRegister = this.page.locator("//a[@href='/sign-up']");
    readonly lnkLogout = this.page
        .locator("//a[text()='Đăng xuất']")
        .or(this.page.getByRole('link', { name: 'Đăng xuất' }))
        .first();
    readonly btnLogout = this.page
        .getByRole('button', { name: 'Đăng xuất' })
        .first();
    readonly btnBuyNow = this.page.getByRole('button', { name: /mua vé/i }).first();
    readonly lnkBuyNow = this.page.getByRole('link', { name: /mua vé/i }).first();
    readonly detailLink = this.page.locator("a[href*='/detail'], a[href*='/movie'], a[href*='/phim']").first();
    readonly showtimeButton = this.page.getByRole('button', { name: /giờ chiếu|suất|mua|chọn ghế|đặt vé/i }).first();
    readonly menuItem = "//div[@text='%s']"; //xpath string dynamic
    readonly userProfile = "Avatar %s";

    constructor(page: Page) {
        super(page);
    }

    getUserProfileLocator(userName: string): Locator {
        let expectedUserProfile = this.userProfile.replace('%s', userName);
        return this.page.getByRole('link', { name: `${expectedUserProfile}` })
    }

    async navigateLoginPage() {
        await this.click(this.lnkLogin);
    }

    async navigateRegisterPage() {
        await this.click(this.lnkRegister);
    }

    async navigatePurchaseFromHome() {
        // Try button first, then link
        if (await this.btnBuyNow.isVisible().catch(() => false)) {
            await this.click(this.btnBuyNow);
            return;
        }
        await this.click(this.lnkBuyNow);
    }

    async navigateDetailFromHome() {
        const hasDetail = await this.detailLink.isVisible().catch(() => false);
        if (hasDetail) {
            await this.detailLink.click({ force: true });
            return;
        }
        await this.navigatePurchaseFromHome();
    }

    async selectShowtimeOnDetail() {
        if (await this.showtimeButton.isVisible().catch(() => false)) {
            await this.showtimeButton.click({ force: true });
            return;
        }
        if (await this.btnBuyNow.isVisible().catch(() => false)) {
            await this.btnBuyNow.click({ force: true });
            return;
        }
        await this.lnkBuyNow.click({ force: true });
    }

    async openUserProfile(userName: string) {
        const userProfileLocator = this.getUserProfileLocator(userName);
        await userProfileLocator.waitFor({ state: 'visible', timeout: 10000 });
        await this.click(userProfileLocator);
    }

    async logout(userName: string) {
        // Đợi trang load xong trước khi logout
        await this.page.waitForLoadState('networkidle').catch(() => {});
        
        // Try clicking the visible logout button directly (some pages show it without menu)
        const btnLogoutVisible = await this.btnLogout.isVisible({ timeout: 3000 }).catch(() => false);
        if (btnLogoutVisible) {
            await this.btnLogout.click({ force: true });
            // Tự động nhấn "Đồng ý" nếu có popup xác nhận
            await this.confirmLogoutIfNeeded();
            // Đợi trang reload sau khi logout
            await this.page.waitForLoadState('networkidle').catch(() => {});
            // Confirm logout - thử nhiều cách tìm link đăng nhập
            await this.waitForLoginLink();
            return;
        }

        // If button not visible, try to find logout link directly
        const lnkLogoutVisible = await this.lnkLogout.isVisible({ timeout: 3000 }).catch(() => false);
        if (lnkLogoutVisible) {
            await this.lnkLogout.click({ force: true });
            // Tự động nhấn "Đồng ý" nếu có popup xác nhận
            await this.confirmLogoutIfNeeded();
            // Đợi trang reload sau khi logout
            await this.page.waitForLoadState('networkidle').catch(() => {});
            // Confirm logout
            await this.waitForLoginLink();
            return;
        }

        // If neither button nor link is visible, open profile menu and try again
        try {
            await this.openUserProfile(userName);
            // Đợi một chút để menu mở
            await this.page.waitForTimeout(500);
            
            // Thử button logout sau khi mở menu
            const btnVisibleAfterMenu = await this.btnLogout.isVisible({ timeout: 3000 }).catch(() => false);
            if (btnVisibleAfterMenu) {
                await this.btnLogout.click({ force: true });
                // Tự động nhấn "Đồng ý" nếu có popup xác nhận
                await this.confirmLogoutIfNeeded();
                await this.page.waitForLoadState('networkidle').catch(() => {});
                await this.waitForLoginLink();
                return;
            }
            
            // Thử link logout sau khi mở menu
            const lnkVisibleAfterMenu = await this.lnkLogout.isVisible({ timeout: 3000 }).catch(() => false);
            if (lnkVisibleAfterMenu) {
                await this.lnkLogout.click({ force: true });
                // Tự động nhấn "Đồng ý" nếu có popup xác nhận
                await this.confirmLogoutIfNeeded();
                await this.page.waitForLoadState('networkidle').catch(() => {});
                await this.waitForLoginLink();
                return;
            }
        } catch (e) {
            // Nếu không thể mở profile, thử tìm logout bằng cách khác
        }

        // Fallback: Tìm bất kỳ element nào có text "Đăng xuất"
        const anyLogout = this.page.getByRole('button', { name: 'Đăng xuất' })
            .or(this.page.getByRole('link', { name: 'Đăng xuất' }))
            .first();
        const anyLogoutVisible = await anyLogout.isVisible({ timeout: 3000 }).catch(() => false);
        if (anyLogoutVisible) {
            await anyLogout.click({ force: true });
            // Tự động nhấn "Đồng ý" nếu có popup xác nhận
            await this.confirmLogoutIfNeeded();
            await this.page.waitForLoadState('networkidle').catch(() => {});
            await this.waitForLoginLink();
            return;
        }

        throw new Error("Không tìm thấy nút/link đăng xuất");
    }

    private async confirmLogoutIfNeeded() {
        // Kiểm tra và nhấn nút "Đồng ý" nếu có popup xác nhận đăng xuất
        const confirmSelectors = [
            this.page.getByRole('button', { name: 'Đồng ý' }),
            this.page.getByRole('button', { name: /đồng ý/i }),
            this.page.getByRole('button', { name: 'OK' }),
            this.page.getByRole('button', { name: /ok/i }),
            this.page.locator("//button[contains(text(), 'Đồng ý')]"),
            this.page.locator("//button[contains(text(), 'đồng ý')]"),
            this.page.locator("//button[contains(text(), 'OK')]"),
            this.page.locator("//button[contains(text(), 'ok')]"),
        ];

        for (const selector of confirmSelectors) {
            try {
                const isVisible = await selector.isVisible({ timeout: 3000 }).catch(() => false);
                if (isVisible) {
                    await selector.click();
                    // Đợi popup đóng
                    await this.page.waitForTimeout(500);
                    return;
                }
            } catch (e) {
                continue;
            }
        }
    }

    private async waitForLoginLink() {
        // Thử nhiều cách tìm link đăng nhập
        const loginSelectors = [
            this.lnkLogin,
            this.page.getByRole('link', { name: 'Đăng nhập' }),
            this.page.getByRole('link', { name: /đăng nhập/i }),
            this.page.locator("//h3[text()='Đăng Nhập']"),
            this.page.locator("//a[contains(text(), 'Đăng nhập')]"),
            this.page.locator("//a[contains(text(), 'Đăng Nhập')]"),
        ];

        for (const selector of loginSelectors) {
            try {
                await selector.waitFor({ state: 'visible', timeout: 5000 });
                return;
            } catch (e) {
                continue;
            }
        }
        
        // Nếu không tìm thấy, đợi trang load và thử lại
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await this.lnkLogin.waitFor({ state: 'visible', timeout: 10000 });
    }

    async openMenuItem(item: string) {
        // String menuItemXpath = String.format(menuItem, item); // Java
        let menuItemXpath: string = this.menuItem.replace('%s', item); // String locator
        // this.page.locator(menuItemXpath).click(); // Locator tuong ung voi WebElement
        this.click(menuItemXpath); //goi click cua BasePage
    }
}