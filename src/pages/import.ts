import { supabase } from "../services/supabase";
import { showToast } from "../features/toast";
import { setSubView, updateFABVisibility } from "../core/app";
import { t } from "../services/i18n";
import { setSubviewStack, clearSubviewStack } from "../core/nav-state";
import type { PageName, ImportSubview } from "../core/nav-state";
import {
  esc,
  getInitials,
  getMonthName,
  parseStoredDate,
} from "../utils/utils";
import { importBirthdays, importBackup } from "../services/import";
import type { BackupBirthday } from "../services/import";

interface RenderImportOptions {
  mode: "contacts" | "backup";
  returnTo?: PageName;
  candidates: ImportSubview["candidates"];
  selected?: string[];
  backupGroups?: ImportSubview["backupGroups"];
}

function formatDate(dateStr: string): string {
  const { month, day, year } = parseStoredDate(dateStr);
  const base = `${getMonthName(month)} ${day}`;
  return year ? `${base}, ${year}` : base;
}

export function renderImport(
  container: HTMLElement,
  gen: number,
  opts: RenderImportOptions,
) {
  setSubView(true);
  updateFABVisibility();

  const returnTo: PageName = opts.returnTo ?? "profile";
  const mode = opts.mode;
  const candidates = opts.candidates;
  const backupGroups = opts.backupGroups ?? [];
  const selected =
    opts.selected ?? candidates.filter((c) => !c.duplicate).map((c) => c.key);

  const subview: ImportSubview = {
    kind: "import",
    returnTo,
    mode,
    selected,
    candidates,
    backupGroups,
  };
  setSubviewStack(returnTo, [subview]);

  const title =
    mode === "contacts" ? t("import_title_contacts") : t("import_title_backup");

  const rows = candidates
    .map(
      (c) => `
        <label class="import-row">
          <input type="checkbox" data-key="${esc(c.key)}" ${
        selected.includes(c.key) ? "checked" : ""
      } />
          <span class="import-avatar">${esc(getInitials(c.name))}</span>
          <span class="import-info">
            <span class="import-name">${esc(c.name)}</span>
            <span class="import-date">${esc(formatDate(c.date))}</span>
          </span>
          ${
            c.duplicate
              ? `<span class="import-dup">${t("import_already_tracked")}</span>`
              : ""
          }
        </label>
      `,
    )
    .join("");

  const emptyState = `
    <div style="
      text-align:center;padding:3rem 1.5rem;
      background:var(--paper);border:2px solid var(--ink);
      border-radius:1.25rem;box-shadow:4px 4px 0 var(--ink);
      transition:background-color 0.3s ease, border-color 0.3s ease;
    ">
      <span class="material-symbols-outlined" style="font-size:2rem;color:var(--muted);">contact_page</span>
      <p style="color:var(--muted);font-size:0.85rem;font-weight:600;margin:0.75rem 0 0;transition:color 0.3s ease;">${t(
        "import_none_found",
      )}</p>
    </div>
  `;

  container.innerHTML = `
    <style>
      .import-header {
        position:sticky;top:0;z-index:40;
        background:var(--cream);
        border-bottom:3px solid var(--ink);
        display:flex;align-items:center;gap:10px;
        padding:0.9rem 1.25rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .import-back-btn {
        background:var(--paper);border:2px solid var(--ink);
        border-radius:999px;box-shadow:none;
        color:var(--ink);width:36px;height:36px;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;flex-shrink:0;padding:0;
        transition:transform 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .import-back-btn:hover { transform:translate(2px,2px); color:var(--orange); }
      .import-header-title {
        font-family:'Archivo Black',sans-serif;font-size:1.1rem;
        text-transform:uppercase;letter-spacing:-0.04em;
        color:var(--ink);margin:0;
        transition:color 0.3s ease;
      }
      .import-body {
        padding:1.25rem;padding-bottom:6rem;
        display:flex;flex-direction:column;gap:1rem;
      }
      .import-toolbar {
        display:flex;align-items:center;justify-content:space-between;gap:0.75rem;
        padding:0.5rem 0;
      }
      .import-select-all {
        display:flex;align-items:center;gap:8px;
        font-size:0.8rem;font-weight:700;color:var(--ink);cursor:pointer;
        transition:color 0.3s ease;
      }
      .import-select-all input { width:16px;height:16px;accent-color:var(--lime);cursor:pointer; }
      .import-count {
        font-size:0.75rem;font-weight:800;color:var(--muted);
        text-transform:uppercase;letter-spacing:0.05em;
        transition:color 0.3s ease;
      }
      .import-list {
        display:flex;flex-direction:column;gap:10px;
      }
      .import-row {
        display:flex;align-items:center;gap:12px;
        background:var(--paper);
        border:2px solid var(--ink);border-radius:1rem;
        box-shadow:3px 3px 0 var(--ink);
        padding:0.7rem 0.9rem;cursor:pointer;
        transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .import-row:hover { transform:translate(1px,1px); box-shadow:2px 2px 0 var(--ink); }
      .import-row input { width:18px;height:18px;accent-color:var(--lime);cursor:pointer;flex-shrink:0; }
      .import-avatar {
        width:34px;height:34px;border-radius:50%;flex-shrink:0;
        background:var(--orange);border:2px solid var(--ink);
        display:flex;align-items:center;justify-content:center;
        font-size:0.72rem;font-weight:900;color:var(--on-accent-light);
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .import-info { display:flex;flex-direction:column;gap:1px;min-width:0;flex:1; }
      .import-name {
        font-size:0.85rem;font-weight:700;color:var(--ink);
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        transition:color 0.3s ease;
      }
      .import-date { font-size:0.72rem;color:var(--muted);font-weight:500;transition:color 0.3s ease; }
      .import-dup {
        flex-shrink:0;
        font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;
        color:var(--orange);border:1.5px solid var(--orange);border-radius:999px;
        padding:3px 8px;white-space:nowrap;
        transition:color 0.3s ease, border-color 0.3s ease;
      }
      .import-submit-btn {
        width:100%;height:52px;
        background:var(--lime);color:var(--on-accent-dark);
        border:2px solid var(--ink);border-radius:999px;
        box-shadow:5px 5px 0 var(--ink);
        font-family:'Inter',sans-serif;font-weight:900;font-size:0.95rem;
        cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .import-submit-btn:hover { transform:translate(3px,3px); box-shadow:2px 2px 0 var(--ink); }
      .import-submit-btn:active { transform:translate(4px,4px); box-shadow:1px 1px 0 var(--ink); }
      .import-submit-btn:disabled { opacity:0.5;cursor:not-allowed;transform:none;box-shadow:5px 5px 0 var(--ink); }
    </style>

    <header class="import-header">
      <button id="import-back" class="import-back-btn" aria-label="Back">
        <span class="material-symbols-outlined" style="font-size:1.1rem;">arrow_back</span>
      </button>
      <h1 class="import-header-title">${title}</h1>
    </header>

    <div class="import-body">
      ${
        candidates.length === 0
          ? emptyState
          : `
            <div class="import-toolbar">
              <label class="import-select-all">
                <input type="checkbox" id="import-select-all" />
                ${t("import_select_all")}
              </label>
              <span class="import-count" id="import-count">${
                candidates.length
              }</span>
            </div>
            <div class="import-list" id="import-list">${rows}</div>
          `
      }
      ${
        candidates.length > 0
          ? `<button id="import-submit" class="import-submit-btn"></button>`
          : ""
      }
    </div>
  `;

  container.scrollTop = 0;

  const listEl = document.getElementById("import-list");
  const submitBtn = document.getElementById(
    "import-submit",
  ) as HTMLButtonElement | null;
  const selectAll = document.getElementById(
    "import-select-all",
  ) as HTMLInputElement | null;
  const countEl = document.getElementById("import-count");

  function updateSubmit(): void {
    if (!listEl) return;
    const checkboxes = listEl.querySelectorAll<HTMLInputElement>(
      "input[type=checkbox]",
    );
    const checked = Array.from(checkboxes).filter((cb) => cb.checked).length;
    if (countEl) countEl.textContent = String(checked);
    if (submitBtn) {
      submitBtn.textContent = `${t("import_button")} (${checked})`;
      submitBtn.disabled = checked === 0;
    }
    if (selectAll) {
      selectAll.checked = checked > 0 && checked === checkboxes.length;
    }
  }

  document
    .getElementById("import-back")
    ?.addEventListener("click", async () => {
      clearSubviewStack(returnTo);
      const { renderProfile } = await import("./profile");
      renderProfile(container, gen);
    });

  listEl?.addEventListener("change", updateSubmit);
  selectAll?.addEventListener("change", () => {
    if (!listEl) return;
    listEl
      .querySelectorAll<HTMLInputElement>("input[type=checkbox]")
      .forEach((cb) => {
        cb.checked = selectAll.checked;
      });
    updateSubmit();
  });

  submitBtn?.addEventListener("click", async () => {
    if (!listEl) return;
    const checked = Array.from(
      listEl.querySelectorAll<HTMLInputElement>("input[type=checkbox]:checked"),
    )
      .map((cb) => cb.dataset.key ?? "")
      .filter(Boolean);
    const toImport = candidates.filter((c) => checked.includes(c.key));
    if (toImport.length === 0) return;

    if (submitBtn) submitBtn.disabled = true;
    const original = submitBtn?.textContent ?? "";
    if (submitBtn) submitBtn.textContent = t("import_importing");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        showToast(t("toast_error_generic"), "error");
        return;
      }
      if (mode === "contacts") {
        const { imported } = await importBirthdays(
          session.user.id,
          toImport.map((c) => ({ name: c.name, birthday: c.date })),
        );
        showToast(
          t("toast_import_success").replace("{n}", String(imported)),
          "success",
        );
      } else {
        const { importedBirthdays, importedGroups, skipped } =
          await importBackup(
            session.user.id,
            toImport.map(
              (c) =>
                (c.full ?? {
                  name: c.name,
                  date: c.date,
                }) as unknown as BackupBirthday,
            ),
            backupGroups,
          );
        let msg = t("toast_import_backup_success")
          .replace("{b}", String(importedBirthdays))
          .replace("{g}", String(importedGroups));
        if (skipped > 0) {
          msg += t("import_skipped_suffix").replace("{n}", String(skipped));
        }
        showToast(msg, "success");
      }
      clearSubviewStack(returnTo);
      const { renderProfile } = await import("./profile");
      renderProfile(container, gen);
    } catch {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      }
      showToast(t("toast_import_failed"), "error");
    }
  });

  updateSubmit();
}
