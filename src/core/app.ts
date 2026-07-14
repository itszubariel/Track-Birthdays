import { renderBirthdays } from "../pages/birthdays";
import { renderAdd } from "../pages/add";
import { renderCalendar } from "../pages/calendar";
import { renderGroups } from "../pages/groups";
import { renderProfile } from "../pages/profile";
import { animateNavTab, bindButtonFeedback } from "../features/animations";
import { t } from "../services/i18n";

type Page = "birthdays" | "calendar" | "groups" | "profile";
let currentPage: Page = "birthdays";
let navGeneration = 0;
let isInSubView = false;

export const getNavGeneration = () => navGeneration;
export const setSubView = (inSubView: boolean) => {
  isInSubView = inSubView;
};
export const getCurrentPage = () => currentPage;
export const setCurrentPage = (page: Page) => {
  currentPage = page;
};

export function renderApp() {
  (window as any).__root().innerHTML = `
    <style>
      .app-shell {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        background: var(--cream);
        position: relative;
        transition: background-color 0.3s ease;
      }

      #page-content {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        background: var(--cream);
        transition: background-color 0.3s ease;
      }
      #page-content::-webkit-scrollbar { display: none; }

      /* ── FAB ── */
      #fab-add {
        position: absolute;
        bottom: 76px;
        right: 1.25rem;
        width: 52px;
        height: 52px;
        border-radius: 999px;
        background: var(--lime);
        border: 2px solid var(--ink);
        box-shadow: none;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 45;
        color: var(--on-accent-dark);
        transition: transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      #fab-add:hover {
        transform: translate(3px, 3px);
        box-shadow: none;
      }
      #fab-add:active {
        transform: translate(4px, 4px);
        box-shadow: none;
      }

      /* ── Bottom nav ── */
      #app-nav {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        padding: 0.6rem 0.75rem env(safe-area-inset-bottom, 0.75rem);
        gap: 4px;
        background: var(--paper);
        border-top: 3px solid var(--ink);
        z-index: 50;
        transition: background-color 0.3s ease, border-color 0.3s ease;
      }

      .nav-tab {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        background: none;
        border: none;
        border-radius: 0.85rem;
        padding: 0.5rem 0.25rem;
        cursor: pointer;
        color: var(--muted);
        transition: color 0.2s ease, background-color 0.15s ease;
        font-family: 'Inter', sans-serif;
        position: relative;
      }
      .nav-tab:active {
        background: var(--cream);
      }
      .nav-tab.active {
        color: var(--orange);
      }

      .nav-tab-icon {
        font-size: 1.4rem;
        line-height: 1;
        transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .nav-tab.active .nav-tab-icon {
        transform: translateY(-1px);
      }

      .nav-tab-label {
        font-size: 0.6rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
        line-height: 1;
      }

    </style>

    <div class="app-shell">
      <div id="page-content"></div>

      <button id="fab-add" aria-label="Add birthday">
        <span class="material-symbols-outlined" style="font-size:1.5rem;font-variation-settings:'FILL' 0;">add</span>
      </button>

      <nav id="app-nav">
        ${navBtn("birthdays", "cake", t("nav_birthdays"))}
        ${navBtn("calendar", "calendar_month", t("nav_calendar"))}
        ${navBtn("groups", "group", t("nav_groups"))}
        ${navBtn("profile", "person", t("nav_profile"))}
      </nav>
    </div>
  `;

  bindNav();
  navigateTo(currentPage);
}

function navBtn(page: Page, icon: string, label: string): string {
  const active = currentPage === page;
  return `
    <button
      data-page="${page}"
      class="nav-tab${active ? " active" : ""}"
      aria-label="${label}"
      aria-current="${active ? "page" : "false"}"
    >
      <span class="material-symbols-outlined nav-tab-icon"
        style="font-variation-settings:'FILL' ${active ? 1 : 0};"
      >${icon}</span>
      <span class="nav-tab-label">${label}</span>
    </button>
  `;
}

function bindNav(): void {
  document.querySelectorAll(".nav-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      animateNavTab(btn as HTMLElement);
      currentPage = (btn as HTMLElement).dataset.page as Page;
      renderApp();
    });
  });

  document.getElementById("fab-add")?.addEventListener("click", () => {
    const content = document.getElementById("page-content");
    if (content) renderAdd(content, ++navGeneration, "birthdays");
  });
}

export function updateFABVisibility(): void {
  const fab = document.getElementById("fab-add");
  if (!fab) return;
  fab.style.display =
    currentPage === "birthdays" && !isInSubView ? "flex" : "none";
}

export function navigateTo(page: Page): void {
  currentPage = page;
  isInSubView = false;
  const gen = ++navGeneration;
  const content = document.getElementById("page-content");
  if (!content) return;
  bindButtonFeedback(content);
  if (page === "birthdays") renderBirthdays(content, gen);
  else if (page === "calendar") renderCalendar(content, gen, true);
  else if (page === "groups") renderGroups(content, gen);
  else if (page === "profile") renderProfile(content, gen);
  updateFABVisibility();
}
