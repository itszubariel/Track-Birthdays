import { getNavGeneration, setSubView, updateFABVisibility } from "../core/app";
import { getStore } from "../services/store";
import { getLetterColor } from "../utils/utils";
import {
  animatePageEnter,
  animateSheetIn,
  animateListItems,
  bindButtonFeedback,
} from "../features/animations";
import { renderDetailView } from "./birthdays";
import { renderAdd } from "./add";
import { clearSubviewStack } from "../core/nav-state";
import { t, getLang } from "../services/i18n";
import {
  parseStoredDate,
  getZodiac,
  getInitials,
  getMonthName,
} from "../utils/utils";

function getDayNames(): string[] {
  return [
    t("calendar_mon"),
    t("calendar_tue"),
    t("calendar_wed"),
    t("calendar_thu"),
    t("calendar_fri"),
    t("calendar_sat"),
    t("calendar_sun"),
  ];
}

let cachedCalendarHTML: string = "";
let cachedStoreVersion: number = -1;
let cachedScrollPosition: number = 0;
let cachedMonth: number = -1;
let cachedYear: number = -1;
let cachedLang: string = "";

let renderedMonthsCount = 0;
let allMonths: Array<{ month: number; year: number }> = [];
let monthsContainer: HTMLElement | null = null;
let loadSentinel: HTMLElement | null = null;
let intersectionObserver: IntersectionObserver | null = null;

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(month: number, year: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}
function getBirthdaysForDate(day: number, month: number): any[] {
  return getStore().birthdays.filter((b) => {
    if (b.archived) return false;
    const p = parseStoredDate(b.date);
    return p.day === day && p.month === month;
  });
}
function closeAllSheets() {
  document.getElementById("birthday-sheet")?.remove();
  document.getElementById("add-sheet")?.remove();
}
function getStoreVersion(): number {
  const store = getStore();
  return (
    store.birthdays.length +
    store.birthdays.reduce((sum, b) => sum + b.id.length + b.date.length, 0) +
    store.birthdays.filter((b) => b.archived).length
  );
}

export function renderCalendar(
  container: HTMLElement,
  gen = 0,
  isMainView = true,
) {
  if (!container.isConnected || gen !== getNavGeneration()) return;
  closeAllSheets();
  setSubView(!isMainView);
  updateFABVisibility();
  if (isMainView) clearSubviewStack("calendar");

  const storeVersion = getStoreVersion();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  if (
    isMainView &&
    cachedCalendarHTML &&
    cachedStoreVersion === storeVersion &&
    cachedMonth === currentMonth &&
    cachedYear === currentYear &&
    cachedLang === getLang()
  ) {
    container.innerHTML = cachedCalendarHTML;
    requestAnimationFrame(() => {
      container.scrollTop = cachedScrollPosition;
    });
    monthsContainer = document.getElementById("calendar-months-container");
    loadSentinel = document.getElementById("load-sentinel");
    setupLazyLoading(today, container);
    bindCalendarEvents(container, gen);
    animatePageEnter(container);
    container.addEventListener(
      "scroll",
      () => {
        if (!document.getElementById("calendar-months-container")) return;
        cachedScrollPosition = container.scrollTop;
      },
      { passive: true },
    );
    return;
  }

  allMonths = [];
  let m = currentMonth,
    y = currentYear;
  for (let i = 0; i < 12; i++) {
    allMonths.push({ month: m, year: y });
    if (++m > 11) {
      m = 0;
      y++;
    }
  }

  renderedMonthsCount = 0;
  const initialCount =
    cachedScrollPosition > 0 ? allMonths.length : Math.min(3, allMonths.length);

  container.innerHTML = `
    <style>
      .cal-header {
        position:sticky;top:0;z-index:40;
        background:var(--cream);
        border-bottom:3px solid var(--ink);
        display:flex;align-items:center;gap:10px;
        padding:0.9rem 1.25rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .cal-header-title {
        font-family:'Archivo Black',sans-serif;
        font-size:1.3rem;text-transform:uppercase;
        letter-spacing:-0.05em;color:var(--ink);margin:0;
        transition:color 0.3s ease;
      }
      .cal-month-label {
        font-family:'Archivo Black',sans-serif;
        font-size:1.1rem;text-transform:uppercase;
        letter-spacing:-0.04em;color:var(--ink);
        margin:0 0 0.85rem;text-align:center;
        transition:color 0.3s ease;
      }
      .cal-grid-wrap {
        background:var(--paper);
        border:3px solid var(--ink);
        border-radius:1.5rem;
        box-shadow:6px 6px 0 var(--ink);
        padding:1rem;
        overflow:hidden;width:100%;box-sizing:border-box;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .cal-day-header {
        text-align:center;
        font-size:0.6rem;font-weight:900;
        text-transform:uppercase;letter-spacing:0.1em;
        color:var(--brown);padding:4px 0;
        transition:color 0.3s ease;
      }
      .cal-cell {
        aspect-ratio:1;
        border-radius:10px;
        padding:12px 2px 6px;
        display:flex;flex-direction:column;
        align-items:center;justify-content:flex-start;
        position:relative;min-width:0;overflow:hidden;
        transition:background 0.15s ease;
      }
      .cal-cell-current { background:var(--cream); cursor:pointer; }
      .cal-cell-current:hover { opacity:0.85; }
      .cal-cell-other { background:transparent; cursor:default; }
      .cal-day-num {
        font-size:0.68rem;font-weight:600;
        position:relative;z-index:1;
        line-height:1;
        transition:color 0.3s ease;
      }
      .cal-dot-row {
        display:flex;gap:1px;flex-wrap:wrap;
        justify-content:center;align-items:center;
        max-width:100%;margin-top:2px;
      }
    </style>

    <header class="cal-header">
      <span class="material-symbols-outlined" style="color:var(--orange);font-variation-settings:'FILL' 1;">calendar_month</span>
      <h1 class="cal-header-title">${t("calendar_header_title")}</h1>
    </header>

    <div id="calendar-months-container" style="padding:1rem 1.25rem 80px;">
      ${allMonths
        .slice(0, initialCount)
        .map(({ month, year }) => renderMonthGrid(month, year, today))
        .join("")}
      <div id="load-sentinel" style="height:1px;"></div>
    </div>
  `;

  renderedMonthsCount = initialCount;
  monthsContainer = document.getElementById("calendar-months-container");
  loadSentinel = document.getElementById("load-sentinel");

  setupLazyLoading(today, container);
  animatePageEnter(container);
  bindButtonFeedback(container);
  bindCalendarEvents(container, gen);

  cachedCalendarHTML = container.innerHTML;
  cachedStoreVersion = storeVersion;
  cachedMonth = currentMonth;
  cachedYear = currentYear;
  cachedLang = getLang();

  if (isMainView && container.isConnected && gen === getNavGeneration()) {
    container.scrollTop = cachedScrollPosition;
    requestAnimationFrame(() => {
      if (container.isConnected && gen === getNavGeneration()) {
        container.scrollTop = cachedScrollPosition;
      }
    });
  }

  container.addEventListener(
    "scroll",
    () => {
      if (!document.getElementById("calendar-months-container")) return;
      cachedScrollPosition = container.scrollTop;
    },
    { passive: true },
  );
}

