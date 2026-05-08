import { renderBirthdays } from "./pages/birthdays";
import { renderAdd } from "./pages/add";
import { renderCalendar } from "./pages/calendar";
import { renderGroups } from "./pages/groups";
import { renderProfile } from "./pages/profile";
import { animateNavTab, bindButtonFeedback } from "./animations";

type Page = "birthdays" | "calendar" | "groups" | "profile";
let currentPage: Page = "birthdays";
let navGeneration = 0;
let isInSubView = false; // Track if we're in a detail/add view
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
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

    <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;background:#0f0f0f;position:relative;">
    <div id="page-content" style="flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;-webkit-overflow-scrolling:touch;"></div>
    
    <button id="fab-add" style="position:absolute;bottom:80px;right:1.5rem;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#ff6b6b,#d45555);border:none;display:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(255,107,107,0.4);z-index:45;transition:transform 0.2s,box-shadow 0.2s;"
      onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 6px 24px rgba(255,107,107,0.5)'"
      onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 20px rgba(255,107,107,0.4)'"
      onmousedown="this.style.transform='scale(0.95)'"
      onmouseup="this.style.transform='scale(1)'">
      <span class="material-symbols-outlined" style="color:#fff;font-size:28px;font-variation-settings:'FILL' 0;">add</span>
    </button>

    <nav style="flex-shrink:0;display:flex;justify-content:space-around;align-items:center;padding:12px 16px env(safe-area-inset-bottom, 16px);background:rgba(19,19,19,0.95);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,0.05);border-radius:2rem 2rem 0 0;box-shadow:0 -20px 40px rgba(0,0,0,0.4);z-index:50;">
      ${navBtn("birthdays", "cake", "Birthdays")}
      ${navBtn("calendar", "calendar_month", "Calendar")}
      ${navBtn("groups", "group", "Groups")}
      ${navBtn("profile", "person", "Profile")}
    </nav>
  </div>

    <style>
      #page-content::-webkit-scrollbar { display:none; }
      @keyframes slideUp {
        from { opacity:0; transform:translateX(-50%) translateY(16px); }
        to { opacity:1; transform:translateX(-50%) translateY(0); }
      }
    </style>
  `;

  bindNav();
  navigateTo(currentPage);
}

function navBtn(page: Page, icon: string, label: string) {
  const active = currentPage === page;
  return `
    <button data-page="${page}" style="display:flex;flex-direction:column;align-items:center;gap:4px;background:${active ? "rgba(255,107,107,0.1)" : "none"};border:none;border-radius:16px;padding:8px 16px;cursor:pointer;color:${active ? "#ffb3b0" : "#666"};transition:color 0.2s,background 0.2s;">
      <span class="material-symbols-outlined" style="font-size:24px;font-variation-settings:'FILL' ${active ? 1 : 0};">${icon}</span>
      <span style="font-family:'Inter',sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;font-weight:500;">${label}</span>
    </button>
  `;
}

function bindNav() {
  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      animateNavTab(btn as HTMLElement);
      currentPage = (btn as HTMLElement).dataset.page as Page;
      renderApp();
    });
  });

  // FAB click handler
  document.getElementById("fab-add")?.addEventListener("click", () => {
    const content = document.getElementById("page-content");
    if (content) {
      renderAdd(content, ++navGeneration, "birthdays");
    }
  });
}

export function updateFABVisibility() {
  const fab = document.getElementById("fab-add");
  if (fab) {
    // Only show FAB on main birthdays list (not in sub-views)
    if (currentPage === "birthdays" && !isInSubView) {
      fab.style.display = "flex";
    } else {
      fab.style.display = "none";
    }
  }
}

export function navigateTo(page: Page) {
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
