import { t, getLang } from "../services/i18n";
import { supabase } from "../services/supabase";
import { renderGift } from "./gift";
import { showToast as showBdayToast } from "../features/toast";
import {
  getNavGeneration,
  setSubView,
  updateFABVisibility,
  getCurrentPage,
  setCurrentPage,
} from "../core/app";
import {
  getStore,
  refreshAll,
  updateBirthday,
  replaceBirthday,
  removeBirthday,
  restoreBirthdayAt,
} from "../services/store";
import {
  animatePageEnter,
  animateSlideUp,
  animateListItems,
  animateModalIn,
  animateSpotlight,
  bindButtonFeedback,
} from "../features/animations";
import {
  parseStoredDate,
  getZodiac,
  getInitials,
  getMonthName,
} from "../utils/utils";

let activeGroupFilter: string = "all";

function daysUntilBirthday(dateStr: string): number {
  const { month, day } = parseStoredDate(dateStr);
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const next = new Date(today.getFullYear(), month, day);
  if (next < todayMidnight) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next.getTime() - todayMidnight.getTime()) / 86400000);
}

function getNextBirthdayDate(dateStr: string): string {
  const { month, day } = parseStoredDate(dateStr);
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const next = new Date(today.getFullYear(), month, day);
  if (next < todayMidnight) next.setFullYear(today.getFullYear() + 1);
  const locale = getLang() === "en" ? "en-GB" : getLang();
  return next.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getAge(dateStr: string): number {
  const { month, day, year } = parseStoredDate(dateStr);
  if (!year) return 0;
  const today = new Date();
  let age = today.getFullYear() - year;
  if (today < new Date(today.getFullYear(), month, day)) age--;
  return age;
}

function getTurningAge(dateStr: string): number {
  const { month, day, year } = parseStoredDate(dateStr);
  if (!year) return 0;
  const today = new Date();
  const thisYearBirthday = new Date(today.getFullYear(), month, day);
  let age = today.getFullYear() - year;
  if (today < thisYearBirthday) return age;
  return age + 1;
}

function nextBirthdayMonth(dateStr: string): number {
  const { month, day } = parseStoredDate(dateStr);
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const next = new Date(today.getFullYear(), month, day);
  if (next < todayMidnight) next.setFullYear(today.getFullYear() + 1);
  return next.getMonth();
}

function birthdayCard(birthday: any, days: number, archived = false): string {
  const daysLabel =
    days === 0
      ? t("birthdays_today_label")
      : days === 1
      ? t("birthdays_one_day_label")
      : t("birthdays_days_label").replace("{n}", String(days));

  const { year } = parseStoredDate(birthday.date);
  let ageStr = "";
  if (year) {
    ageStr =
      days === 0
        ? t("birthdays_turned").replace("{age}", String(getAge(birthday.date)))
        : t("birthdays_turns").replace(
            "{age}",
            String(getTurningAge(birthday.date)),
          );
  }

  const avatarInner = birthday.avatar_url
    ? `<img src="${birthday.avatar_url}" class="avatar-img" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
    : `<span style="font-family:'Inter',sans-serif;font-weight:800;font-size:0.8rem;">${getInitials(
        birthday.name,
      )}</span>`;

  const wishedBadge = birthday.wished
    ? `<div style="position:absolute;top:0.6rem;right:0.6rem;width:18px;height:18px;border-radius:50%;background:var(--lime);border:2px solid var(--ink);display:flex;align-items:center;justify-content:center;">
        <span class="material-symbols-outlined" style="color:var(--on-accent-dark);font-size:10px;font-variation-settings:'FILL' 1;">check</span>
      </div>`
    : "";

  const urgentDays = !archived && days <= 7;

  return `
    <div data-birthday-id="${birthday.id}" class="bday-card" style="
      background:var(--paper);
      border:2px solid var(--ink);
      border-radius:1rem;
      border-left:4px solid var(--ink);
      padding:0.85rem 1rem;
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-bottom:12px;
      opacity:${archived ? "0.55" : "1"};
      position:relative;
    ">
      ${wishedBadge}
      <div style="display:flex;align-items:center;gap:10px;min-width:0;">
        <div style="
          width:40px;height:40px;flex-shrink:0;
          border-radius:50%;
          border:2px solid var(--ink);
          box-shadow:3px 3px 0 var(--ink);
          background:var(--paper);
          display:flex;align-items:center;justify-content:center;
          color:var(--orange);
          overflow:hidden;
        ">${avatarInner}</div>
        <div style="min-width:0;">
          <h3 style="font-family:'Inter',sans-serif;font-weight:700;color:var(--ink);font-size:0.92rem;margin:0 0 1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color 0.3s ease;">${
            birthday.name
          }</h3>
          ${
            ageStr
              ? `<p style="color:var(--orange);font-size:0.75rem;font-weight:700;margin:0 0 1px;transition:color 0.3s ease;">${ageStr}</p>`
              : ""
          }
          <p style="color:var(--muted);font-size:0.72rem;margin:0;transition:color 0.3s ease;">${getNextBirthdayDate(
            birthday.date,
          )}</p>
          <p style="color:var(--muted);font-size:0.72rem;margin:0;transition:color 0.3s ease;">${getZodiac(
            birthday.date,
          )}</p>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:8px;">
        <span style="
          font-size:0.72rem;font-weight:800;
          color:${
            archived
              ? "var(--muted)"
              : urgentDays
              ? "var(--orange)"
              : "var(--muted)"
          };
          white-space:nowrap;
          transition:color 0.3s ease;
        ">${daysLabel}</span>
      </div>
    </div>
  `;
}

function spotlightCard(birthday: any, days: number): string {
  const { year } = parseStoredDate(birthday.date);
  let ageStr = "";
  if (year) {
    ageStr =
      days === 0
        ? t("birthdays_turned").replace("{age}", String(getAge(birthday.date)))
        : t("birthdays_turns").replace(
            "{age}",
            String(getTurningAge(birthday.date)),
          );
  }

  return `
    <section style="margin-bottom:1.25rem;" data-birthday-id="${birthday.id}">
      <div style="
        position:relative;overflow:hidden;
        border-radius:1.5rem;
        background:var(--paper);
        border:3px solid var(--ink);
        border-left:5px solid var(--orange);
        box-shadow:4px 4px 0 var(--ink);
        padding:1.5rem;
        cursor:pointer;
        transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      ">
        <div style="position:absolute;top:0;right:0;padding:1rem;opacity:0.06;pointer-events:none;">
          <span class="material-symbols-outlined" style="font-size:90px;font-variation-settings:'FILL' 1;color:var(--ink);">cake</span>
        </div>
        <div style="position:relative;z-index:1;">
          <span style="
            display:inline-block;
            padding:2px 10px;
            background:var(--cream);
            color:var(--orange);
            font-size:0.65rem;font-weight:900;
            text-transform:uppercase;letter-spacing:0.12em;
            border:1px solid var(--orange);
            border-radius:999px;
            margin-bottom:0.75rem;
          ">${
            days === 0
              ? t("birthdays_spotlight_today")
              : t("birthdays_spotlight_coming")
          }</span>
          <h2 style="font-family:'Archivo Black',sans-serif;font-size:1.75rem;text-transform:uppercase;letter-spacing:-0.05em;color:var(--ink);margin:0 0 3px;line-height:0.95;transition:color 0.3s ease;">${
            birthday.name
          }</h2>
          ${
            ageStr
              ? `<p style="color:var(--orange);font-size:0.8rem;font-weight:700;margin:0 0 2px;transition:color 0.3s ease;">${ageStr}</p>`
              : ""
          }
          <p style="color:var(--muted);font-size:0.8rem;font-weight:500;margin:0 0 2px;transition:color 0.3s ease;">${getNextBirthdayDate(
            birthday.date,
          )}</p>
          <p style="color:var(--muted);font-size:0.72rem;margin:0;transition:color 0.3s ease;">${getZodiac(
            birthday.date,
          )}</p>
        </div>
      </div>
    </section>
  `;
}

function groupFilterBtn(id: string, name: string, color: string): string {
  const active = activeGroupFilter === id;
  return `
    <button data-gfilter="${id}" style="
      display:inline-flex;align-items:center;gap:5px;
      white-space:nowrap;
      padding:4px 12px 4px 8px;
      background:${active ? color + "22" : "var(--paper)"};
      border:2px solid ${active ? color : "var(--ink)"};
      border-radius:999px;
      box-shadow:2px 2px 0 var(--ink);
      cursor:pointer;flex-shrink:0;
      transition:all 0.15s ease;
    ">
      <span style="width:7px;height:7px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;pointer-events:none;"></span>
      <span style="font-size:0.72rem;font-weight:700;color:${
        active ? color : "var(--muted)"
      };font-family:'Inter',sans-serif;pointer-events:none;text-transform:uppercase;letter-spacing:0.06em;">${name}</span>
    </button>
  `;
}

export async function renderBirthdays(
  container: HTMLElement,
  gen = 0,
  isMainView = true,
) {
  const groups = getStore().groups;
  if (!container.isConnected || gen !== getNavGeneration()) return;

  setSubView(!isMainView);
  updateFABVisibility();

  const allActive = activeGroupFilter === "all";

  container.innerHTML = `
    <style>
      .bday-header {
        position:sticky;top:0;z-index:40;
        background:var(--cream);
        border-bottom:3px solid var(--ink);
        display:flex;align-items:center;justify-content:space-between;
        padding:0.9rem 1.25rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .bday-header-title {
        font-family:'Archivo Black',sans-serif;
        font-size:1.3rem;text-transform:uppercase;
        letter-spacing:-0.05em;color:var(--ink);margin:0;
        transition:color 0.3s ease;
      }
      .bday-icon-btn {
        background:none;border:none;
        color:var(--muted);cursor:pointer;
        padding:2px;
        border-radius:50%;
        display:flex;align-items:center;
        transition:color 0.2s ease;
      }
      .bday-icon-btn:hover { color:var(--orange); }

      .bday-search-input {
        width:100%;height:46px;
        background:var(--paper);
        border:2px solid var(--ink);
        border-radius:0.85rem;
        padding:0 1rem;
        color:var(--ink);
        font-size:0.9rem;
        font-family:'Inter',sans-serif;
        outline:none;box-sizing:border-box;
        transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .bday-search-input:focus { box-shadow:4px 4px 0 var(--ink); }
      .bday-search-input::placeholder { color:var(--muted); }

      .gfilter-all {
        white-space:nowrap;padding:4px 14px;
        background:${allActive ? "var(--orange)" : "var(--paper)"};
        border:2px solid var(--ink);
        border-radius:999px;
        box-shadow:${
          allActive ? "3px 3px 0 var(--ink)" : "2px 2px 0 var(--ink)"
        };
        cursor:pointer;flex-shrink:0;
        transition:all 0.15s ease;
      }
      .gfilter-all:active { transform:scale(0.95); }
      .gfilter-all span {
        font-size:0.72rem;font-weight:700;
        color:${allActive ? "var(--on-accent-light)" : "var(--muted)"};
        font-family:'Inter',sans-serif;
        pointer-events:none;
        text-transform:uppercase;letter-spacing:0.06em;
      }

      .month-label {
        font-size:0.68rem;font-weight:900;
        text-transform:uppercase;letter-spacing:0.14em;
        color:var(--brown);margin:0 0 8px;padding-left:2px;
        transition:color 0.3s ease;
      }
      .archived-label {
        font-size:0.68rem;font-weight:900;
        text-transform:uppercase;letter-spacing:0.14em;
        color:var(--muted);margin:0 0 8px;padding-left:2px;
        transition:color 0.3s ease;
      }
      .empty-state {
        text-align:center;padding:4rem 0;
      }
      .bday-card {
        box-shadow:4px 4px 0 var(--ink);
        transition:box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.3s ease, border-color 0.3s ease;
      }
      .bday-card:hover {
        transform:translate(-2px, -2px);
        box-shadow:6px 6px 0 var(--ink);
      }
    </style>

    <header class="bday-header">
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="material-symbols-outlined" style="font-size:1.5rem;color:var(--orange);">cake</span>
        <h1 class="bday-header-title">${t("birthdays_header_title")}</h1>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <button id="gift-btn" style="
          background:var(--paper);color:var(--muted);
          border:2px solid var(--ink);border-radius:999px;
          box-shadow:3px 3px 0 var(--ink);
          padding:0.3rem 0.7rem;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;
          transition:transform 0.15s ease, box-shadow 0.15s ease, color 0.15s ease,
            background-color 0.3s ease, border-color 0.3s ease;
        " aria-label="Gift ideas">
          <span class="material-symbols-outlined" style="font-size:1.1rem;">redeem</span>
        </button>
        <button id="search-btn" style="
          background:var(--paper);color:var(--muted);
          border:2px solid var(--ink);border-radius:999px;
          box-shadow:3px 3px 0 var(--ink);
          padding:0.3rem 0.7rem;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;
          transition:transform 0.15s ease, box-shadow 0.15s ease, color 0.15s ease,
            background-color 0.3s ease, border-color 0.3s ease;
        " aria-label="Search">
          <span class="material-symbols-outlined" style="font-size:1.1rem;">search</span>
        </button>
      </div>
    </header>

    <div style="padding:0 1.25rem 80px;">
      <div id="search-bar" style="display:none;padding:0.75rem 0 0;">
        <input id="search-input" class="bday-search-input" type="text" placeholder="${t(
          "birthdays_search_placeholder",
        )}" />
      </div>

      <div id="group-filter-bar" style="display:flex;align-items:center;gap:7px;padding:0.6rem 0 0.25rem;margin-bottom:1rem;overflow-x:auto;scrollbar-width:none;cursor:grab;user-select:none;">
        <button data-gfilter="all" class="gfilter-all">
          <span>${t("birthdays_all_filter")}</span>
        </button>
        ${groups
          .map((g: any) =>
            groupFilterBtn(g.id, g.name, g.color || "var(--orange)"),
          )
          .join("")}
      </div>

      <div id="birthdays-list">
        <div class="empty-state">
          <span class="material-symbols-outlined" style="font-size:48px;font-variation-settings:'FILL' 1;color:var(--muted);">cake</span>
          <p style="margin:1rem 0 0;font-size:0.9rem;color:var(--muted);">${t(
            "birthdays_loading",
          )}</p>
        </div>
      </div>
    </div>
  `;

  bindGroupFilterEvents(container, groups, gen);
  bindSearchEvent(container);
  bindCardClick(container, gen);
  document
    .getElementById("gift-btn")
    ?.addEventListener("click", () => renderGift(container));

  ["gift-btn", "search-btn"].forEach((id) => {
    const btn = document.getElementById(id) as HTMLButtonElement;
    if (!btn) return;
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translate(2px,2px)";
      btn.style.boxShadow = "1px 1px 0 var(--ink)";
      btn.style.color = "var(--orange)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
      btn.style.boxShadow = "3px 3px 0 var(--ink)";
      btn.style.color = "var(--muted)";
    });
  });

  animatePageEnter(container);
  bindButtonFeedback(container);

  const filterBar = document.getElementById("group-filter-bar");
  if (filterBar) {
    let isDown = false,
      startX = 0,
      scrollLeft = 0;
    filterBar.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - filterBar.offsetLeft;
      scrollLeft = filterBar.scrollLeft;
      filterBar.style.cursor = "grabbing";
    });
    filterBar.addEventListener("mouseleave", () => {
      isDown = false;
      filterBar.style.cursor = "grab";
    });
    filterBar.addEventListener("mouseup", () => {
      isDown = false;
      filterBar.style.cursor = "grab";
    });
    filterBar.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      filterBar.scrollLeft =
        scrollLeft - (e.pageX - filterBar.offsetLeft - startX);
    });
  }

  await loadBirthdays(container, gen);
}

function bindSearchEvent(_container: HTMLElement) {
  document.getElementById("search-btn")?.addEventListener("click", () => {
    const bar = document.getElementById("search-bar");
    if (!bar) return;
    const isVisible = bar.style.display !== "none";
    bar.style.display = isVisible ? "none" : "block";
    if (!isVisible) document.getElementById("search-input")?.focus();
  });
  document.getElementById("search-input")?.addEventListener("input", (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();
    const list = document.getElementById("birthdays-list");
    if (!list) return;
    const filtered = getStore()
      .birthdays.filter(
        (b) => !b.archived && b.name.toLowerCase().includes(query),
      )
      .map((b) => ({ ...b, days: daysUntilBirthday(b.date) }));
    renderList(list, filtered);
  });
}

function bindGroupFilterEvents(
  container: HTMLElement,
  groups: any[],
  gen: number,
) {
  const filterBar = container.querySelector("#group-filter-bar") as HTMLElement;
  if (filterBar) {
    filterBar.addEventListener(
      "mouseenter",
      (e) => {
        const btn = (e.target as HTMLElement).closest(
          "[data-gfilter]",
        ) as HTMLElement;
        if (btn) {
          btn.style.transform = "translate(2px,2px)";
          btn.style.boxShadow = "1px 1px 0 var(--ink)";
        }
      },
      true,
    );
    filterBar.addEventListener(
      "mouseleave",
      (e) => {
        const btn = (e.target as HTMLElement).closest(
          "[data-gfilter]",
        ) as HTMLElement;
        if (btn) {
          btn.style.transform = "";
          btn.style.boxShadow =
            btn.dataset.gfilter === activeGroupFilter
              ? "3px 3px 0 var(--ink)"
              : "2px 2px 0 var(--ink)";
        }
      },
      true,
    );
    filterBar.addEventListener("mousedown", (e) => {
      const btn = (e.target as HTMLElement).closest(
        "[data-gfilter]",
      ) as HTMLElement;
      if (btn) {
        btn.style.transform = "scale(0.95)";
        btn.style.transition = "transform 0.08s ease";
      }
    });
    filterBar.addEventListener("mouseup", (e) => {
      const btn = (e.target as HTMLElement).closest(
        "[data-gfilter]",
      ) as HTMLElement;
      if (btn) {
        btn.style.transform = "scale(1)";
        btn.style.transition = "transform 0.2s ease-out";
      }
    });
    filterBar.addEventListener(
      "touchstart",
      (e) => {
        const btn = (e.target as HTMLElement).closest(
          "[data-gfilter]",
        ) as HTMLElement;
        if (btn) {
          btn.style.transform = "scale(0.95)";
          btn.style.transition = "transform 0.08s ease";
        }
      },
      { passive: true },
    );
    filterBar.addEventListener(
      "touchend",
      (e) => {
        const btn = (e.target as HTMLElement).closest(
          "[data-gfilter]",
        ) as HTMLElement;
        if (btn) {
          btn.style.transform = "scale(1)";
          btn.style.transition = "transform 0.2s ease-out";
        }
      },
      { passive: true },
    );
  }

  container.addEventListener("click", async (e) => {
    const btn = (e.target as HTMLElement).closest(
      "[data-gfilter]",
    ) as HTMLElement;
    if (!btn) return;
    activeGroupFilter = btn.dataset.gfilter!;

    container.querySelectorAll("[data-gfilter]").forEach((b) => {
      const el = b as HTMLElement;
      const isActive = el.dataset.gfilter === activeGroupFilter;
      if (el.dataset.gfilter === "all") {
        el.style.background = isActive ? "var(--orange)" : "var(--paper)";
        const span = el.querySelector("span") as HTMLElement;
        if (span)
          span.style.color = isActive
            ? "var(--on-accent-light)"
            : "var(--muted)";
        el.style.boxShadow = isActive
          ? "3px 3px 0 var(--ink)"
          : "2px 2px 0 var(--ink)";
      } else {
        const g = groups.find((g) => g.id === el.dataset.gfilter);
        const color = g?.color || "var(--orange)";
        el.style.background = isActive ? color + "22" : "var(--paper)";
        el.style.borderColor = isActive ? color : "var(--ink)";
        el.style.boxShadow = isActive
          ? "3px 3px 0 var(--ink)"
          : "2px 2px 0 var(--ink)";
        const nameSpan = el.querySelectorAll("span")[1] as HTMLElement;
        if (nameSpan) nameSpan.style.color = isActive ? color : "var(--muted)";
      }
    });

    await loadBirthdays(container, gen);
  });
}

function bindCardClick(container: HTMLElement, gen: number) {
  container.addEventListener("click", async (e) => {
    const card = (e.target as HTMLElement).closest(
      "[data-birthday-id]",
    ) as HTMLElement;
    if (!card) return;
    const id = card.dataset.birthdayId!;
    const birthday = getStore().birthdays.find((b) => b.id === id);
    const groups = getStore().groups;
    if (birthday)
      renderDetailView(container, birthday, groups, gen, getCurrentPage());
  });
}

function renderList(list: HTMLElement, birthdays: any[], archived: any[] = []) {
  if (birthdays.length === 0 && archived.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-outlined" style="font-size:56px;font-variation-settings:'FILL' 1;color:var(--muted);opacity:0.5;">cake</span>
        <p style="margin:1rem 0 0;font-size:0.95rem;font-weight:600;color:var(--ink);">${t(
          "birthdays_empty_title",
        )}</p>
        <p style="margin:6px 0 0;font-size:0.82rem;color:var(--muted);">${t(
          "birthdays_empty_subtitle",
        )}</p>
      </div>
    `;
    return;
  }

  const spotlight = birthdays.find((b) => b.days <= 7);

  const today = new Date();
  const currentMonth = today.getMonth();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const upcoming: any[] = [];
  const passedThisMonth: any[] = [];

  for (const b of birthdays) {
    const { month, day } = parseStoredDate(b.date);
    const thisYearDate = new Date(today.getFullYear(), month, day);
    if (month === currentMonth && thisYearDate < todayMidnight) {
      passedThisMonth.push(b);
    } else {
      upcoming.push(b);
    }
  }

  const byMonth: Record<number, any[]> = {};
  for (const b of upcoming) {
    const m = nextBirthdayMonth(b.date);
    if (!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(b);
  }
  const monthOrder = [
    ...new Set(upcoming.map((b) => nextBirthdayMonth(b.date))),
  ];

  list.innerHTML = `
    ${spotlight ? spotlightCard(spotlight, spotlight.days) : ""}
    ${monthOrder
      .map(
        (m) => `
      <div style="margin-bottom:1.25rem;">
        <p class="month-label">${getMonthName(m)}</p>
        ${byMonth[m].map((b) => birthdayCard(b, b.days)).join("")}
      </div>
    `,
      )
      .join("")}
    ${
      passedThisMonth.length > 0
        ? `
      <div style="margin-bottom:1.25rem;">
        <p class="month-label">${getMonthName(currentMonth)}</p>
        ${passedThisMonth.map((b) => birthdayCard(b, b.days)).join("")}
      </div>
    `
        : ""
    }
    ${
      archived.length > 0
        ? `
      <div style="margin-top:0.75rem;">
        <p class="archived-label">${t("birthdays_archived_header")}</p>
        ${archived.map((b) => birthdayCard(b, b.days, true)).join("")}
      </div>
    `
        : ""
    }
  `;
}

