import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { RegisterPage } from "../pages/RegisterPage";

test.describe("Register Functional Test", () => {
  test("Valid Register Test", async ({ page }) => {
    let homePage = new HomePage(page);
    let registerPage = new RegisterPage(page);

    //Step 0: Navigate to homepage
    await homePage.navigateTo("https://demo1.cybersoft.edu.vn/");
    
    // Wait to see homepage
    await page.waitForTimeout(2000);

    //Step 1: Click Dang Ky
    await homePage.topBarNavigation.navigateRegisterPage();
    
    // Wait for register page to load
    await page.waitForTimeout(3000);

    //Step 2: Enter account
    //Step 3: Enter password
    //Step 4: Enter confirm password
    //Step 5: Enter email
    //Step 6: Enter full name
    //Step 7: Click Dang Ky
    const timestamp = Date.now();
    const account = `TestAccount${timestamp}`;
    const password = "Test123456@";
    const email = `test${timestamp}@example.com`;
    const fullName = "Test User";

    await registerPage.register(
      account,
      password,
      password,
      email,
      fullName
    );

    //Step 8: Verify register successfully
    //VP1: "Dang ky thanh cong" message display
    await expect(registerPage.getRegisterMsgLocator()).toBeVisible();

    //Step 9: Navigate to login page after successful registration
    await registerPage.navigateToLoginAfterRegister();
    
    //Step 10: Verify we are on login page
    //VP2: Login page should be displayed
    const loginButton = page.getByRole('button', { name: 'Đăng nhập' });
    await expect(loginButton).toBeVisible();
  });

  test("Invalid Register Test", async ({ page }) => {
    //Implement invalid register test cases
  });
});