function renderMonthGrid(month: number, year: number, today: Date): string {
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const prevMonthDays = getDaysInMonth(month - 1, year);

  const calendarDays: Array<{
    day: number;
    isCurrentMonth: boolean;
    date: Date;
  }> = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
      date: new Date(py, pm, d),
    });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day),
    });
  }
  const remaining = 42 - calendarDays.length;
  for (let day = 1; day <= remaining; day++) {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(ny, nm, day),
    });
  }

  return `
    <div style="margin-bottom:1.75rem;">
      <h2 class="cal-month-label">${getMonthName(month)} ${year}</h2>
      <div class="cal-grid-wrap">
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:6px;">
          ${getDayNames()
            .map((d) => `<div class="cal-day-header">${d}</div>`)
            .join("")}
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;">
          ${calendarDays
            .map(({ day, isCurrentMonth, date }) => {
              const isToday =
                isCurrentMonth &&
                day === todayDate &&
                month === todayMonth &&
                year === todayYear;
              const birthdays = isCurrentMonth
                ? getBirthdaysForDate(day, month)
                : [];
              const hasBirthdays = birthdays.length > 0;

              return `
              <div
                data-calendar-day="${date.toISOString()}"
                data-has-birthdays="${hasBirthdays}"
                class="cal-cell ${
                  isCurrentMonth ? "cal-cell-current" : "cal-cell-other"
                }"
              >
                <div style="position:relative;width:100%;display:flex;justify-content:center;margin-bottom:2px;">
                  ${
                    isToday
                      ? `<div style="position:absolute;width:22px;height:22px;border-radius:50%;background:var(--orange);border:2px solid var(--ink);z-index:0;top:50%;left:50%;transform:translate(-50%,-50%);"></div>`
                      : ""
                  }
                  <span class="cal-day-num" style="color:${
                    isToday
                      ? "var(--on-accent-light)"
                      : isCurrentMonth
                      ? "var(--ink)"
                      : "var(--muted)"
                  }; font-weight:${isToday ? "900" : "600"};">
                    ${day}
                  </span>
                </div>
                ${
                  hasBirthdays
                    ? `
                  <div class="cal-dot-row">
                    ${birthdays
                      .slice(0, 3)
                      .map((b) => {
                        const color = getLetterColor(b.name);
                        return b.avatar_url
                          ? `<div style="width:7px;height:7px;border-radius:50%;overflow:hidden;flex-shrink:0;border:1px solid var(--ink);"><img src="${b.avatar_url}" style="width:100%;height:100%;object-fit:cover;" /></div>`
                          : `<div style="width:7px;height:7px;border-radius:50%;background:${color};border:1px solid var(--ink);flex-shrink:0;"></div>`;
                      })
                      .join("")}
                    ${
                      birthdays.length > 3
                        ? `<span style="font-size:6px;font-weight:900;color:var(--orange);margin-left:1px;">+${
                            birthdays.length - 3
                          }</span>`
                        : ""
                    }
                  </div>
                `
                    : ""
                }
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function setupLazyLoading(today: Date, container: HTMLElement) {
  if (intersectionObserver) intersectionObserver.disconnect();
  if (!loadSentinel || !monthsContainer) return;

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && renderedMonthsCount < allMonths.length) {
          const toLoad = Math.min(2, allMonths.length - renderedMonthsCount);
          const newHTML = allMonths
            .slice(renderedMonthsCount, renderedMonthsCount + toLoad)
            .map(({ month, year }) => renderMonthGrid(month, year, today))
            .join("");
          if (loadSentinel && monthsContainer) {
            loadSentinel.insertAdjacentHTML("beforebegin", newHTML);
            renderedMonthsCount += toLoad;
            cachedCalendarHTML = container.innerHTML;
          }
          if (renderedMonthsCount >= allMonths.length) {
            intersectionObserver?.disconnect();
            loadSentinel?.remove();
          }
        }
      });
    },
    { root: null, rootMargin: "200px", threshold: 0 },
  );

  intersectionObserver.observe(loadSentinel);
}

