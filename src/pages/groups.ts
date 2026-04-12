import { supabase } from '../supabase'
import { showToast } from '../toast'
import { getNavGeneration } from '../app'
import { getStore, refreshAll } from '../store'

const GROUP_COLORS = ['#ff6b6b', '#52dea2', '#4dabf7', '#ffd43b', '#cc5de8', '#ff922b']

export async function renderGroups(container: HTMLElement, gen = 0) {
  const groups = getStore().groups

  if (!container.isConnected || gen !== getNavGeneration()) return

  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

    <div style="background:#0f0f0f;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;min-height:100%;">

      <header style="position:sticky;top:0;z-index:40;background:rgba(13,13,13,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="material-symbols-outlined" style="color:#ffb3b0;font-variation-settings:'FILL' 1;">celebration</span>
          <h1 style="font-weight:800;font-size:1.5rem;color:#ffb3b0;margin:0;">Groups</h1>
        </div>
        <button id="add-group-btn" style="background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;padding:8px 16px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;">
          <span class="material-symbols-outlined" style="font-size:18px;">add</span> New Group
        </button>
      </header>

      <div style="padding:1.5rem;">
        <h2 style="font-size:2rem;font-weight:800;margin:0 0 4px;color:#e5e2e1;">Moments in <span style="color:#ffb3b0;">Circles</span></h2>
        <p style="color:#a78a88;font-size:14px;margin:0 0 1.5rem;">Organize your celebrations.</p>

        <div id="groups-list" style="display:flex;flex-direction:column;gap:1rem;">
          ${groups.length === 0 ? `
            <div style="text-align:center;padding:3rem 0;color:#555;">
              <span class="material-symbols-outlined" style="font-size:48px;color:#333;">group</span>
              <p style="margin:1rem 0 0;font-weight:600;color:#444;">No groups yet</p>
              <p style="font-size:13px;margin:4px 0 0;color:#333;">Create one to organize your birthdays</p>
            </div>
          ` : groups.map(g => groupCard(g)).join('')}
        </div>
      </div>

      <!-- Add group modal -->
      <div id="add-group-modal" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.7);z-index:100;align-items:flex-end;justify-content:center;">
        <div style="background:#1a1a1a;border-radius:2rem 2rem 0 0;padding:2rem;width:100%;">
          <h3 style="font-size:1.25rem;font-weight:800;color:#ffb3b0;margin:0 0 1.5rem;">New Group</h3>
          <input id="group-name" type="text" placeholder="Group name (e.g. Family)"
            style="width:100%;height:52px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 1.5rem;font-size:16px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;margin-bottom:1rem;"
            onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
          <div style="margin-bottom:1.5rem;">
            <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;display:block;margin-bottom:10px;">Color</label>
            <div style="display:flex;gap:10px;">
              ${GROUP_COLORS.map(c => `
                <button data-color="${c}" onclick="document.querySelectorAll('[data-color]').forEach(b=>b.style.transform='scale(1)');this.style.transform='scale(1.3)';window.__selectedColor='${c}'"
                  style="width:32px;height:32px;border-radius:50%;background:${c};border:none;cursor:pointer;transition:transform 0.15s;"></button>
              `).join('')}
            </div>
          </div>
          <div style="display:flex;gap:10px;">
            <button id="cancel-group-btn" style="flex:1;height:52px;background:#2a2a2a;border:none;border-radius:9999px;color:#a78a88;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;">Cancel</button>
            <button id="save-group-btn" style="flex:2;height:52px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;">Create Group</button>
          </div>
        </div>
      </div>

    </div>
  `

    ; (window as any).__selectedColor = GROUP_COLORS[0]
  document.querySelector<HTMLButtonElement>('[data-color]')?.style && (document.querySelector<HTMLButtonElement>('[data-color]')!.style.transform = 'scale(1.3)')

  bindGroupCardClick(container)

  document.getElementById('add-group-btn')?.addEventListener('click', () => {
    const modal = document.getElementById('add-group-modal')
    if (modal) modal.style.display = 'flex'
  })

  document.getElementById('cancel-group-btn')?.addEventListener('click', () => {
    const modal = document.getElementById('add-group-modal')
    if (modal) modal.style.display = 'none'
  })

  document.getElementById('save-group-btn')?.addEventListener('click', async () => {
    const name = (document.getElementById('group-name') as HTMLInputElement)?.value.trim()
    if (!name) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const btn = document.getElementById('save-group-btn') as HTMLButtonElement
    if (!btn) return
    btn.disabled = true
    btn.textContent = 'Creating...'
    try {
      const { error } = await supabase.from('groups').insert({
        user_id: session.user.id,
        name,
        color: (window as any).__selectedColor
      })

      if (!error) {
        showToast('Group created!', 'success')
        document.getElementById('add-group-modal')?.style && (document.getElementById('add-group-modal')!.style.display = 'none')
        await refreshAll(session.user.id)
        renderGroups(container, getNavGeneration())
      } else {
        showToast(error.message, 'error')
      }
    } finally {
      btn.disabled = false
      btn.textContent = 'Create Group'
    }
  })
}

function groupCard(group: any) {
  const count = group.birthdays?.[0]?.count || 0
  const color = group.color || '#ffb3b0'
  const avatarInner = group.avatar_url
    ? `<img src="${group.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
    : `<span class="material-symbols-outlined" style="color:${color};font-variation-settings:'FILL' 1;">group</span>`
  return `
    <div data-group-id="${group.id}" style="background:#1a1a1a;border-radius:1.5rem;padding:1.5rem;display:flex;align-items:center;justify-content:space-between;border-left:4px solid ${color};cursor:pointer;transition:background 0.2s;"
      onmouseover="this.style.background='#222'" onmouseout="this.style.background='#1a1a1a'">
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="width:48px;height:48px;border-radius:50%;background:${color}22;display:flex;align-items:center;justify-content:center;overflow:hidden;">
          ${avatarInner}
        </div>
        <div>
          <h3 style="font-weight:700;font-size:16px;margin:0 0 2px;color:#e5e2e1;">${group.name}</h3>
          <p style="font-size:13px;color:#a78a88;margin:0;">${count} ${count === 1 ? 'birthday' : 'birthdays'}</p>
        </div>
      </div>
      <span class="material-symbols-outlined" style="color:#555;pointer-events:none;">chevron_right</span>
    </div>
  `
}

