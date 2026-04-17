import { supabase } from '../supabase'
import { getNavGeneration } from '../app'
import { showToast } from '../toast'
import { getStore, refreshAll } from '../store'
import { animatePageEnter, bindButtonFeedback } from '../animations'

export async function renderAdd(container: HTMLElement, gen = 0) {
  const groups = getStore().groups

  if (!container.isConnected || gen !== getNavGeneration()) return

  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

    <div style="background:#0f0f0f;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;min-height:100%;">

      <header style="position:sticky;top:0;z-index:40;background:rgba(13,13,13,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="material-symbols-outlined" style="color:#ffb3b0;font-variation-settings:'FILL' 1;">cake</span>
          <h1 style="font-weight:800;font-size:1.5rem;color:#ffb3b0;margin:0;">Add Birthday</h1>
        </div>
      </header>

      <div style="padding:1.5rem;">
        <div style="background:#2a2a2a;border-radius:1.5rem;padding:2rem;margin-bottom:1.5rem;position:relative;overflow:hidden;border-left:4px solid #ffb3b0;">
          <div style="position:absolute;right:-1rem;bottom:-1rem;opacity:0.06;">
            <span class="material-symbols-outlined" style="font-size:100px;font-variation-settings:'FILL' 1;color:#ffb3b0;">cake</span>
          </div>
          <h2 style="font-size:1.75rem;font-weight:800;color:#e5e2e1;margin:0 0 8px;">Create a New<br/>Celebration</h2>
          <p style="color:#a78a88;font-size:14px;margin:0;">Never miss a special moment for your loved ones.</p>
        </div>

        <div style="display:flex;flex-direction:column;gap:1.25rem;">

          <div>
            <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:8px;padding-left:4px;">Full Name</label>
            <div style="position:relative;">
              <input id="add-name" type="text" placeholder="Who are we celebrating?"
                style="width:100%;height:56px;background:#1a1a1a;border:1px solid #333;border-radius:9999px;padding:0 3rem 0 1.5rem;font-size:16px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;"
                onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
              <span class="material-symbols-outlined" style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);font-size:20px;color:#ffb3b0;">person</span>
            </div>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:8px;padding-left:4px;">Birth Date <span style="color:#444;font-weight:500;text-transform:none;letter-spacing:0;">(year optional)</span></label>
            <div style="display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:10px;">
              <div>
                <input id="add-day" type="text" inputmode="numeric" placeholder="Day" maxlength="2"
                  style="width:100%;height:56px;background:#1a1a1a;border:1px solid #333;border-radius:9999px;padding:0 1rem;font-size:16px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;text-align:center;"
                  onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
                <p style="font-size:10px;color:#444;text-align:center;margin:4px 0 0;">Day</p>
              </div>
              <div>
                <input id="add-month" type="text" inputmode="numeric" placeholder="Month" maxlength="2"
                  style="width:100%;height:56px;background:#1a1a1a;border:1px solid #333;border-radius:9999px;padding:0 1rem;font-size:16px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;text-align:center;"
                  onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
                <p style="font-size:10px;color:#444;text-align:center;margin:4px 0 0;">Month</p>
              </div>
              <div>
                <input id="add-year" type="text" inputmode="numeric" placeholder="Year" maxlength="4"
                  style="width:100%;height:56px;background:#1a1a1a;border:1px solid #333;border-radius:9999px;padding:0 1rem;font-size:16px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;text-align:center;"
                  onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"/>
                <p style="font-size:10px;color:#444;text-align:center;margin:4px 0 0;">Year (optional)</p>
              </div>
            </div>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:8px;padding-left:4px;">Group</label>
            <select id="add-group"
              style="width:100%;height:56px;background:#1a1a1a;border:1px solid #333;border-radius:9999px;padding:0 1.5rem;font-size:16px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;appearance:none;">
              <option value="">No group</option>
              ${groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:8px;padding-left:4px;">Notes (optional)</label>
            <textarea id="add-notes" placeholder="Any special notes..."
              style="width:100%;height:100px;background:#1a1a1a;border:1px solid #333;border-radius:1.5rem;padding:1rem 1.5rem;font-size:16px;font-family:'Plus Jakarta Sans',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;resize:none;"
              onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#333'"></textarea>
          </div>

          <button id="add-save-btn" style="width:100%;height:60px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 12px 24px rgba(255,107,107,0.2);transition:transform 0.15s;"
            onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'"
            onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='scale(1)'">
            Save Celebration
            <span class="material-symbols-outlined">auto_awesome</span>
          </button>

        </div>
      </div>
    </div>
  `

  // Auto-advance: day → month → year
  const dayInput = document.getElementById('add-day') as HTMLInputElement

  animatePageEnter(container)
  bindButtonFeedback(container)
  const monthInput = document.getElementById('add-month') as HTMLInputElement
  const yearInput = document.getElementById('add-year') as HTMLInputElement

  dayInput.addEventListener('input', () => {
    dayInput.value = dayInput.value.replace(/\D/g, '')
    if (dayInput.value.length === 2) monthInput.focus()
  })
  monthInput.addEventListener('input', () => {
    monthInput.value = monthInput.value.replace(/\D/g, '')
    if (monthInput.value.length === 2) yearInput.focus()
  })
  yearInput.addEventListener('input', () => {
    yearInput.value = yearInput.value.replace(/\D/g, '')
  })

  document.getElementById('add-save-btn')?.addEventListener('click', async () => {
    const name = (document.getElementById('add-name') as HTMLInputElement).value.trim()
    const day = dayInput.value.trim()
    const month = monthInput.value.trim()
    const year = yearInput.value.trim()
    const groupId = (document.getElementById('add-group') as HTMLSelectElement).value
    const notes = (document.getElementById('add-notes') as HTMLTextAreaElement).value.trim()

    if (!name) { showToast('Please enter a name', 'error'); return }
    if (!day || !month) { showToast('Please enter at least day and month', 'error'); return }

    const d = parseInt(day), m = parseInt(month)
    if (isNaN(d) || isNaN(m) || d < 1 || d > 31 || m < 1 || m > 12) {
      showToast('Invalid day or month', 'error'); return
    }

    let storedDate: string
    if (year) {
      const y = parseInt(year)
      if (isNaN(y) || year.length !== 4) { showToast('Enter a valid 4-digit year', 'error'); return }
      storedDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    } else {
      storedDate = `0001-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }

    const btn = document.getElementById('add-save-btn') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Saving...'
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase.from('birthdays').insert({
        user_id: session.user.id,
        name,
        date: storedDate,
        group_id: groupId || null,
        notes: notes || null
      })

      if (error) {
        showToast(error.message, 'error')
      } else {
        await refreshAll(session.user.id)
        showToast('Birthday added!', 'success')
        // Clear fields instead of re-rendering the whole app
        ;(document.getElementById('add-name') as HTMLInputElement).value = ''
        dayInput.value = ''
        monthInput.value = ''
        yearInput.value = ''
        ;(document.getElementById('add-group') as HTMLSelectElement).value = ''
        ;(document.getElementById('add-notes') as HTMLTextAreaElement).value = ''
      }
    } finally {
      btn.disabled = false
      btn.textContent = 'Save Celebration'
    }
  })
}