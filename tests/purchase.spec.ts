import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { DetailPage } from "../pages/DetailPage";
import { PurchasePage } from "../pages/PurchasePage";

test.describe("Purchase Functional Test", () => {
  test("Valid Purchase Test", async ({ page }) => {
    let homePage = new HomePage(page);
    let loginPage = new LoginPage(page);
    let detailPage = new DetailPage(page);
    let purchasePage = new PurchasePage(page);

    homePage.navigateTo("https://demo1.cybersoft.edu.vn/");

    //Step 1: Click Dang Nhap
    await homePage.topBarNavigation.navigateLoginPage();

    //Step 2: Enter username
    //Step 3: Enter password
    //Step 4: Click Dang Nhap
    await loginPage.login(
      "NhuDoan123",
      "123456@"
    );

    //Step 5: Verify login successfully
    await expect(loginPage.getLoginMsgLocator()).toBeVisible();

    //Step 6: Vào trang home chọn mua vé bất kỳ
    await homePage.navigateTo("https://demo1.cybersoft.edu.vn/");
    // Đợi trang home load xong
    await page.waitForLoadState('networkidle');
    await homePage.clickBuyTicketAnyMovie();

    //Step 7: Hiển thị trang detail
    await detailPage.waitForDetailVisible();
    await expect(detailPage.getDetailContainerLocator()).toBeVisible();

    //Step 8: Chọn giờ chiếu phim bất kì ở detail page
    await detailPage.selectShowtime();
    // Đợi trang load xong sau khi chọn giờ chiếu
    await page.waitForLoadState('networkidle');

    //Step 9: Navigate to purchase page từ detail page
    await detailPage.navigateToPurchasePage();

    //Step 10: Tại màn hình purchase (giờ chiếu đã được chọn)
    //Step 11: Chọn ghế trống
    //Step 12: Nhấn đặt vé
    await purchasePage.purchaseTicket();

    //Step 13: Verify purchase successfully
    //VP1: "Đặt vé thành công" message display
    const successMsgLocator = await purchasePage.waitForSuccessMessage(15000);
    await expect(successMsgLocator).toBeVisible();
  });

  test("Invalid Purchase Test", async ({ page }) => {
    //Implement invalid purchase test cases
  });
});

