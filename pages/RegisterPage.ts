import { Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";

export class RegisterPage extends CommonPage {

    readonly txtAccountRegister = this.page.getByRole('textbox', { name: 'Tài Khoản' });
    readonly txtPasswordRegister = this.page.locator('#matKhau');
    readonly txtConfirmPassword = this.page.locator('#confirmPassWord');
    readonly txtFullName = this.page.getByRole('textbox', { name: 'Họ Tên' });
    readonly txtEmail = this.page.getByRole('textbox', { name: 'Email' });
    readonly btnRegister = this.page.getByRole('button', { name: 'Đăng ký' });
    readonly lblRegisterMsg = this.page.getByRole('heading', { name: 'Đăng ký thành công' });

    constructor(page: Page) {
        super(page);
    }

    getRegisterMsgLocator(): Locator {
        return this.lblRegisterMsg;
    }

    async enterAccount(value: string) {
        await this.txtAccountRegister.waitFor({ state: 'visible' });
        await this.fill(this.txtAccountRegister, value);
    }

    async enterPassword(value: string) {
        await this.txtPasswordRegister.waitFor({ state: 'visible' });
        await this.fill(this.txtPasswordRegister, value);
    }

    async enterConfirmPassword(value: string) {
        await this.txtConfirmPassword.waitFor({ state: 'visible' });
        await this.fill(this.txtConfirmPassword, value);
    }
    async enterFullName(value: string) {
        await this.txtFullName.waitFor({ state: 'visible' });
        await this.fill(this.txtFullName, value);
    }

    async enterEmail(value: string) {
        await this.txtEmail.waitFor({ state: 'visible' });
        await this.fill(this.txtEmail, value);
    }

 
    async clickRegister() {
        await this.click(this.btnRegister);
    }

    async register(account: string, password: string, confirmPassword: string, email: string, fullName: string) {
        // Wait a bit before starting to fill form
        await this.page.waitForTimeout(2000);
        
        await this.enterAccount(account);
        await this.page.waitForTimeout(1000);
        
        await this.enterPassword(password);
        await this.page.waitForTimeout(1000);
        
        await this.enterConfirmPassword(confirmPassword);
        await this.page.waitForTimeout(1000);
        
        await this.enterFullName(fullName);
        await this.page.waitForTimeout(1000);
        
        await this.enterEmail(email);
        
        // Wait 5 seconds after filling all fields to review
        await this.page.waitForTimeout(5000);
        
        await this.click(this.btnRegister);
    }

    async getRegisterMessage(): Promise<string | null> {
        return await this.getText(this.lblRegisterMsg);
    }

    async navigateToLoginAfterRegister() {
        // Wait for register success message to be visible
        await this.lblRegisterMsg.waitFor({ state: 'visible' });
        
        // Wait 2 seconds to see success message
        await this.page.waitForTimeout(2000);
        
        // Try to click on login link if available, otherwise navigate to login page
        try {
            // Try to find login link by text
            const loginLinkByText = this.page.locator("//a[contains(text(), 'Đăng nhập')]");
            await loginLinkByText.waitFor({ state: 'visible' });
            await this.click(loginLinkByText);
        } catch {
            try {
                // Try to find login link by role
                const loginLinkByRole = this.page.getByRole('link', { name: 'Đăng nhập' });
                await loginLinkByRole.waitFor({ state: 'visible' });
                await this.click(loginLinkByRole);
            } catch {
                // If no login link found, navigate to login page directly using top bar
                await this.topBarNavigation.navigateLoginPage();
            }
        }
        
        // Wait for login page to load
        await this.page.waitForTimeout(2000);
        
        // Verify we are on login page by checking for login form elements
        const loginButton = this.page.getByRole('button', { name: 'Đăng nhập' });
        await loginButton.waitFor({ state: 'visible' });
    }

}

