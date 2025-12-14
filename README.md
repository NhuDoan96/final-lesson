# class07-playwright-framework
1. Giới thiệu Framework
Framework này sử dụng Playwright - công cụ testing end-to-end của Microsoft, được xây dựng theo mô hình Page Object Model (POM).
Tính năng chính:
Tự động hóa testing trên nhiều trình duyệt (Chromium, Firefox, WebKit)
Hỗ trợ TypeScript
Auto-waiting và auto-retry
Trace viewer để debug
HTML report chi tiết
Cấu trúc thư mục:

class07-playwright-framework/
├── pages/              # Page Object classes
│   ├── BasePage.ts    # Base class
│   ├── CommonPage.ts  # Common page
│   ├── HomePage.ts
│   ├── LoginPage.ts
│   └── components/     # Reusable components
├── tests/              # Test cases (*.spec.ts)
├── fixtures/           # Custom fixtures
└── playwright.config.ts # Cấu hình
2. Setup - Git Clone và Build
Yêu cầu
Node.js >= 16
npm
Git
Các bước setup
# 1. Clone repository
git clone <repository-url>
cd class07-playwright-framework

# 2. Cài đặt dependencies
npm install

# 3. Cài đặt Playwright browsers
npx playwright install

# 4. Verify
npx playwright --version
3. Run Test Case, Môi trường và Config
Chạy Test Case
# Chạy tất cả tests
npm test
# Chạy test cụ thể
npm run test:login
npm run test:register
npx playwright test tests/login.spec.ts
# Chạy test case cụ thể
npx playwright test -g "Valid Login Test"

# Chạy với browser hiển thị
npm run test:headed

# Chạy UI mode (interactive)
npm run test:ui

# Debug mode
npm run test:debug
Chạy với Môi trường khác nhau
Cách 1: Environment Variables

BASE_URL=https://dev.example.com npx playwright test
BASE_URL=https://staging.example.com npx playwright test
Cách 2: Projects trong config

// playwright.config.ts
projects: [
  { name: 'dev', use: { baseURL: 'https://dev.example.com' } },
  { name: 'staging', use: { baseURL: 'https://staging.example.com' } },
]

// Chạy
npx playwright test --project=dev
Cách 3: Config files riêng

npx playwright test --config=playwright.dev.config.ts
Chỉnh Config
File playwright.config.ts chứa các cấu hình:

export default defineConfig({
  timeout: 180000,              // Timeout test (180s)
  expect: { timeout: 20000 },   // Timeout assertion (20s)
  testDir: './tests',           // Thư mục test
  fullyParallel: false,         // Chạy song song
  workers: 1,                   // Số worker
  reporter: 'html',             // Reporter
  use: {
    baseURL: 'https://demo1.cybersoft.edu.vn',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
# 4. Implement Test Case Mới
Tạo Page Object mới
Bước 1: Tạo file trong pages/

// pages/NewPage.ts
import { Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";

export class NewPage extends CommonPage {
    readonly btnSubmit = this.page.getByRole('button', { name: 'Submit' });
    
    constructor(page: Page) {
        super(page);
    }
    
    async clickSubmit() {
        await this.click(this.btnSubmit);
    }
}
Tạo Test Case mới
Bước 2: Tạo file test trong tests/

// tests/new-feature.spec.ts
import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { NewPage } from "../pages/NewPage";

test.describe("New Feature Test", () => {
    test("Test case name", async ({ page }) => {
        const homePage = new HomePage(page);
        const newPage = new NewPage(page);
        
        await homePage.navigateTo("https://demo1.cybersoft.edu.vn/");
        // ... thực hiện test steps
        
        await expect(newPage.btnSubmit).toBeVisible();
    });
});
Thêm Script vào package.json
Bước 3: Thêm script vào package.json

{
  "scripts": {
    "test:new-feature": "playwright test tests/new-feature.spec.ts"
  }
}
Chạy: npm run test:new-feature

# 5. Report - Output và Xem Report
Report Output
Sau khi chạy test, report được tạo trong:

HTML Report: playwright-report/index.html
Screenshots: test-results/ (khi test fail)
Videos: test-results/ (khi test fail)
Traces: test-results/ (khi retry)
Xem Report
# Mở HTML report
npx playwright show-report

# Mở report từ thư mục cụ thể
npx playwright show-report playwright-report

# Xem trace
npx playwright show-trace test-results/trace.zip
Report sẽ tự động mở trong trình duyệt, hiển thị:

Tổng quan: số test passed/failed/skipped
Chi tiết từng test: timeline, screenshots, video
Error messages chi tiết
# 6. Command Line với Parameters
Các tham số thường dùng
# Chạy test với browser hiển thị
npx playwright test --headed

# Chạy test cụ thể
npx playwright test tests/login.spec.ts

# Chạy test case theo tên
npx playwright test -g "Login"

# Chạy với project/browser cụ thể
npx playwright test --project=chromium
npx playwright test --project=firefox

# Chạy với config file khác
npx playwright test --config=playwright.dev.config.ts

# Chạy với retry
npx playwright test --retries=2

# Chạy với timeout
npx playwright test --timeout=60000

# Chạy với trace
npx playwright test --trace=on

# Chạy với screenshot
npx playwright test --screenshot=only-on-failure

# Chạy với video
npx playwright test --video=retain-on-failure

# Chạy với reporter
npx playwright test --reporter=html,list

# Kết hợp nhiều params
npx playwright test tests/login.spec.ts --headed --project=chromium --retries=2
Environment Variables
# Truyền env vars khi chạy
BASE_URL=https://dev.example.com USERNAME=test npx playwright test

# Hoặc export trước
export BASE_URL=https://dev.example.com
npx playwright test
Ví dụ thực tế
# Chạy test login với browser hiển thị, retry 2 lần
npx playwright test tests/login.spec.ts --headed --retries=2

# Chạy tất cả test trên Firefox với trace
npx playwright test --project=firefox --trace=on

# Chạy test với môi trường dev
BASE_URL=https://dev.example.com npx playwright test --project=dev
Scripts có sẵn
npm test - Chạy tất cả tests
npm run test:headed - Chạy với browser hiển thị
npm run test:ui - UI mode (interactive)
npm run test:debug - Debug mode
npm run test:login - Chạy test login
npm run test:register - Chạy test register
npm run test:logout - Chạy test logout
npm run test:detail - Chạy test detail

