import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { LogoutPage } from "../pages/LogoutPage";

test.describe("Logout Functional Test", () => {
  test("Valid Logout Test", async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const logoutPage = new LogoutPage(page);

    //Step 0: Navigate to homepage
    await homePage.navigateTo("https://demo1.cybersoft.edu.vn/");

    //Step 1: Login
    await homePage.topBarNavigation.navigateLoginPage();
    await loginPage.login("NhuDoan123", "123456@");

    //Step 2: Verify login success
    await expect(loginPage.getLoginMsgLocator()).toBeVisible();
    await expect(
      homePage.topBarNavigation.getUserProfileLocator("Đoàn Thị Huỳnh Như")
    ).toBeVisible();

    //Step 3: Logout directly via logout button/link
    await logoutPage.logout();

    //Step 4: Verify logout
    await expect(homePage.topBarNavigation.lnkLogin).toBeVisible();
  });

  test("Invalid Logout Test", async ({ page }) => {
    // Implement negative logout cases if needed
  });
});
