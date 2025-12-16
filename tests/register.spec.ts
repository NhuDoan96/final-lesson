import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { RegisterPage } from "../pages/RegisterPage";

test.describe("Register Functional Test", () => {
  test("Valid Register Test", async ({ page }) => {
    let homePage = new HomePage(page);
    let registerPage = new RegisterPage(page);

    //Step 0: Navigate to homepage
    await homePage.navigateTo("https://demo1.cybersoft.edu.vn/");

    //Step 1: Click Dang Ky
    await homePage.topBarNavigation.navigateRegisterPage();

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
    //VP1: Popup "Đăng ký thành công" message display
    const successMsgLocator = await registerPage.waitForRegisterMessage(15000);
    await expect(successMsgLocator).toBeVisible();
  });

  test("Invalid Register Test", async ({ page }) => {
    //Implement invalid register test cases
  });
});
