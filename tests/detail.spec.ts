import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { DetailPage } from "../pages/DetailPage";

test.describe("Detail Page Flow Test", () => {
  test("Valid Detail Test", async ({ page }) => {
    // Step 1: Login thành công
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    await homePage.navigateTo("https://demo1.cybersoft.edu.vn/");
    await homePage.topBarNavigation.navigateLoginPage();
    await loginPage.login("NhuDoan123", "123456@");
    await expect(loginPage.getLoginMsgLocator()).toBeVisible();

    // Step 2: Vào trang home chọn mua vé bất kỳ
    await homePage.navigateTo("https://demo1.cybersoft.edu.vn/");
    await homePage.clickBuyTicketAnyMovie();

    // Step 3: Hiển thị trang detail
    const detailPage = new DetailPage(page);
    await detailPage.waitForDetailVisible();
    await expect(detailPage.getDetailContainerLocator()).toBeVisible();
  });
});
