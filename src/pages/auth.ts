import { supabase } from '../supabase'
import { showToast } from '../toast'

function renderForgotPassword() {
  ; (window as any).__root().innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

    <div style="min-height:100vh;background:#0f0f0f;display:flex;align-items:center;justify-content:center;padding:1.5rem;font-family:'Inter',sans-serif;">
      <main style="width:100%;max-width:440px;">
        <div style="background:#1a1a1a;border-radius:2rem;padding:2.5rem;box-shadow:0 25px 60px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.05);">
          
          <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:2rem;gap:12px;">
            <div style="width:80px;height:80px;background:rgba(255,107,107,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;">
              <span class="material-symbols-outlined" style="font-size:2.5rem;color:#ffb3b0;font-variation-settings:'FILL' 1;">lock_reset</span>
            </div>
            <h1 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.75rem;color:#e5e2e1;margin:0;">Reset Password</h1>
            <p style="color:#e0bfbd;font-size:0.85rem;margin:0;text-align:center;">Enter your email and we'll send you a reset link</p>
          </div>

          <div style="display:flex;flex-direction:column;gap:1.25rem;">
            <div>
              <label style="display:block;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#e0bfbd;margin-bottom:8px;">Email</label>
              <input id="reset-email" type="email" placeholder="alex@example.com"
                style="width:100%;height:52px;background:#353534;border:none;border-radius:12px;padding:0 1.25rem;color:#e5e2e1;font-size:1rem;font-family:'Inter',sans-serif;outline:none;box-sizing:border-box;"
                onfocus="this.style.boxShadow='0 0 0 2px rgba(255,179,176,0.3)'" onblur="this.style.boxShadow='none'"/>
            </div>

            <button id="reset-btn" style="width:100%;height:56px;background:linear-gradient(180deg,#ffb3b0,#ff6b6b);border:none;border-radius:14px;color:#410006;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:1.1rem;cursor:pointer;transition:transform 0.15s;box-shadow:0 8px 24px rgba(255,107,107,0.25);"
              onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'"
              onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='scale(1)'">
              Send Reset Link
            </button>

            <div style="text-align:center;">
              <span id="back-to-login" style="font-size:14px;color:#ffb3b0;font-weight:600;cursor:pointer;">← Back to Log In</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `

  document.getElementById('reset-btn')!.addEventListener('click', async () => {
    const email = (document.getElementById('reset-email') as HTMLInputElement).value.trim()
    if (!email) {
      showToast('Please enter your email', 'error')
      return
    }

    const btn = document.getElementById('reset-btn') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Sending...'
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`
      })
      if (error) {
        showToast(error.message, 'error')
      } else {
        showToast('Reset link sent! Check your email', 'success')
      }
    } finally {
      btn.disabled = false
      btn.textContent = 'Send Reset Link'
    }
  })

  document.getElementById('back-to-login')!.addEventListener('click', () => {
    renderAuth()
  })
}

