import { Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";

export class RegisterPage extends CommonPage {

    readonly txtAccountRegister = this.page.getByRole('textbox', { name: 'Tài Khoản' });
    readonly txtPasswordRegister = this.page.locator('#matKhau');
    readonly txtConfirmPassword = this.page.locator('#confirmPassWord');
    readonly txtFullName = this.page.getByRole('textbox', { name: 'Họ Tên' });
    readonly txtEmail = this.page.getByRole('textbox', { name: 'Email' });
    readonly btnRegister = this.page.getByRole('button', { name: 'Đăng ký' });
    readonly lblRegisterMsg = this.page.getByText(/đăng ký thành công/i).first();
    readonly popupRegisterMsg = this.page.locator('[role="dialog"], [role="alertdialog"], .modal, .popup, .dialog, .toast, .notification').filter({ hasText: /đăng ký thành công/i }).first();

    constructor(page: Page) {
        super(page);
    }

    getRegisterMsgLocator(): Locator {
        // Ưu tiên trả về popup, nếu không có thì trả về text thông thường
        return this.popupRegisterMsg;
    }

    async waitForRegisterMessage(timeout: number = 10000): Promise<Locator> {
        // Thử nhiều selector để tìm popup/modal thông báo đăng ký thành công
        const successSelectors = [
            // Tìm popup/modal/dialog trước
            this.page.locator('[role="dialog"]').filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator('[role="alertdialog"]').filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator('.modal').filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator('.popup').filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator('.dialog').filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator('.toast').filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator('.notification').filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator('.alert').filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator('[class*="modal"]').filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator('[class*="popup"]').filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator('[class*="dialog"]').filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator('[class*="toast"]').filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator('[class*="notification"]').filter({ hasText: /đăng ký thành công/i }).first(),
            // Tìm text trong popup
            this.page.locator('[role="dialog"], [role="alertdialog"], .modal, .popup, .dialog, .toast, .notification').getByText(/đăng ký thành công/i).first(),
            // Tìm text thông thường (fallback)
            this.page.getByText(/đăng ký thành công/i).first(),
            this.page.getByText(/dang ky thanh cong/i).first(),
            this.page.getByText(/thành công/i).first(),
            this.page.getByRole('heading', { name: /đăng ký thành công/i }),
            this.page.locator("[class*='success']").filter({ hasText: /đăng ký thành công/i }).first(),
            this.page.locator("[class*='thành-công']").first(),
            this.page.locator("[class*='thanh-cong']").first(),
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
        return this.popupRegisterMsg;
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
        await this.enterAccount(account);
        await this.enterPassword(password);
        await this.enterConfirmPassword(confirmPassword);
        await this.enterFullName(fullName);
        await this.enterEmail(email);
        
        // Lưu URL hiện tại trước khi click đăng ký
        const currentUrl = this.page.url();
        
        await this.click(this.btnRegister);
        
        // Chờ popup thông báo đăng ký thành công hiển thị
        const successMsgLocator = await this.waitForRegisterMessage(15000);
        await successMsgLocator.waitFor({ state: 'visible', timeout: 10000 });
        
        // Đợi popup hiển thị ổn định
        await successMsgLocator.waitFor({ state: 'visible' });
    }
    
    async registerAndNavigateToLogin(account: string, password: string, confirmPassword: string, email: string, fullName: string) {
        // Đăng ký
        await this.register(account, password, confirmPassword, email, fullName);
        
        // Tự động chuyển sang màn hình login
        await this.navigateToLoginAfterRegister();
    }

    async getRegisterMessage(): Promise<string | null> {
        return await this.getText(this.lblRegisterMsg);
    }

    async navigateToLoginAfterRegister() {
        // Wait for popup register success message to be visible
        const successMsgLocator = await this.waitForRegisterMessage(15000);
        await successMsgLocator.waitFor({ state: 'visible', timeout: 10000 });
        
        // Đợi popup hiển thị đầy đủ
        await successMsgLocator.waitFor({ state: 'visible' });
        
        // Wait for page to be stable
        await this.page.waitForLoadState('networkidle');
        
        // Ưu tiên navigate trực tiếp bằng URL (an toàn nhất)
        try {
            await this.page.goto("https://demo1.cybersoft.edu.vn/login", { waitUntil: 'networkidle' });
        } catch {
            // Nếu navigate bằng URL fail, thử click link
            try {
                // Try to find login link by text
                const loginLinkByText = this.page.locator("//a[contains(text(), 'Đăng nhập')]");
                if (await loginLinkByText.isVisible().catch(() => false)) {
                    await loginLinkByText.scrollIntoViewIfNeeded();
                    await loginLinkByText.click();
                } else {
                    // Try to find login link by role
                    const loginLinkByRole = this.page.getByRole('link', { name: 'Đăng nhập' });
                    if (await loginLinkByRole.isVisible().catch(() => false)) {
                        await loginLinkByRole.scrollIntoViewIfNeeded();
                        await loginLinkByRole.click();
                    } else {
                        // Fallback: try using top bar navigation
                        await this.topBarNavigation.navigateLoginPage();
                    }
                }
            } catch {
                // Nếu tất cả đều fail, thử navigate lại bằng URL
                await this.page.goto("https://demo1.cybersoft.edu.vn/login", { waitUntil: 'domcontentloaded' });
            }
        }
        
        // Wait for login page to load
        await this.page.waitForLoadState('networkidle');
        
        // Verify we are on login page by checking for login form elements
        const loginButton = this.page.getByRole('button', { name: 'Đăng nhập' });
        await loginButton.waitFor({ state: 'visible' });
    }
    
    async isLoginPageDisplayed(): Promise<boolean> {
        // Kiểm tra xem màn hình login đã hiển thị chưa
        try {
            const loginButton = this.page.getByRole('button', { name: 'Đăng nhập' });
            const txtAccount = this.page.getByRole('textbox', { name: 'Tài Khoản' });
            const txtPassword = this.page.getByRole('textbox', { name: 'Mật Khẩu' });
            
            const hasLoginButton = await loginButton.isVisible().catch(() => false);
            const hasAccountField = await txtAccount.isVisible().catch(() => false);
            const hasPasswordField = await txtPassword.isVisible().catch(() => false);
            
            // Kiểm tra URL có chứa /login không
            const currentURL = this.page.url();
            const isLoginURL = currentURL.includes('/login');
            
            return (hasLoginButton && hasAccountField && hasPasswordField) || isLoginURL;
        } catch {
            return false;
        }
    }
    
    getLoginPageLocator(): Locator {
        // Trả về locator của button Đăng nhập để verify
        return this.page.getByRole('button', { name: 'Đăng nhập' });
    }

}