function bindCalendarEvents(container: HTMLElement, gen: number) {
  container.addEventListener("click", (e) => {
    const dayCell = (e.target as HTMLElement).closest(
      "[data-calendar-day]",
    ) as HTMLElement;
    if (!dayCell) return;
    cachedScrollPosition = container.scrollTop;
    const hasBirthdays = dayCell.dataset.hasBirthdays === "true";
    const date = new Date(dayCell.dataset.calendarDay!);
    if (hasBirthdays) showBirthdaySheet(container, date, gen);
    else showAddSheet(container, date, gen);
  });
}

function showBirthdaySheet(container: HTMLElement, date: Date, gen: number) {
  closeAllSheets();

  const day = date.getDate();
  const month = date.getMonth();
  const birthdays = getBirthdaysForDate(day, month);
  if (birthdays.length === 0) return;

  const locale = getLang() === "en" ? "en-GB" : getLang();
  const dateStr = date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const overlay = document.createElement("div");
  overlay.id = "birthday-sheet";
  overlay.style.cssText =
    "position:absolute;inset:0;background:rgba(0,0,0,0.55);z-index:100;display:flex;align-items:flex-end;";

  overlay.innerHTML = `
    <style>
      .sheet-wrap {
        background:var(--paper);
        width:100%;
        border-radius:1.5rem 1.5rem 0 0;
        border:3px solid var(--ink);
        border-bottom:none;
        padding:1.25rem 1.25rem 2rem;
        max-height:70vh;overflow-y:auto;
        scrollbar-width:none;
        position:relative;z-index:101;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .sheet-wrap::-webkit-scrollbar { display:none; }
      .sheet-handle {
        width:36px;height:4px;
        background:var(--muted);
        border-radius:999px;
        margin:0 auto 1rem;
        opacity:0.4;
      }
      .sheet-title {
        font-family:'Archivo Black',sans-serif;
        font-size:1.1rem;text-transform:uppercase;
        letter-spacing:-0.04em;color:var(--ink);
        margin:0 0 1rem;
        transition:color 0.3s ease;
      }
      .sheet-card {
        background:var(--cream);
        border:2px solid var(--ink);
        border-radius:1rem;
        box-shadow:4px 4px 0 var(--ink);
        padding:0.85rem 1rem;
        display:flex;align-items:center;justify-content:space-between;
        cursor:pointer;
        transition:border-color 0.3s ease;
      }
      .sheet-card:hover { }
    </style>
    <div class="sheet-wrap" id="birthday-sheet-content">
      <div class="sheet-handle"></div>
      <h3 class="sheet-title">${dateStr}</h3>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${birthdays
          .map((b) => {
            const color = getLetterColor(b.name);
            const avatarInner = b.avatar_url
              ? `<img src="${b.avatar_url}" class="avatar-img" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
              : `<span style="font-family:'Inter',sans-serif;font-weight:800;font-size:0.75rem;">${getInitials(
                  b.name,
                )}</span>`;
            return `
            <div data-birthday-id="${b.id}" class="sheet-card">
              <div style="display:flex;align-items:center;gap:10px;pointer-events:none;">
                <div style="width:38px;height:38px;border-radius:50%;border:2px solid var(--ink);background:${color}22;display:flex;align-items:center;justify-content:center;color:${color};overflow:hidden;flex-shrink:0;">
                  ${avatarInner}
                </div>
                <div>
                  <h4 style="font-weight:700;color:var(--ink);font-size:0.9rem;margin:0 0 2px;transition:color 0.3s ease;">${
                    b.name
                  }</h4>
                  <p style="color:var(--muted);font-size:0.72rem;margin:0;transition:color 0.3s ease;">${getZodiac(
                    b.date,
                  )}</p>
                </div>
              </div>
              <span class="material-symbols-outlined" style="color:var(--muted);font-size:1.1rem;pointer-events:none;">chevron_right</span>
            </div>
          `;
          })
          .join("")}
      </div>
    </div>
  `;

  (window as any).__root().appendChild(overlay);
  animateSheetIn(overlay);
  animateListItems(overlay, "[data-birthday-id]", 50);

  document
    .getElementById("birthday-sheet-content")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      const row = (e.target as HTMLElement).closest(
        "[data-birthday-id]",
      ) as HTMLElement;
      if (!row) return;
      const birthday = getStore().birthdays.find(
        (b) => b.id === row.dataset.birthdayId,
      );
      if (birthday) {
        closeAllSheets();
        renderDetailView(
          container,
          birthday,
          getStore().groups,
          gen,
          "calendar",
        );
      }
    });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeAllSheets();
  });
}

function showAddSheet(container: HTMLElement, date: Date, gen: number) {
  closeAllSheets();

  const day = date.getDate();
  const month = date.getMonth();
  const locale = getLang() === "en" ? "en-GB" : getLang();
  const dateStr = date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const overlay = document.createElement("div");
  overlay.id = "add-sheet";
  overlay.style.cssText =
    "position:absolute;inset:0;background:rgba(0,0,0,0.55);z-index:200;display:flex;align-items:flex-end;";

  overlay.innerHTML = `
    <div id="add-sheet-content" style="
      background:var(--paper);
      width:100%;
      border-radius:1.5rem 1.5rem 0 0;
      border:3px solid var(--ink);border-bottom:none;
      padding:1.25rem 1.25rem 2rem;
      position:relative;z-index:201;
      transition:background-color 0.3s ease, border-color 0.3s ease;
    ">
      <div style="width:36px;height:4px;background:var(--muted);border-radius:999px;margin:0 auto 1rem;opacity:0.4;"></div>
      <p style="font-size:0.72rem;font-weight:900;text-transform:uppercase;letter-spacing:0.12em;color:var(--brown);margin:0 0 0.4rem;transition:color 0.3s ease;">${dateStr}</p>
      <h3 style="font-family:'Archivo Black',sans-serif;font-size:1.1rem;text-transform:uppercase;letter-spacing:-0.04em;color:var(--ink);margin:0 0 1.1rem;transition:color 0.3s ease;">${t(
        "calendar_no_birthdays",
      ).replace("{date}", "")}</h3>
      <button id="add-birthday-btn" style="
        width:100%;height:50px;
        background:var(--lime);color:var(--on-accent-dark);
        border:2px solid var(--ink);border-radius:999px;
        box-shadow:5px 5px 0 var(--ink);
        font-family:'Inter',sans-serif;font-weight:900;font-size:0.95rem;
        cursor:pointer;
        transition:transform 0.15s ease, box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      ">${t("calendar_add_button")}</button>
    </div>
  `;

  (window as any).__root().appendChild(overlay);
  animateSheetIn(overlay);

  document
    .getElementById("add-sheet-content")
    ?.addEventListener("click", (e) => e.stopPropagation());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeAllSheets();
  });

  const addBtn = document.getElementById(
    "add-birthday-btn",
  ) as HTMLButtonElement | null;
  addBtn?.addEventListener("mouseenter", () => {
    addBtn.style.transform = "translate(3px,3px)";
    addBtn.style.boxShadow = "2px 2px 0 var(--ink)";
  });
  addBtn?.addEventListener("mouseleave", () => {
    addBtn.style.transform = "";
    addBtn.style.boxShadow = "5px 5px 0 var(--ink)";
  });

  document.getElementById("add-birthday-btn")?.addEventListener("click", () => {
    closeAllSheets();
    (window as any).__prefilledDate = { day, month: month + 1 };
    renderAdd(container, gen, "calendar");
  });
}