function bindGroupCardClick(container: HTMLElement) {
  container.addEventListener('click', async (e) => {
    const card = (e.target as HTMLElement).closest('[data-group-id]') as HTMLElement
    if (!card) return
    const id = card.dataset.groupId!
    const group = getStore().groups.find(g => g.id === id)
    if (group) renderGroupDetail(container, group)
  })
}

function renderGroupDetail(container: HTMLElement, group: any) {
  const color = group.color || '#ffb3b0'
  const count = group.birthdays?.[0]?.count || 0
  const avatarInner = group.avatar_url
    ? `<img src="${group.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
    : `<span class="material-symbols-outlined" style="color:${color};font-size:28px;font-variation-settings:'FILL' 1;">group</span>`

  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

    <header style="position:sticky;top:0;z-index:40;background:rgba(13,13,13,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;gap:12px;padding:1rem 1.5rem;">
      <button id="gd-back" style="background:none;border:none;color:#a78a88;cursor:pointer;padding:4px;display:flex;align-items:center;">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.25rem;color:#e5e2e1;margin:0;flex:1;">Group</h1>
    </header>

    <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem;">

      <!-- Hero -->
      <div style="position:relative;overflow:hidden;border-radius:1.5rem;background:#1a1a1a;padding:2rem;border-left:4px solid ${color};">
        <div style="position:absolute;top:0;right:0;padding:1rem;opacity:0.07;">
          <span class="material-symbols-outlined" style="font-size:110px;font-variation-settings:'FILL' 1;color:${color};">group</span>
        </div>
        <div style="position:relative;z-index:1;">
          <div style="position:relative;width:64px;height:64px;margin-bottom:1rem;">
            <div id="group-avatar-circle" style="width:64px;height:64px;border-radius:50%;background:${color}22;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;">
              ${avatarInner}
            </div>
            <button id="group-avatar-btn" style="position:absolute;bottom:0;right:0;width:22px;height:22px;border-radius:50%;background:#1a1a1a;border:2px solid #0f0f0f;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;">
              <span class="material-symbols-outlined" style="font-size:11px;color:#ffb3b0;">photo_camera</span>
            </button>
          </div>
          <h2 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:2rem;font-weight:800;color:#e5e2e1;margin:0 0 4px;">${group.name}</h2>
          <p style="color:#a78a88;font-size:13px;margin:0;">${count} ${count === 1 ? 'birthday' : 'birthdays'}</p>
        </div>
      </div>

      <!-- Edit form -->
      <div style="background:#1a1a1a;border-radius:1.5rem;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;">
        <p style="color:#555;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0;">Edit Group</p>
        <input id="gd-name" type="text" value="${group.name}"
          style="width:100%;height:52px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 1.5rem;font-size:15px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;"
          onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
        <div>
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin:0 0 10px;">Color</p>
          <div style="display:flex;gap:10px;">
            ${GROUP_COLORS.map(c => `
              <button data-edit-color="${c}" style="width:32px;height:32px;border-radius:50%;background:${c};border:${c === color ? '3px solid #fff' : '3px solid transparent'};cursor:pointer;transition:all 0.15s;box-shadow:${c === color ? '0 0 0 1px ' + c : 'none'};"></button>
            `).join('')}
          </div>
        </div>
        <button id="gd-save" style="width:100%;height:52px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;cursor:pointer;transition:transform 0.15s;"
          onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
          Save Changes
        </button>
      </div>

      <!-- Delete -->
      <button id="gd-delete" style="width:100%;height:52px;background:none;border:1px solid rgba(255,107,107,0.2);border-radius:1rem;color:#ff6b6b;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.2s;"
        onmouseover="this.style.background='rgba(255,107,107,0.08)'" onmouseout="this.style.background='none'">
        <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
        Delete Group
      </button>

    </div>
  `

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const photoInput = document.createElement('input')
  photoInput.type = 'file'
  photoInput.accept = 'image/*'
  photoInput.style.display = 'none'
  container.appendChild(photoInput)

  const triggerUpload = () => photoInput.click()
  document.getElementById('group-avatar-circle')?.addEventListener('click', triggerUpload)
  document.getElementById('group-avatar-btn')?.addEventListener('click', (e) => { e.stopPropagation(); triggerUpload() })

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files?.[0]
    if (!file) return
    const { data: { session } } = await supabase.auth.getSession()
    const path = `${session?.user.id}/groups/${group.id}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
    if (uploadError) { showToast('Upload failed', 'error'); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`
    await supabase.from('groups').update({ avatar_url: publicUrl }).eq('id', group.id)
    if (session) await refreshAll(session.user.id)
    const updated = getStore().groups.find(g => g.id === group.id)
    if (updated) renderGroupDetail(container, updated)
  })

  // ── Color picker ───────────────────────────────────────────────────────────
  let selectedColor = color
  container.querySelectorAll('[data-edit-color]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColor = (btn as HTMLElement).dataset.editColor!
      container.querySelectorAll('[data-edit-color]').forEach(b => {
        const el = b as HTMLElement
        const c = el.dataset.editColor!
        el.style.border = c === selectedColor ? '3px solid #fff' : '3px solid transparent'
        el.style.boxShadow = c === selectedColor ? `0 0 0 1px ${c}` : 'none'
      })
    })
  })

  document.getElementById('gd-back')?.addEventListener('click', () => renderGroups(container, getNavGeneration()))

  document.getElementById('gd-save')?.addEventListener('click', async () => {
    const name = (document.getElementById('gd-name') as HTMLInputElement)?.value.trim()
    if (!name) return
    const btn = document.getElementById('gd-save') as HTMLButtonElement
    if (!btn) return
    btn.disabled = true
    btn.textContent = 'Saving...'
    try {
      const { error } = await supabase.from('groups').update({ name, color: selectedColor }).eq('id', group.id)
      if (!error) {
        showToast('Group updated!', 'success')
        const { data: { session } } = await supabase.auth.getSession()
        if (session) await refreshAll(session.user.id)
        renderGroups(container, getNavGeneration())
      } else {
        showToast(error.message, 'error')
      }
    } finally {
      btn.disabled = false
      btn.textContent = 'Save Changes'
    }
  })

  document.getElementById('gd-delete')?.addEventListener('click', async () => {
    if (!confirm(`Delete "${group.name}"? Birthdays in this group will be unassigned.`)) return
    const btn = document.getElementById('gd-delete') as HTMLButtonElement
    if (!btn) return
    btn.disabled = true
    btn.textContent = 'Deleting...'
    try {
      const { error: e1 } = await supabase.from('birthdays').update({ group_id: null }).eq('group_id', group.id)
      const { error: e2 } = await supabase.from('groups').delete().eq('id', group.id)
      if (!e1 && !e2) {
        showToast('Group deleted', 'success')
        const { data: { session } } = await supabase.auth.getSession()
        if (session) await refreshAll(session.user.id)
        renderGroups(container, getNavGeneration())
      } else {
        showToast('Failed to delete group', 'error')
      }
    } finally {
      btn.disabled = false
      btn.textContent = 'Delete Group'
    }
  })
}