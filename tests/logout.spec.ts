import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";

test.describe("Logout Functional Test", () => {
  test("Valid Logout Test", async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    //Step 0: Navigate to homepage
    await homePage.navigateTo("https://demo1.cybersoft.edu.vn/");

    //Step 1: Click Đăng Nhập
    await homePage.topBarNavigation.navigateLoginPage();

    //Step 2: Enter username
    //Step 3: Enter password
    //Step 4: Click Đăng nhập
    await loginPage.login("NhuDoan123", "123456@");

    //Step 5: Verify login successfully
    //VP1: "Đăng nhập thành công" message display
    await expect(loginPage.getLoginMsgLocator()).toBeVisible();

    //VP2: User profile displays
    await expect(
      homePage.topBarNavigation.getUserProfileLocator("Đoàn Thị Huỳnh Như")
    ).toBeVisible();

    //Step 6: Navigate về màn hình home
    await homePage.navigateTo("https://demo1.cybersoft.edu.vn/");
    // Đợi trang home load xong
    await page.waitForLoadState('networkidle');

    //Step 7: Nhấn button đăng xuất tại màn hình home
    await homePage.topBarNavigation.logout("Đoàn Thị Huỳnh Như");

    //Step 8: Verify logout successfully
    //VP1: Link "Đăng Nhập" hiển thị (đã logout)
    await expect(homePage.topBarNavigation.lnkLogin).toBeVisible();
  });

  test("Invalid Logout Test", async ({ page }) => {
    // Implement negative logout cases if needed
  });
});
