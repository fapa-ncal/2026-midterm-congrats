// Shared by the static-page generator and the browser's language switch.
const PAGE_META = {
  en: {
    lang: "en", locale: "en_US", path: "", image: "og-image-en.jpg",
    title: "2026 Election Congratulations | FAPA Northern California",
    description: "Enter your ZIP code to find your district's newly elected officials and send a warm letter of congratulations with our templates.",
    siteName: "FAPA Northern California",
    imageAlt: "Congratulate the winners in your district! Find your elected officials by ZIP code. Send a warm letter of congratulations. FAPA Northern California."
  },
  zh: {
    lang: "zh-TW", locale: "zh_TW", path: "zh-tw/", image: "og-image.jpg",
    title: "2026 期中選舉恭賀信小工具｜FAPA 北加州分會",
    description: "輸入 zip code，查出你選區 2026 年新當選的國會議員、州參議員、州眾議員和市長，一鍵寄出恭喜信！",
    siteName: "FAPA 北加州分會",
    imageAlt: "一起來恭喜你選區的當選人！輸入 ZIP Code，找到當選人，寄出一封溫暖的恭喜信。FAPA 北加州分會。"
  }
};
if (typeof module !== "undefined") module.exports = PAGE_META;
