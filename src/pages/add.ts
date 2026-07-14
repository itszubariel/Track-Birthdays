import { t } from "../services/i18n";
import { supabase } from "../services/supabase";
import {
  getNavGeneration,
  setSubView,
  updateFABVisibility,
  setCurrentPage,
} from "../core/app";
import { showToast } from "../features/toast";
import {
  getStore,
  refreshAll,
  addBirthday,
  removeBirthday,
  replaceBirthday,
} from "../services/store";
import type { Birthday } from "../services/store";
import { animatePageEnter, bindButtonFeedback } from "../features/animations";
import { getInitials } from "../utils/utils";

export async function renderAdd(
  container: HTMLElement,
  gen = 0,
  returnTo: string = "birthdays",
) {
  const groups = getStore().groups;
  if (!container.isConnected || gen !== getNavGeneration()) return;

  setSubView(true);
  updateFABVisibility();

  const prefilledDate = (window as any).__prefilledDate;
  if (prefilledDate) delete (window as any).__prefilledDate;

  container.innerHTML = `
    <style>
      .add-header {
        position:sticky;top:0;z-index:40;
        background:var(--cream);
        border-bottom:3px solid var(--ink);
        display:flex;align-items:center;gap:10px;
        padding:0.9rem 1.25rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .add-back-btn {
        background:var(--paper);border:2px solid var(--ink);
        border-radius:999px;box-shadow:none;
        color:var(--ink);width:36px;height:36px;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;flex-shrink:0;padding:0;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .add-back-btn:hover { transform:translate(2px,2px); box-shadow:none; color:var(--orange); }

      .add-field-label {
        display:block;font-size:0.68rem;font-weight:900;
        text-transform:uppercase;letter-spacing:0.1em;
        color:var(--brown);margin-bottom:6px;padding-left:2px;
        transition:color 0.3s ease;
      }
      .add-input {
        width:100%;height:50px;
        background:var(--paper);
        border:2px solid var(--ink);border-radius:0.85rem;
        padding:0 1rem;font-size:0.95rem;
        font-family:'Inter',sans-serif;font-weight:500;
        color:var(--ink);outline:none;box-sizing:border-box;
        transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .add-input:focus { box-shadow:4px 4px 0 var(--ink); }
      .add-input::placeholder { color:var(--muted);font-weight:400; }

      .add-textarea {
        width:100%;height:90px;
        background:var(--paper);
        border:2px solid var(--ink);border-radius:0.85rem;
        padding:0.75rem 1rem;font-size:0.95rem;
        font-family:'Inter',sans-serif;font-weight:500;
        color:var(--ink);outline:none;box-sizing:border-box;resize:none;
        transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .add-textarea:focus { box-shadow:4px 4px 0 var(--ink); }
      .add-textarea::placeholder { color:var(--muted);font-weight:400; }

      .add-save-btn {
        width:100%;height:52px;
        background:var(--lime);color:var(--on-accent-dark);
        border:2px solid var(--ink);border-radius:999px;
        box-shadow:5px 5px 0 var(--ink);
        font-family:'Inter',sans-serif;font-weight:900;font-size:1rem;
        cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:8px;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .add-save-btn:hover { transform:translate(3px,3px); box-shadow:2px 2px 0 var(--ink); }
      .add-save-btn:active { transform:translate(4px,4px); box-shadow:1px 1px 0 var(--ink); }
      .add-save-btn:disabled { opacity:0.6;cursor:not-allowed;transform:none; }

      .add-preview {
        display:none;
        background:var(--paper);
        border:2px solid var(--ink);border-radius:1rem;
        box-shadow:4px 4px 0 var(--ink);
        padding:0.85rem 1rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }

      .date-sub-label {
        font-size:0.62rem;color:var(--brown);
        text-align:center;margin:3px 0 0;
        font-weight:700;text-transform:uppercase;letter-spacing:0.08em;
        transition:color 0.3s ease;
      }
    </style>

    <header class="add-header">
      <button id="back-btn" class="add-back-btn" aria-label="Back">
        <span class="material-symbols-outlined" style="font-size:1.1rem;">arrow_back</span>
      </button>
      <h1 style="font-family:'Archivo Black',sans-serif;font-size:1.3rem;text-transform:uppercase;letter-spacing:-0.05em;color:var(--ink);margin:0;transition:color 0.3s ease;">${t(
        "add_header_title",
      )}</h1>
    </header>

    <div style="padding:1.25rem;display:flex;flex-direction:column;gap:1.1rem;padding-bottom:80px;">

      <!-- Hero card -->
      <div style="
        position:relative;overflow:hidden;
        border-radius:1.5rem;
        background:var(--paper);
        border:3px solid var(--ink);
        border-left:5px solid var(--lime);
        box-shadow:4px 4px 0 var(--ink);
        padding:1.25rem 1.5rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      ">
        <div style="position:absolute;right:-0.5rem;bottom:-0.5rem;opacity:0.06;pointer-events:none;">
          <span class="material-symbols-outlined" style="font-size:90px;font-variation-settings:'FILL' 1;color:var(--lime);">cake</span>
        </div>
        <h2 style="font-family:'Archivo Black',sans-serif;font-size:1.3rem;text-transform:uppercase;letter-spacing:-0.05em;color:var(--ink);margin:0 0 4px;transition:color 0.3s ease;">${t(
          "add_hero_heading",
        )}</h2>
        <p style="color:var(--muted);font-size:0.82rem;margin:0;transition:color 0.3s ease;">${t(
          "add_hero_desc",
        )}</p>
      </div>

      <!-- Live preview -->
      <div id="preview-card" class="add-preview" style="border-left:4px solid var(--ink);">
        <div style="display:flex;align-items:center;gap:10px;">
          <div id="preview-avatar" style="width:38px;height:38px;flex-shrink:0;border-radius:50%;border:2px solid var(--ink);box-shadow:3px 3px 0 var(--ink);background:var(--paper);display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-weight:800;font-size:0.78rem;color:var(--orange);">?</div>
          <div>
            <p style="font-size:0.62rem;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:var(--brown);margin:0 0 2px;transition:color 0.3s ease;">${t(
              "add_preview_label",
            )}</p>
            <h3 id="preview-name" style="font-weight:700;color:var(--ink);font-size:0.9rem;margin:0;transition:color 0.3s ease;">${t(
              "add_preview_default",
            )}</h3>
          </div>
        </div>
      </div>

      <!-- Name -->
      <div>
        <label class="add-field-label" for="add-name">${t(
          "add_name_label",
        )}</label>
        <div style="position:relative;">
          <input id="add-name" class="add-input" style="padding-right:2.75rem;" type="text" placeholder="${t(
            "add_name_placeholder",
          )}" autocomplete="off" />
          <span class="material-symbols-outlined" style="position:absolute;right:0.85rem;top:50%;transform:translateY(-50%);font-size:1.1rem;color:var(--muted);pointer-events:none;">person</span>
        </div>
      </div>

      <!-- Date -->
      <div>
        <label class="add-field-label">${t(
          "add_date_label",
        )} <span style="color:var(--muted);font-weight:400;text-transform:none;letter-spacing:0;">${t(
    "add_date_year_optional",
  )}</span></label>
        <div style="display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:8px;">
          <div>
            <input id="add-day" class="add-input" style="text-align:center;" type="text" inputmode="numeric" placeholder="${t(
              "birthdays_detail_day_placeholder",
            )}" maxlength="2" value="${prefilledDate?.day || ""}" />
            <p class="date-sub-label">${t("birthdays_detail_day_label")}</p>
          </div>
          <div>
            <input id="add-month" class="add-input" style="text-align:center;" type="text" inputmode="numeric" placeholder="${t(
              "birthdays_detail_month_placeholder",
            )}" maxlength="2" value="${prefilledDate?.month || ""}" />
            <p class="date-sub-label">${t("birthdays_detail_month_label")}</p>
          </div>
          <div>
            <input id="add-year" class="add-input" style="text-align:center;" type="text" inputmode="numeric" placeholder="${t(
              "birthdays_detail_year_placeholder",
            )}" maxlength="4" />
            <p class="date-sub-label">${t("birthdays_detail_year_label")}</p>
          </div>
        </div>
      </div>

      <!-- Group -->
      <div>
        <label class="add-field-label" for="add-group">${t(
          "add_group_label",
        )}</label>
        <div style="position:relative;">
          <select id="add-group" class="add-input" style="appearance:none;padding:0 2.5rem 0 1rem;cursor:pointer;">
            <option value="">${t("add_no_group")}</option>
            ${groups
              .map((g: any) => `<option value="${g.id}">${g.name}</option>`)
              .join("")}
          </select>
          <span class="material-symbols-outlined" style="position:absolute;right:0.85rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted);pointer-events:none;">expand_more</span>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <label class="add-field-label" for="add-notes">${t(
          "add_notes_label",
        )}</label>
        <textarea id="add-notes" class="add-textarea" placeholder="${t(
          "add_notes_placeholder",
        )}"></textarea>
      </div>

      <button id="add-save-btn" class="add-save-btn">
        ${t("add_save_button")}
        <span class="material-symbols-outlined" style="font-size:1.1rem;">auto_awesome</span>
      </button>

    </div>
  `;

  animatePageEnter(container);
  bindButtonFeedback(container);

  document.getElementById("back-btn")?.addEventListener("click", async () => {
    if (returnTo === "calendar") {
      setCurrentPage("calendar" as any);
      const { renderCalendar } = await import("./calendar");
      renderCalendar(container, gen, true);
    } else {
      const { renderBirthdays } = await import("./birthdays");
      renderBirthdays(container, gen, true);
    }
  });

  const nameInput = document.getElementById("add-name") as HTMLInputElement;
  const previewCard = document.getElementById("preview-card") as HTMLElement;
  const previewAvatar = document.getElementById(
    "preview-avatar",
  ) as HTMLElement;
  const previewName = document.getElementById("preview-name") as HTMLElement;

  nameInput.addEventListener("input", () => {
    const name = nameInput.value.trim();
    if (name) {
      previewCard.style.display = "block";
      previewAvatar.textContent = getInitials(name);
      previewName.textContent = name;
    } else {
      previewCard.style.display = "none";
    }
  });

  const dayInput = document.getElementById("add-day") as HTMLInputElement;
  const monthInput = document.getElementById("add-month") as HTMLInputElement;
  const yearInput = document.getElementById("add-year") as HTMLInputElement;

  dayInput.addEventListener("input", () => {
    dayInput.value = dayInput.value.replace(/\D/g, "");
    if (dayInput.value.length === 2) monthInput.focus();
  });
  monthInput.addEventListener("input", () => {
    monthInput.value = monthInput.value.replace(/\D/g, "");
    if (monthInput.value.length === 2) yearInput.focus();
  });
  yearInput.addEventListener("input", () => {
    yearInput.value = yearInput.value.replace(/\D/g, "");
  });

  document
    .getElementById("add-save-btn")
    ?.addEventListener("click", async () => {
      const name = nameInput.value.trim();
      const day = dayInput.value.trim();
      const month = monthInput.value.trim();
      const year = yearInput.value.trim();
      const groupId = (
        document.getElementById("add-group") as HTMLSelectElement
      ).value;
      const notes = (
        document.getElementById("add-notes") as HTMLTextAreaElement
      ).value.trim();

      if (!name) {
        showToast(t("toast_enter_name"), "error");
        return;
      }
      if (!day || !month) {
        showToast(t("toast_enter_day_month_error"), "error");
        return;
      }
      const d = parseInt(day),
        m = parseInt(month);
      if (isNaN(d) || isNaN(m) || d < 1 || d > 31 || m < 1 || m > 12) {
        showToast(t("toast_invalid_date"), "error");
        return;
      }

      let storedDate: string;
      if (year) {
        const y = parseInt(year);
        if (isNaN(y) || year.length !== 4) {
          showToast(t("toast_invalid_year"), "error");
          return;
        }
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

      const btn = document.getElementById("add-save-btn") as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = t("toast_saving");

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const tempId = `temp-${Date.now()}`;
        addBirthday({
          id: tempId,
          user_id: session.user.id,
          name,
          date: storedDate,
          group_id: groupId || null,
          notes: notes || null,
          archived: false,
          avatar_url: null,
          wished: false,
          wished_at: null,
          gift_status: null,
          notify: true,
          groups: groupId
            ? getStore().groups.find((g) => g.id === groupId)
            : null,
        } as Birthday);

        showToast(t("toast_birthday_added"), "success");
        nameInput.value = "";
        dayInput.value = "";
        monthInput.value = "";
        yearInput.value = "";
        (document.getElementById("add-group") as HTMLSelectElement).value = "";
        (document.getElementById("add-notes") as HTMLTextAreaElement).value =
          "";

        const { data, error } = await supabase
          .from("birthdays")
          .insert({
            user_id: session.user.id,
            name,
            date: storedDate,
            group_id: groupId || null,
            notes: notes || null,
          })
          .select();
        if (error) {
          removeBirthday(tempId);
          showToast(t("toast_error_generic"), "error");
        } else if (data?.[0]) replaceBirthday(tempId, data[0]);
        await refreshAll(session.user.id);
      } finally {
        btn.disabled = false;
        btn.textContent = t("add_save_button");
      }
    });
}
