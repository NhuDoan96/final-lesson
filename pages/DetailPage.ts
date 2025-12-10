import { Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";

export class DetailPage extends CommonPage {

    readonly btnBuyNow = this.page.getByRole('button', { name: /mua vé/i }).first();
    readonly lnkBuyNow = this.page.getByRole('link', { name: /mua vé/i }).first();
    readonly cardBuyButtons = this.page.getByRole('button', { name: /mua vé/i });
    readonly cardBuyLinks = this.page.getByRole('link', { name: /mua vé/i });
    readonly showtimeButtons = this.page.getByRole('button', { name: /giờ chiếu|suất|mua|chọn ghế|đặt vé/i });
    readonly showtimeLinks = this.page.getByRole('link', { name: /giờ chiếu|suất|mua|chọn ghế|đặt vé/i });
    readonly detailContainer = this.page.locator("//div[contains(@class,'detail') or contains(@class,'movie-detail')]");
    readonly popupSelectMovie = this.page.getByText(/Bạn chưa chọn phim|Vui lòng chọn phim/i);
    readonly popupCloseButton = this.page.getByRole('button', { name: /đã hiểu|close|ok|x/i });
    readonly movieCardLink = this.page.locator("a[href*='/detail'], a[href*='/movie'], a[href*='/phim']").first();

    constructor(page: Page) {
        super(page);
    }

    getDetailContainerLocator(): Locator {
        return this.detailContainer;
    }

    async waitForDetailVisible() {
        // Wait for URL change first
        await this.page.waitForURL(/\/(detail|movie)/);
        await this.detailContainer.first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async isDetailVisible(): Promise<boolean> {
        return await this.detailContainer.first().isVisible().catch(() => false);
    }

    getBuyNowButtonLocator(): Locator {
        return this.btnBuyNow;
    }

    getBuyNowLinkLocator(): Locator {
        return this.lnkBuyNow;
    }

    getShowtimeButtonsLocator(): Locator {
        return this.showtimeButtons;
    }

    async clickBuyNow() {
        // Ưu tiên button, sau đó tới link
        if (await this.btnBuyNow.isVisible().catch(() => false)) {
            await this.btnBuyNow.click({ force: true });
            return;
        }
        await this.lnkBuyNow.click({ force: true });
    }

    async clickCardBuyButton(index: number = 0) {
        await this.cardBuyButtons.nth(index).click({ force: true });
    }

    async clickCardBuyLink(index: number = 0) {
        await this.cardBuyLinks.nth(index).click({ force: true });
    }

    async chooseAnyMovieAndBuyFromHome() {
        // Try different buy options in order of preference
        try {
            await this.clickBuyNow();
        } catch {
            try {
                await this.clickCardBuyButton();
            } catch {
                try {
                    await this.clickCardBuyLink();
                } catch {
                    throw new Error("Không tìm thấy nút/links 'Mua vé' trên trang Home");
                }
            }
        }
    }

    async clickShowtimeButton(index: number = 0) {
        await this.showtimeButtons.nth(index).click({ force: true });
    }

    async clickShowtimeLink(index: number = 0) {
        await this.showtimeLinks.nth(index).click({ force: true });
    }

    async chooseShowtimeOrBuyOnDetail() {
        // Try different options in order of preference
        try {
            await this.clickShowtimeButton();
        } catch {
            try {
                await this.clickShowtimeLink();
            } catch {
                try {
                    await this.clickBuyNow();
                } catch {
                    throw new Error("Không tìm thấy giờ chiếu hoặc nút mua trên trang chi tiết");
                }
            }
        }
    }

    async waitForDetailPage() {
        await this.page.waitForLoadState('domcontentloaded');
        await this.detailContainer.waitFor({ state: 'visible' });
    }

    async goToDetailFromHome() {
        await this.chooseAnyMovieAndBuyFromHome();
        await this.waitForDetailPage();
    }

    async startFlowFromHomeToDetail() {
        await this.chooseAnyMovieAndBuyFromHome();
        await this.chooseShowtimeOrBuyOnDetail();
    }

    async dismissPopup() {
        if (await this.popupSelectMovie.isVisible().catch(() => false)) {
            await this.popupCloseButton.click({ force: true });
        }
    }

    async clickMovieCard() {
        await this.movieCardLink.click({ force: true });
    }
}

