import { test, expect } from '../fixtures/custom-fixtures';


test.describe("Login Functional Test", () => {
  test("Valid Login Test", async ({ homePage, loginPage }) => {
    
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
    //VP1: "Dang nhap thanh cong" message display
    await expect(loginPage.getLoginMsgLocator()).toBeVisible();

    //VP2: User profile displays
    await expect(
      homePage.topBarNavigation.getUserProfileLocator("Đoàn Thị Huỳnh Như")
    ).toBeVisible();
  });

  test("Invalid Login Test", async ({ page }) => {
    //Implement invalid login test cases
  });
});
