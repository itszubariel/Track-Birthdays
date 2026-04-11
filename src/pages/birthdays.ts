import { supabase } from '../supabase'
import { renderGift } from './gift'
import { showToast as showBdayToast } from '../toast'


let activeGroupFilter: string = 'all' // 'all' or group id

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function parseStoredDate(dateStr: string): { month: number; day: number; year: number | null } {
  const parts = dateStr.split('-')
  const year = parseInt(parts[0])
  return {
    year: year === 1 ? null : year,
    month: parseInt(parts[1]) - 1, // 0-indexed
    day: parseInt(parts[2])
  }
}

function daysUntilBirthday(dateStr: string): number {
  const { month, day } = parseStoredDate(dateStr)
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const next = new Date(today.getFullYear(), month, day)
  if (next < todayMidnight) next.setFullYear(today.getFullYear() + 1)
  return Math.round((next.getTime() - todayMidnight.getTime()) / 86400000)
}

function getNextBirthdayDate(dateStr: string): string {
  const { month, day } = parseStoredDate(dateStr)
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const next = new Date(today.getFullYear(), month, day)
  if (next < todayMidnight) next.setFullYear(today.getFullYear() + 1)
  return next.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function getZodiac(dateStr: string): string {
  const { month, day } = parseStoredDate(dateStr)
  const m = month + 1
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 'Aries'
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 'Taurus'
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return 'Gemini'
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return 'Cancer'
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 'Leo'
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 'Virgo'
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return 'Libra'
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return 'Scorpio'
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return 'Sagittarius'
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return 'Capricorn'
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return 'Aquarius'
  return 'Pisces'
}


function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
function getAge(dateStr: string): number {
  const { month, day, year } = parseStoredDate(dateStr)
  if (!year) return 0
  const today = new Date()
  let age = today.getFullYear() - year
  if (today < new Date(today.getFullYear(), month, day)) age--
  return age + 1 // turning age
}

// Returns the month index (0-11) that the next birthday falls in
function nextBirthdayMonth(dateStr: string): number {
  const { month, day } = parseStoredDate(dateStr)
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const next = new Date(today.getFullYear(), month, day)
  if (next < todayMidnight) next.setFullYear(today.getFullYear() + 1)
  return next.getMonth()
}

function birthdayCard(birthday: any, days: number, archived = false): string {
  const groupColor = archived ? '#333' : (birthday.groups?.color || '#ffb3b0')
  const daysLabel = days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`
  const daysColor = archived ? '#444' : (days <= 7 ? '#ffb3b0' : '#555')
  const avatarInner = birthday.avatar_url
    ? `<img src="${birthday.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
    : getInitials(birthday.name)
  const { year } = parseStoredDate(birthday.date)
  const ageStr = year ? `Turns ${getAge(birthday.date)}` : ''
  return `
    <div data-birthday-id="${birthday.id}" style="background:${archived ? '#111' : '#1a1a1a'};border-radius:1rem;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;border-left:4px solid ${groupColor};box-shadow:0 2px 12px rgba(0,0,0,0.2);margin-bottom:10px;cursor:pointer;opacity:${archived ? '0.5' : '1'};"
      ${archived ? '' : 'onmouseover="this.style.background=\'#222\'" onmouseout="this.style.background=\'#1a1a1a\'"'}>
      <div style="display:flex;align-items:center;gap:14px;min-width:0;">
        <div style="width:44px;height:44px;flex-shrink:0;border-radius:50%;background:${groupColor}22;display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:13px;color:${groupColor};overflow:hidden;">
          ${avatarInner}
        </div>
        <div style="min-width:0;">
          <h3 style="font-weight:700;color:${archived ? '#555' : '#e5e2e1'};font-size:15px;margin:0 0 1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${birthday.name}</h3>
          ${ageStr ? `<p style="color:${archived ? '#444' : '#ffb3b0'};font-size:12px;font-weight:600;margin:0 0 1px;">${ageStr}</p>` : ''}
          <p style="color:${archived ? '#444' : '#a78a88'};font-size:12px;margin:0 0 1px;">${getNextBirthdayDate(birthday.date)}</p>
          <p style="color:#444;font-size:11px;margin:0;">${getZodiac(birthday.date)}</p>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:10px;">
        <span style="font-size:12px;font-weight:700;color:${daysColor};white-space:nowrap;">${daysLabel}</span>
      </div>
    </div>
  `
}

function spotlightCard(birthday: any, days: number): string {
  const groupColor = birthday.groups?.color || '#ffb3b0'
  return `
    <section style="margin-bottom:1.5rem;">
      <div style="position:relative;overflow:hidden;border-radius:1.5rem;background:#2a2a2a;padding:1.5rem 2rem;border-left:4px solid ${groupColor};box-shadow:0 8px 32px rgba(0,0,0,0.3);">
        <div style="position:absolute;top:0;right:0;padding:1rem;opacity:0.08;">
          <span class="material-symbols-outlined" style="font-size:90px;font-variation-settings:'FILL' 1;color:${groupColor};">cake</span>
        </div>
        <div style="position:relative;z-index:1;">
          <span style="display:inline-block;padding:3px 10px;background:${groupColor}22;color:${groupColor};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;border-radius:9999px;margin-bottom:0.75rem;">
            ${days === 0 ? "Today's Spotlight" : "Coming Up"}
          </span>
          <h2 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:1.75rem;font-weight:800;color:#e5e2e1;margin:0 0 3px;">${birthday.name}</h2>
          ${parseStoredDate(birthday.date).year ? `<p style="color:#ffb3b0;font-size:13px;font-weight:700;margin:0 0 2px;">Turns ${getAge(birthday.date)}</p>` : ''}
          <p style="color:#a78a88;font-size:13px;font-weight:500;margin:0 0 2px;">${getNextBirthdayDate(birthday.date)}</p>
          <p style="color:#666;font-size:12px;margin:0;">${getZodiac(birthday.date)}</p>
        </div>
      </div>
    </section>
  `
}

function groupFilterBtn(id: string, name: string, color: string): string {
  const active = activeGroupFilter === id
  return `
    <button data-gfilter="${id}" style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;padding:5px 12px 5px 8px;background:${active ? color + '20' : '#1a1a1a'};border:1px solid ${active ? color : '#2a2a2a'};border-radius:9999px;cursor:pointer;transition:all 0.2s;flex-shrink:0;">
      <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;pointer-events:none;"></span>
      <span style="font-size:12px;font-weight:600;color:${active ? color : '#666'};font-family:'Inter',sans-serif;pointer-events:none;">${name}</span>
    </button>
  `
}

export async function renderBirthdays(container: HTMLElement) {
  const { data: groups } = await supabase.from('groups').select('*')

  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

    <header style="position:sticky;top:0;z-index:40;background:rgba(13,13,13,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="material-symbols-outlined" style="color:#ffb3b0;font-variation-settings:'FILL' 1;">calendar_today</span>
        <h1 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.5rem;color:#ffb3b0;margin:0;">Birthdays</h1>
      </div>
      <div style="display:flex;align-items:center;gap:2px;">
        <button id="gift-btn" style="background:none;border:none;color:#666;cursor:pointer;padding:8px;border-radius:50%;transition:color 0.2s;" onmouseover="this.style.color='#ffb3b0'" onmouseout="this.style.color='#666'">
          <span class="material-symbols-outlined">redeem</span>
        </button>
        <button id="search-btn" style="background:none;border:none;color:#666;cursor:pointer;padding:8px;border-radius:50%;transition:color 0.2s;" onmouseover="this.style.color='#ffb3b0'" onmouseout="this.style.color='#666'">
          <span class="material-symbols-outlined">search</span>
        </button>
      </div>
    </header>

    <div style="padding:0 1.5rem 1.5rem;">
      <div id="search-bar" style="display:none;margin-bottom:1rem;">
        <input id="search-input" type="text" placeholder="Search birthdays..."
          style="width:100%;height:48px;background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:0 1rem;color:#e5e2e1;font-size:1rem;font-family:'Inter',sans-serif;outline:none;box-sizing:border-box;"
          onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
      </div>

      <!-- Group filter pills -->
      <div id="group-filter-bar" style="display:flex;align-items:center;gap:8px;padding:10px 0;margin-bottom:4px;overflow-x:auto;scrollbar-width:none;cursor:grab;user-select:none;">
        <button data-gfilter="all" style="white-space:nowrap;padding:5px 14px;background:${activeGroupFilter === 'all' ? 'rgba(255,179,176,0.15)' : '#1a1a1a'};border:1px solid ${activeGroupFilter === 'all' ? '#ffb3b0' : '#2a2a2a'};border-radius:9999px;cursor:pointer;transition:all 0.2s;flex-shrink:0;">
          <span style="font-size:12px;font-weight:600;color:${activeGroupFilter === 'all' ? '#ffb3b0' : '#666'};font-family:'Inter',sans-serif;pointer-events:none;">All</span>
        </button>
        ${(groups || []).map(g => groupFilterBtn(g.id, g.name, g.color || '#ffb3b0')).join('')}
      </div>

      <div id="birthdays-list">
        <div style="text-align:center;padding:3rem 0;color:#555;">
          <span class="material-symbols-outlined" style="font-size:48px;font-variation-settings:'FILL' 1;color:#333;">cake</span>
          <p style="margin:1rem 0 0;font-size:14px;">Loading birthdays...</p>
        </div>
      </div>
    </div>
  `

  bindGroupFilterEvents(container, groups || [])
  bindSearchEvent(container)
  bindCardClick(container)
  document.getElementById('gift-btn')?.addEventListener('click', () => renderGift(container))

  const filterBar = document.getElementById('group-filter-bar')!
  let isDown = false, startX = 0, scrollLeft = 0
  filterBar.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - filterBar.offsetLeft; scrollLeft = filterBar.scrollLeft; filterBar.style.cursor = 'grabbing' })
  filterBar.addEventListener('mouseleave', () => { isDown = false; filterBar.style.cursor = 'grab' })
  filterBar.addEventListener('mouseup', () => { isDown = false; filterBar.style.cursor = 'grab' })
  filterBar.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - filterBar.offsetLeft; filterBar.scrollLeft = scrollLeft - (x - startX) })

  await loadBirthdays(container)
}

function bindSearchEvent(_container: HTMLElement) {
  document.getElementById('search-btn')?.addEventListener('click', () => {
    const bar = document.getElementById('search-bar')!
    const isVisible = bar.style.display !== 'none'
    bar.style.display = isVisible ? 'none' : 'block'
    if (!isVisible) document.getElementById('search-input')?.focus()
  })

  document.getElementById('search-input')?.addEventListener('input', async (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase()
    const list = document.getElementById('birthdays-list')!
    const { data } = await supabase
      .from('birthdays')
      .select('*, groups(name, color)')
      .ilike('name', `%${query}%`)
      .order('date')
    renderList(list, (data || []).filter(b => !b.archived).map(b => ({ ...b, days: daysUntilBirthday(b.date) })))
  })
}

function bindGroupFilterEvents(container: HTMLElement, groups: any[]) {
  container.addEventListener('click', async (e) => {
    const btn = (e.target as HTMLElement).closest('[data-gfilter]') as HTMLElement
    if (!btn) return
    activeGroupFilter = btn.dataset.gfilter!

    // Update pill styles
    container.querySelectorAll('[data-gfilter]').forEach(b => {
      const el = b as HTMLElement
      const isActive = el.dataset.gfilter === activeGroupFilter
      if (el.dataset.gfilter === 'all') {
        el.style.background = isActive ? 'rgba(255,179,176,0.15)' : '#1a1a1a'
        el.style.borderColor = isActive ? '#ffb3b0' : '#2a2a2a'
        const span = el.querySelector('span') as HTMLElement
        if (span) span.style.color = isActive ? '#ffb3b0' : '#666'
      } else {
        const g = groups.find(g => g.id === el.dataset.gfilter)
        const color = g?.color || '#ffb3b0'
        el.style.background = isActive ? color + '20' : '#1a1a1a'
        el.style.borderColor = isActive ? color : '#2a2a2a'
        const nameSpan = el.querySelectorAll('span')[1] as HTMLElement
        if (nameSpan) nameSpan.style.color = isActive ? color : '#666'
      }
    })

    await loadBirthdays(container)
  })
}

function bindCardClick(container: HTMLElement) {
  container.addEventListener('click', async (e) => {
    const card = (e.target as HTMLElement).closest('[data-birthday-id]') as HTMLElement
    if (!card) return
    const id = card.dataset.birthdayId!
    const [{ data: birthday }, { data: groups }] = await Promise.all([
      supabase.from('birthdays').select('*, groups(name, color)').eq('id', id).single(),
      supabase.from('groups').select('*')
    ])
    if (birthday) renderDetailView(container, birthday, groups || [])
  })
}

function renderDetailView(container: HTMLElement, birthday: any, groups: any[] = []) {
  const groupColor = birthday.groups?.color || '#ffb3b0'
  const days = daysUntilBirthday(birthday.date)
  const daysLabel = days === 0 ? 'Today!' : days === 1 ? '1 day' : `${days} days`

  // Format stored date back to DD/MM/YYYY or DD/MM for display in edit fields
  const { day, month, year } = parseStoredDate(birthday.date)

  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

    <header style="position:sticky;top:0;z-index:40;background:rgba(13,13,13,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;gap:12px;padding:1rem 1.5rem;">
      <button id="back-btn" style="background:none;border:none;color:#a78a88;cursor:pointer;padding:4px;display:flex;align-items:center;">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.25rem;color:#e5e2e1;margin:0;flex:1;">Birthday</h1>
      <button id="edit-toggle-btn" style="background:none;border:none;color:#a78a88;cursor:pointer;padding:4px;display:flex;align-items:center;gap:4px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;">
        <span class="material-symbols-outlined" style="font-size:18px;">edit</span>
        Edit
      </button>
    </header>

    <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem;">

      <!-- Hero -->
      <div style="position:relative;overflow:hidden;border-radius:1.5rem;background:#1a1a1a;padding:2rem;border-left:4px solid ${groupColor};">
        <div style="position:absolute;top:0;right:0;padding:1rem;opacity:0.07;">
          <span class="material-symbols-outlined" style="font-size:110px;font-variation-settings:'FILL' 1;color:${groupColor};">cake</span>
        </div>
        <div style="position:relative;z-index:1;">
          <div style="position:relative;width:64px;height:64px;margin-bottom:1rem;">
            <div style="width:64px;height:64px;border-radius:50%;background:${groupColor}22;display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:20px;color:${groupColor};overflow:hidden;">
              ${birthday.avatar_url
      ? `<img src="${birthday.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
      : birthday.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <button id="bday-avatar-btn" style="position:absolute;bottom:0;right:0;width:22px;height:22px;border-radius:50%;background:#1a1a1a;border:2px solid #0f0f0f;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;">
              <span class="material-symbols-outlined" style="font-size:11px;color:#ffb3b0;">photo_camera</span>
            </button>
          </div>          <h2 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:2rem;font-weight:800;color:#e5e2e1;margin:0 0 4px;">${birthday.name}</h2>
          <p style="color:#a78a88;font-size:13px;margin:0;">${getZodiac(birthday.date)}</p>
        </div>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div style="background:#1a1a1a;border-radius:1.25rem;padding:1.25rem;">
          <p style="color:#555;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Next Birthday</p>
          <p style="color:#e5e2e1;font-size:13px;font-weight:600;margin:0;line-height:1.4;">${getNextBirthdayDate(birthday.date)}</p>
        </div>
        <div style="background:#1a1a1a;border-radius:1.25rem;padding:1.25rem;">
          <p style="color:#555;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Birthday In</p>
          <p style="font-size:1.5rem;font-weight:800;color:${days <= 7 ? groupColor : '#e5e2e1'};margin:0;">${daysLabel}</p>
        </div>
      </div>

      ${birthday.notes ? `
        <div style="background:#1a1a1a;border-radius:1.25rem;padding:1.25rem;">
          <p style="color:#555;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">Notes</p>
          <p style="color:#a78a88;font-size:14px;margin:0;line-height:1.6;">${birthday.notes}</p>
        </div>
      ` : ''}

      <!-- Edit form (hidden by default) -->
      <div id="edit-form" style="display:none;background:#1a1a1a;border-radius:1.5rem;padding:1.5rem;flex-direction:column;gap:1rem;">
        <p style="color:#555;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0;">Edit Details</p>

        <div>
          <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:6px;">Name</label>
          <input id="edit-name" type="text" value="${birthday.name}"
            style="width:100%;height:52px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 1.5rem;font-size:15px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;"
            onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
        </div>

        <div>
          <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:6px;">Birth Date <span style="color:#444;font-weight:400;text-transform:none;">(year optional)</span></label>
          <div style="display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:8px;">
            <div>
              <input id="edit-day" type="text" inputmode="numeric" placeholder="Day" maxlength="2" value="${day}"
                style="width:100%;height:48px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 1rem;font-size:15px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;text-align:center;"
                onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
              <p style="font-size:10px;color:#444;text-align:center;margin:3px 0 0;">Day</p>
            </div>
            <div>
              <input id="edit-month" type="text" inputmode="numeric" placeholder="Month" maxlength="2" value="${month + 1}"
                style="width:100%;height:48px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 1rem;font-size:15px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;text-align:center;"
                onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
              <p style="font-size:10px;color:#444;text-align:center;margin:3px 0 0;">Month</p>
            </div>
            <div>
              <input id="edit-year" type="text" inputmode="numeric" placeholder="Year" maxlength="4" value="${year ?? ''}"
                style="width:100%;height:48px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 1rem;font-size:15px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;text-align:center;"
                onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
              <p style="font-size:10px;color:#444;text-align:center;margin:3px 0 0;">Year (opt.)</p>
            </div>
          </div>
        </div>

        <div>
          <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:6px;">Notes</label>
          <textarea id="edit-notes" placeholder="Any special notes..."
            style="width:100%;height:80px;background:#2a2a2a;border:1px solid #333;border-radius:1.25rem;padding:0.75rem 1.25rem;font-size:15px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;resize:none;"
            onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'">${birthday.notes || ''}</textarea>
        </div>

        <div>
          <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:6px;">Group</label>
          <div style="position:relative;">
            <select id="edit-group"
              style="width:100%;height:48px;background:#2a2a2a;border:1px solid #333;border-radius:9999px;padding:0 2.5rem 0 1.5rem;font-size:15px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;appearance:none;cursor:pointer;"
              onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'">
              <option value="">No group</option>
              ${groups.map(g => `<option value="${g.id}" ${birthday.group_id === g.id ? 'selected' : ''}>${g.name}</option>`).join('')}
            </select>
            <span class="material-symbols-outlined" style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);font-size:16px;color:#555;pointer-events:none;">expand_more</span>
          </div>
        </div>

        <button id="edit-save-btn" style="width:100%;height:52px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;cursor:pointer;transition:transform 0.15s;"
          onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
          Save Changes
        </button>
      </div>

      <!-- Archive / Delete -->
      <div style="display:flex;gap:10px;">
        <button id="archive-btn" style="flex:1;height:52px;background:none;border:1px solid #333;border-radius:1rem;color:${birthday.archived ? '#52dea2' : '#a78a88'};font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background 0.2s;"
          onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='none'">
          <span class="material-symbols-outlined" style="font-size:18px;">${birthday.archived ? 'unarchive' : 'archive'}</span>
          ${birthday.archived ? 'Unarchive' : 'Archive'}
        </button>
        <button id="delete-btn" style="flex:1;height:52px;background:none;border:1px solid rgba(255,107,107,0.2);border-radius:1rem;color:#ff6b6b;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background 0.2s;"
          onmouseover="this.style.background='rgba(255,107,107,0.08)'" onmouseout="this.style.background='none'">
          <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
          Delete
        </button>
      </div>

    </div>

    <!-- Archive confirmation modal -->
    <div id="archive-modal" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.75);z-index:200;align-items:center;justify-content:center;padding:1.5rem;">
      <div style="background:#1a1a1a;border-radius:1.5rem;border:1px solid #333;padding:2rem;width:100%;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:0.75rem;">
          <span class="material-symbols-outlined" style="color:#a78a88;font-size:22px;font-variation-settings:'FILL' 1;">${birthday.archived ? 'unarchive' : 'archive'}</span>
          <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1rem;color:#e5e2e1;margin:0;">${birthday.archived ? 'Unarchive' : 'Archive'} birthday?</h3>
        </div>
        <p style="font-size:13px;color:#a78a88;margin:0 0 1.5rem;line-height:1.5;">${birthday.archived ? 'This will move it back to your main list.' : 'This will move it to the archived section at the bottom.'}</p>
        <div style="display:flex;gap:10px;">
          <button id="archive-cancel" style="flex:1;height:46px;background:#2a2a2a;border:none;border-radius:9999px;color:#a78a88;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;cursor:pointer;">Cancel</button>
          <button id="archive-confirm" style="flex:2;height:46px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;cursor:pointer;">${birthday.archived ? 'Unarchive' : 'Archive'}</button>
        </div>
      </div>
    </div>
  `

  document.getElementById('back-btn')?.addEventListener('click', () => renderBirthdays(container))

  // Toggle edit form
  let editOpen = false
  document.getElementById('edit-toggle-btn')!.addEventListener('click', () => {
    editOpen = !editOpen
    const form = document.getElementById('edit-form')!
    form.style.display = editOpen ? 'flex' : 'none'
    const btn = document.getElementById('edit-toggle-btn')!
    btn.style.color = editOpen ? '#ffb3b0' : '#a78a88'
  })

  document.getElementById('edit-save-btn')!.addEventListener('click', async () => {
    const name = (document.getElementById('edit-name') as HTMLInputElement).value.trim()
    const d = parseInt((document.getElementById('edit-day') as HTMLInputElement).value)
    const m = parseInt((document.getElementById('edit-month') as HTMLInputElement).value)
    const yRaw = (document.getElementById('edit-year') as HTMLInputElement).value.trim()
    const notes = (document.getElementById('edit-notes') as HTMLTextAreaElement).value.trim()
    const groupId = (document.getElementById('edit-group') as HTMLSelectElement).value

    if (!name || isNaN(d) || isNaN(m) || d < 1 || d > 31 || m < 1 || m > 12) return

    let storedDate: string
    if (yRaw) {
      const y = parseInt(yRaw)
      if (isNaN(y) || yRaw.length !== 4) return
      storedDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    } else {
      storedDate = `0001-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }

    const btn = document.getElementById('edit-save-btn') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Saving...'
    try {
      const { error } = await supabase.from('birthdays').update({
        name, date: storedDate, notes: notes || null, group_id: groupId || null
      }).eq('id', birthday.id)

      if (!error) {
        showBdayToast('Birthday updated!', 'success')
        const [{ data: updated }, { data: grps }] = await Promise.all([
          supabase.from('birthdays').select('*, groups(name, color)').eq('id', birthday.id).single(),
          supabase.from('groups').select('*')
        ])
        if (updated) renderDetailView(container, updated, grps || [])
      } else {
        showBdayToast(error.message, 'error')
      }
    } finally {
      btn.disabled = false
      btn.textContent = 'Save Changes'
    }
  })

  document.getElementById('archive-btn')!.addEventListener('click', () => {
    const modal = document.getElementById('archive-modal')!
    modal.style.display = 'flex'
  })

  document.getElementById('archive-cancel')!.addEventListener('click', () => {
    const modal = document.getElementById('archive-modal')!
    modal.style.display = 'none'
  })

  document.getElementById('archive-confirm')!.addEventListener('click', async () => {
    const modal = document.getElementById('archive-modal')!
    modal.style.display = 'none'

    const btn = document.getElementById('archive-btn') as HTMLButtonElement
    const originalText = birthday.archived ? 'Unarchive' : 'Archive'
    btn.disabled = true
    btn.textContent = 'Saving...'
    try {
      const { error } = await supabase.from('birthdays').update({ archived: !birthday.archived }).eq('id', birthday.id)
      if (!error) {
        showBdayToast(birthday.archived ? 'Birthday unarchived!' : 'Birthday archived!', 'success')
        renderBirthdays(container)
      } else {
        showBdayToast('Failed to archive birthday', 'error')
      }
    } finally {
      btn.disabled = false
      btn.textContent = originalText
    }
  })

  document.getElementById('delete-btn')!.addEventListener('click', async () => {
    if (!confirm(`Delete ${birthday.name}'s birthday?`)) return
    const btn = document.getElementById('delete-btn') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Deleting...'
    try {
      const { error } = await supabase.from('birthdays').delete().eq('id', birthday.id)
      if (!error) {
        showBdayToast('Birthday deleted', 'success')
        renderBirthdays(container)
      } else {
        showBdayToast('Failed to delete birthday', 'error')
      }
    } finally {
      btn.disabled = false
      btn.textContent = 'Delete'
    }
  })

  // ── Birthday avatar upload ─────────────────────────────────────────────────
  const bdayPhotoInput = document.createElement('input')
  bdayPhotoInput.type = 'file'
  bdayPhotoInput.id = 'bday-photo-upload'
  bdayPhotoInput.accept = 'image/*'
  bdayPhotoInput.style.display = 'none'
  container.appendChild(bdayPhotoInput)
  document.getElementById('bday-avatar-btn')!.addEventListener('click', () => bdayPhotoInput.click())
  bdayPhotoInput.addEventListener('change', async () => {
    const file = bdayPhotoInput.files?.[0]
    if (!file) return
    const { data: { session } } = await supabase.auth.getSession()
    const path = `${session?.user.id}/birthdays/${birthday.id}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (uploadError) { showBdayToast('Upload failed', 'error'); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`
    const { error: updateError } = await supabase.from('birthdays').update({ avatar_url: publicUrl }).eq('id', birthday.id)
    if (updateError) { showBdayToast('Failed to save photo', 'error'); return }
    showBdayToast('Photo updated!', 'success')
    const { data: updated } = await supabase.from('birthdays').select('*, groups(name, color)').eq('id', birthday.id).single()
    if (updated) renderDetailView(container, updated, groups)
  })
}

