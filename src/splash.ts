let splashEl: HTMLElement | null = null

export function showSplash(): void {
  if (splashEl) return
  splashEl = document.createElement('div')
  splashEl.id = 'splash-screen'
  splashEl.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');

      #splash-screen {
        position: fixed;
        inset: 0;
        background: #0f0f0f;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
        gap: 0;
      }

      @keyframes splash-float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }

      @keyframes splash-bar {
  0% { width: 0%; }
  60% { width: 75%; }
  85% { width: 90%; }
  100% { width: 100%; }
}

      @keyframes splash-fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      #splash-icon-wrap {
        animation: splash-float 3s ease-in-out infinite;
        margin-bottom: 20px;
      }

      #splash-title {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 800;
        font-size: 1.4rem;
        color: #e5e2e1;
        letter-spacing: -0.02em;
        margin-bottom: 6px;
        animation: splash-fade-in 0.6s ease forwards;
        opacity: 0;
        animation-delay: 0.2s;
      }

      #splash-sub {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 500;
        font-size: 0.8rem;
        color: #a78a88;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 40px;
        animation: splash-fade-in 0.6s ease forwards;
        opacity: 0;
        animation-delay: 0.35s;
      }

      #splash-bar-wrap {
        width: 140px;
        height: 3px;
        background: rgba(255,179,176,0.12);
        border-radius: 9999px;
        overflow: hidden;
        animation: splash-fade-in 0.6s ease forwards;
        opacity: 0;
        animation-delay: 0.5s;
      }

      #splash-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffb3b0, #ff6b6b);
  border-radius: 9999px;
  animation: splash-bar 1.2s ease-in-out forwards;
  animation-delay: 0.6s;
  width: 0%;
}
    </style>

    <div id="splash-icon-wrap">
      <img src="/icons/icon.png" width="88" height="88" style="border-radius:22px;box-shadow:0 16px 40px rgba(255,107,107,0.2);" />
    </div>

    <p id="splash-title">Track Birthdays</p>
    <p id="splash-sub">Never miss a moment</p>

    <div id="splash-bar-wrap">
      <div id="splash-bar-fill"></div>
    </div>
  `
  document.body.appendChild(splashEl)
}

export async function hideSplash(): Promise<void> {
  if (!splashEl) return
  const el = splashEl

  await new Promise<void>(resolve => setTimeout(resolve, 1800))

  el.style.opacity = '0'
  await new Promise<void>(resolve => setTimeout(resolve, 500))
  el.remove()
  splashEl = null
}