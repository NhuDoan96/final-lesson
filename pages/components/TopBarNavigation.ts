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
        await this.getUserProfileLocator(userName).waitFor({ state: 'visible' });
        await this.click(this.getUserProfileLocator(userName));
    }

    async logout(userName: string) {
        // Try clicking the visible logout button directly (some pages show it without menu)
        try {
            await this.btnLogout.waitFor({ state: 'visible' });
            await this.btnLogout.click({ force: true });
        } catch {
            // If button not visible, open profile menu and try again
            await this.openUserProfile(userName);
            try {
                await this.btnLogout.waitFor({ state: 'visible' });
                await this.btnLogout.click({ force: true });
            } catch {
                // Fallback to logout link
                await this.lnkLogout.waitFor({ state: 'visible' });
                await this.lnkLogout.click({ force: true });
            }
        }

        // Confirm logout by waiting for login link
        await this.lnkLogin.waitFor({ state: 'visible' });
    }

    async openMenuItem(item: string) {
        // String menuItemXpath = String.format(menuItem, item); // Java
        let menuItemXpath: string = this.menuItem.replace('%s', item); // String locator
        // this.page.locator(menuItemXpath).click(); // Locator tuong ung voi WebElement
        this.click(menuItemXpath); //goi click cua BasePage
    }
}