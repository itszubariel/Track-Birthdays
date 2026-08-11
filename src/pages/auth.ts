import { supabase } from "../services/supabase";
import { showToast } from "../features/toast";
import { t } from "../services/i18n";

function getTheme(): string {
  return document.documentElement.getAttribute("data-theme") || "dark";
}

function setTheme(theme: string): void {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function themeToggleBtn(): string {
  return `
    <button id="theme-toggle" type="button" aria-label="Toggle dark mode" style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.6rem;
      height: 2.6rem;
      border: 2px solid var(--ink);
      border-radius: 999px;
      box-shadow: 4px 4px 0 var(--ink);
      background: var(--paper);
      color: var(--ink);
      cursor: pointer;
      flex-shrink: 0;
      padding: 0;
      transition: transform 0.15s ease, box-shadow 0.15s ease,
        background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    ">
      <svg id="icon-sun-svg" style="width:1.1rem;height:1.1rem;display:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg id="icon-moon-svg" style="width:1.1rem;height:1.1rem;display:block;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  `;
}

function bindThemeToggle(): void {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  function syncIcons(): void {
    const dark = getTheme() === "dark";
    const sun = document.getElementById("icon-sun-svg") as HTMLElement | null;
    const moon = document.getElementById("icon-moon-svg") as HTMLElement | null;
    if (sun) sun.style.display = dark ? "block" : "none";
    if (moon) moon.style.display = dark ? "none" : "block";
  }

  syncIcons();

  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "translate(3px, 3px)";
    btn.style.boxShadow = "1px 1px 0 var(--ink)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
    btn.style.boxShadow = "4px 4px 0 var(--ink)";
  });

  btn.addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
    syncIcons();
    btn.style.transform = "translate(3px, 3px)";
    btn.style.boxShadow = "1px 1px 0 var(--ink)";
    setTimeout(() => {
      btn.style.transform = "";
      btn.style.boxShadow = "4px 4px 0 var(--ink)";
    }, 150);
  });
}

