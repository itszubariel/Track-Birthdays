import { supabase } from "../services/supabase";
import { showToast } from "../features/toast";
import { t } from "../services/i18n";

export function renderResetPassword() {
  let showPassword = false;

  function getTheme(): string {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }
  function setTheme(theme: string): void {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  function getHTML(): string {
    return `
      <style>
        .rp-root {
          height:100%;overflow-y:auto;overflow-x:hidden;
          scrollbar-width:none;
          background:var(--cream);
          display:flex;flex-direction:column;
          font-family:'Inter',sans-serif;
          transition:background-color 0.3s ease;
        }
        .rp-root::-webkit-scrollbar { display:none; }

        .rp-topbar {
          display:flex;align-items:center;justify-content:space-between;
          padding:1rem 1.25rem;flex-shrink:0;
        }
        .rp-logo {
          font-family:'Archivo Black',sans-serif;
          font-size:1rem;font-weight:400;
          text-transform:uppercase;letter-spacing:-0.04em;
          color:var(--ink);
          border:2px solid var(--ink);border-radius:999px;
          box-shadow:4px 4px 0 var(--ink);
          background:var(--paper);
          padding:0.45rem 1rem;
          display:inline-block;
          cursor:pointer;
          transition:transform 0.15s ease, box-shadow 0.15s ease,
            background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        .rp-logo:hover { transform:translate(3px,3px); box-shadow:1px 1px 0 var(--ink); }
        .rp-logo:active { transform:translate(4px,4px); box-shadow:0px 0px 0 var(--ink); }
        .rp-theme-btn {
          display:inline-flex;align-items:center;justify-content:center;
          width:2.6rem;height:2.6rem;
          border:2px solid var(--ink);border-radius:999px;
          box-shadow:4px 4px 0 var(--ink);
          background:var(--paper);color:var(--ink);
          cursor:pointer;flex-shrink:0;padding:0;
          transition:transform 0.15s ease, box-shadow 0.15s ease,
            background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        .rp-theme-btn:hover { transform:translate(3px,3px); box-shadow:1px 1px 0 var(--ink); }

        .rp-body {
          flex:1;display:flex;align-items:center;justify-content:center;
          padding:1.25rem 1.25rem 2rem;
        }
        .rp-card {
          width:100%;max-width:400px;
          background:var(--paper);
          border:3px solid var(--ink);border-radius:2rem;
          box-shadow:8px 8px 0 var(--ink);
          padding:2rem 1.75rem;
          transition:background-color 0.3s ease, border-color 0.3s ease;
        }
        .rp-card-header { text-align:center;margin-bottom:1.75rem; }
        .rp-eyebrow {
          font-size:0.72rem;font-weight:900;text-transform:uppercase;
          letter-spacing:0.18em;color:var(--brown);
          display:block;margin-bottom:0.75rem;
          transition:color 0.3s ease;
        }
        .rp-title {
          font-family:'Archivo Black',sans-serif;
          font-size:2rem;text-transform:uppercase;
          letter-spacing:-0.06em;line-height:0.9;
          color:var(--ink);margin-bottom:0.6rem;
          transition:color 0.3s ease;
        }
        .rp-subtitle {
          font-size:0.88rem;color:var(--muted);line-height:1.55;
          transition:color 0.3s ease;
        }
        .rp-label {
          display:block;font-size:0.7rem;font-weight:900;
          letter-spacing:0.12em;text-transform:uppercase;
          color:var(--brown);margin-bottom:0.4rem;
          transition:color 0.3s ease;
        }
        .rp-input {
          width:100%;height:50px;
          background:var(--cream);
          border:2px solid var(--ink);border-radius:0.85rem;
          padding:0 3rem 0 1rem;
          color:var(--ink);font-size:0.95rem;
          font-family:'Inter',sans-serif;font-weight:500;
          outline:none;box-sizing:border-box;
          transition:box-shadow 0.15s ease, background-color 0.3s ease, border-color 0.3s ease;
        }
        .rp-input:focus { box-shadow:4px 4px 0 var(--ink); }
        .rp-input::placeholder { color:var(--muted);font-weight:400; }
        .rp-pw-toggle {
          position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);
          background:none;border:none;color:var(--muted);
          cursor:pointer;padding:0;display:flex;
          transition:color 0.15s ease;
        }
        .rp-pw-toggle:hover { color:var(--ink); }
        .rp-btn {
          width:100%;height:52px;
          background:var(--orange);color:var(--on-accent-light);
          border:2px solid var(--ink);border-radius:999px;
          box-shadow:5px 5px 0 var(--ink);
          font-family:'Inter',sans-serif;font-weight:900;font-size:1rem;
          cursor:pointer;margin-top:0.5rem;
          transition:transform 0.15s ease, box-shadow 0.15s ease,
            background-color 0.3s ease, border-color 0.3s ease;
        }
        .rp-btn:hover { transform:translate(3px,3px); box-shadow:2px 2px 0 var(--ink); }
        .rp-btn:active { transform:translate(4px,4px); box-shadow:1px 1px 0 var(--ink); }
        .rp-btn:disabled { opacity:0.6;cursor:not-allowed;transform:none; }
      </style>

      <div class="rp-root">
        <div class="rp-topbar">
          <span class="rp-logo">Track Birthdays</span>
          <button id="rp-theme-toggle" class="rp-theme-btn" type="button" aria-label="Toggle dark mode">
            <svg id="rp-sun" style="width:1.1rem;height:1.1rem;display:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg id="rp-moon" style="width:1.1rem;height:1.1rem;display:block;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
        </div>

        <div class="rp-body">
          <div class="rp-card">
            <div class="rp-card-header">
              <span class="rp-eyebrow">Account Security</span>
              <h1 class="rp-title">SET NEW<br>PASSWORD</h1>
              <p class="rp-subtitle">${t("reset_desc")}</p>
            </div>

            <div style="display:flex;flex-direction:column;gap:1.1rem;">
              <div>
                <label class="rp-label" for="new-password">${t(
                  "reset_new_password_label",
                )}</label>
                <div style="position:relative;">
                  <input id="new-password" class="rp-input" type="${
                    showPassword ? "text" : "password"
                  }" placeholder="••••••••" autocomplete="new-password" />
                  <button id="toggle-passwords" class="rp-pw-toggle" type="button" aria-label="Toggle visibility">
                    <span class="material-symbols-outlined" style="font-size:1.1rem;">${
                      showPassword ? "visibility_off" : "visibility"
                    }</span>
                  </button>
                </div>
              </div>

              <div>
                <label class="rp-label" for="confirm-new-password">${t(
                  "reset_confirm_password_label",
                )}</label>
                <div style="position:relative;">
                  <input id="confirm-new-password" class="rp-input" type="${
                    showPassword ? "text" : "password"
                  }" placeholder="••••••••" autocomplete="new-password" />
                </div>
              </div>

              <button id="update-password-btn" class="rp-btn">${t(
                "reset_update_button",
              )}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function syncIcons(): void {
    const dark = getTheme() === "dark";
    const sun = document.getElementById("rp-sun") as HTMLElement | null;
    const moon = document.getElementById("rp-moon") as HTMLElement | null;
    if (sun) sun.style.display = dark ? "block" : "none";
    if (moon) moon.style.display = dark ? "none" : "block";
  }

  function bindEvents(): void {
    syncIcons();
    document
      .getElementById("rp-theme-toggle")
      ?.addEventListener("click", () => {
        setTheme(getTheme() === "dark" ? "light" : "dark");
        syncIcons();
      });

    document
      .getElementById("toggle-passwords")
      ?.addEventListener("click", () => {
        const newVal = (
          document.getElementById("new-password") as HTMLInputElement
        ).value;
        const confirmVal = (
          document.getElementById("confirm-new-password") as HTMLInputElement
        ).value;
        showPassword = !showPassword;
        render();
        (document.getElementById("new-password") as HTMLInputElement).value =
          newVal;
        (
          document.getElementById("confirm-new-password") as HTMLInputElement
        ).value = confirmVal;
        syncIcons();
      });

    document
      .getElementById("update-password-btn")
      ?.addEventListener("click", async () => {
        const newPassword = (
          document.getElementById("new-password") as HTMLInputElement
        ).value;
        const confirmPassword = (
          document.getElementById("confirm-new-password") as HTMLInputElement
        ).value;

        if (!newPassword || !confirmPassword) {
          showToast(t("toast_fill_fields"), "error");
          return;
        }
        if (newPassword.length < 8) {
          showToast("Password must be at least 8 characters", "error");
          return;
        }
        if (newPassword !== confirmPassword) {
          showToast(t("toast_passwords_no_match"), "error");
          return;
        }

        const btn = document.getElementById(
          "update-password-btn",
        ) as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = t("toast_saving");
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (error) {
            showToast(t("toast_error_generic"), "error");
          } else {
            showToast(t("reset_password_updated"), "success");
            await supabase.auth.signOut();
            setTimeout(() => (window.location.href = "/"), 1500);
          }
        } finally {
          btn.disabled = false;
          btn.textContent = t("reset_update_button");
        }
      });
  }

  function render(): void {
    (window as any).__root().innerHTML = getHTML();
    bindEvents();
  }

  render();
}
