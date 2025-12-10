import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { test as base } from '@playwright/test';

type MyFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
  homePage: async ({ page }, use) => {
    // Set up the fixture.
    const homePage = new HomePage(page);

    // Use the fixture value in the test.
    await use(homePage);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await use(loginPage);
  },
});
export { expect } from '@playwright/test';