const AUTH_STYLES = `
  <style>
    .auth-root {
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: none;
      background: var(--cream);
      display: flex;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
      transition: background-color 0.3s ease;
    }
    .auth-root::-webkit-scrollbar { display: none; }

    .auth-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      flex-shrink: 0;
    }

    .auth-logo {
      font-family: 'Archivo Black', sans-serif;
      font-size: 1rem;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: -0.04em;
      color: var(--ink);
      border: 2px solid var(--ink);
      border-radius: 999px;
      box-shadow: 4px 4px 0 var(--ink);
      background: var(--paper);
      padding: 0.45rem 1rem;
      text-decoration: none;
      display: inline-block;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease,
        background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
    .auth-logo:hover { transform: translate(3px, 3px); box-shadow: 1px 1px 0 var(--ink); }

    .auth-body {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem 1.25rem 2rem;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      background: var(--paper);
      border: 3px solid var(--ink);
      border-radius: 2rem;
      box-shadow: 8px 8px 0 var(--ink);
      padding: 2rem 1.75rem;
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }

    .auth-card-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-eyebrow {
      font-size: 0.72rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: var(--brown);
      display: block;
      margin-bottom: 0.75rem;
      transition: color 0.3s ease;
    }

    .auth-title {
      font-family: 'Archivo Black', sans-serif;
      font-size: 2.2rem;
      text-transform: uppercase;
      letter-spacing: -0.06em;
      line-height: 0.9;
      color: var(--ink);
      margin-bottom: 0.6rem;
      transition: color 0.3s ease;
    }

    .auth-subtitle {
      font-size: 0.88rem;
      color: var(--muted);
      line-height: 1.55;
      transition: color 0.3s ease;
    }

    .auth-fields {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .auth-label {
      display: block;
      font-size: 0.7rem;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--brown);
      margin-bottom: 0.4rem;
      transition: color 0.3s ease;
    }

    .auth-input {
      width: 100%;
      height: 50px;
      background: var(--cream);
      border: 2px solid var(--ink);
      border-radius: 0.85rem;
      padding: 0 1rem;
      color: var(--ink);
      font-size: 0.95rem;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      outline: none;
      box-sizing: border-box;
      transition: box-shadow 0.15s ease, background-color 0.3s ease,
        color 0.3s ease, border-color 0.3s ease;
    }

    .auth-input:focus {
      box-shadow: 4px 4px 0 var(--ink);
    }

    .auth-input::placeholder {
      color: var(--muted);
      font-weight: 400;
    }

    .auth-input-wrap {
      position: relative;
    }

    .auth-input-wrap .auth-input {
      padding-right: 3rem;
    }

    .auth-pw-toggle {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--muted);
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }

    .auth-pw-toggle:hover { color: var(--ink); }

    .auth-forgot {
      display: block;
      text-align: right;
      margin-top: 0.35rem;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--orange);
      text-decoration: none;
      cursor: pointer;
      transition: text-decoration 0.15s ease;
    }
    .auth-forgot:hover { text-decoration: underline; }

    .auth-tos-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;
    }

    .auth-checkbox {
      appearance: none;
      width: 20px;
      height: 20px;
      min-width: 20px;
      margin-top: 1px;
      border: 2px solid var(--ink);
      border-radius: 6px;
      background: var(--cream);
      cursor: pointer;
      position: relative;
      transition: background-color 0.2s ease, border-color 0.3s ease;
    }

    .auth-checkbox:checked {
      background: var(--lime);
    }

    .auth-checkbox:checked::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 1px;
      width: 7px;
      height: 11px;
      border: 2px solid var(--on-accent-dark);
      border-top: none;
      border-left: none;
      transform: rotate(45deg);
    }

    .auth-tos-text {
      font-size: 0.82rem;
      color: var(--muted);
      line-height: 1.55;
      transition: color 0.3s ease;
    }

    .auth-tos-text a {
      color: var(--orange);
      font-weight: 700;
      text-decoration: none;
    }
    .auth-tos-text a:hover { text-decoration: underline; }

    .auth-btn-primary {
      width: 100%;
      height: 52px;
      background: var(--orange);
      color: var(--on-accent-light);
      border: 2px solid var(--ink);
      border-radius: 999px;
      box-shadow: 5px 5px 0 var(--ink);
      font-family: 'Inter', sans-serif;
      font-weight: 900;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: transform 0.15s ease, box-shadow 0.15s ease,
        background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }

    .auth-btn-primary:hover {
      transform: translate(3px, 3px);
      box-shadow: 2px 2px 0 var(--ink);
    }

    .auth-btn-primary:active {
      transform: translate(4px, 4px);
      box-shadow: 1px 1px 0 var(--ink);
    }

    .auth-btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: 5px 5px 0 var(--ink);
    }

    .auth-switch {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.88rem;
      color: var(--muted);
      transition: color 0.3s ease;
    }

    .auth-switch-link {
      color: var(--orange);
      font-weight: 700;
      cursor: pointer;
      margin-left: 0.25rem;
    }

    .auth-trust-row {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 1.75rem;
    }

    .auth-trust-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      transition: color 0.3s ease;
    }
  </style>
`;

function renderForgotPassword(): void {
  (window as any).__root().innerHTML = `
    ${AUTH_STYLES}
    <div class="auth-root">

      <div class="auth-topbar">
        <span class="auth-logo">Track Birthdays</span>
        ${themeToggleBtn()}
      </div>

      <div class="auth-body">
        <div class="auth-card">

          <div class="auth-card-header">
            <span class="auth-eyebrow">Password Reset</span>
            <h1 class="auth-title">FORGOT<br>PASSWORD</h1>
            <p class="auth-subtitle">Enter your email and we'll send you a reset link.</p>
          </div>

          <div class="auth-fields">
            <div>
              <label class="auth-label" for="reset-email">Email</label>
              <input id="reset-email" class="auth-input" type="email" placeholder="your@email.com" autocomplete="email" />
            </div>

            <button id="reset-btn" class="auth-btn-primary">Send Reset Link</button>

            <div class="auth-switch">
              Remember it after all?
              <span id="back-to-login" class="auth-switch-link">Back to Log In</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  `;

  bindThemeToggle();

  document.getElementById("reset-btn")!.addEventListener("click", async () => {
    const email = (
      document.getElementById("reset-email") as HTMLInputElement
    ).value.trim();
    if (!email) {
      showToast(t("toast_enter_email"), "error");
      return;
    }
    const btn = document.getElementById("reset-btn") as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = t("toast_sending");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) {
        showToast(t("toast_error_generic"), "error");
      } else {
        showToast(t("toast_reset_sent"), "success");
      }
    } finally {
      btn.disabled = false;
      btn.textContent = "Send Reset Link";
    }
  });

  document.getElementById("back-to-login")!.addEventListener("click", () => {
    renderAuth();
  });
}

