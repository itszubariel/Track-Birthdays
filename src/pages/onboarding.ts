import { renderApp } from "../core/app";
import { supabase } from "../services/supabase";
import { t } from "../services/i18n";

export interface SlideConfig {
  icon: string;
  title: string;
  description: string;
  accent: string;
  accentDark: string;
}

export const SLIDES: SlideConfig[] = [
  {
    icon: "cake",
    title: t("onboarding_slide0_title"),
    description: t("onboarding_slide0_desc"),
    accent: "--orange",
    accentDark: "--on-accent-light",
  },
  {
    icon: "calendar_month",
    title: t("onboarding_slide1_title"),
    description: t("onboarding_slide1_desc"),
    accent: "--pink",
    accentDark: "--on-accent-light",
  },
  {
    icon: "group",
    title: t("onboarding_slide2_title"),
    description: t("onboarding_slide2_desc"),
    accent: "--lime",
    accentDark: "--on-accent-dark",
  },
  {
    icon: "redeem",
    title: t("onboarding_slide3_title"),
    description: t("onboarding_slide3_desc"),
    accent: "--blue",
    accentDark: "--on-accent-dark",
  },
  {
    icon: "notifications_active",
    title: t("onboarding_slide4_title"),
    description: t("onboarding_slide4_desc"),
    accent: "--orange",
    accentDark: "--on-accent-light",
  },
];

