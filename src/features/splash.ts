import { t } from "../services/i18n";

let splashEl: HTMLElement | null = null;

export function showSplash(): void {
  if (splashEl) return;

  splashEl = document.createElement("div");
  splashEl.id = "splash-screen";
  splashEl.innerHTML = `
    <style>
      #splash-screen {
        position: fixed;
        inset: 0;
        background: var(--cream, #fff4dc);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.45s ease, background-color 0.3s ease;
        gap: 0;
        font-family: 'Inter', sans-serif;
      }

      @keyframes splash-float {
        0%, 100% { transform: translateY(0px) rotate(-1deg); }
        50%       { transform: translateY(-10px) rotate(1deg); }
      }

      @keyframes splash-fade-up {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      @keyframes splash-bar-fill {
        0%   { width: 0%; }
        55%  { width: 72%; }
        80%  { width: 88%; }
        100% { width: 100%; }
      }

      #splash-icon-wrap {
        animation: splash-float 3.2s ease-in-out infinite;
        margin-bottom: 1.5rem;
      }

      #splash-icon-img {
        width: 88px;
        height: 88px;
        border-radius: 22px;
        border: 3px solid #f5ede0;
        box-shadow: 6px 6px 0 #1a1a1a;
        display: block;
      }

      #splash-title {
        font-family: 'Archivo Black', sans-serif;
        font-size: 1.55rem;
        font-weight: 400;
        text-transform: uppercase;
        letter-spacing: -0.05em;
        color: var(--ink, #211713);
        margin-bottom: 0.3rem;
        opacity: 0;
        animation: splash-fade-up 0.5s ease forwards;
        animation-delay: 0.15s;
        transition: color 0.3s ease;
      }

      #splash-sub {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--brown, #8f5730);
        margin-bottom: 2.5rem;
        opacity: 0;
        animation: splash-fade-up 0.5s ease forwards;
        animation-delay: 0.28s;
        transition: color 0.3s ease;
      }

      #splash-bar-wrap {
        width: 80%;
        max-width: 340px;
        height: 8px;
        background: var(--paper, #fffaf0);
        border: 2px solid var(--ink, #211713);
        border-radius: 999px;
        overflow: hidden;
        opacity: 0;
        animation: splash-fade-up 0.5s ease forwards;
        animation-delay: 0.4s;
        transition: background-color 0.3s ease, border-color 0.3s ease;
      }

      #splash-bar-fill {
        height: 100%;
        background: var(--orange, #ff7a1a);
        border-radius: 999px;
        width: 0%;
        animation: splash-bar-fill 1.4s ease-in-out forwards;
        animation-delay: 0.5s;
        transition: background-color 0.3s ease;
      }
    </style>

    <div id="splash-icon-wrap">
      <img id="splash-icon-img" src="/icons/icon.png" alt="Track Birthdays" />
    </div>

    <p id="splash-title">${t("splash_title")}</p>
    <p id="splash-sub">${t("splash_subtitle")}</p>

    <div id="splash-bar-wrap">
      <div id="splash-bar-fill"></div>
    </div>
  `;

  document.body.appendChild(splashEl);

  const title = splashEl.querySelector("#splash-sub") as HTMLElement;
  const bar = splashEl.querySelector("#splash-bar-wrap") as HTMLElement;
  if (title && bar) {
    requestAnimationFrame(() => {
      bar.style.width = title.offsetWidth + "px";
    });
  }

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const img = splashEl.querySelector("#splash-icon-img") as HTMLElement;
  if (img) img.style.boxShadow = `6px 6px 0 ${isDark ? "#f5ede0" : "#1a1a1a"}`;
}

export async function hideSplash(): Promise<void> {
  if (!splashEl) return;
  const el = splashEl;

  await new Promise<void>((resolve) => setTimeout(resolve, 1800));

  el.style.opacity = "0";
  await new Promise<void>((resolve) => setTimeout(resolve, 450));
  el.remove();
  splashEl = null;
}