export function renderAuth(): void {
  let isLogin = true;
  let showPassword = false;
  let passwordValue = "";

  function validatePassword(p: string): { valid: boolean; error: string } {
    if (p.length < 8) return { valid: false, error: "Minimum 8 characters" };
    return { valid: true, error: "" };
  }

  function getHTML(): string {
    return `
      ${AUTH_STYLES}
      <div class="auth-root">

        <div class="auth-topbar">
          <span class="auth-logo">Track Birthdays</span>
          ${themeToggleBtn()}
        </div>

        <div class="auth-body">
          <div class="auth-card">

            <div class="auth-card-header">
              <span class="auth-eyebrow">${
                isLogin ? "Welcome Back" : "Get Started"
              }</span>
              <h1 class="auth-title">${isLogin ? "LOG IN" : "SIGN UP"}</h1>
              <p class="auth-subtitle">${
                isLogin
                  ? "Sign in to your birthday tracker."
                  : "Create your account and never miss a birthday."
              }</p>
            </div>

            <div class="auth-fields">

              ${
                !isLogin
                  ? `
                <div>
                  <label class="auth-label" for="username">Username</label>
                  <input id="username" class="auth-input" type="text" placeholder="Choose a username" autocomplete="username" />
                </div>
              `
                  : ""
              }

              <div>
                <label class="auth-label" for="email">${
                  isLogin ? "Email or Username" : "Email"
                }</label>
                <input id="email" class="auth-input" type="${
                  isLogin ? "text" : "email"
                }"
                  placeholder="your@email.com"
                  autocomplete="${isLogin ? "username" : "email"}" />
              </div>

              <div>
                <label class="auth-label" for="password">Password</label>
                <div class="auth-input-wrap">
                  <input id="password" class="auth-input" type="${
                    showPassword ? "text" : "password"
                  }"
                    placeholder="${
                      isLogin
                        ? "Enter your password"
                        : "Choose a password (min. 8 chars)"
                    }"
                    value="${passwordValue}"
                    autocomplete="${
                      isLogin ? "current-password" : "new-password"
                    }" />
                  <button id="toggle-pw" class="auth-pw-toggle" type="button" aria-label="Toggle password visibility">
                    <span class="material-symbols-outlined" style="font-size:1.1rem;">${
                      showPassword ? "visibility_off" : "visibility"
                    }</span>
                  </button>
                </div>
                ${
                  isLogin
                    ? `<a id="forgot-pw" class="auth-forgot" role="button" tabindex="0">Forgot Password?</a>`
                    : ""
                }
              </div>

              ${
                !isLogin
                  ? `
                <div>
                  <label class="auth-label" for="confirm-password">Confirm Password</label>
                  <input id="confirm-password" class="auth-input" type="password"
                    placeholder="Re-enter your password"
                    autocomplete="new-password" />
                </div>

                <label class="auth-tos-row">
                  <input id="tos" class="auth-checkbox" type="checkbox" />
                  <span class="auth-tos-text">
                    I agree to the
                    <a href="https://trackbirthdays.zubs.me/terms.html" target="_blank" rel="noopener">Terms of Service</a>
                    and
                    <a href="https://trackbirthdays.zubs.me/policy.html" target="_blank" rel="noopener">Privacy Policy</a>
                  </span>
                </label>
              `
                  : ""
              }

              <button id="auth-btn" class="auth-btn-primary">
                ${isLogin ? "Log In" : "Create Account"}
              </button>

            </div>

            <div class="auth-switch">
              ${isLogin ? "Don't have an account?" : "Already have an account?"}
              <span id="toggle-btn" class="auth-switch-link">${
                isLogin ? "Create one" : "Log in"
              }</span>
            </div>

            ${
              isLogin
                ? `
              <div class="auth-trust-row">
                <span class="auth-trust-item">
                  <svg style="width:0.9rem;height:0.9rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                  Secured
                </span>
                <span class="auth-trust-item">
                  <svg style="width:0.9rem;height:0.9rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
                    <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>
                  </svg>
                  Synced
                </span>
                <span class="auth-trust-item">
                  <svg style="width:0.9rem;height:0.9rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Private
                </span>
              </div>
            `
                : ""
            }

          </div>
        </div>

      </div>
    `;
  }

  function bindEvents(): void {
    bindThemeToggle();

    document.getElementById("toggle-btn")!.addEventListener("click", () => {
      isLogin = !isLogin;
      passwordValue = "";
      render();
    });

    document.getElementById("toggle-pw")?.addEventListener("click", () => {
      showPassword = !showPassword;
      const pwInput = document.getElementById("password") as HTMLInputElement;
      if (pwInput) pwInput.type = showPassword ? "text" : "password";
      const icon = document.querySelector(
        "#toggle-pw .material-symbols-outlined",
      ) as HTMLElement;
      if (icon)
        icon.textContent = showPassword ? "visibility_off" : "visibility";
    });

    document.getElementById("password")?.addEventListener("input", (e) => {
      passwordValue = (e.target as HTMLInputElement).value;
    });

    document.getElementById("forgot-pw")?.addEventListener("click", (e) => {
      e.preventDefault();
      renderForgotPassword();
    });
    document.getElementById("forgot-pw")?.addEventListener("keydown", (e) => {
      if ((e as KeyboardEvent).key === "Enter") renderForgotPassword();
    });

    document.getElementById("auth-btn")!.addEventListener("click", async () => {
      const email = (
        document.getElementById("email") as HTMLInputElement
      )?.value.trim();
      const password = (document.getElementById("password") as HTMLInputElement)
        ?.value;

      if (!email || !password) {
        showToast(t("toast_fill_fields"), "error");
        return;
      }

      const btn = document.getElementById("auth-btn") as HTMLButtonElement;
      const originalText = isLogin ? "Log In" : "Create Account";
      btn.disabled = true;
      btn.textContent = isLogin
        ? t("toast_signin")
        : t("toast_creating_account");

      try {
        if (isLogin) {
          let loginEmail = email;
          if (!email.includes("@")) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("email")
              .ilike("username", email.trim())
              .limit(1);
            if (!profiles || profiles.length === 0) {
              showToast(t("toast_username_not_found"), "error");
              return;
            }
            loginEmail = profiles[0].email;
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password,
          });
          if (error) {
            if (error.message.toLowerCase().includes("invalid")) {
              showToast(t("toast_incorrect_credentials"), "error");
            } else if (
              error.message.toLowerCase().includes("email not confirmed")
            ) {
              showToast(t("toast_verify_email"), "error");
            } else {
              showToast(t("toast_error_generic"), "error");
            }
          } else if (data.user && !data.user.email_confirmed_at) {
            showToast(t("toast_verify_email"), "error");
          } else {
            showToast(t("toast_welcome_back"), "success");
          }
        } else {
          const username = (
            document.getElementById("username") as HTMLInputElement
          )?.value.trim();
          const confirmPassword = (
            document.getElementById("confirm-password") as HTMLInputElement
          )?.value;
          const tos = (document.getElementById("tos") as HTMLInputElement)
            ?.checked;

          if (!username) {
            showToast(t("toast_fill_fields"), "error");
            return;
          }
          const v = validatePassword(password);
          if (!v.valid) {
            showToast(v.error, "error");
            return;
          }
          if (password !== confirmPassword) {
            showToast(t("toast_passwords_no_match"), "error");
            return;
          }
          if (!tos) {
            showToast(t("toast_accept_tos"), "error");
            return;
          }

          const { data: existingUsers } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", username)
            .limit(1);
          if (existingUsers && existingUsers.length > 0) {
            showToast(t("toast_username_taken"), "error");
            return;
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } },
          });
          if (error) {
            if (error.message.toLowerCase().includes("already registered")) {
              showToast(t("toast_email_exists"), "error");
            } else {
              showToast(t("toast_error_generic"), "error");
            }
            return;
          }
          if (data.user) {
            showToast(t("toast_account_created"), "success");
          }
        }
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }

  function render(): void {
    (window as any).__root().innerHTML = getHTML();
    bindEvents();
  }

  render();
}