export function renderDetailView(
  container: HTMLElement,
  birthday: any,
  groups: any[] = [],
  gen = 0,
  returnTo: string = "birthdays",
) {
  setSubView(true);
  updateFABVisibility();

  const days = daysUntilBirthday(birthday.date);
  const daysLabel =
    days === 0
      ? t("birthdays_today_exclamation")
      : days === 1
      ? t("birthdays_one_day")
      : t("birthdays_n_days").replace("{n}", String(days));

  const { day, month, year } = parseStoredDate(birthday.date);

  const avatarInner = birthday.avatar_url
    ? `<img src="${birthday.avatar_url}" class="avatar-img" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
    : `<span style="font-family:'Inter',sans-serif;font-weight:800;font-size:1.25rem;">${birthday.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)}</span>`;

  container.innerHTML = `
    <style>
      .detail-header {
        position:sticky;top:0;z-index:40;
        background:var(--cream);
        border-bottom:3px solid var(--ink);
        display:flex;align-items:center;gap:10px;
        padding:0.9rem 1.25rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .detail-back-btn {
        background:var(--paper);
        border:2px solid var(--ink);
        border-radius:999px;
        box-shadow:none;
        color:var(--ink);
        width:36px;height:36px;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;flex-shrink:0;padding:0;
        transition:transform 0.15s ease, box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .detail-back-btn:hover { transform:translate(2px,2px); box-shadow:none; color:var(--orange); }

      .detail-edit-btn {
        background:var(--paper);
        border:2px solid var(--ink);
        border-radius:999px;
        box-shadow:3px 3px 0 var(--ink);
        color:var(--muted);cursor:pointer;
        padding:0.3rem 0.9rem;
        display:flex;align-items:center;gap:4px;
        font-family:'Inter',sans-serif;font-size:0.78rem;font-weight:900;
        text-transform:uppercase;letter-spacing:0.06em;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease, color 0.15s ease;
      }
      .detail-edit-btn:hover { transform:translate(2px,2px); box-shadow:1px 1px 0 var(--ink); color:var(--orange); }

      .detail-stat-card {
        background:var(--paper);
        border:2px solid var(--ink);
        border-radius:1.25rem;
        box-shadow:4px 4px 0 var(--ink);
        padding:1rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .detail-stat-label {
        font-size:0.65rem;font-weight:900;
        text-transform:uppercase;letter-spacing:0.1em;
        color:var(--brown);margin:0 0 5px;
        transition:color 0.3s ease;
      }
      .detail-stat-value {
        color:var(--ink);font-size:0.82rem;
        font-weight:600;margin:0;line-height:1.4;
        transition:color 0.3s ease;
      }

      .detail-section-card {
        background:var(--paper);
        border:2px solid var(--ink);
        border-radius:1.25rem;
        box-shadow:4px 4px 0 var(--ink);
        padding:1rem 1.25rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }

      .detail-input {
        width:100%;height:48px;
        background:var(--cream);
        border:2px solid var(--ink);
        border-radius:0.85rem;
        padding:0 1rem;
        color:var(--ink);
        font-size:0.9rem;font-family:'Inter',sans-serif;font-weight:500;
        outline:none;box-sizing:border-box;
        transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .detail-input:focus { box-shadow:4px 4px 0 var(--ink); }
      .detail-input::placeholder { color:var(--muted);font-weight:400; }

      .detail-textarea {
        width:100%;height:80px;
        background:var(--cream);
        border:2px solid var(--ink);
        border-radius:0.85rem;
        padding:0.75rem 1rem;
        color:var(--ink);
        font-size:0.9rem;font-family:'Inter',sans-serif;font-weight:500;
        outline:none;box-sizing:border-box;resize:none;
        transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .detail-textarea:focus { box-shadow:4px 4px 0 var(--ink); }

      .detail-field-label {
        display:block;font-size:0.68rem;font-weight:900;
        text-transform:uppercase;letter-spacing:0.1em;
        color:var(--brown);margin-bottom:6px;
        transition:color 0.3s ease;
      }

      .detail-save-btn {
        width:100%;height:50px;
        background:var(--orange);color:var(--on-accent-light);
        border:2px solid var(--ink);border-radius:999px;
        box-shadow:5px 5px 0 var(--ink);
        font-family:'Inter',sans-serif;font-weight:900;font-size:0.95rem;
        cursor:pointer;margin-top:0.25rem;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .detail-save-btn:hover { transform:translate(3px,3px); box-shadow:2px 2px 0 var(--ink); }
      .detail-save-btn:disabled { opacity:0.6;cursor:not-allowed;transform:none;box-shadow:5px 5px 0 var(--ink); }
    </style>

    <header class="detail-header">
      <button id="back-btn" class="detail-back-btn" aria-label="Back">
        <span class="material-symbols-outlined" style="font-size:1.1rem;">arrow_back</span>
      </button>
      <h1 style="font-family:'Archivo Black',sans-serif;font-size:1.1rem;text-transform:uppercase;letter-spacing:-0.04em;color:var(--ink);margin:0;flex:1;transition:color 0.3s ease;">${t(
        "birthdays_detail_title",
      )}</h1>
      <button id="edit-toggle-btn" class="detail-edit-btn">
        <span class="material-symbols-outlined" style="font-size:1rem;">edit</span>
        ${t("birthdays_detail_edit_button")}
      </button>
    </header>

    <div style="padding:1.25rem;display:flex;flex-direction:column;gap:1rem;padding-bottom:80px;">

      <!-- Hero card -->
      <div style="
        position:relative;overflow:hidden;
        border-radius:1.5rem;
        background:var(--paper);
        border:3px solid var(--ink);
        border-left:5px solid var(--orange);
        box-shadow:4px 4px 0 var(--ink);
        padding:1.5rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      ">
        <div style="position:absolute;top:0;right:0;padding:1rem;opacity:0.06;pointer-events:none;">
          <span class="material-symbols-outlined" style="font-size:100px;font-variation-settings:'FILL' 1;color:var(--ink);">cake</span>
        </div>
        <div style="position:relative;z-index:1;">
          <div style="position:relative;width:60px;height:60px;margin-bottom:0.9rem;">
            <div style="
              width:60px;height:60px;border-radius:50%;
              border:2px solid var(--ink);
              box-shadow:5px 5px 0 var(--ink);
              background:var(--paper);
              display:flex;align-items:center;justify-content:center;
              color:var(--orange);overflow:hidden;
            ">${avatarInner}</div>
            <button id="bday-avatar-btn" style="
              position:absolute;bottom:0;right:-4px;
              width:22px;height:22px;border-radius:50%;
              background:var(--paper);border:2px solid var(--ink);
              box-shadow:2px 2px 0 var(--ink);
              display:flex;align-items:center;justify-content:center;
              cursor:pointer;padding:0;
              transition:background-color 0.3s ease, border-color 0.3s ease;
            ">
              <span class="material-symbols-outlined" style="font-size:10px;color:var(--orange);">photo_camera</span>
            </button>
          </div>
          <h2 style="font-family:'Archivo Black',sans-serif;font-size:1.9rem;text-transform:uppercase;letter-spacing:-0.05em;line-height:0.92;color:var(--ink);margin:0 0 4px;transition:color 0.3s ease;">${
            birthday.name
          }</h2>
          <p style="color:var(--muted);font-size:0.8rem;margin:0;transition:color 0.3s ease;">${getZodiac(
            birthday.date,
          )}</p>
        </div>
      </div>

      <!-- Stats row -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
        <div class="detail-stat-card">
          <p class="detail-stat-label">${t(
            "birthdays_detail_next_birthday",
          )}</p>
          <p class="detail-stat-value">${getNextBirthdayDate(birthday.date)}</p>
        </div>
        <div class="detail-stat-card">
          <p class="detail-stat-label">${t("birthdays_detail_birthday_in")}</p>
          <p style="font-size:1.4rem;font-weight:900;font-family:'Archivo Black',sans-serif;color:var(--orange);margin:0;letter-spacing:-0.04em;transition:color 0.3s ease;">${daysLabel}</p>
        </div>
      </div>

      <!-- Notify toggle -->
      <div class="detail-section-card" style="display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="material-symbols-outlined" style="color:var(--muted);font-size:1.1rem;">notifications</span>
          <span style="font-size:0.88rem;font-weight:700;color:var(--ink);transition:color 0.3s ease;">${t(
            "birthdays_detail_notify_label",
          )}</span>
        </div>
        <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;">
          <input type="checkbox" id="notify-toggle" ${
            birthday.notify !== false ? "checked" : ""
          } style="opacity:0;width:0;height:0;position:absolute;">
          <span class="notify-slider" style="position:absolute;cursor:pointer;inset:0;background:${
            birthday.notify !== false ? "var(--orange)" : "var(--muted)"
          };border:2px solid var(--ink);border-radius:24px;transition:background 0.3s ease;">
            <span class="notify-knob" style="position:absolute;height:16px;width:16px;border-radius:50%;background:var(--paper);top:2px;left:${
              birthday.notify !== false ? "22px" : "2px"
            };transition:left 0.3s ease;"></span>
          </span>
        </label>
      </div>

      ${
        birthday.notes
          ? `
        <div class="detail-section-card">
          <p class="detail-stat-label">${t("birthdays_detail_notes")}</p>
          <p style="color:var(--muted);font-size:0.88rem;margin:0;line-height:1.6;transition:color 0.3s ease;">${
            birthday.notes
          }</p>
        </div>
      `
          : ""
      }

      <!-- Edit form -->
      <div id="edit-form" style="display:none;background:var(--paper);border:2px solid var(--ink);border-radius:1.5rem;box-shadow:4px 4px 0 var(--ink);padding:1.25rem;flex-direction:column;gap:1rem;transition:background-color 0.3s ease, border-color 0.3s ease;">
        <p style="font-size:0.68rem;font-weight:900;text-transform:uppercase;letter-spacing:0.12em;color:var(--brown);margin:0;transition:color 0.3s ease;">${t(
          "birthdays_detail_edit_section",
        )}</p>

        <div>
          <label class="detail-field-label">${t(
            "birthdays_detail_name_label",
          )}</label>
          <input id="edit-name" class="detail-input" type="text" value="${
            birthday.name
          }" autocomplete="off" />
        </div>

        <div>
          <label class="detail-field-label">${t(
            "birthdays_detail_date_label",
          )} <span style="color:var(--muted);font-weight:400;text-transform:none;letter-spacing:0;">${t(
    "birthdays_detail_year_optional",
  )}</span></label>
          <div style="display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:8px;">
            <div>
              <input id="edit-day" class="detail-input" style="text-align:center;" type="text" inputmode="numeric" placeholder="${t(
                "birthdays_detail_day_placeholder",
              )}" maxlength="2" value="${day}" />
              <p style="font-size:0.62rem;color:var(--brown);text-align:center;margin:3px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">${t(
                "birthdays_detail_day_label",
              )}</p>
            </div>
            <div>
              <input id="edit-month" class="detail-input" style="text-align:center;" type="text" inputmode="numeric" placeholder="${t(
                "birthdays_detail_month_placeholder",
              )}" maxlength="2" value="${month + 1}" />
              <p style="font-size:0.62rem;color:var(--brown);text-align:center;margin:3px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">${t(
                "birthdays_detail_month_label",
              )}</p>
            </div>
            <div>
              <input id="edit-year" class="detail-input" style="text-align:center;" type="text" inputmode="numeric" placeholder="${t(
                "birthdays_detail_year_placeholder",
              )}" maxlength="4" value="${year ?? ""}" />
              <p style="font-size:0.62rem;color:var(--brown);text-align:center;margin:3px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">${t(
                "birthdays_detail_year_label",
              )}</p>
            </div>
          </div>
        </div>

        <div>
          <label class="detail-field-label">${t(
            "birthdays_detail_notes_label",
          )}</label>
          <textarea id="edit-notes" class="detail-textarea" placeholder="${t(
            "birthdays_detail_notes_placeholder",
          )}">${birthday.notes || ""}</textarea>
        </div>

        <div>
          <label class="detail-field-label">${t(
            "birthdays_detail_group_label",
          )}</label>
          <div style="position:relative;">
            <select id="edit-group" class="detail-input" style="appearance:none;padding:0 2.5rem 0 1rem;cursor:pointer;">
              <option value="">${t("birthdays_detail_no_group")}</option>
              ${groups
                .map(
                  (g) =>
                    `<option value="${g.id}" ${
                      birthday.group_id === g.id ? "selected" : ""
                    }>${g.name}</option>`,
                )
                .join("")}
            </select>
            <span class="material-symbols-outlined" style="position:absolute;right:0.85rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted);pointer-events:none;">expand_more</span>
          </div>
        </div>

        <button id="edit-save-btn" class="detail-save-btn">${t(
          "birthdays_detail_save_button",
        )}</button>
      </div>


      <!-- Action buttons -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;">
        <button id="wished-btn" data-wished="${birthday.wished}" style="
          height:50px;
          background:${birthday.wished ? "var(--lime)" : "var(--paper)"};
          border:2px solid var(--ink);border-radius:1rem;
          box-shadow:4px 4px 0 var(--ink);
          color:${birthday.wished ? "var(--on-accent-dark)" : "var(--muted)"};
          font-weight:700;font-family:'Inter',sans-serif;font-size:0.82rem;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;
          transition:transform 0.15s ease, box-shadow 0.15s ease, color 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
        ">
          <span class="material-symbols-outlined" style="font-size:1rem;font-variation-settings:'FILL' ${
            birthday.wished ? 1 : 0
          };">${birthday.wished ? "check_circle" : "celebration"}</span>
          ${
            birthday.wished
              ? t("birthdays_detail_wished_button_done")
              : t("birthdays_detail_wished_button")
          }
        </button>

        <button id="gift-ideas-btn" style="
          height:50px;
          background:var(--paper);
          border:2px solid var(--ink);border-radius:1rem;
          box-shadow:4px 4px 0 var(--ink);
          color:var(--ink);
          font-weight:700;font-family:'Inter',sans-serif;font-size:0.82rem;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;
          transition:transform 0.15s ease, box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
        ">
          <span class="material-symbols-outlined" style="font-size:1rem;">redeem</span>
          ${t("birthdays_detail_gift_button")}
        </button>

        <button id="archive-btn" style="
          height:50px;
          background:var(--paper);
          border:2px solid var(--ink);border-radius:1rem;
          box-shadow:4px 4px 0 var(--ink);
          color:${birthday.archived ? "var(--orange)" : "var(--muted)"};
          font-weight:700;font-family:'Inter',sans-serif;font-size:0.82rem;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;
          transition:transform 0.15s ease, box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
        ">
          <span class="material-symbols-outlined" style="font-size:1rem;">${
            birthday.archived ? "unarchive" : "archive"
          }</span>
          ${
            birthday.archived
              ? t("birthdays_detail_unarchive_button")
              : t("birthdays_detail_archive_button")
          }
        </button>

        <button id="delete-btn" style="
          height:50px;
          background:var(--paper);
          border:2px solid var(--ink);border-radius:1rem;
          box-shadow:4px 4px 0 var(--ink);
          color:var(--pink);
          font-weight:700;font-family:'Inter',sans-serif;font-size:0.82rem;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;
          transition:transform 0.15s ease, box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
        ">
          <span class="material-symbols-outlined" style="font-size:1rem;">delete</span>
          ${t("birthdays_detail_delete_button")}
        </button>
      </div>

    </div>

    <!-- Archive confirmation modal -->
    <div id="archive-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:200;align-items:center;justify-content:center;padding:1.5rem;">
      <div style="background:var(--paper);border:3px solid var(--ink);border-radius:1.5rem;box-shadow:8px 8px 0 var(--ink);padding:1.75rem;width:100%;max-width:360px;transition:background-color 0.3s ease, border-color 0.3s ease;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.6rem;">
          <span class="material-symbols-outlined" style="color:var(--orange);font-size:1.25rem;font-variation-settings:'FILL' 1;">${
            birthday.archived ? "unarchive" : "archive"
          }</span>
          <h3 style="font-family:'Archivo Black',sans-serif;font-size:1rem;text-transform:uppercase;letter-spacing:-0.04em;color:var(--ink);margin:0;transition:color 0.3s ease;">${
            birthday.archived
              ? t("birthdays_detail_unarchive_title")
              : t("birthdays_detail_archive_title")
          }</h3>
        </div>
        <p style="font-size:0.85rem;color:var(--muted);margin:0 0 1.25rem;line-height:1.55;transition:color 0.3s ease;">${
          birthday.archived
            ? t("birthdays_detail_unarchive_desc")
            : t("birthdays_detail_archive_desc")
        }</p>
        <div style="display:flex;gap:8px;">
          <button id="archive-cancel" style="flex:1;height:44px;background:var(--cream);border:2px solid var(--ink);border-radius:999px;box-shadow:3px 3px 0 var(--ink);color:var(--muted);font-weight:700;font-family:'Inter',sans-serif;font-size:0.85rem;cursor:pointer;transition:transform 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;">${t(
            "birthdays_detail_cancel_button",
          )}</button>
          <button id="archive-confirm" style="flex:2;height:44px;background:var(--orange);border:2px solid var(--ink);border-radius:999px;box-shadow:3px 3px 0 var(--ink);color:var(--on-accent-light);font-weight:900;font-family:'Inter',sans-serif;font-size:0.85rem;cursor:pointer;transition:transform 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;">${
            birthday.archived
              ? t("birthdays_detail_unarchive_button")
              : t("birthdays_detail_archive_button")
          }</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("back-btn")?.addEventListener("click", async () => {
    if (returnTo === "calendar") {
      setCurrentPage("calendar" as any);
      const { renderCalendar } = await import("./calendar");
      renderCalendar(container, getNavGeneration(), true);
    } else {
      renderBirthdays(container, getNavGeneration(), true);
    }
  });

  animateSlideUp(container);
  bindButtonFeedback(container);

  const wishedBtn = document.getElementById("wished-btn") as HTMLButtonElement;
  if (wishedBtn) {
    wishedBtn.addEventListener("mouseenter", () => {
      wishedBtn.style.transform = "translate(2px,2px)";
      wishedBtn.style.boxShadow = "2px 2px 0 var(--ink)";
      if (wishedBtn.dataset.wished !== "true") {
        wishedBtn.style.color = "var(--lime)";
      }
    });
    wishedBtn.addEventListener("mouseleave", () => {
      wishedBtn.style.transform = "";
      wishedBtn.style.boxShadow = "4px 4px 0 var(--ink)";
      wishedBtn.style.color =
        wishedBtn.dataset.wished === "true"
          ? "var(--on-accent-dark)"
          : "var(--muted)";
    });
  }

  ["gift-ideas-btn", "archive-btn", "delete-btn"].forEach((id) => {
    const btn = document.getElementById(id) as HTMLButtonElement;
    if (!btn) return;
    const originalColor = btn.style.color;
    const hoverColor = id === "delete-btn" ? "var(--pink)" : "var(--orange)";
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translate(2px,2px)";
      btn.style.boxShadow = "2px 2px 0 var(--ink)";
      btn.style.color = hoverColor;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
      btn.style.boxShadow = "4px 4px 0 var(--ink)";
      btn.style.color = originalColor;
    });
  });

  document.getElementById("wished-btn")?.addEventListener("click", async () => {
    if (birthday.archived) {
      showBdayToast(t("toast_unarchive_before_edit"), "error");
      return;
    }
    const btn = document.getElementById("wished-btn") as HTMLButtonElement;
    const originalWished = birthday.wished;
    const originalWishedAt = birthday.wished_at;
    birthday.wished = !birthday.wished;
    birthday.wished_at = birthday.wished ? new Date().toISOString() : null;
    updateBirthday(birthday.id, {
      wished: birthday.wished,
      wished_at: birthday.wished_at,
    });
    btn.dataset.wished = String(birthday.wished);
    btn.style.background = birthday.wished ? "var(--lime)" : "var(--paper)";
    btn.style.color = birthday.wished
      ? "var(--on-accent-dark)"
      : "var(--muted)";
    btn.innerHTML = birthday.wished
      ? `<span class="material-symbols-outlined" style="font-size:1rem;font-variation-settings:'FILL' 1;">check_circle</span> ${t(
          "birthdays_detail_wished_button_done",
        )}`
      : `<span class="material-symbols-outlined" style="font-size:1rem;">celebration</span> ${t(
          "birthdays_detail_wished_button",
        )}`;
    showBdayToast(
      birthday.wished ? t("toast_marked_wished") : t("toast_unmarked"),
      "success",
    );
    try {
      const { error } = await supabase
        .from("birthdays")
        .update({ wished: birthday.wished, wished_at: birthday.wished_at })
        .eq("id", birthday.id);
      if (error) {
        birthday.wished = originalWished;
        birthday.wished_at = originalWishedAt;
        updateBirthday(birthday.id, {
          wished: originalWished,
          wished_at: originalWishedAt,
        });
        showBdayToast(t("toast_failed_update"), "error");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) await refreshAll(session.user.id);
        const updated = getStore().birthdays.find((b) => b.id === birthday.id);
        if (updated) renderDetailView(container, updated, groups, gen);
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) await refreshAll(session.user.id);
      }
    } catch {
      birthday.wished = originalWished;
      birthday.wished_at = originalWishedAt;
      updateBirthday(birthday.id, {
        wished: originalWished,
        wished_at: originalWishedAt,
      });
      showBdayToast(t("toast_failed_update"), "error");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) await refreshAll(session.user.id);
      const updated = getStore().birthdays.find((b) => b.id === birthday.id);
      if (updated) renderDetailView(container, updated, groups, gen);
    }
  });

  const notifyToggle = document.getElementById(
    "notify-toggle",
  ) as HTMLInputElement | null;
  if (notifyToggle) {
    const originalNotify = birthday.notify;
    notifyToggle.addEventListener("change", async () => {
      const newVal = notifyToggle.checked;
      const slider = notifyToggle.parentElement?.querySelector(
        ".notify-slider",
      ) as HTMLElement | null;
      const knob = notifyToggle.parentElement?.querySelector(
        ".notify-knob",
      ) as HTMLElement | null;
      birthday.notify = newVal;
      if (slider)
        slider.style.background = newVal ? "var(--orange)" : "var(--muted)";
      if (knob) knob.style.left = newVal ? "22px" : "2px";
      updateBirthday(birthday.id, { notify: newVal });
      const { error } = await supabase
        .from("birthdays")
        .update({ notify: newVal })
        .eq("id", birthday.id);
      if (error) {
        birthday.notify = originalNotify;
        if (slider)
          slider.style.background = originalNotify
            ? "var(--orange)"
            : "var(--muted)";
        if (knob) knob.style.left = originalNotify ? "22px" : "2px";
        updateBirthday(birthday.id, { notify: originalNotify });
        notifyToggle.checked = originalNotify;
        showBdayToast(t("toast_error_generic"), "error");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) await refreshAll(session.user.id);
      }
    });
  }

  document.getElementById("gift-ideas-btn")?.addEventListener("click", () => {
    renderGift(container, () =>
      renderDetailView(container, birthday, groups, gen, returnTo),
    );
  });

  let editOpen = false;
  document.getElementById("edit-toggle-btn")?.addEventListener("click", () => {
    if (birthday.archived) {
      showBdayToast(t("toast_unarchive_before_edit"), "error");
      return;
    }
    editOpen = !editOpen;
    const form = document.getElementById("edit-form");
    if (form) form.style.display = editOpen ? "flex" : "none";
    const btn = document.getElementById("edit-toggle-btn");
    if (btn) btn.style.color = editOpen ? "var(--orange)" : "var(--muted)";
  });

  document
    .getElementById("edit-save-btn")
    ?.addEventListener("click", async () => {
      const name = (
        document.getElementById("edit-name") as HTMLInputElement
      ).value.trim();
      const d = parseInt(
        (document.getElementById("edit-day") as HTMLInputElement).value,
      );
      const m = parseInt(
        (document.getElementById("edit-month") as HTMLInputElement).value,
      );
      const yRaw = (
        document.getElementById("edit-year") as HTMLInputElement
      ).value.trim();
      const notes = (
        document.getElementById("edit-notes") as HTMLTextAreaElement
      ).value.trim();
      const groupId = (
        document.getElementById("edit-group") as HTMLSelectElement
      ).value;
      if (!name || isNaN(d) || isNaN(m) || d < 1 || d > 31 || m < 1 || m > 12)
        return;
      let storedDate: string;
      if (yRaw) {
        const y = parseInt(yRaw);
        if (isNaN(y) || yRaw.length !== 4) return;
        storedDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(
          2,
          "0",
        )}`;
      } else {
        storedDate = `0001-${String(m).padStart(2, "0")}-${String(d).padStart(
          2,
          "0",
        )}`;
      }
      const btn = document.getElementById("edit-save-btn") as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = t("toast_saving");
      const originalBirthday = { ...birthday };
      birthday.name = name;
      birthday.date = storedDate;
      birthday.notes = notes || null;
      birthday.group_id = groupId || null;
      replaceBirthday(birthday.id, { ...birthday });
      showBdayToast(t("toast_birthday_updated"), "success");
      const grps = getStore().groups;
      renderDetailView(container, birthday, grps, gen);
      try {
        const { error } = await supabase
          .from("birthdays")
          .update({
            name,
            date: storedDate,
            notes: notes || null,
            group_id: groupId || null,
          })
          .eq("id", birthday.id);
        if (error) {
          replaceBirthday(birthday.id, originalBirthday);
          showBdayToast(t("toast_failed_save_changes"), "error");
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) await refreshAll(session.user.id);
          const updated = getStore().birthdays.find(
            (b) => b.id === birthday.id,
          );
          if (updated) renderDetailView(container, updated, grps, gen);
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) await refreshAll(session.user.id);
        }
      } catch {
        replaceBirthday(birthday.id, originalBirthday);
        showBdayToast(t("toast_failed_save_changes"), "error");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) await refreshAll(session.user.id);
        const updated = getStore().birthdays.find((b) => b.id === birthday.id);
        if (updated) renderDetailView(container, updated, grps, gen);
      } finally {
        btn.disabled = false;
        btn.textContent = t("birthdays_detail_save_button");
      }
    });

  document.getElementById("archive-btn")?.addEventListener("click", () => {
    const modal = document.getElementById("archive-modal");
    if (modal) {
      modal.style.display = "flex";
      animateModalIn(modal);
    }
  });
  document.getElementById("archive-cancel")?.addEventListener("click", () => {
    const modal = document.getElementById("archive-modal");
    if (modal) modal.style.display = "none";
  });
  document
    .getElementById("archive-confirm")
    ?.addEventListener("click", async () => {
      const modal = document.getElementById("archive-modal");
      if (modal) modal.style.display = "none";
      const btn = document.getElementById("archive-btn") as HTMLButtonElement;
      const originalText = birthday.archived
        ? t("birthdays_detail_unarchive_button")
        : t("birthdays_detail_archive_button");
      btn.disabled = true;
      btn.textContent = t("toast_saving");
      const originalArchived = birthday.archived;
      birthday.archived = !birthday.archived;
      updateBirthday(birthday.id, { archived: birthday.archived });
      showBdayToast(
        birthday.archived
          ? t("toast_birthday_archived")
          : t("toast_birthday_unarchived"),
        "success",
      );
      renderBirthdays(container, getNavGeneration());
      try {
        const { error } = await supabase
          .from("birthdays")
          .update({ archived: birthday.archived })
          .eq("id", birthday.id);
        if (error) {
          birthday.archived = originalArchived;
          updateBirthday(birthday.id, { archived: originalArchived });
          showBdayToast(t("toast_failed_archive"), "error");
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) await refreshAll(session.user.id);
          renderBirthdays(container, getNavGeneration());
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) await refreshAll(session.user.id);
        }
      } catch {
        birthday.archived = originalArchived;
        updateBirthday(birthday.id, { archived: originalArchived });
        showBdayToast(t("toast_failed_archive"), "error");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) await refreshAll(session.user.id);
        renderBirthdays(container, getNavGeneration());
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });

  document.getElementById("delete-btn")?.addEventListener("click", async () => {
    if (!confirm(`Delete ${birthday.name}'s birthday?`)) return;
    const btn = document.getElementById("delete-btn") as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = t("toast_deleting");
    const deletedBirthday = { ...birthday };
    const deleteIdx = getStore().birthdays.findIndex(
      (b) => b.id === birthday.id,
    );
    removeBirthday(birthday.id);
    showBdayToast(t("toast_birthday_deleted"), "success");
    renderBirthdays(container, getNavGeneration());
    try {
      const { error } = await supabase
        .from("birthdays")
        .delete()
        .eq("id", birthday.id);
      if (error) {
        if (deleteIdx !== -1) restoreBirthdayAt(deleteIdx, deletedBirthday);
        showBdayToast(t("toast_failed_delete"), "error");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) await refreshAll(session.user.id);
        renderBirthdays(container, getNavGeneration());
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) await refreshAll(session.user.id);
      }
    } catch {
      if (deleteIdx !== -1) restoreBirthdayAt(deleteIdx, deletedBirthday);
      showBdayToast(t("toast_failed_delete"), "error");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) await refreshAll(session.user.id);
      renderBirthdays(container, getNavGeneration());
    } finally {
      btn.disabled = false;
      btn.textContent = t("birthdays_detail_delete_button");
    }
  });

  const bdayPhotoInput = document.createElement("input");
  bdayPhotoInput.type = "file";
  bdayPhotoInput.accept = "image/*";
  bdayPhotoInput.style.display = "none";
  container.appendChild(bdayPhotoInput);
  document
    .getElementById("bday-avatar-btn")
    ?.addEventListener("click", () => bdayPhotoInput.click());
  bdayPhotoInput.addEventListener("change", async () => {
    const file = bdayPhotoInput.files?.[0];
    if (!file) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const path = `${session?.user.id}/birthdays/${birthday.id}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      showBdayToast(t("toast_upload_failed"), "error");
      return;
    }
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);
    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;
    const { error: updateError } = await supabase
      .from("birthdays")
      .update({ avatar_url: publicUrl })
      .eq("id", birthday.id);
    if (updateError) {
      showBdayToast(t("toast_failed_save_photo"), "error");
      return;
    }
    if (session) await refreshAll(session.user.id);
    showBdayToast(t("toast_photo_updated"), "success");
    const updated = getStore().birthdays.find((b) => b.id === birthday.id);
    if (updated) renderDetailView(container, updated, getStore().groups, gen);
  });
}

async function loadBirthdays(_container: HTMLElement, gen = 0) {
  const data = getStore().birthdays;
  if (!_container.isConnected || gen !== getNavGeneration()) return;
  const freshList = document.getElementById("birthdays-list");
  if (!freshList) return;

  const today = new Date();
  const birthdaysToReset: any[] = [];
  for (const birthday of data) {
    if (birthday.wished || birthday.gift_status) {
      const { month, day } = parseStoredDate(birthday.date);
      const thisYearBirthday = new Date(today.getFullYear(), month, day);
      if (today > thisYearBirthday && birthday.wished_at) {
        const wishedDate = new Date(birthday.wished_at);
        if (wishedDate < thisYearBirthday) birthdaysToReset.push(birthday);
      }
    }
  }
  if (birthdaysToReset.length > 0) {
    for (const birthday of birthdaysToReset) {
      updateBirthday(birthday.id, {
        wished: false,
        wished_at: null,
        gift_status: null,
      });
      try {
        await supabase
          .from("birthdays")
          .update({ wished: false, wished_at: null, gift_status: null })
          .eq("id", birthday.id);
      } catch (err) {
        console.error("Failed to reset birthday status:", err);
      }
    }
  }

  let allData = data;
  if (activeGroupFilter !== "all")
    allData = data.filter((b) => b.group_id === activeGroupFilter);

  const active = allData
    .filter((b) => !b.archived)
    .map((b) => ({ ...b, days: daysUntilBirthday(b.date) }));
  const archived = allData
    .filter((b) => b.archived)
    .map((b) => ({ ...b, days: daysUntilBirthday(b.date) }));
  active.sort((a, b) => a.days - b.days);

  renderList(freshList, active, archived);

  const spotlight = freshList.querySelector("section");
  if (spotlight) animateSpotlight(spotlight as HTMLElement);
  animateListItems(freshList, "[data-birthday-id]", 45);
}