async function loadBirthdays(_container: HTMLElement) {
  const list = document.getElementById('birthdays-list')
  if (!list) return
  const { data, error } = await supabase
    .from('birthdays')
    .select('*, groups(name, color)')
    .order('date')

  if (error || !data) {
    list.innerHTML = `<p style="color:#ff4444;text-align:center;padding:2rem;">Failed to load birthdays</p>`
    return
  }

  let allData = data
  if (activeGroupFilter !== 'all') {
    allData = data.filter(b => b.group_id === activeGroupFilter)
  }

  const active = allData.filter(b => !b.archived).map(b => ({ ...b, days: daysUntilBirthday(b.date) }))
  const archived = allData.filter(b => b.archived).map(b => ({ ...b, days: daysUntilBirthday(b.date) }))

  active.sort((a, b) => a.days - b.days)

  renderList(list, active, archived)
}

function renderList(list: HTMLElement, birthdays: any[], archived: any[] = []) {
  if (birthdays.length === 0 && archived.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:4rem 0;color:#555;">
        <span class="material-symbols-outlined" style="font-size:64px;font-variation-settings:'FILL' 1;color:#2a2a2a;">cake</span>
        <p style="margin:1rem 0 0;font-size:16px;font-weight:500;color:#444;">No birthdays yet</p>
        <p style="margin:8px 0 0;font-size:13px;color:#333;">Tap Add to get started</p>
      </div>
    `
    return
  }

  const spotlight = birthdays.find(b => b.days <= 7)

  const byMonth: Record<number, any[]> = {}
  for (const b of birthdays) {
    const m = nextBirthdayMonth(b.date)
    if (!byMonth[m]) byMonth[m] = []
    byMonth[m].push(b)
  }
  const monthOrder = [...new Set(birthdays.map(b => nextBirthdayMonth(b.date)))]

  list.innerHTML = `
    ${spotlight ? spotlightCard(spotlight, spotlight.days) : ''}
    ${monthOrder.map(m => `
      <div style="margin-bottom:1.5rem;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#444;margin:0 0 10px;padding-left:2px;">${MONTH_NAMES[m]}</p>
        ${byMonth[m].map(b => birthdayCard(b, b.days)).join('')}
      </div>
    `).join('')}
    ${archived.length > 0 ? `
      <div style="margin-top:1rem;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#333;margin:0 0 10px;padding-left:2px;">Archived</p>
        ${archived.map(b => birthdayCard(b, b.days, true)).join('')}
      </div>
    ` : ''}
  `
}