export function renderAuth() {
  let isLogin = true
  let showPassword = false
  let passwordValue = ''

  function validatePassword(p: string): { valid: boolean; error: string } {
    if (p.length < 8) return { valid: false, error: 'Password must be at least 8 characters' }
    return { valid: true, error: '' }
  }

  function getHTML() {
    return `
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

      <div style="height:100%;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;background:#0f0f0f;display:flex;align-items:flex-start;justify-content:center;padding:1.5rem;font-family:'Inter',sans-serif;">
        <div style="position:fixed;top:-10%;left:-10%;width:40%;height:40%;background:rgba(255,179,176,0.05);border-radius:50%;filter:blur(120px);pointer-events:none;"></div>
        <div style="position:fixed;bottom:-10%;right:-10%;width:40%;height:40%;background:rgba(82,222,162,0.05);border-radius:50%;filter:blur(120px);pointer-events:none;"></div>

        <main style="width:100%;max-width:440px;position:relative;z-index:10;margin:auto 0;padding:1rem 0;">
          <div style="background:#1a1a1a;border-radius:2rem;padding:2.5rem;box-shadow:0 25px 60px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.05);">

            <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:2rem;gap:12px;">
              <div style="width:80px;height:80px;background:rgba(255,107,107,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;">
                <span class="material-symbols-outlined" style="font-size:2.5rem;color:#ffb3b0;font-variation-settings:'FILL' 1;">redeem</span>
              </div>
              <h1 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.75rem;color:#e5e2e1;margin:0;">Track Birthdays</h1>
              <p style="color:#e0bfbd;font-size:0.85rem;margin:0;">${isLogin ? 'Sign in to your curated chronology' : 'Join the curated chronology.'}</p>
            </div>

            <div style="display:flex;flex-direction:column;gap:1.25rem;">

              ${!isLogin ? `
                <div>
                  <label style="display:block;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#e0bfbd;margin-bottom:8px;">Username</label>
                  <input id="username" type="text" placeholder="@arivers"
                    style="width:100%;height:52px;background:#353534;border:none;border-radius:12px;padding:0 1.25rem;color:#e5e2e1;font-size:1rem;font-family:'Inter',sans-serif;outline:none;box-sizing:border-box;"
                    onfocus="this.style.boxShadow='0 0 0 2px rgba(255,179,176,0.3)'" onblur="this.style.boxShadow='none'"/>
                </div>
              ` : ''}

              <div>
                <label style="display:block;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#e0bfbd;margin-bottom:8px;">${isLogin ? 'Email / Username' : 'Email'}</label>
                <input id="email" type="${isLogin ? 'text' : 'email'}" placeholder="alex@example.com"
                  style="width:100%;height:52px;background:#353534;border:none;border-radius:12px;padding:0 1.25rem;color:#e5e2e1;font-size:1rem;font-family:'Inter',sans-serif;outline:none;box-sizing:border-box;"
                  onfocus="this.style.boxShadow='0 0 0 2px rgba(255,179,176,0.3)'" onblur="this.style.boxShadow='none'"/>
              </div>

              <div>
                <label style="display:block;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#e0bfbd;margin-bottom:8px;">Password</label>
                <div style="position:relative;">
                  <input id="password" type="${showPassword ? 'text' : 'password'}" placeholder="••••••••" value="${passwordValue}"
                    style="width:100%;height:52px;background:#353534;border:none;border-radius:12px;padding:0 3rem 0 1.25rem;color:#e5e2e1;font-size:1rem;font-family:'Inter',sans-serif;outline:none;box-sizing:border-box;"
                    onfocus="this.style.boxShadow='0 0 0 2px rgba(255,179,176,0.3)'" onblur="this.style.boxShadow='none'"/>
                  <button id="toggle-pw" style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#a78a88;cursor:pointer;padding:0;display:flex;">
                    <span class="material-symbols-outlined" style="font-size:20px;">${showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                ${isLogin ? `<div style="text-align:right;margin-top:6px;"><a id="forgot-pw" href="#" style="font-size:12px;color:#ffb3b0;text-decoration:none;">Forgot Password?</a></div>` : ''}
              </div>

              ${!isLogin ? `
                <div>
                  <label style="display:block;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#e0bfbd;margin-bottom:8px;">Confirm Password</label>
                  <input id="confirm-password" type="password" placeholder="••••••••"
                    style="width:100%;height:52px;background:#353534;border:none;border-radius:12px;padding:0 1.25rem;color:#e5e2e1;font-size:1rem;font-family:'Inter',sans-serif;outline:none;box-sizing:border-box;"
                    onfocus="this.style.boxShadow='0 0 0 2px rgba(255,179,176,0.3)'" onblur="this.style.boxShadow='none'"/>
                </div>

                <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;">
                  <div style="position:relative;margin-top:2px;">
                    <input id="tos" type="checkbox" style="appearance:none;width:20px;height:20px;min-width:20px;background:#353534;border:none;border-radius:6px;cursor:pointer;"
                      onchange="this.style.background=this.checked?'#00b179':'#353534'"/>
                    <span class="material-symbols-outlined" id="tos-check" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:14px;color:#003b26;pointer-events:none;font-variation-settings:'wght' 700;opacity:0;">check</span>
                  </div>
                  <span style="font-size:13px;color:#e0bfbd;line-height:1.5;">I agree to the <a href="#" style="color:#ffb3b0;">Terms of Service</a> and <a href="#" style="color:#ffb3b0;">Privacy Policy</a></span>
                </label>
              ` : ''}

              <button id="auth-btn" style="width:100%;height:56px;background:linear-gradient(180deg,#ffb3b0,#ff6b6b);border:none;border-radius:14px;color:#410006;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:1.1rem;cursor:pointer;margin-top:0.5rem;transition:transform 0.15s,box-shadow 0.15s;box-shadow:0 8px 24px rgba(255,107,107,0.25);"
                onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'"
                onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='scale(1)'">
                ${isLogin ? 'Log In' : 'Create Account'}
              </button>

            </div>

            <div style="text-align:center;margin-top:1.5rem;">
              <p style="font-size:14px;color:#e0bfbd;margin:0;">
                ${isLogin ? "New here?" : "Already have an account?"}
                <span id="toggle-btn" style="color:#ffb3b0;font-weight:600;cursor:pointer;margin-left:4px;">${isLogin ? 'Sign up' : 'Log in'}</span>
              </p>
            </div>

          </div>

          ${isLogin ? `
            <div style="margin-top:2rem;display:flex;justify-content:center;gap:2rem;">
              <div style="display:flex;align-items:center;gap:8px;color:#444;transition:color 0.2s;cursor:pointer;" onmouseover="this.style.color='#ffb3b0'" onmouseout="this.style.color='#444'">
                <span class="material-symbols-outlined" style="font-size:20px;">shield</span>
                <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Secure</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;color:#444;transition:color 0.2s;cursor:pointer;" onmouseover="this.style.color='#52dea2'" onmouseout="this.style.color='#444'">
                <span class="material-symbols-outlined" style="font-size:20px;">cloud</span>
                <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Synced</span>
              </div>
            </div>
          ` : ''}
        </main>
      </div>
    `
  }

  function bindEvents() {
    document.getElementById('toggle-btn')!.addEventListener('click', () => {
      isLogin = !isLogin
      passwordValue = ''
      render()
    })

    document.getElementById('toggle-pw')?.addEventListener('click', () => {
      showPassword = !showPassword
      const pwInput = document.getElementById('password') as HTMLInputElement
      const confirmInput = document.getElementById('confirm-password') as HTMLInputElement
      const icon = document.querySelector('#toggle-pw .material-symbols-outlined') as HTMLElement
      if (pwInput) pwInput.type = showPassword ? 'text' : 'password'
      if (confirmInput) confirmInput.type = showPassword ? 'text' : 'password'
      if (icon) icon.textContent = showPassword ? 'visibility_off' : 'visibility'
    })

    document.getElementById('password')?.addEventListener('input', (e) => {
      passwordValue = (e.target as HTMLInputElement).value
    })

    document.getElementById('tos')?.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked
      const checkIcon = document.getElementById('tos-check')
      if (checkIcon) checkIcon.style.opacity = checked ? '1' : '0'
    })

    document.getElementById('auth-btn')!.addEventListener('click', async () => {
      const email = (document.getElementById('email') as HTMLInputElement)?.value.trim()
      const password = (document.getElementById('password') as HTMLInputElement)?.value

      if (!email || !password) {
        showToast('Please fill in all fields', 'error')
        return
      }

      const btn = document.getElementById('auth-btn') as HTMLButtonElement
      const originalText = isLogin ? 'Log In' : 'Create Account'
      btn.disabled = true
      btn.textContent = isLogin ? 'Signing in...' : 'Creating account...'

      try {
        if (isLogin) {
          let loginEmail = email
          if (!email.includes('@')) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('email')
              .ilike('username', email.trim())
              .limit(1)

            if (!profiles || profiles.length === 0) {
              showToast('Username not found', 'error')
              return
            }

            loginEmail = profiles[0].email
          }

          const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password })

          if (error) {
            if (error.message.toLowerCase().includes('invalid')) {
              showToast('Incorrect email or password', 'error')
            } else if (error.message.toLowerCase().includes('email not confirmed')) {
              showToast('Please verify your email before logging in', 'error')
            } else {
              showToast(error.message, 'error')
            }
          } else if (data.user && !data.user.email_confirmed_at) {
            showToast('Please verify your email before logging in', 'error')
          } else {
            showToast('Welcome back!', 'success')
          }

        } else {
          const username = (document.getElementById('username') as HTMLInputElement)?.value.trim()
          const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement)?.value
          const tos = (document.getElementById('tos') as HTMLInputElement)?.checked

          if (!username) {
            showToast('Please fill in all fields', 'error')
            return
          }

          const v = validatePassword(password)
          if (!v.valid) {
            showToast(v.error, 'error')
            return
          }

          if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error')
            return
          }

          if (!tos) {
            showToast('Please accept the Terms of Service', 'error')
            return
          }

          const { data: existingUsers } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .limit(1)

          if (existingUsers && existingUsers.length > 0) {
            showToast('Username already taken', 'error')
            return
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } }
          })

          if (error) {
            if (error.message.toLowerCase().includes('already registered')) {
              showToast('An account with this email already exists', 'error')
            } else {
              showToast(error.message, 'error')
            }
            return
          }

          if (data.user) {
            showToast('Account created! Check your email to verify', 'success')
          }
        }
      } finally {
        btn.disabled = false
        btn.textContent = originalText
      }
    })

    document.getElementById('forgot-pw')?.addEventListener('click', (e) => {
      e.preventDefault()
      renderForgotPassword()
    })
  }

  function render() {
    ; (window as any).__root().innerHTML = getHTML()
    bindEvents()
  }

  render()
}