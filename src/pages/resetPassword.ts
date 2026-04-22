import { supabase } from '../supabase'
import { showToast } from '../toast'

export function renderResetPassword() {
  let showPassword = false

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
                <span class="material-symbols-outlined" style="font-size:2.5rem;color:#ffb3b0;font-variation-settings:'FILL' 1;">lock_reset</span>
              </div>
              <h1 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.75rem;color:#e5e2e1;margin:0;">Set New Password</h1>
              <p style="color:#e0bfbd;font-size:0.85rem;margin:0;text-align:center;">Choose a strong password for your account</p>
            </div>

            <div style="display:flex;flex-direction:column;gap:1.25rem;">
              <div>
                <label style="display:block;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#e0bfbd;margin-bottom:8px;">New Password</label>
                <div style="position:relative;">
                  <input id="new-password" type="${showPassword ? 'text' : 'password'}" placeholder="••••••••"
                    style="width:100%;height:52px;background:#353534;border:none;border-radius:12px;padding:0 3rem 0 1.25rem;color:#e5e2e1;font-size:1rem;font-family:'Inter',sans-serif;outline:none;box-sizing:border-box;"
                    onfocus="this.style.boxShadow='0 0 0 2px rgba(255,179,176,0.3)'" onblur="this.style.boxShadow='none'"/>
                  <button id="toggle-passwords" style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#a78a88;cursor:pointer;padding:0;display:flex;">
                    <span class="material-symbols-outlined" style="font-size:20px;">${showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <div>
                <label style="display:block;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#e0bfbd;margin-bottom:8px;">Confirm Password</label>
                <div style="position:relative;">
                  <input id="confirm-new-password" type="${showPassword ? 'text' : 'password'}" placeholder="••••••••"
                    style="width:100%;height:52px;background:#353534;border:none;border-radius:12px;padding:0 3rem 0 1.25rem;color:#e5e2e1;font-size:1rem;font-family:'Inter',sans-serif;outline:none;box-sizing:border-box;"
                    onfocus="this.style.boxShadow='0 0 0 2px rgba(255,179,176,0.3)'" onblur="this.style.boxShadow='none'"/>
                </div>
              </div>
              <button id="update-password-btn" style="width:100%;height:56px;background:linear-gradient(180deg,#ffb3b0,#ff6b6b);border:none;border-radius:14px;color:#410006;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:1.1rem;cursor:pointer;margin-top:0.5rem;transition:transform 0.15s,box-shadow 0.15s;box-shadow:0 8px 24px rgba(255,107,107,0.25);"
                onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'"
                onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='scale(1)'">
                Update Password
              </button>
            </div>

          </div>
        </main>
      </div>
    `
  }

  function bindEvents() {
    const newPasswordInput = document.getElementById('new-password') as HTMLInputElement
    const confirmPasswordInput = document.getElementById('confirm-new-password') as HTMLInputElement

    document.getElementById('toggle-passwords')!.addEventListener('click', () => {
      const newVal = newPasswordInput.value
      const confirmVal = confirmPasswordInput.value
      
      showPassword = !showPassword
      render()
      
      // Restore values after re-render
      const newInput = document.getElementById('new-password') as HTMLInputElement
      const confirmInput = document.getElementById('confirm-new-password') as HTMLInputElement
      newInput.value = newVal
      confirmInput.value = confirmVal
    })

    document.getElementById('update-password-btn')!.addEventListener('click', async () => {
      const newPassword = (document.getElementById('new-password') as HTMLInputElement).value
      const confirmPassword = (document.getElementById('confirm-new-password') as HTMLInputElement).value

      if (!newPassword || !confirmPassword) {
        showToast('Please fill in all fields', 'error')
        return
      }

      if (newPassword.length < 8) {
        showToast('Password must be at least 8 characters', 'error')
        return
      }

      if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error')
        return
      }

      const btn = document.getElementById('update-password-btn') as HTMLButtonElement
      btn.disabled = true
      btn.textContent = 'Updating...'
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) {
          showToast(error.message, 'error')
        } else {
          showToast('Password updated! Please log in.', 'success')
          await supabase.auth.signOut()
          setTimeout(() => window.location.href = '/', 1500)
        }
      } finally {
        btn.disabled = false
        btn.textContent = 'Update Password'
      }
    })
  }

  function render() {
    (window as any).__root().innerHTML = getHTML()
    bindEvents()
  }

  render()
}