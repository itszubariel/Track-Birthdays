import { supabase } from '../supabase'
import { renderAuth } from './auth'
import { showToast } from '../toast'
import { getNavGeneration } from '../app'
import { getStore, refreshAll, clearStore } from '../store'

export async function renderProfile(container: HTMLElement, gen = 0) {
  const { data: { session } } = await supabase.auth.getSession()
  const profile = getStore().profile

  if (!container.isConnected || gen !== getNavGeneration()) return

  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  const avatarInner = profile?.avatar_url
    ? `<img src="${profile.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
    : initials

  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

    <div style="background:#0f0f0f;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;min-height:100%;padding-bottom:2rem;">

      <!-- Header -->
      <header style="position:sticky;top:0;z-index:40;background:rgba(13,13,13,0.92);backdrop-filter:blur(12px);display:flex;align-items:center;gap:10px;padding:1rem 1.5rem;border-bottom:1px solid #111;">
        <span class="material-symbols-outlined" style="color:#ffb3b0;font-variation-settings:'FILL' 1;">person</span>
        <h1 style="font-weight:800;font-size:1.5rem;color:#ffb3b0;margin:0;">Profile</h1>
      </header>

      <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem;">

        <!-- Hero Avatar -->
        <div style="display:flex;flex-direction:column;align-items:center;padding:2rem 0 1rem;">
          <div style="position:relative;margin-bottom:1.25rem;">
            <div id="avatar-circle" style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:800;color:#410006;box-shadow:0 8px 32px rgba(255,107,107,0.25);cursor:pointer;overflow:hidden;">
              ${avatarInner}
            </div>
            <button id="avatar-btn" style="position:absolute;bottom:0;right:0;width:28px;height:28px;border-radius:50%;background:#1a1a1a;border:2px solid #0f0f0f;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;">
              <span class="material-symbols-outlined" style="font-size:14px;color:#ffb3b0;">photo_camera</span>
            </button>
          </div>
          <h2 style="font-size:1.6rem;font-weight:800;margin:0 0 4px;color:#e5e2e1;text-align:center;">${profile?.full_name || 'User'}</h2>
          <p style="color:#ffb3b0;font-size:14px;font-weight:600;margin:0 0 3px;">@${profile?.username || 'unknown'}</p>
          <p style="color:#444;font-size:12px;margin:0;">${session?.user.email || ''}</p>
        </div>

        <!-- Editable Profile Card -->
        <div style="background:#1a1a1a;border-radius:1.5rem;border:1px solid #222;overflow:hidden;">
          <div style="padding:1rem 1.25rem;border-bottom:1px solid #222;display:flex;align-items:center;gap:10px;">
            <span class="material-symbols-outlined" style="color:#ffb3b0;font-size:18px;font-variation-settings:'FILL' 1;">manage_accounts</span>
            <span style="font-weight:700;font-size:14px;color:#e5e2e1;">Personal Info</span>
          </div>

          <!-- Full Name row -->
          <div style="padding:1rem 1.25rem;border-bottom:1px solid #1e1e1e;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0;">
              <div>
                <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#555;margin:0 0 3px;">Full Name</p>
                <p id="display-name" style="font-size:15px;font-weight:600;color:#e5e2e1;margin:0;">${profile?.full_name || '—'}</p>
              </div>
              <button id="edit-name-btn" style="background:none;border:none;color:#555;cursor:pointer;padding:6px;border-radius:8px;transition:color 0.2s;" onmouseover="this.style.color='#ffb3b0'" onmouseout="this.style.color='#555'">
                <span class="material-symbols-outlined" style="font-size:18px;">edit</span>
              </button>
            </div>
            <div id="name-edit-form" style="display:none;margin-top:10px;display:none;">
              <input id="input-name" type="text" value="${profile?.full_name || ''}" placeholder="Full name"
                style="width:100%;height:46px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 1.25rem;font-size:14px;font-family:'Inter',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;"
                onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
              <button id="save-name-btn" style="width:100%;height:42px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;cursor:pointer;margin-top:8px;">Save Name</button>
            </div>
          </div>

          <!-- Username row -->
          <div style="padding:1rem 1.25rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <div>
                <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#555;margin:0 0 3px;">Username</p>
                <p id="display-username" style="font-size:15px;font-weight:600;color:#e5e2e1;margin:0;">@${profile?.username || '—'}</p>
              </div>
              <button id="edit-username-btn" style="background:none;border:none;color:#555;cursor:pointer;padding:6px;border-radius:8px;transition:color 0.2s;" onmouseover="this.style.color='#ffb3b0'" onmouseout="this.style.color='#555'">
                <span class="material-symbols-outlined" style="font-size:18px;">edit</span>
              </button>
            </div>
            <div id="username-edit-form" style="display:none;margin-top:10px;">
              <input id="input-username" type="text" value="${profile?.username || ''}" placeholder="Username"
                style="width:100%;height:46px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 1.25rem;font-size:14px;font-family:'Inter',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;"
                onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
              <button id="save-username-btn" style="width:100%;height:42px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;cursor:pointer;margin-top:8px;">Save Username</button>
            </div>
          </div>
        </div>

        <!-- Your Birthday Card -->
        <div style="background:#1a1a1a;border-radius:1.5rem;border:1px solid #222;padding:1.25rem;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:0.75rem;">
            <span class="material-symbols-outlined" style="color:#ffb3b0;font-size:18px;font-variation-settings:'FILL' 1;">cake</span>
            <span style="font-weight:700;font-size:14px;color:#e5e2e1;">Your Birthday</span>
          </div>
          <p style="font-size:12px;color:#555;margin:0 0 12px;">We'll remind your friends</p>
          <div style="display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:8px;margin-bottom:10px;">
            <div>
              <input id="bday-day" type="text" inputmode="numeric" placeholder="Day" maxlength="2"
                value="${profile?.birthday ? profile.birthday.split('-')[2] : ''}"
                style="width:100%;height:46px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 0.75rem;font-size:14px;font-family:'Inter',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;text-align:center;"
                onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
              <p style="font-size:10px;color:#444;text-align:center;margin:3px 0 0;">Day</p>
            </div>
            <div>
              <input id="bday-month" type="text" inputmode="numeric" placeholder="Month" maxlength="2"
                value="${profile?.birthday ? profile.birthday.split('-')[1] : ''}"
                style="width:100%;height:46px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 0.75rem;font-size:14px;font-family:'Inter',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;text-align:center;"
                onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
              <p style="font-size:10px;color:#444;text-align:center;margin:3px 0 0;">Month</p>
            </div>
            <div>
              <input id="bday-year" type="text" inputmode="numeric" placeholder="Year" maxlength="4"
                value="${profile?.birthday ? profile.birthday.split('-')[0] : ''}"
                style="width:100%;height:46px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 0.75rem;font-size:14px;font-family:'Inter',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;text-align:center;"
                onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
              <p style="font-size:10px;color:#444;text-align:center;margin:3px 0 0;">Year (opt.)</p>
            </div>
          </div>
          <button id="save-bday-btn" style="width:100%;height:46px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;cursor:pointer;">Save Birthday</button>
        </div>

        <div style="background:#1a1a1a;border-radius:1.5rem;border:1px solid #222;padding:1.25rem;">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:0.75rem;">
    <span class="material-symbols-outlined" style="color:#ffb3b0;font-size:18px;font-variation-settings:'FILL' 1;">notifications_active</span>
    <span style="font-weight:700;font-size:14px;color:#e5e2e1;">Notifications</span>
  </div>
  <p style="font-size:12px;color:#555;margin:0 0 12px;">Daily reminder check time (set time is in UTC)</p>

  <div style="display:flex;align-items:center;justify-content:space-between;background:#2a2a2a;border-radius:9999px;padding:10px 16px;margin-bottom:12px;">
    <div style="display:flex;align-items:center;gap:8px;">
      <span class="material-symbols-outlined" style="font-size:18px;color:#ffb3b0;">notifications</span>
      <span style="font-size:13px;font-weight:600;color:#e5e2e1;">Push Notifications</span>
    </div>
    <button id="enable-notif-btn" style="height:34px;padding:0 16px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;cursor:pointer;">Enable</button>
  </div>

  <input id="notif-time" type="time" value="${profile?.notification_time?.slice(0, 5) || '09:00'}"
    style="width:100%;height:46px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 1.25rem;font-size:14px;font-family:'Inter',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;color-scheme:dark;"
    onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
  <button id="save-notif-btn" style="width:100%;height:46px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;cursor:pointer;margin-top:10px;">Save Time</button>
</div>

        <!-- Security Card -->
        <div style="background:#1a1a1a;border-radius:1.5rem;border:1px solid #222;overflow:hidden;">
          <div style="padding:1rem 1.25rem;border-bottom:1px solid #222;display:flex;align-items:center;gap:10px;">
            <span class="material-symbols-outlined" style="color:#ffb3b0;font-size:18px;font-variation-settings:'FILL' 1;">security</span>
            <span style="font-weight:700;font-size:14px;color:#e5e2e1;">Security</span>
          </div>
          <div id="change-pw-row" style="display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid #1e1e1e;cursor:pointer;transition:background 0.15s;"
            onmouseover="this.style.background='#222'" onmouseout="this.style.background='none'">
            <div style="display:flex;align-items:center;gap:12px;">
              <span class="material-symbols-outlined" style="color:#a78a88;font-size:20px;">lock_reset</span>
              <span style="font-size:14px;font-weight:600;color:#e5e2e1;">Change Password</span>
            </div>
            <span class="material-symbols-outlined" style="color:#555;font-size:18px;">chevron_right</span>
          </div>
          <div id="delete-account-row" style="display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;cursor:pointer;transition:background 0.15s;"
            onmouseover="this.style.background='#1f1010'" onmouseout="this.style.background='none'">
            <div style="display:flex;align-items:center;gap:12px;">
              <span class="material-symbols-outlined" style="color:#ff6b6b;font-size:20px;">delete_forever</span>
              <span style="font-size:14px;font-weight:600;color:#ff6b6b;">Delete Account</span>
            </div>
            <span class="material-symbols-outlined" style="color:#ff6b6b;font-size:18px;opacity:0.5;">chevron_right</span>
          </div>
        </div>

        <!-- Sign Out -->
        <button id="signout-btn" style="width:100%;height:54px;background:none;border:1px solid rgba(255,107,107,0.2);border-radius:1rem;color:#ff6b6b;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.2s;"
          onmouseover="this.style.background='rgba(255,107,107,0.07)'" onmouseout="this.style.background='none'">
          <span class="material-symbols-outlined">logout</span>
          Sign Out
        </button>

      </div>
    </div>

    <!-- Sign Out Modal -->
    <div id="signout-modal" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.8);z-index:200;align-items:center;justify-content:center;padding:1.5rem;">
      <div style="background:#1a1a1a;border-radius:1.5rem;border:1px solid #333;padding:2rem;width:100%;max-width:340px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem;">
          <span class="material-symbols-outlined" style="color:#ffb3b0;font-size:24px;font-variation-settings:'FILL' 1;">logout</span>
          <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.1rem;color:#e5e2e1;margin:0;">Sign out?</h3>
        </div>
        <p style="font-size:13px;color:#a78a88;margin:0 0 1.5rem;line-height:1.6;">You'll need to sign back in to access your birthdays.</p>
        <div style="display:flex;gap:10px;">
          <button id="signout-cancel-btn" style="flex:1;height:46px;background:#2a2a2a;border:none;border-radius:9999px;color:#a78a88;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;cursor:pointer;">Cancel</button>
          <button id="signout-confirm-btn" style="flex:2;height:46px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;cursor:pointer;">Sign Out</button>
        </div>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <div id="delete-modal" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.8);z-index:200;align-items:center;justify-content:center;padding:1.5rem;">
      <div style="background:#1a1a1a;border-radius:1.5rem;border:1px solid #333;padding:2rem;width:100%;max-width:340px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem;">
          <span class="material-symbols-outlined" style="color:#ff6b6b;font-size:24px;font-variation-settings:'FILL' 1;">warning</span>
          <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.1rem;color:#ff6b6b;margin:0;">Delete Account</h3>
        </div>
        <p style="font-size:13px;color:#a78a88;margin:0 0 1rem;line-height:1.6;">This will permanently delete your account and all your birthday data. This cannot be undone.</p>
        <p style="font-size:12px;color:#555;margin:0 0 8px;">Type <span style="color:#ff6b6b;font-weight:700;">DELETE</span> to confirm</p>
        <input id="delete-confirm-input" type="text" placeholder="DELETE"
          style="width:100%;height:46px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 1.25rem;font-size:14px;font-family:'Inter',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;margin-bottom:1rem;"
          onfocus="this.style.borderColor='#ff6b6b'" onblur="this.style.borderColor='#333'"/>
        <div style="display:flex;gap:10px;">
          <button id="delete-cancel-btn" style="flex:1;height:46px;background:#2a2a2a;border:none;border-radius:9999px;color:#a78a88;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;cursor:pointer;">Cancel</button>
          <button id="delete-confirm-btn" style="flex:2;height:46px;background:linear-gradient(135deg,#ff4444,#ff6b6b);border:none;border-radius:9999px;color:#fff;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;cursor:pointer;">Delete Forever</button>
        </div>
      </div>
    </div>
  `

  // ── Avatar file input (appended outside innerHTML) ─────────────────────────
  const avatarInput = document.createElement('input')
  avatarInput.type = 'file'
  avatarInput.id = 'avatar-upload'
  avatarInput.accept = 'image/*'
  avatarInput.style.display = 'none'
  container.appendChild(avatarInput)

  // ── Name edit ──────────────────────────────────────────────────────────────
  document.getElementById('edit-name-btn')?.addEventListener('click', () => {
    const form = document.getElementById('name-edit-form')!
    form.style.display = form.style.display === 'none' ? 'block' : 'none'
  })
  document.getElementById('save-name-btn')?.addEventListener('click', async () => {
    const name = (document.getElementById('input-name') as HTMLInputElement).value.trim()
    if (!name) return
    const btn = document.getElementById('save-name-btn') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Saving...'
    try {
      const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', session?.user.id)
      if (!error) {
        if (session) await refreshAll(session.user.id)
        showToast('Name updated!', 'success')
        renderProfile(container, gen)
      }
    } finally {
      btn.disabled = false
      btn.textContent = 'Save Name'
    }
  })

  // ── Username edit ──────────────────────────────────────────────────────────
  document.getElementById('edit-username-btn')?.addEventListener('click', () => {
    const form = document.getElementById('username-edit-form')!
    form.style.display = form.style.display === 'none' ? 'block' : 'none'
  })
  document.getElementById('save-username-btn')?.addEventListener('click', async () => {
    const username = (document.getElementById('input-username') as HTMLInputElement).value.trim()
    if (!username) return
    const btn = document.getElementById('save-username-btn') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Saving...'
    try {
      const { error } = await supabase.from('profiles').update({ username }).eq('id', session?.user.id)
      if (!error) {
        if (session) await refreshAll(session.user.id)
        document.getElementById('display-username')?.textContent && (document.getElementById('display-username')!.textContent = `@${username}`)
        document.getElementById('username-edit-form')?.style && (document.getElementById('username-edit-form')!.style.display = 'none')
        showToast('Username updated!', 'success')
      } else {
        showToast('Username already taken', 'error')
      }
    } finally {
      btn.disabled = false
      btn.textContent = 'Save Username'
    }
  })

  // ── Your Birthday ──────────────────────────────────────────────────────────
  const bdayDay = document.getElementById('bday-day') as HTMLInputElement
  const bdayMonth = document.getElementById('bday-month') as HTMLInputElement
  const bdayYear = document.getElementById('bday-year') as HTMLInputElement
  bdayDay.addEventListener('input', () => { bdayDay.value = bdayDay.value.replace(/\D/g, ''); if (bdayDay.value.length === 2) bdayMonth.focus() })
  bdayMonth.addEventListener('input', () => { bdayMonth.value = bdayMonth.value.replace(/\D/g, ''); if (bdayMonth.value.length === 2) bdayYear.focus() })
  bdayYear.addEventListener('input', () => { bdayYear.value = bdayYear.value.replace(/\D/g, '') })

  document.getElementById('save-bday-btn')?.addEventListener('click', async () => {
    const d = bdayDay.value.trim(), m = bdayMonth.value.trim(), y = bdayYear.value.trim()
    if (!d || !m) { showToast('Enter at least day and month', 'error'); return }
    const stored = y
      ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
      : `0000-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    const btn = document.getElementById('save-bday-btn') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Saving...'
    try {
      const { error } = await supabase.from('profiles').update({ birthday: stored }).eq('id', session?.user.id)
      if (!error) {
        if (session) await refreshAll(session.user.id)
        showToast('Birthday saved!', 'success')
      }
      else showToast(error.message, 'error')
    } finally {
      btn.disabled = false
      btn.textContent = 'Save Birthday'
    }
  })

  // ── Notification time ──────────────────────────────────────────────────────
  document.getElementById('save-notif-btn')?.addEventListener('click', async () => {
    const time = (document.getElementById('notif-time') as HTMLInputElement).value
    const btn = document.getElementById('save-notif-btn') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Saving...'
    try {
      await supabase.from('profiles').update({ notification_time: time }).eq('id', session?.user.id)
      if (session) await refreshAll(session.user.id)
      showToast('Notification time saved!', 'success')
    } finally {
      btn.disabled = false
      btn.textContent = 'Save Time'
    }
  })

  document.getElementById('enable-notif-btn')?.addEventListener('click', async () => {
    const { initNotifications } = await import('../notifications')
    await initNotifications(session?.user.id!)
    showToast('Notifications enabled!', 'success')
  })

  // ── Change Password ────────────────────────────────────────────────────────
  document.getElementById('change-pw-row')?.addEventListener('click', async () => {
    if (!session?.user.email) return
    const row = document.getElementById('change-pw-row') as HTMLElement
    row.style.pointerEvents = 'none'
    row.style.opacity = '0.5'
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
        redirectTo: `${window.location.origin}/reset`
      })
      if (!error) showToast('Reset link sent to your email', 'success')
      else showToast(error.message, 'error')
    } finally {
      row.style.pointerEvents = ''
      row.style.opacity = ''
    }
  })

  // ── Delete Account ─────────────────────────────────────────────────────────
  document.getElementById('delete-account-row')?.addEventListener('click', () => {
    const modal = document.getElementById('delete-modal')
    if (modal) { modal.style.display = 'flex'; (document.getElementById('delete-confirm-input') as HTMLInputElement).value = '' }
  })

  document.getElementById('delete-cancel-btn')?.addEventListener('click', () => {
    const modal = document.getElementById('delete-modal')
    if (modal) modal.style.display = 'none'
  })

  document.getElementById('delete-confirm-btn')?.addEventListener('click', async () => {
    const val = (document.getElementById('delete-confirm-input') as HTMLInputElement).value.trim()
    if (val !== 'DELETE') { showToast('Type DELETE to confirm', 'error'); return }

    const btn = document.getElementById('delete-confirm-btn') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Deleting...'
    try {
      await supabase.from('birthdays').delete().eq('user_id', session?.user.id)
      await supabase.from('groups').delete().eq('user_id', session?.user.id)
      await supabase.from('profiles').delete().eq('id', session?.user.id)

      await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session?.user.id })
      })

      await supabase.auth.signOut()
      renderAuth()
    } finally {
      btn.disabled = false
      btn.textContent = 'Delete Forever'
    }
  })

  // ── Sign Out ───────────────────────────────────────────────────────────────
  document.getElementById('signout-btn')?.addEventListener('click', () => {
    const modal = document.getElementById('signout-modal')
    if (modal) modal.style.display = 'flex'
  })
  document.getElementById('signout-cancel-btn')?.addEventListener('click', () => {
    const modal = document.getElementById('signout-modal')
    if (modal) modal.style.display = 'none'
  })
  document.getElementById('signout-confirm-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('signout-confirm-btn') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Signing out...'
    try {
      await supabase.auth.signOut()
      clearStore()
      renderAuth()
    } finally {
      btn.disabled = false
      btn.textContent = 'Sign Out'
    }
  })

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const triggerAvatarUpload = () => avatarInput.click()
  document.getElementById('avatar-circle')?.addEventListener('click', triggerAvatarUpload)
  document.getElementById('avatar-btn')?.addEventListener('click', (e) => {
    e.stopPropagation()
    triggerAvatarUpload()
  })
  avatarInput.addEventListener('change', async () => {
    const file = avatarInput.files?.[0]
    if (!file || !session?.user.id) return
    const path = `${session.user.id}/avatar`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (uploadError) { showToast('Upload failed', 'error'); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', session.user.id)
    if (updateError) { showToast('Failed to save photo', 'error'); return }
    await refreshAll(session.user.id)
    showToast('Photo updated!', 'success')
    renderProfile(container, gen)
  })
}