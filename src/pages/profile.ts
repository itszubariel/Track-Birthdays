import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { supabase } from "../services/supabase";
import { renderAuth } from "./auth";
import { showToast } from "../features/toast";
import { getNavGeneration } from "../core/app";
import { getStore, refreshAll, clearStore } from "../services/store";
import {
  animatePageEnter,
  animateModalIn,
  bindButtonFeedback,
} from "../features/animations";
import { languages, getLang, setLang, t } from "../services/i18n";
import { generateICS } from "../utils/utils";

export async function renderProfile(container: HTMLElement, gen = 0) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const profile = getStore().profile;

  if (!container.isConnected || gen !== getNavGeneration()) return;

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";
  const avatarInner = profile?.avatar_url
    ? `<img src="${profile.avatar_url}" class="avatar-img" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
    : `<span style="font-family:'Inter',sans-serif;font-weight:900;font-size:1.5rem;">${initials}</span>`;

  container.innerHTML = `
    <style>
      .prof-header {
        position:sticky;top:0;z-index:40;
        background:var(--cream);
        border-bottom:3px solid var(--ink);
        display:flex;align-items:center;gap:10px;
        padding:0.9rem 1.25rem;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .prof-header-title {
        font-family:'Archivo Black',sans-serif;
        font-size:1.3rem;text-transform:uppercase;
        letter-spacing:-0.05em;color:var(--ink);margin:0;
        transition:color 0.3s ease;
      }

      .prof-card {
        background:var(--paper);
        border:2px solid var(--ink);
        border-radius:1.25rem;
        box-shadow:4px 4px 0 var(--ink);
        overflow:hidden;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .prof-card-heading {
        padding:0.85rem 1.1rem;
        border-bottom:2px solid var(--ink);
        display:flex;align-items:center;gap:8px;
        transition:border-color 0.3s ease;
      }
      .prof-card-heading-label {
        font-size:0.72rem;font-weight:900;
        text-transform:uppercase;letter-spacing:0.1em;
        color:var(--brown);margin:0;
        transition:color 0.3s ease;
      }
      .prof-row {
        padding:0.9rem 1.1rem;
        border-bottom:1px solid var(--cream);
        display:flex;align-items:center;justify-content:space-between;
        transition:background-color 0.15s ease, border-color 0.3s ease;
        cursor:default;
      }
      .prof-row:last-child { border-bottom:none; }
      .prof-row-label {
        font-size:0.65rem;font-weight:900;text-transform:uppercase;
        letter-spacing:0.1em;color:var(--brown);margin:0 0 3px;
        transition:color 0.3s ease;
      }
      .prof-row-value {
        font-size:0.9rem;font-weight:600;color:var(--ink);margin:0;
        transition:color 0.3s ease;
      }
      .prof-edit-btn {
        background:none;border:none;color:var(--muted);
        cursor:pointer;padding:5px;border-radius:8px;
        display:flex;align-items:center;
        transition:color 0.15s ease;
      }
      .prof-edit-btn:hover { color:var(--orange); }

      .prof-input {
        width:100%;height:46px;
        background:var(--cream);
        border:2px solid var(--ink);border-radius:0.85rem;
        padding:0 1rem;font-size:0.9rem;
        font-family:'Inter',sans-serif;font-weight:500;
        color:var(--ink);outline:none;box-sizing:border-box;
        transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      .prof-input:focus { box-shadow:4px 4px 0 var(--ink); }
      .prof-input::placeholder { color:var(--muted);font-weight:400; }

      .prof-save-btn {
        width:100%;height:42px;
        background:var(--orange);color:var(--on-accent-light);
        border:2px solid var(--ink);border-radius:999px;
        box-shadow:4px 4px 0 var(--ink);
        font-family:'Inter',sans-serif;font-weight:900;font-size:0.85rem;
        cursor:pointer;margin-top:8px;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .prof-save-btn:hover { transform:translate(3px,3px); box-shadow:1px 1px 0 var(--ink); }
      .prof-save-btn:disabled { opacity:0.6;cursor:not-allowed;transform:none; }

      .prof-action-row {
        padding:0.9rem 1.1rem;
        border-bottom:1px solid var(--cream);
        display:flex;align-items:center;justify-content:space-between;
        cursor:pointer;
        transition:background-color 0.15s ease, border-color 0.3s ease;
      }
      .prof-action-row:last-child { border-bottom:none; }
      .prof-action-row:hover { color:var(--orange); }

      .prof-action-label {
        font-size:0.88rem;font-weight:600;
        color:var(--ink);transition:color 0.3s ease;
      }

      .date-sub-label {
        font-size:0.62rem;color:var(--brown);
        text-align:center;margin:3px 0 0;
        font-weight:700;text-transform:uppercase;letter-spacing:0.08em;
        transition:color 0.3s ease;
      }

      .prof-notif-row {
        display:flex;align-items:center;justify-content:space-between;
        background:var(--cream);border:2px solid var(--ink);
        border-radius:0.85rem;padding:0.7rem 1rem;
        margin-bottom:10px;
        transition:background-color 0.3s ease, border-color 0.3s ease;
      }
      .prof-enable-btn {
        height:32px;padding:0 14px;
        background:var(--lime);color:var(--on-accent-dark);
        border:2px solid var(--ink);border-radius:999px;
        box-shadow:3px 3px 0 var(--ink);
        font-family:'Inter',sans-serif;font-weight:900;font-size:0.72rem;
        text-transform:uppercase;letter-spacing:0.06em;
        cursor:pointer;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .prof-enable-btn:hover { transform:translate(2px,2px); box-shadow:1px 1px 0 var(--ink); }

      .prof-signout-btn {
        width:100%;height:52px;
        background:var(--paper);
        border:2px solid var(--ink);border-radius:1rem;
        box-shadow:4px 4px 0 var(--ink);
        color:var(--pink);
        font-weight:900;font-family:'Inter',sans-serif;font-size:0.9rem;
        text-transform:uppercase;letter-spacing:0.06em;
        cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .prof-signout-btn:hover { transform:translate(3px,3px); box-shadow:1px 1px 0 var(--ink); }
      .modal-btn {
        box-shadow:3px 3px 0 var(--ink);
        transition:transform 0.15s ease, box-shadow 0.15s ease,
          background-color 0.3s ease, border-color 0.3s ease;
      }
      .modal-btn:hover { transform:translate(2px,2px); box-shadow:1px 1px 0 var(--ink); }
      .modal-btn:active { transform:translate(3px,3px); box-shadow:0px 0px 0 var(--ink); }
      .modal-cancel { color:var(--muted); transition:transform 0.15s ease, box-shadow 0.15s ease, color 0.15s ease, background-color 0.3s ease, border-color 0.3s ease; }
      .modal-cancel:hover { color:var(--orange); }
    </style>

    <header class="prof-header">
      <span class="material-symbols-outlined" style="color:var(--orange);font-variation-settings:'FILL' 1;">person</span>
      <h1 class="prof-header-title">${t("profile_header_title")}</h1>
    </header>

    <div style="padding:1.25rem;display:flex;flex-direction:column;gap:1rem;padding-bottom:80px;">

      <!-- Avatar hero -->
      <div style="display:flex;flex-direction:column;align-items:center;padding:1.5rem 0 0.75rem;">
        <div style="position:relative;margin-bottom:1rem;">
          <div id="avatar-circle" style="
            width:88px;height:88px;border-radius:50%;
            border:3px solid var(--ink);
            box-shadow:5px 5px 0 var(--ink);
            background:${profile?.avatar_url ? "transparent" : "var(--orange)"};
            display:flex;align-items:center;justify-content:center;
            color:var(--on-accent-light);
            cursor:pointer;overflow:hidden;
            transition:background-color 0.3s ease, border-color 0.3s ease;
          ">${avatarInner}</div>
          <button id="avatar-btn" style="
            position:absolute;bottom:0;right:-4px;
            width:26px;height:26px;border-radius:50%;
            background:var(--paper);border:2px solid var(--ink);
            box-shadow:2px 2px 0 var(--ink);
            display:flex;align-items:center;justify-content:center;
            cursor:pointer;padding:0;
            transition:background-color 0.3s ease, border-color 0.3s ease;
          ">
            <span class="material-symbols-outlined" style="font-size:11px;color:var(--orange);">photo_camera</span>
          </button>
        </div>
        <h2 style="font-family:'Archivo Black',sans-serif;font-size:1.6rem;text-transform:uppercase;letter-spacing:-0.05em;color:var(--ink);margin:0 0 3px;text-align:center;transition:color 0.3s ease;">${
          profile?.full_name || t("profile_user_fallback")
        }</h2>
        <p style="color:var(--orange);font-size:0.82rem;font-weight:700;margin:0 0 2px;">@${
          profile?.username || t("profile_username_fallback")
        }</p>
        <p style="color:var(--muted);font-size:0.72rem;margin:0;transition:color 0.3s ease;">${
          session?.user.email || ""
        }</p>
      </div>

      <!-- Personal info card -->
      <div class="prof-card">
        <div class="prof-card-heading">
          <span class="material-symbols-outlined" style="color:var(--orange);font-size:1rem;font-variation-settings:'FILL' 1;">manage_accounts</span>
          <p class="prof-card-heading-label">${t("profile_personal_info")}</p>
        </div>

        <div class="prof-row">
          <div>
            <p class="prof-row-label">${t("profile_full_name_label")}</p>
            <p id="display-name" class="prof-row-value">${
              profile?.full_name || t("profile_full_name_fallback")
            }</p>
          </div>
          <button id="edit-name-btn" class="prof-edit-btn" aria-label="Edit name">
            <span class="material-symbols-outlined" style="font-size:1rem;">edit</span>
          </button>
        </div>
        <div id="name-edit-form" style="display:none;padding:0 1.1rem 0.9rem;border-bottom:1px solid var(--cream);">
          <input id="input-name" class="prof-input" type="text" value="${
            profile?.full_name || ""
          }" placeholder="${t(
    "profile_full_name_placeholder",
  )}" autocomplete="name" />
          <button id="save-name-btn" class="prof-save-btn">${t(
            "profile_save_name_button",
          )}</button>
        </div>

        <div class="prof-row" style="border-bottom:none;">
          <div>
            <p class="prof-row-label">${t("profile_username_label")}</p>
            <p id="display-username" class="prof-row-value">@${
              profile?.username || "—"
            }</p>
          </div>
          <button id="edit-username-btn" class="prof-edit-btn" aria-label="Edit username">
            <span class="material-symbols-outlined" style="font-size:1rem;">edit</span>
          </button>
        </div>
        <div id="username-edit-form" style="display:none;padding:0 1.1rem 0.9rem;">
          <input id="input-username" class="prof-input" type="text" value="${
            profile?.username || ""
          }" placeholder="${t(
    "profile_username_placeholder",
  )}" autocomplete="username" />
          <button id="save-username-btn" class="prof-save-btn">${t(
            "profile_save_username_button",
          )}</button>
        </div>
      </div>

      <!-- Your birthday card -->
      <div class="prof-card" style="padding:1.1rem;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.5rem;">
          <span class="material-symbols-outlined" style="color:var(--orange);font-size:1rem;font-variation-settings:'FILL' 1;">cake</span>
          <p class="prof-card-heading-label">${t("profile_your_birthday")}</p>
        </div>
        <p style="font-size:0.78rem;color:var(--muted);margin:0 0 10px;transition:color 0.3s ease;">${t(
          "profile_birthday_desc",
        )}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:8px;margin-bottom:10px;">
          <div>
            <input id="bday-day" class="prof-input" style="text-align:center;" type="text" inputmode="numeric" placeholder="${t(
              "birthdays_detail_day_placeholder",
            )}" maxlength="2" value="${
    profile?.birthday ? profile.birthday.split("-")[2] : ""
  }" />
            <p class="date-sub-label">${t("birthdays_detail_day_label")}</p>
          </div>
          <div>
            <input id="bday-month" class="prof-input" style="text-align:center;" type="text" inputmode="numeric" placeholder="${t(
              "birthdays_detail_month_placeholder",
            )}" maxlength="2" value="${
    profile?.birthday ? profile.birthday.split("-")[1] : ""
  }" />
            <p class="date-sub-label">${t("birthdays_detail_month_label")}</p>
          </div>
          <div>
            <input id="bday-year" class="prof-input" style="text-align:center;" type="text" inputmode="numeric" placeholder="${t(
              "birthdays_detail_year_placeholder",
            )}" maxlength="4" value="${
    profile?.birthday ? profile.birthday.split("-")[0] : ""
  }" />
            <p class="date-sub-label">${t("profile_bday_year_opt")}</p>
          </div>
        </div>
        <button id="save-bday-btn" class="prof-save-btn">${t(
          "profile_save_birthday_button",
        )}</button>
      </div>

      <!-- Notifications card -->
      <div class="prof-card" style="padding:1.1rem;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.5rem;">
          <span class="material-symbols-outlined" style="color:var(--orange);font-size:1rem;font-variation-settings:'FILL' 1;">notifications_active</span>
          <p class="prof-card-heading-label">${t(
            "profile_notifications_title",
          )}</p>
        </div>
        <p style="font-size:0.78rem;color:var(--muted);margin:0 0 10px;transition:color 0.3s ease;">${t(
          "profile_notifications_desc",
        )}</p>
        <div class="prof-notif-row">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="material-symbols-outlined" style="font-size:1rem;color:var(--muted);">notifications</span>
            <span style="font-size:0.88rem;font-weight:600;color:var(--ink);transition:color 0.3s ease;">${t(
              "profile_push_label",
            )}</span>
          </div>
          <button id="enable-notif-btn" class="prof-enable-btn">${t(
            "profile_enable_button",
          )}</button>
        </div>
        <input id="notif-time" type="time" value="${
          profile?.notification_time?.slice(0, 5) || "09:00"
        }"
          class="prof-input" style="margin-bottom:8px;color-scheme:light dark;" />
        <button id="save-notif-btn" class="prof-save-btn">${t(
          "profile_save_time_button",
        )}</button>
      </div>

      <!-- Language card -->
      <div class="prof-card" style="padding:1.1rem;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem;">
          <span class="material-symbols-outlined" style="color:var(--orange);font-size:1rem;">language</span>
          <p class="prof-card-heading-label">${t("profile_language_title")}</p>
        </div>
        <div style="position:relative;">
          <select id="lang-select" class="prof-input" style="appearance:none;padding:0 2.5rem 0 1rem;cursor:pointer;">
            ${languages
              .map(
                (l) =>
                  `<option value="${l.code}" ${
                    getLang() === l.code ? "selected" : ""
                  }>${l.native} (${l.name})</option>`,
              )
              .join("")}
          </select>
          <span class="material-symbols-outlined" style="position:absolute;right:0.85rem;top:50%;transform:translateY(-50%);font-size:1rem;color:var(--muted);pointer-events:none;">expand_more</span>
        </div>
      </div>

      <!-- Appearance card -->
      <div class="prof-card" style="padding:1.1rem;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem;">
          <span class="material-symbols-outlined" style="color:var(--orange);font-size:1rem;">contrast</span>
          <p class="prof-card-heading-label">Appearance</p>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="material-symbols-outlined" style="font-size:1rem;color:var(--muted);" id="theme-icon">dark_mode</span>
            <span style="font-size:0.88rem;font-weight:600;color:var(--ink);transition:color 0.3s ease;" id="theme-label">Dark mode</span>
          </div>
          <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;">
            <input type="checkbox" id="theme-toggle-profile" style="opacity:0;width:0;height:0;position:absolute;">
            <span id="theme-toggle-slider" style="position:absolute;cursor:pointer;inset:0;background:var(--muted);border:2px solid var(--ink);border-radius:24px;transition:background 0.3s ease;">
              <span id="theme-toggle-knob" style="position:absolute;height:16px;width:16px;border-radius:50%;background:var(--paper);top:2px;transition:left 0.3s ease;"></span>
            </span>
          </label>
        </div>
      </div>

      <!-- Data card -->
      <div class="prof-card">
        <div class="prof-card-heading">
          <span class="material-symbols-outlined" style="color:var(--orange);font-size:1rem;">folder</span>
          <p class="prof-card-heading-label">${t("profile_data_title")}</p>
        </div>
        <div id="export-calendar-row" class="prof-action-row">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="material-symbols-outlined" style="color:var(--muted);font-size:1.1rem;">calendar_month</span>
            <span class="prof-action-label">${t(
              "profile_export_calendar",
            )}</span>
          </div>
          <span class="material-symbols-outlined" style="color:var(--muted);font-size:1rem;">download</span>
        </div>
        <div id="export-json-row" class="prof-action-row" style="border-bottom:none;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="material-symbols-outlined" style="color:var(--muted);font-size:1.1rem;">data_object</span>
            <span class="prof-action-label">${t("profile_export_json")}</span>
          </div>
          <span class="material-symbols-outlined" style="color:var(--muted);font-size:1rem;">download</span>
        </div>
      </div>

      <!-- Security card -->
      <div class="prof-card">
        <div class="prof-card-heading">
          <span class="material-symbols-outlined" style="color:var(--orange);font-size:1rem;font-variation-settings:'FILL' 1;">security</span>
          <p class="prof-card-heading-label">${t("profile_security_title")}</p>
        </div>
        <div id="change-pw-row" class="prof-action-row">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="material-symbols-outlined" style="color:var(--muted);font-size:1.1rem;">lock_reset</span>
            <span class="prof-action-label">${t(
              "profile_change_password",
            )}</span>
          </div>
          <span class="material-symbols-outlined" style="color:var(--muted);font-size:1rem;">chevron_right</span>
        </div>
        <div id="delete-account-row" class="prof-action-row" style="border-bottom:none;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="material-symbols-outlined" style="color:var(--pink);font-size:1.1rem;">delete_forever</span>
            <span class="prof-action-label" style="color:var(--pink);">${t(
              "profile_delete_account",
            )}</span>
          </div>
          <span class="material-symbols-outlined" style="color:var(--pink);font-size:1rem;opacity:0.6;">chevron_right</span>
        </div>
      </div>

      <!-- Legal links -->
      <div style="text-align:center;padding:0.25rem 0;">
        <a href="https://trackbirthdaysland.netlify.app/policy.html" target="_blank" style="color:var(--muted);font-size:0.72rem;text-decoration:none;margin-right:12px;font-weight:600;transition:color 0.15s ease;" onmouseover="this.style.color='var(--orange)'" onmouseout="this.style.color='var(--muted)'">${t(
          "profile_privacy_policy",
        )}</a>
        <a href="https://trackbirthdaysland.netlify.app/terms.html" target="_blank" style="color:var(--muted);font-size:0.72rem;text-decoration:none;font-weight:600;transition:color 0.15s ease;" onmouseover="this.style.color='var(--orange)'" onmouseout="this.style.color='var(--muted)'">${t(
          "profile_terms_of_service",
        )}</a>
      </div>

      <!-- Sign out -->
      <button id="signout-btn" class="prof-signout-btn">
        <span class="material-symbols-outlined" style="font-size:1.1rem;">logout</span>
        ${t("profile_sign_out")}
      </button>

    </div>
  `;

  const avatarInput = document.createElement("input");
  avatarInput.type = "file";
  avatarInput.accept = "image/*";
  avatarInput.style.display = "none";
  container.appendChild(avatarInput);

  const root = (window as any).__root() as HTMLElement;

  function createModal(id: string, html: string): HTMLElement {
    document.getElementById(id)?.remove();
    const el = document.createElement("div");
    el.id = id;
    el.style.cssText =
      "display:none;position:absolute;inset:0;background:rgba(0,0,0,0.6);z-index:9000;align-items:center;justify-content:center;padding:1.5rem;";
    el.innerHTML = html;
    root.appendChild(el);
    return el;
  }

  const modalCardStyle = `background:var(--paper);border:3px solid var(--ink);border-radius:1.5rem;box-shadow:8px 8px 0 var(--ink);padding:1.75rem;width:100%;max-width:340px;transition:background-color 0.3s ease, border-color 0.3s ease;`;
  const modalCancelStyle = `flex:1;height:44px;background:var(--cream);border:2px solid var(--ink);border-radius:999px;font-weight:700;font-family:'Inter',sans-serif;font-size:0.85rem;cursor:pointer;`;
  const modalConfirmStyle = `flex:2;height:44px;background:var(--orange);color:var(--on-accent-light);border:2px solid var(--ink);border-radius:999px;font-weight:900;font-family:'Inter',sans-serif;font-size:0.85rem;cursor:pointer;`;
  const modalTitleStyle = `font-family:'Archivo Black',sans-serif;font-size:1rem;text-transform:uppercase;letter-spacing:-0.04em;color:var(--ink);margin:0;transition:color 0.3s ease;`;
  const modalDescStyle = `font-size:0.85rem;color:var(--muted);margin:0 0 1.25rem;line-height:1.55;transition:color 0.3s ease;`;

  const signoutModal = createModal(
    "signout-modal",
    `
    <div style="${modalCardStyle}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem;">
        <span class="material-symbols-outlined" style="color:var(--orange);font-size:1.25rem;font-variation-settings:'FILL' 1;">logout</span>
        <h3 style="${modalTitleStyle}">${t("profile_signout_title")}</h3>
      </div>
      <p style="${modalDescStyle}">${t("profile_signout_desc")}</p>
      <div style="display:flex;gap:8px;">
        <button id="signout-cancel-btn" class="modal-btn modal-cancel" style="${modalCancelStyle}">${t(
      "profile_signout_cancel",
    )}</button>
        <button id="signout-confirm-btn" class="modal-btn" style="${modalConfirmStyle}">${t(
      "profile_signout_confirm",
    )}</button>
      </div>
    </div>
  `,
  );

  const deleteModal = createModal(
    "delete-modal",
    `
    <div style="${modalCardStyle}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem;">
        <span class="material-symbols-outlined" style="color:var(--pink);font-size:1.25rem;font-variation-settings:'FILL' 1;">warning</span>
        <h3 style="${modalTitleStyle.replace(
          "color:var(--ink)",
          "color:var(--pink)",
        )}">${t("profile_delete_title")}</h3>
      </div>
      <p style="${modalDescStyle}">${t("profile_delete_desc")}</p>
      <p style="font-size:0.78rem;color:var(--muted);margin:0 0 8px;transition:color 0.3s ease;">${t(
        "profile_delete_confirm_prefix",
      )}<span style="color:var(--pink);font-weight:700;">${t(
      "profile_delete_confirm_word",
    )}</span>${t("profile_delete_confirm_suffix")}</p>
      <input id="delete-confirm-input" type="text" placeholder="${t(
        "profile_delete_placeholder",
      )}"
        style="width:100%;height:44px;background:var(--cream);border:2px solid var(--ink);border-radius:0.85rem;padding:0 1rem;font-size:0.9rem;font-family:'Inter',sans-serif;color:var(--ink);outline:none;box-sizing:border-box;margin-bottom:1rem;transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;"
        onfocus="this.style.boxShadow='4px 4px 0 var(--ink)'" onblur="this.style.boxShadow='none'" />
      <div style="display:flex;gap:8px;">
        <button id="delete-cancel-btn" class="modal-btn modal-cancel" style="${modalCancelStyle}">${t(
      "profile_delete_cancel",
    )}</button>
        <button id="delete-confirm-btn" class="modal-btn" style="${modalConfirmStyle.replace(
          "var(--orange)",
          "var(--pink)",
        )}">${t("profile_delete_confirm_button")}</button>
      </div>
    </div>
  `,
  );

  animatePageEnter(container);
  bindButtonFeedback(container);
  bindButtonFeedback(signoutModal);
  bindButtonFeedback(deleteModal);

  document.getElementById("edit-name-btn")?.addEventListener("click", () => {
    const form = document.getElementById("name-edit-form")!;
    form.style.display = form.style.display === "none" ? "block" : "none";
  });
  document
    .getElementById("save-name-btn")
    ?.addEventListener("click", async () => {
      const name = (
        document.getElementById("input-name") as HTMLInputElement
      ).value.trim();
      if (!name) return;
      const btn = document.getElementById("save-name-btn") as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = t("toast_saving");
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ full_name: name })
          .eq("id", session?.user.id);
        if (!error) {
          if (session) await refreshAll(session.user.id);
          showToast(t("toast_name_updated"), "success");
          renderProfile(container, gen);
        }
      } finally {
        btn.disabled = false;
        btn.textContent = t("profile_save_name_button");
      }
    });

  document
    .getElementById("edit-username-btn")
    ?.addEventListener("click", () => {
      const form = document.getElementById("username-edit-form")!;
      form.style.display = form.style.display === "none" ? "block" : "none";
    });
  document
    .getElementById("save-username-btn")
    ?.addEventListener("click", async () => {
      const username = (
        document.getElementById("input-username") as HTMLInputElement
      ).value.trim();
      if (!username) return;
      const btn = document.getElementById(
        "save-username-btn",
      ) as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = t("toast_saving");
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ username })
          .eq("id", session?.user.id);
        if (!error) {
          if (session) await refreshAll(session.user.id);
          const disp = document.getElementById("display-username");
          if (disp) disp.textContent = `@${username}`;
          const form = document.getElementById("username-edit-form");
          if (form) form.style.display = "none";
          showToast(t("toast_username_updated"), "success");
        } else {
          showToast(t("toast_username_taken"), "error");
        }
      } finally {
        btn.disabled = false;
        btn.textContent = t("profile_save_username_button");
      }
    });

  const bdayDay = document.getElementById("bday-day") as HTMLInputElement;
  const bdayMonth = document.getElementById("bday-month") as HTMLInputElement;
  const bdayYear = document.getElementById("bday-year") as HTMLInputElement;
  bdayDay.addEventListener("input", () => {
    bdayDay.value = bdayDay.value.replace(/\D/g, "");
    if (bdayDay.value.length === 2) bdayMonth.focus();
  });
  bdayMonth.addEventListener("input", () => {
    bdayMonth.value = bdayMonth.value.replace(/\D/g, "");
    if (bdayMonth.value.length === 2) bdayYear.focus();
  });
  bdayYear.addEventListener("input", () => {
    bdayYear.value = bdayYear.value.replace(/\D/g, "");
  });

  document
    .getElementById("save-bday-btn")
    ?.addEventListener("click", async () => {
      const d = bdayDay.value.trim(),
        m = bdayMonth.value.trim(),
        y = bdayYear.value.trim();
      if (!d || !m) {
        showToast(t("toast_enter_day_month"), "error");
        return;
      }
      const stored = y
        ? `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
        : `0000-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      const btn = document.getElementById("save-bday-btn") as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = t("toast_saving");
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ birthday: stored })
          .eq("id", session?.user.id);
        if (!error) {
          if (session) await refreshAll(session.user.id);
          showToast(t("toast_birthday_saved"), "success");
        } else showToast(t("toast_error_generic"), "error");
      } finally {
        btn.disabled = false;
        btn.textContent = t("profile_save_birthday_button");
      }
    });

  document
    .getElementById("save-notif-btn")
    ?.addEventListener("click", async () => {
      const time = (document.getElementById("notif-time") as HTMLInputElement)
        .value;
      const btn = document.getElementById(
        "save-notif-btn",
      ) as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = t("toast_saving");
      try {
        await supabase
          .from("profiles")
          .update({ notification_time: time })
          .eq("id", session?.user.id);
        if (session) await refreshAll(session.user.id);
        showToast(t("toast_notif_time_saved"), "success");
      } finally {
        btn.disabled = false;
        btn.textContent = t("profile_save_time_button");
      }
    });
  document
    .getElementById("enable-notif-btn")
    ?.addEventListener("click", async () => {
      const { initNotifications } = await import("../features/notifications");
      await initNotifications(session?.user.id!);
      showToast(t("toast_notif_enabled"), "success");
    });

  document
    .getElementById("lang-select")
    ?.addEventListener("change", async (e) => {
      const code = (e.target as HTMLSelectElement).value;
      if (code === getLang()) return;
      setLang(code);
      const { renderApp } = await import("../core/app");
      renderApp();
      showToast(
        t("toast_language_changed").replace(
          "{name}",
          languages.find((l) => l.code === code)?.name || "",
        ),
        "success",
      );
    });

  function syncThemeToggle(): void {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    const checkbox = document.getElementById(
      "theme-toggle-profile",
    ) as HTMLInputElement | null;
    const slider = document.getElementById(
      "theme-toggle-slider",
    ) as HTMLElement | null;
    const knob = document.getElementById(
      "theme-toggle-knob",
    ) as HTMLElement | null;
    const icon = document.getElementById("theme-icon") as HTMLElement | null;
    const label = document.getElementById("theme-label") as HTMLElement | null;
    if (checkbox) checkbox.checked = isDark;
    if (slider)
      slider.style.background = isDark ? "var(--orange)" : "var(--muted)";
    if (knob) knob.style.left = isDark ? "22px" : "2px";
    if (icon) icon.textContent = isDark ? "dark_mode" : "light_mode";
    if (label) label.textContent = isDark ? "Dark mode" : "Light mode";
  }

  syncThemeToggle();

  document
    .getElementById("theme-toggle-profile")
    ?.addEventListener("change", () => {
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      const newTheme = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      syncThemeToggle();
    });

  document
    .getElementById("change-pw-row")
    ?.addEventListener("click", async () => {
      if (!session?.user.email) return;
      const row = document.getElementById("change-pw-row") as HTMLElement;
      row.style.pointerEvents = "none";
      row.style.opacity = "0.5";
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(
          session.user.email,
          { redirectTo: `${window.location.origin}/reset` },
        );
        if (!error) showToast(t("toast_reset_link_sent"), "success");
        else showToast(t("toast_error_generic"), "error");
      } finally {
        row.style.pointerEvents = "";
        row.style.opacity = "";
      }
    });

  document
    .getElementById("delete-account-row")
    ?.addEventListener("click", () => {
      deleteModal.style.display = "flex";
      animateModalIn(deleteModal);
      (
        deleteModal.querySelector("#delete-confirm-input") as HTMLInputElement
      ).value = "";
    });
  deleteModal
    .querySelector("#delete-cancel-btn")
    ?.addEventListener("click", () => {
      deleteModal.style.display = "none";
    });
  deleteModal
    .querySelector("#delete-confirm-btn")
    ?.addEventListener("click", async () => {
      const val = (
        deleteModal.querySelector("#delete-confirm-input") as HTMLInputElement
      ).value.trim();
      if (val !== "DELETE") {
        showToast(t("toast_type_delete"), "error");
        return;
      }
      const btn = deleteModal.querySelector(
        "#delete-confirm-btn",
      ) as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = t("toast_deleting");
      try {
        await supabase
          .from("birthdays")
          .delete()
          .eq("user_id", session?.user.id);
        await supabase.from("groups").delete().eq("user_id", session?.user.id);
        await supabase.from("profiles").delete().eq("id", session?.user.id);
        await fetch("/api/delete-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session?.user.id }),
        });
        await supabase.auth.signOut();
        signoutModal.remove();
        deleteModal.remove();
        renderAuth();
      } finally {
        btn.disabled = false;
        btn.textContent = t("profile_delete_confirm_button");
      }
    });

  document.getElementById("signout-btn")?.addEventListener("click", () => {
    signoutModal.style.display = "flex";
    animateModalIn(signoutModal);
  });
  signoutModal
    .querySelector("#signout-cancel-btn")
    ?.addEventListener("click", () => {
      signoutModal.style.display = "none";
    });
  signoutModal
    .querySelector("#signout-confirm-btn")
    ?.addEventListener("click", async () => {
      const btn = signoutModal.querySelector(
        "#signout-confirm-btn",
      ) as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = t("toast_signing_out");
      try {
        await supabase.auth.signOut();
        clearStore();
        signoutModal.remove();
        deleteModal.remove();
        renderAuth();
      } finally {
        btn.disabled = false;
        btn.textContent = t("profile_sign_out");
      }
    });

  const triggerAvatarUpload = () => avatarInput.click();
  document
    .getElementById("avatar-circle")
    ?.addEventListener("click", triggerAvatarUpload);
  document.getElementById("avatar-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    triggerAvatarUpload();
  });
  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files?.[0];
    if (!file || !session?.user.id) return;
    const path = `${session.user.id}/avatar`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      showToast(t("toast_upload_failed"), "error");
      return;
    }
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);
    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", session.user.id);
    if (updateError) {
      showToast(t("toast_failed_save_photo"), "error");
      return;
    }
    await refreshAll(session.user.id);
    showToast(t("toast_photo_updated"), "success");
    renderProfile(container, gen);
  });

  document
    .getElementById("export-calendar-row")
    ?.addEventListener("click", async () => {
      const birthdays = getStore().birthdays.filter((b) => !b.archived);
      if (birthdays.length === 0) {
        showToast(t("toast_no_birthdays"), "error");
        return;
      }
      const ics = generateICS(birthdays);
      if (Capacitor.isNativePlatform()) {
        try {
          const base64 = btoa(ics);
          const result = await Filesystem.writeFile({
            path: "track-birthdays.ics",
            data: base64,
            directory: Directory.Cache,
          });
          await Share.share({ url: result.uri });
        } catch {
          showToast(t("toast_export_failed"), "error");
          return;
        }
      } else {
        const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "track-birthdays.ics";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      showToast(t("toast_download_started"), "success");
    });

  document
    .getElementById("export-json-row")
    ?.addEventListener("click", async () => {
      const { birthdays, groups } = getStore();
      const json = JSON.stringify(
        { birthdays, groups, exportedAt: new Date().toISOString() },
        null,
        2,
      );
      if (Capacitor.isNativePlatform()) {
        try {
          const base64 = btoa(json);
          const result = await Filesystem.writeFile({
            path: "track-birthdays-export.json",
            data: base64,
            directory: Directory.Cache,
          });
          await Share.share({ url: result.uri });
        } catch {
          showToast(t("toast_export_failed"), "error");
          return;
        }
      } else {
        const blob = new Blob([json], {
          type: "application/json;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "track-birthdays-export.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      showToast(t("toast_download_started"), "success");
    });
}
