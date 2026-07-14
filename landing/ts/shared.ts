import { translations } from "./i18n.ts";

export function setLanguage(langCode: string): void {
  console.log("--- Translation Start ---");
  console.log("Setting language to:", langCode);
  localStorage.setItem("lang", langCode);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    console.log(`Checking key: ${key}`);
    if (key && translations[key]) {
      if (translations[key][langCode]) {
        console.log(`Translating ${key} to: ${translations[key][langCode]}`);
        el.innerHTML = translations[key][langCode];
      } else {
        console.warn(
          `No translation found for key ${key} in language ${langCode}`,
        );
      }
    } else {
      console.warn(`Key ${key} not found in translations object`);
    }
  });
  window.scrollTo(0, 0);
  console.log("--- Translation End ---");
}

const lang = localStorage.getItem("lang") || "en";
setLanguage(lang);

const langLabel = document.getElementById("lang-label");
if (langLabel) langLabel.textContent = lang.toUpperCase();