export function renderOnboarding(root: HTMLElement): void {
  let currentIndex = 0;
  let transitioning = false;

  function render(): void {
    const slide = SLIDES[currentIndex];
    const isLast = currentIndex === SLIDES.length - 1;
    const accentVar = `var(${slide.accent})`;
    const accentDarkVar = `var(${slide.accentDark})`;

    root.innerHTML = `
      <style>
        .ob-root {
          position: relative;
          width: 100%;
          height: 100%;
          background: var(--cream);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
          padding: 1.25rem 1.5rem 2rem;
          transition: background-color 0.3s ease;
        }

        .ob-topbar {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          position: relative;
          z-index: 10;
          flex-shrink: 0;
        }

        .ob-skip {
          background: var(--paper);
          border: 2px solid var(--ink);
          border-radius: 999px;
          box-shadow: 3px 3px 0 var(--ink);
          color: var(--muted);
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.35rem 1rem;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          transition: transform 0.15s ease, box-shadow 0.15s ease,
            background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        .ob-skip:hover {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0 var(--ink);
          color: var(--orange);
        }

        #slide-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          width: 100%;
          text-align: center;
          gap: 1.25rem;
          position: relative;
          z-index: 10;
          padding: 1rem 0;
        }

        .ob-icon-wrap {
          width: 110px;
          height: 110px;
          background: var(--paper);
          border: 3px solid var(--ink);
          border-radius: 2rem;
          box-shadow: 6px 6px 0 var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: ob-pop 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .ob-icon-inner {
          animation: ob-pulse 3.2s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .ob-step-badge {
          display: inline-flex;
          align-items: center;
          background: var(--paper);
          border: 2px solid var(--ink);
          border-radius: 999px;
          box-shadow: 3px 3px 0 var(--ink);
          padding: 0.25rem 0.9rem;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .ob-step-text {
          font-size: 0.68rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--brown);
          transition: color 0.3s ease;
        }

        .ob-title {
          font-family: 'Archivo Black', sans-serif;
          font-size: clamp(1.6rem, 7vw, 2.2rem);
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: -0.05em;
          line-height: 0.92;
          color: var(--ink);
          margin: 0;
          opacity: 0;
          transform: translateY(14px);
          animation: ob-slide-up 0.38s cubic-bezier(0.22,1,0.36,1) 0.12s both;
          transition: color 0.3s ease;
        }

        .ob-desc {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--muted);
          margin: 0;
          line-height: 1.65;
          max-width: 280px;
          opacity: 0;
          transform: translateY(10px);
          animation: ob-slide-up 0.38s cubic-bezier(0.22,1,0.36,1) 0.22s both;
          transition: color 0.3s ease;
        }

        .ob-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
          z-index: 10;
          flex-shrink: 0;
          opacity: 0;
          animation: ob-slide-up 0.38s cubic-bezier(0.22,1,0.36,1) 0.3s both;
        }

        .ob-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .ob-dot {
          height: 7px;
          border-radius: 999px;
          border: 2px solid var(--ink);
          transition: width 0.3s cubic-bezier(0.22,1,0.36,1),
            background-color 0.3s ease, border-color 0.3s ease;
        }

        .ob-btn-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .ob-btn-back {
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 999px;
          background: transparent;
          border: 2px solid var(--ink);
          box-shadow: none;
          color: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.3s ease, color 0.3s ease;
        }
        .ob-btn-back:hover {
          transform: translate(3px, 3px);
          color: var(--orange);
        }

        .ob-btn-next {
          flex: 1;
          height: 50px;
          border: 2px solid var(--ink);
          border-radius: 999px;
          box-shadow: 5px 5px 0 var(--ink);
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          transition: transform 0.15s ease, box-shadow 0.15s ease,
            background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        .ob-btn-next:hover {
          transform: translate(3px, 3px);
          box-shadow: 2px 2px 0 var(--ink);
        }
        .ob-btn-next:active {
          transform: translate(4px, 4px);
          box-shadow: 1px 1px 0 var(--ink);
        }

        .ob-btn-start {
          width: 100%;
          height: 52px;
          border: 2px solid var(--ink);
          border-radius: 999px;
          box-shadow: 5px 5px 0 var(--ink);
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 900;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease,
            background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        .ob-btn-start:hover {
          transform: translate(3px, 3px);
          box-shadow: 2px 2px 0 var(--ink);
        }
        .ob-btn-start:active {
          transform: translate(4px, 4px);
          box-shadow: 1px 1px 0 var(--ink);
        }

        @keyframes ob-pop {
          0%   { opacity: 0; transform: scale(0.75) rotate(-4deg); }
          70%  { transform: scale(1.06) rotate(1deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes ob-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50%       { transform: scale(1.08) rotate(2deg); }
        }
        @keyframes ob-slide-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      </style>

      <div class="ob-root">

        <!-- Top bar: skip -->
        <div class="ob-topbar">
          ${
            !isLast
              ? `<button id="skip-btn" class="ob-skip">${t(
                  "onboarding_skip",
                )}</button>`
              : `<div style="height:2rem;"></div>`
          }
        </div>

        <!-- Slide content -->
        <div id="slide-content">

          <!-- Icon card -->
          <div class="ob-icon-wrap">
            <div class="ob-icon-inner">
              <span class="material-symbols-outlined" style="
                font-size: 3rem;
                color: ${accentVar};
                font-variation-settings: 'FILL' 1;
                display: block;
              ">${slide.icon}</span>
            </div>
          </div>

          <!-- Step badge -->
          <div class="ob-step-badge">
            <span class="ob-step-text">${t("onboarding_step")
              .replace("{current}", String(currentIndex + 1))
              .replace("{total}", String(SLIDES.length))}</span>
          </div>

          <h1 class="ob-title">${slide.title}</h1>
          <p class="ob-desc">${slide.description}</p>

        </div>

        <!-- Bottom controls -->
        <div class="ob-actions">

          <!-- Dots -->
          <div class="ob-dots">
            ${SLIDES.map(
              (_, i) => `
              <div class="ob-dot" style="
                width: ${i === currentIndex ? "22px" : "7px"};
                background: ${i === currentIndex ? accentVar : "var(--paper)"};
              "></div>
            `,
            ).join("")}
          </div>

          ${
            isLast
              ? `
            <button id="get-started-btn" class="ob-btn-start" style="
              background: ${accentVar};
              color: ${accentDarkVar};
              display: flex; align-items: center; justify-content: center; gap: 6px;
            ">${t(
              "onboarding_lets_go",
            )}<span class="material-symbols-outlined" style="font-size:1.1rem;font-variation-settings:'FILL' 1;">arrow_forward</span></button>
          `
              : `
            <div class="ob-btn-row">
              <button id="back-btn" class="ob-btn-back" style="
                visibility: ${currentIndex === 0 ? "hidden" : "visible"};
              " aria-label="Previous slide">
                <span class="material-symbols-outlined" style="font-size:1.25rem;">arrow_back</span>
              </button>
              <button id="next-btn" class="ob-btn-next" style="
                background: ${accentVar};
                color: ${accentDarkVar};
              ">
                ${t("onboarding_continue")}
                <span class="material-symbols-outlined" style="font-size:1.1rem;">arrow_forward</span>
              </button>
            </div>
          `
          }

        </div>
      </div>
    `;

    bindButtons();
  }

  async function complete(): Promise<void> {
    const shell = document.querySelector(".ob-root") as HTMLElement | null;
    if (shell) {
      shell.style.transition =
        "opacity 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1)";
      shell.style.opacity = "0";
      shell.style.transform = "scale(0.97)";
      await new Promise<void>((r) => setTimeout(r, 300));
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ onboarding_complete: true })
        .eq("id", user.id);
    }
    localStorage.setItem("onboarding_complete", Date.now().toString());
    renderApp();
  }

  function transitionTo(direction: "forward" | "back"): void {
    if (transitioning) return;
    transitioning = true;

    const content = document.getElementById("slide-content");
    if (!content) {
      transitioning = false;
      return;
    }

    const exitX = direction === "forward" ? "-60px" : "60px";
    content.style.transition = "opacity 0.18s ease, transform 0.18s ease";
    content.style.opacity = "0";
    content.style.transform = `translateX(${exitX})`;

    setTimeout(() => {
      if (direction === "forward") currentIndex++;
      else currentIndex--;

      render();

      const newContent = document.getElementById("slide-content");
      if (!newContent) {
        transitioning = false;
        return;
      }

      const enterX = direction === "forward" ? "60px" : "-60px";
      newContent.style.transition = "none";
      newContent.style.opacity = "0";
      newContent.style.transform = `translateX(${enterX})`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          newContent.style.transition =
            "opacity 0.28s cubic-bezier(0.22,1,0.36,1), transform 0.28s cubic-bezier(0.22,1,0.36,1)";
          newContent.style.opacity = "1";
          newContent.style.transform = "translateX(0)";
          setTimeout(() => {
            transitioning = false;
          }, 280);
        });
      });
    }, 180);
  }

  function bindButtons(): void {
    document.getElementById("back-btn")?.addEventListener("click", () => {
      if (currentIndex > 0) transitionTo("back");
    });
    document.getElementById("next-btn")?.addEventListener("click", () => {
      if (currentIndex < SLIDES.length - 1) transitionTo("forward");
    });
    document
      .getElementById("skip-btn")
      ?.addEventListener("click", () => complete());
    document
      .getElementById("get-started-btn")
      ?.addEventListener("click", () => complete());
  }

  function bindSwipe(container: HTMLElement): void {
    let touchStartX = 0;
    let touchStartY = 0;
    container.addEventListener(
      "touchstart",
      (e: TouchEvent) => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
      },
      { passive: true },
    );
    container.addEventListener(
      "touchend",
      (e: TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < Math.abs(dy) * 1.5 || Math.abs(dx) < 40) return;
        if (dx < 0 && currentIndex < SLIDES.length - 1) transitionTo("forward");
        else if (dx > 0 && currentIndex > 0) transitionTo("back");
      },
      { passive: true },
    );
  }

  render();
  bindSwipe(root);
}
