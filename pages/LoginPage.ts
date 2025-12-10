import { Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";

export class LoginPage extends CommonPage {

    readonly txtAccountLogin = this.page.getByRole('textbox', { name: 'Tài Khoản' });
    readonly txtPasswordLogin = this.page.getByRole('textbox', { name: 'Mật Khẩu' });
    readonly btnLogin = this.page.getByRole('button', { name: 'Đăng nhập' });
    readonly lblLoginMsg = this.page.getByRole('heading', { name: 'Đăng nhập thành công' });

    constructor(page: Page) {
        super(page);
    }

    getLoginMsgLocator(): Locator {
        return this.lblLoginMsg;
    }

    async enterUserName(value: string) {
        await this.fill(this.txtAccountLogin, value);
    }

    async enterPassword(value: string) {
        await this.fill(this.txtPasswordLogin, value)
    }

    async clickLogin() {
        await this.click(this.btnLogin);
    }

    async login(userName: string, password: string) {
        await this.enterUserName(userName);
        await this.enterPassword(password);
        await this.click(this.btnLogin);
    }

    async getLoginMessage(): Promise<string | null> {
        return await this.getText(this.lblLoginMsg)
    }

}