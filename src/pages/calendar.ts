import { getNavGeneration, setSubView, updateFABVisibility } from "../app";
import { getStore } from "../store";
import { getLetterColor } from "../utils";
import {
  animatePageEnter,
  animateSheetIn,
  bindButtonFeedback,
} from "../animations";
import { renderDetailView } from "./birthdays";
import { renderAdd } from "./add";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Cache for rendered calendar element and store version
let cachedCalendarHTML: string = "";
let cachedStoreVersion: number = -1;
let cachedScrollPosition: number = 0;
let cachedMonth: number = -1; // Track which month the cache was built for
let cachedYear: number = -1; // Track which year the cache was built for

// Lazy loading state
let renderedMonthsCount = 0;
let allMonths: Array<{ month: number; year: number }> = [];
let monthsContainer: HTMLElement | null = null;
let loadSentinel: HTMLElement | null = null;
let intersectionObserver: IntersectionObserver | null = null;

function parseStoredDate(dateStr: string): {
  month: number;
  day: number;
  year: number | null;
} {
  const parts = dateStr.split("-");
  const year = parseInt(parts[0]);
  return {
    year: year === 1 ? null : year,
    month: parseInt(parts[1]) - 1,
    day: parseInt(parts[2]),
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number): number {
  // Returns 0-6 where 0 = Monday, 6 = Sunday
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function getBirthdaysForDate(day: number, month: number): any[] {
  const birthdays = getStore().birthdays.filter((b) => !b.archived);
  return birthdays.filter((b) => {
    const parsed = parseStoredDate(b.date);
    return parsed.day === day && parsed.month === month;
  });
}

// Cleanup function to remove any existing sheets
function closeAllSheets() {
  const birthdaySheet = document.getElementById("birthday-sheet");
  const addSheet = document.getElementById("add-sheet");
  if (birthdaySheet) birthdaySheet.remove();
  if (addSheet) addSheet.remove();
}

// Get a version hash of the store data to detect changes
function getStoreVersion(): number {
  const store = getStore();
  // Simple hash: count of birthdays + sum of their IDs
  return (
    store.birthdays.length +
    store.birthdays.reduce((sum, b) => sum + b.id.length, 0)
  );
}

export function renderCalendar(
  container: HTMLElement,
  gen = 0,
  isMainView = true,
) {
  if (!container.isConnected || gen !== getNavGeneration()) return;

  // Clean up any existing sheets before rendering
  closeAllSheets();

  // Update sub-view state
  setSubView(!isMainView);
  updateFABVisibility();

  const storeVersion = getStoreVersion();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Check if we can use cached HTML
  // Cache is valid only if store hasn't changed AND we're still in the same month
  if (
    isMainView &&
    cachedCalendarHTML &&
    cachedStoreVersion === storeVersion &&
    cachedMonth === currentMonth &&
    cachedYear === currentYear
  ) {
    // Use cached HTML - instant render
    container.innerHTML = cachedCalendarHTML;

    // Restore scroll position
    requestAnimationFrame(() => {
      container.scrollTop = cachedScrollPosition;
    });

    // Re-setup lazy loading and event handlers
    monthsContainer = document.getElementById("calendar-months-container");
    loadSentinel = document.getElementById("load-sentinel");

    setupLazyLoading(today, container);
    bindCalendarEvents(container, gen);

    // Re-attach scroll listener
    container.addEventListener(
      "scroll",
      () => {
        cachedScrollPosition = container.scrollTop;
      },
      { passive: true },
    );

    return;
  }

  // Generate rolling 12-month window from current month
  allMonths = [];
  let m = currentMonth;
  let y = currentYear;

  // Generate 12 months starting from current month
  for (let i = 0; i < 12; i++) {
    allMonths.push({ month: m, year: y });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }

  // Initial render: only first 3 months
  renderedMonthsCount = 0;
  const initialMonthsToRender = Math.min(3, allMonths.length);

  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

    <header style="position:sticky;top:0;z-index:40;background:rgba(13,13,13,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="material-symbols-outlined" style="color:#ffb3b0;font-variation-settings:'FILL' 1;">calendar_month</span>
        <h1 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.5rem;color:#ffb3b0;margin:0;">Calendar</h1>
      </div>
    </header>

    <div id="calendar-months-container" style="padding:1rem 1.5rem 80px;">
      ${allMonths
        .slice(0, initialMonthsToRender)
        .map(({ month, year }) => renderMonthGrid(month, year, today))
        .join("")}
      <div id="load-sentinel" style="height:1px;"></div>
    </div>
  `;

  renderedMonthsCount = initialMonthsToRender;
  monthsContainer = document.getElementById("calendar-months-container");
  loadSentinel = document.getElementById("load-sentinel");

  // Set up intersection observer for lazy loading
  setupLazyLoading(today, container);

  animatePageEnter(container);
  bindButtonFeedback(container);
  bindCalendarEvents(container, gen);

  // Cache the rendered HTML, store version, and current month/year
  cachedCalendarHTML = container.innerHTML;
  cachedStoreVersion = storeVersion;
  cachedMonth = currentMonth;
  cachedYear = currentYear;
  cachedScrollPosition = 0;

  // Track scroll position for cache restoration
  container.addEventListener(
    "scroll",
    () => {
      cachedScrollPosition = container.scrollTop;
    },
    { passive: true },
  );
}

function setupLazyLoading(today: Date, container: HTMLElement) {
  // Clean up existing observer
  if (intersectionObserver) {
    intersectionObserver.disconnect();
  }

  if (!loadSentinel || !monthsContainer) return;

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && renderedMonthsCount < allMonths.length) {
          // Load next 2 months
          const monthsToLoad = Math.min(
            2,
            allMonths.length - renderedMonthsCount,
          );
          const newMonths = allMonths
            .slice(renderedMonthsCount, renderedMonthsCount + monthsToLoad)
            .map(({ month, year }) => renderMonthGrid(month, year, today))
            .join("");

          // Insert before sentinel
          if (loadSentinel && monthsContainer) {
            loadSentinel.insertAdjacentHTML("beforebegin", newMonths);
            renderedMonthsCount += monthsToLoad;

            // Update cached HTML
            cachedCalendarHTML = container.innerHTML;
          }

          // If all months loaded, disconnect observer
          if (renderedMonthsCount >= allMonths.length) {
            intersectionObserver?.disconnect();
            loadSentinel?.remove();
          }
        }
      });
    },
    {
      root: null,
      rootMargin: "200px", // Start loading 200px before sentinel is visible
      threshold: 0,
    },
  );

  intersectionObserver.observe(loadSentinel);
}

function bindCalendarEvents(container: HTMLElement, gen: number) {
  // Day click handlers
  container.addEventListener("click", (e) => {
    const dayCell = (e.target as HTMLElement).closest(
      "[data-calendar-day]",
    ) as HTMLElement;
    if (!dayCell) return;

    const hasBirthdays = dayCell.dataset.hasBirthdays === "true";
    const dateStr = dayCell.dataset.calendarDay!;
    const date = new Date(dateStr);

    if (hasBirthdays) {
      showBirthdaySheet(container, date, gen);
    } else {
      showAddSheet(container, date, gen);
    }
  });
}

function renderMonthGrid(month: number, year: number, today: Date): string {
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const prevMonthDays = getDaysInMonth(month - 1, year);

  // Build calendar grid
  const calendarDays: Array<{
    day: number;
    isCurrentMonth: boolean;
    date: Date;
  }> = [];

  // Previous month overflow
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(prevYear, prevMonth, day),
    });
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day),
    });
  }

  // Next month overflow
  const remainingCells = 42 - calendarDays.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(nextYear, nextMonth, day),
    });
  }

  return `
    <div style="margin-bottom:2rem;">
      <!-- Month Header -->
      <h2 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.25rem;color:#e5e2e1;margin:0 0 1rem;text-align:center;">
        ${MONTH_NAMES[month]} ${year}
      </h2>

      <!-- Calendar Grid -->
      <div style="background:#1a1a1a;border-radius:1.5rem;padding:1rem;overflow:hidden;width:100%;box-sizing:border-box;">
        <!-- Day headers -->
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px;width:100%;">
          ${DAY_NAMES.map(
            (day) => `
            <div style="text-align:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#555;padding:4px 0;">
              ${day}
            </div>
          `,
          ).join("")}
        </div>

        <!-- Calendar days -->
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;width:100%;">
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
              <div data-calendar-day="${date.toISOString()}" data-has-birthdays="${hasBirthdays}" 
                style="aspect-ratio:1;background:${isCurrentMonth ? "#0f0f0f" : "transparent"};border-radius:12px;padding:4px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;cursor:${hasBirthdays || isCurrentMonth ? "pointer" : "default"};position:relative;transition:background 0.2s;min-width:0;overflow:hidden;"
                ${hasBirthdays || isCurrentMonth ? `onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='${isCurrentMonth ? "#0f0f0f" : "transparent"}'"` : ""}>
                <div style="position:relative;width:100%;display:flex;justify-content:center;margin-bottom:2px;">
                  ${isToday ? `<div style="position:absolute;width:24px;height:24px;border-radius:50%;background:#ff6b6b;z-index:0;"></div>` : ""}
                  <span style="font-size:11px;font-weight:${isToday ? "800" : "600"};color:${isToday ? "#fff" : isCurrentMonth ? "#e5e2e1" : "#333"};position:relative;z-index:1;">
                    ${day}
                  </span>
                </div>
                ${
                  hasBirthdays
                    ? `
                  <div style="display:flex;gap:1px;flex-wrap:wrap;justify-content:center;align-items:center;max-width:100%;">
                    ${birthdays
                      .slice(0, 3)
                      .map((b) => {
                        const color = getLetterColor(b.name);
                        return b.avatar_url
                          ? `<div style="width:8px;height:8px;border-radius:50%;overflow:hidden;flex-shrink:0;">
                            <img src="${b.avatar_url}" style="width:100%;height:100%;object-fit:cover;" />
                          </div>`
                          : `<div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></div>`;
                      })
                      .join("")}
                    ${birthdays.length > 3 ? `<span style="font-size:7px;font-weight:700;color:#ffb3b0;margin-left:1px;">+${birthdays.length - 3}</span>` : ""}
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

function showBirthdaySheet(container: HTMLElement, date: Date, gen: number) {
  // Close any existing sheets first
  closeAllSheets();

  const day = date.getDate();
  const month = date.getMonth();
  const birthdays = getBirthdaysForDate(day, month);

  if (birthdays.length === 0) return;

  const dateStr = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const overlay = document.createElement("div");
  overlay.id = "birthday-sheet";
  overlay.style.cssText =
    "position:absolute;inset:0;background:rgba(0,0,0,0.7);z-index:100;display:flex;align-items:flex-end;";

  overlay.innerHTML = `
    <div id="birthday-sheet-content" style="background:#1a1a1a;width:100%;border-radius:1.5rem 1.5rem 0 0;padding:1.5rem;max-height:70vh;overflow-y:auto;scrollbar-width:none;position:relative;z-index:101;">
      <div style="width:40px;height:4px;background:#333;border-radius:9999px;margin:0 auto 1rem;"></div>
      <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.25rem;color:#e5e2e1;margin:0 0 1rem;">${dateStr}</h3>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${birthdays
          .map((b) => {
            const color = getLetterColor(b.name);
            const avatarInner = b.avatar_url
              ? `<img src="${b.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
              : getInitials(b.name);

            return `
            <div data-birthday-id="${b.id}" style="background:#0f0f0f;border-radius:1rem;padding:1rem;display:flex;align-items:center;justify-content:space-between;cursor:pointer;position:relative;z-index:102;transition:background 0.2s;"
              onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0f0f0f'">
              <div style="display:flex;align-items:center;gap:12px;pointer-events:none;">
                <div style="width:40px;height:40px;border-radius:50%;background:${color}26;display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:12px;color:${color};overflow:hidden;">
                  ${avatarInner}
                </div>
                <div>
                  <h4 style="font-weight:700;color:#e5e2e1;font-size:15px;margin:0 0 2px;">${b.name}</h4>
                  <p style="color:#a78a88;font-size:12px;margin:0;">${getZodiac(b.date)}</p>
                </div>
              </div>
              <span class="material-symbols-outlined" style="color:#666;font-size:20px;pointer-events:none;">chevron_right</span>
            </div>
          `;
          })
          .join("")}
      </div>
    </div>
  `;

  (window as any).__root().appendChild(overlay);
  animateSheetIn(overlay);

  // Stop propagation on sheet content clicks
  const sheetContent = document.getElementById("birthday-sheet-content");
  if (sheetContent) {
    sheetContent.addEventListener("click", (e) => {
      e.stopPropagation();

      const row = (e.target as HTMLElement).closest(
        "[data-birthday-id]",
      ) as HTMLElement;
      if (!row) return;

      const birthdayId = row.dataset.birthdayId!;
      const birthday = getStore().birthdays.find((b) => b.id === birthdayId);
      if (birthday) {
        // Close sheet before navigating
        closeAllSheets();
        // Pass "calendar" as returnTo so back button returns to calendar
        const groups = getStore().groups;
        renderDetailView(container, birthday, groups, gen, "calendar");
      }
    });
  }

  // Close on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeAllSheets();
    }
  });
}

function showAddSheet(container: HTMLElement, date: Date, gen: number) {
  // Close any existing sheets first
  closeAllSheets();

  const day = date.getDate();
  const month = date.getMonth();
  const dateStr = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const overlay = document.createElement("div");
  overlay.id = "add-sheet";
  overlay.style.cssText =
    "position:absolute;inset:0;background:rgba(0,0,0,0.7);z-index:200;display:flex;align-items:flex-end;";

  overlay.innerHTML = `
    <div id="add-sheet-content" style="background:#1a1a1a;width:100%;border-radius:1.5rem 1.5rem 0 0;padding:1.5rem;position:relative;z-index:201;">
      <div style="width:40px;height:4px;background:#333;border-radius:9999px;margin:0 auto 1rem;"></div>
      <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:1rem;color:#e5e2e1;margin:0 0 0.5rem;">No birthdays on ${dateStr}</h3>
      <button id="add-birthday-btn" style="width:100%;height:52px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;cursor:pointer;transition:transform 0.15s;margin-top:1rem;"
        onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
        Add Birthday on this date
      </button>
    </div>
  `;

  (window as any).__root().appendChild(overlay);
  animateSheetIn(overlay);

  // Stop propagation on sheet content clicks
  const sheetContent = document.getElementById("add-sheet-content");
  if (sheetContent) {
    sheetContent.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // Close on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeAllSheets();
    }
  });

  // Navigate to add page with pre-filled date
  const addBtn = document.getElementById("add-birthday-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      // Close sheet before navigating
      closeAllSheets();
      (window as any).__prefilledDate = { day, month: month + 1 };
      renderAdd(container, gen, "calendar");
    });
  }
}

function getZodiac(dateStr: string): string {
  const { month, day } = parseStoredDate(dateStr);
  const m = month + 1;
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "Aries";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "Taurus";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return "Gemini";
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return "Cancer";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "Leo";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "Virgo";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return "Libra";
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return "Scorpio";
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return "Sagittarius";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "Capricorn";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}
