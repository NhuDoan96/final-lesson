import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { DetailPage } from "../pages/DetailPage";

test.describe("Detail Page Flow Test", () => {
  test("Login & Navigate to Detail Page", async ({ page }) => {
    // Login thành công (giả định sử dụng LoginPage nếu đã có sẵn)
    const loginPage = new (require('../pages/LoginPage').LoginPage)(page);
    await page.goto("https://demo1.cybersoft.edu.vn/login");
    await loginPage.login('yourUser', 'yourPassword');
    await expect(loginPage.getLoginMsgLocator()).toBeVisible();
    // Đến Home và mua bất kỳ vé
    const homePage = new (require('../pages/HomePage').HomePage)(page);
    await homePage.navigateTo("https://demo1.cybersoft.edu.vn/");
    const detailPage = new (require('../pages/DetailPage').DetailPage)(page);
    await detailPage.chooseAnyMovieAndBuyFromHome();
    // Chờ trang detail hiển thị
    await detailPage.waitForDetailVisible();
    await expect(detailPage.getDetailContainerLocator()).toBeVisible();
  });

  test("Complete Flow: Home -> Detail -> Showtime Selection", async ({ page }) => {
    let homePage = new HomePage(page);
    let detailPage = new DetailPage(page);

    // Step 1: Navigate to home page
    homePage.navigateTo("https://demo1.cybersoft.edu.vn/");

    // Step 2: Click on "mua bất kì" and navigate to detail page
    await detailPage.goToDetailFromHome();

    // Step 3: On detail page, select showtime or buy ticket
    await detailPage.chooseShowtimeOrBuyOnDetail();

    // Step 4: Verify navigation to next step (purchase/seat selection)
    // This should navigate to purchase page or seat selection
    await expect(page).toHaveURL(/\/(purchase|booking|seat)/);
  });
});
