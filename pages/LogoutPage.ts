import { Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";

export class LogoutPage extends CommonPage {

    readonly btnLogout = this.page.getByRole('button', { name: 'Đăng xuất' });
    readonly lnkLogout = this.page.getByRole('link', { name: 'Đăng xuất' }).first();
    readonly lblLogoutMsg = this.page.getByRole('heading', { name: 'Đăng xuất thành công' });
    readonly btnConfirmLogout = this.page.getByRole('button', { name: 'Đồng ý' });
    readonly btnCancelLogout = this.page.getByRole('button', { name: 'Hủy' });

    constructor(page: Page) {
        super(page);
    }

    getLogoutMsgLocator(): Locator {
        return this.lblLogoutMsg;
    }

    async clickLogout() {
        // Ưu tiên button, sau đó tới link
        if (await this.btnLogout.isVisible().catch(() => false)) {
            await this.btnLogout.click({ force: true });
            return;
        }

        await this.lnkLogout.waitFor({ state: 'visible' });
        await this.lnkLogout.click({ force: true });
    }

    async confirmLogout() {
        await this.btnConfirmLogout.waitFor({ state: 'visible' });
        await this.btnConfirmLogout.click();
    }

    async cancelLogout() {
        await this.btnCancelLogout.waitFor({ state: 'visible' });
        await this.btnCancelLogout.click();
    }

    async logout() {
        await this.clickLogout();
        await this.confirmLogout();
        await this.topBarNavigation.lnkLogin.waitFor({ state: 'visible' });
    }

    async getLogoutMessage(): Promise<string | null> {
        return await this.getText(this.lblLogoutMsg);
    }
}

