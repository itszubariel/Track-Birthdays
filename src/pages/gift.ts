import { renderBirthdays } from './birthdays'
import { showToast } from '../toast'
import { getNavGeneration } from '../app'
import { animateSlideUp, bindButtonFeedback } from '../animations'

export function renderGift(container: HTMLElement) {
  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

    <header style="position:sticky;top:0;z-index:40;background:rgba(13,13,13,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;gap:12px;padding:1rem 1.5rem;">
      <button id="gift-back" style="background:none;border:none;color:#a78a88;cursor:pointer;padding:4px;display:flex;align-items:center;">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="material-symbols-outlined" style="color:#ffb3b0;font-variation-settings:'FILL' 1;">redeem</span>
        <h1 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.25rem;color:#e5e2e1;margin:0;">Gift Ideas</h1>
      </div>
    </header>

    <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem;padding-bottom:6rem;">

      <div style="background:#2a2a2a;border-radius:1.5rem;padding:1.5rem;border-left:4px solid #ffb3b0;position:relative;overflow:hidden;">
        <div style="position:absolute;right:-0.5rem;bottom:-0.5rem;opacity:0.06;">
          <span class="material-symbols-outlined" style="font-size:90px;font-variation-settings:'FILL' 1;color:#ffb3b0;">redeem</span>
        </div>
        <h2 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:1.25rem;font-weight:800;color:#e5e2e1;margin:0 0 4px;">Find the perfect gift</h2>
        <p style="color:#a78a88;font-size:13px;margin:0;">Fill in what you know and get personalised ideas - Powered by Groq AI.</p>
      </div>

      <div>
        <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:6px;">Who is this for?</label>
        <input id="gift-person" type="text" placeholder="e.g. my best friend who loves hiking and coffee..."
          style="width:100%;height:52px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:9999px;padding:0 1.25rem;font-size:14px;font-family:'Inter',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;"
          onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#2a2a2a'"/>
      </div>

      <div>
        <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:6px;">Their interests</label>
        <input id="gift-interests" type="text" placeholder="e.g. gaming, coffee, hiking, reading..."
          style="width:100%;height:52px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:9999px;padding:0 1.25rem;font-size:14px;font-family:'Inter',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;"
          onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#2a2a2a'"/>
      </div>

      <div>
        <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:6px;">Things they dislike (optional)</label>
        <input id="gift-dislikes" type="text" placeholder="e.g. sweets, loud things, clutter..."
          style="width:100%;height:52px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:9999px;padding:0 1.25rem;font-size:14px;font-family:'Inter',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;"
          onfocus="this.style.borderColor='#ffb3b0'" onblur="this.style.borderColor='#2a2a2a'"/>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:6px;">Relationship</label>
          <div style="position:relative;">
            <select id="gift-relationship" style="width:100%;height:52px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:9999px;padding:0 2.5rem 0 1.25rem;font-size:14px;font-family:'Inter',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;appearance:none;cursor:pointer;">
              <option value="friend">Friend</option>
              <option value="best friend">Best Friend</option>
              <option value="partner">Partner</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="cousin">Cousin</option>
              <option value="colleague">Colleague</option>
              <option value="other">Other</option>
            </select>
            <span class="material-symbols-outlined" style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);font-size:16px;color:#555;pointer-events:none;">expand_more</span>
          </div>
        </div>
        <div>
          <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a78a88;margin-bottom:6px;">Budget</label>
          <div style="position:relative;">
            <select id="gift-budget" style="width:100%;height:52px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:9999px;padding:0 2.5rem 0 1.25rem;font-size:14px;font-family:'Inter',sans-serif;color:#e5e2e1;outline:none;box-sizing:border-box;appearance:none;cursor:pointer;">
              <option value="under $20">Under $20</option>
              <option value="$20–$50">$20–$50</option>
              <option value="$50–$100" selected>$50–$100</option>
              <option value="$100–$200">$100–$200</option>
              <option value="$200+">$200+</option>
            </select>
            <span class="material-symbols-outlined" style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);font-size:16px;color:#555;pointer-events:none;">expand_more</span>
          </div>
        </div>
      </div>

      <button id="gift-generate" style="width:100%;height:56px;background:linear-gradient(135deg,#ffb3b0,#ff6b6b);border:none;border-radius:9999px;color:#410006;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:transform 0.15s;box-shadow:0 8px 24px rgba(255,107,107,0.2);"
        onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'"
        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='scale(1)'">
        <span class="material-symbols-outlined" style="font-size:20px;">auto_awesome</span>
        Generate Ideas
      </button>

      <div id="gift-results"></div>

    </div>
  `

  document.getElementById('gift-back')!.addEventListener('click', () => {
    renderBirthdays(container, getNavGeneration())
  })

  animateSlideUp(container)
  bindButtonFeedback(container)

  document.getElementById('gift-generate')!.addEventListener('click', async () => {
    const person = (document.getElementById('gift-person') as HTMLInputElement).value.trim()
    const interests = (document.getElementById('gift-interests') as HTMLInputElement).value.trim()
    const dislikes = (document.getElementById('gift-dislikes') as HTMLInputElement).value.trim()
    const relationship = (document.getElementById('gift-relationship') as HTMLSelectElement).value
    const budget = (document.getElementById('gift-budget') as HTMLSelectElement).value

    if (!interests) {
      showToast('Please enter their interests', 'error')
      return
    }

    const btn = document.getElementById('gift-generate') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Generating...'

    const resultsEl = document.getElementById('gift-results')!
    resultsEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:2rem 0;color:#a78a88;">
        <span class="material-symbols-outlined" style="font-size:20px;animation:spin 1s linear infinite;">progress_activity</span>
        <span style="font-size:14px;">Finding perfect gifts...</span>
      </div>
      <style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
    `

    try {
      const prompt = `You are a thoughtful gift advisor. Suggest 6 specific, creative, and practical gift ideas for the following person:

Who: ${person || 'someone special'}
Relationship: ${relationship}
Interests: ${interests}
Dislikes: ${dislikes || 'none mentioned'}
Budget: ${budget}

Return ONLY a JSON array of exactly 6 gift ideas. Each item should be an object with "name" (short gift name) and "reason" (one sentence why it's perfect for them). No other text, just the JSON array.

Example format:
[{"name":"Gift name","reason":"Why it suits them perfectly."}]`

      const response = await fetch('/.netlify/functions/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || ''
      const clean = text.replace(/```json|```/g, '').trim()
      let ideas: { name: string; reason: string }[] = []
      try {
        // Fix common JSON issues from AI
        const fixed = clean.replace(/,\s*\n\s*\n\s*]/g, ']').replace(/}\s*\n\s*\n\s*]/g, '}]')
        ideas = JSON.parse(fixed)
      } catch {
        // Try extracting just the array
        const match = clean.match(/\[[\s\S]*\]/)
        if (match) ideas = JSON.parse(match[0])
        else throw new Error('Could not parse response')
      }

      resultsEl.innerHTML = `
        <div style="border-top:1px solid #222;padding-top:1.25rem;">
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#555;margin:0 0 12px;">AI Gift Suggestions</p>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${ideas.map((idea, i) => `
              <div style="background:#1a1a1a;border-radius:1rem;padding:1rem 1.25rem;display:flex;gap:12px;align-items:flex-start;">
                <span style="width:28px;height:28px;border-radius:50%;background:rgba(255,179,176,0.12);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#ffb3b0;flex-shrink:0;margin-top:1px;">${i + 1}</span>
                <div>
                  <p style="font-size:14px;font-weight:700;color:#e5e2e1;margin:0 0 3px;font-family:'Plus Jakarta Sans',sans-serif;">${idea.name}</p>
                  <p style="font-size:12px;color:#a78a88;margin:0;line-height:1.5;font-family:'Inter',sans-serif;">${idea.reason}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `
    } catch (err) {
      resultsEl.innerHTML = `<p style="color:#ff4444;text-align:center;padding:1rem;font-size:14px;">Failed to generate ideas. Please try again.</p>`
    } finally {
      btn.disabled = false
      btn.textContent = 'Generate Ideas'
    }
  })
}
