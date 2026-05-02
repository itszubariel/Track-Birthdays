import { renderApp } from '../app'
import { supabase } from '../supabase'

export interface SlideConfig {
  icon: string
  title: string
  description: string
  accentColor: string
  bg: string
}

export const SLIDES: SlideConfig[] = [
  {
    icon: 'cake',
    title: 'Never Miss a Birthday',
    description: 'Add the people who matter and see exactly how many days until their special day.',
    accentColor: '#ffb3b0',
    bg: 'rgba(255,179,176,0.06)',
  },
  {
    icon: 'calendar_month',
    title: 'Countdowns & Zodiacs',
    description: 'Every birthday comes with a live countdown and their zodiac sign automatically.',
    accentColor: '#c084fc',
    bg: 'rgba(192,132,252,0.06)',
  },
  {
    icon: 'group',
    title: 'Family, Friends & More',
    description: 'Colour-coded groups keep everyone organised — family, friends, work, whoever.',
    accentColor: '#52dea2',
    bg: 'rgba(82,222,162,0.06)',
  },
  {
    icon: 'redeem',
    title: 'AI Gift Ideas',
    description: 'Stuck on what to get? Let AI suggest the perfect gift for anyone on your list.',
    accentColor: '#fbbf24',
    bg: 'rgba(251,191,36,0.06)',
  },
  {
    icon: 'notifications_active',
    title: 'Daily Reminders',
    description: 'Set a daily check time and never be caught off guard by a birthday again.',
    accentColor: '#4dabf7',
    bg: 'rgba(77,171,247,0.06)',
  },
]

export function renderOnboarding(root: HTMLElement): void {
  let currentIndex = 0
  let transitioning = false

  function render(): void {
    const slide = SLIDES[currentIndex]
    const isLast = currentIndex === SLIDES.length - 1

    root.innerHTML = `
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />

      <style>
        @keyframes ob-icon-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes ob-ring-expand {
          0% { transform: scale(0.7); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ob-bg-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .ob-icon-wrap {
          animation: ob-ring-expand 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        .ob-icon-inner {
          animation: ob-icon-pulse 3s ease-in-out infinite;
          animation-delay: 0.6s;
        }
        .ob-title {
          opacity: 0;
          transform: translateY(16px);
          animation: ob-slide-up 0.4s cubic-bezier(0.22,1,0.36,1) 0.15s both;
        }
        .ob-desc {
          opacity: 0;
          transform: translateY(12px);
          animation: ob-slide-up 0.4s cubic-bezier(0.22,1,0.36,1) 0.25s both;
        }
        .ob-actions {
          opacity: 0;
          transform: translateY(10px);
          animation: ob-slide-up 0.4s cubic-bezier(0.22,1,0.36,1) 0.35s both;
        }
        @keyframes ob-slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ob-dot {
          transition: width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.35s ease;
        }
        .ob-btn-next {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .ob-btn-next:active {
          transform: scale(0.9) !important;
        }
        .ob-btn-skip:active {
          opacity: 0.6;
        }
        .ob-btn-start:active {
          transform: scale(0.96) !important;
        }
      </style>

      <div id="ob-shell" style="
        position: relative;
        width: 100%;
        height: 100%;
        background: #0f0f0f;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
        box-sizing: border-box;
        padding: 3rem 2rem 2.5rem;
      ">

        <!-- Ambient background blob -->
        <div id="ob-blob" style="
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 340px;
          height: 340px;
          border-radius: 50%;
          background: radial-gradient(circle, ${slide.accentColor}22 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
          animation: ob-bg-fade 0.5s ease both;
          transition: background 0.5s ease;
        "></div>

        <!-- Skip -->
        <div style="width:100%;display:flex;justify-content:flex-end;position:relative;z-index:10;">
          ${!isLast ? `
            <button id="skip-btn" class="ob-btn-skip" style="
              background: rgba(255,255,255,0.06);
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 9999px;
              color: #666;
              font-family: 'Inter', sans-serif;
              font-size: 13px;
              font-weight: 600;
              padding: 6px 16px;
              cursor: pointer;
            ">Skip</button>
          ` : '<div></div>'}
        </div>

        <!-- Slide content -->
        <div id="slide-content" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          width: 100%;
          text-align: center;
          gap: 1.5rem;
          position: relative;
          z-index: 10;
        ">
          <!-- Icon ring -->
          <div class="ob-icon-wrap" style="
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: ${slide.bg};
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid ${slide.accentColor}30;
            box-shadow: 0 0 0 16px ${slide.accentColor}08, 0 0 0 32px ${slide.accentColor}04;
            position: relative;
          ">
            <div class="ob-icon-inner">
              <span class="material-symbols-outlined" style="
                font-size: 52px;
                color: ${slide.accentColor};
                font-variation-settings: 'FILL' 1;
                display: block;
              ">${slide.icon}</span>
            </div>
          </div>

          <!-- Step badge -->
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: ${slide.accentColor}14;
            border: 1px solid ${slide.accentColor}25;
            border-radius: 9999px;
            padding: 3px 12px;
          ">
            <span style="font-size: 11px; font-weight: 700; color: ${slide.accentColor}; letter-spacing: 0.08em; text-transform: uppercase;">${currentIndex + 1} of ${SLIDES.length}</span>
          </div>

          <h1 class="ob-title" style="
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 2rem;
            font-weight: 800;
            color: #e5e2e1;
            margin: 0;
            line-height: 1.2;
          ">${slide.title}</h1>

          <p class="ob-desc" style="
            font-size: 15px;
            font-weight: 400;
            color: #a78a88;
            margin: 0;
            line-height: 1.7;
            max-width: 280px;
          ">${slide.description}</p>
        </div>

        <!-- Bottom controls -->
        <div class="ob-actions" style="width: 100%; display: flex; flex-direction: column; gap: 1.25rem; position: relative; z-index: 10;">

          <!-- Dot indicators -->
          <div style="display:flex;align-items:center;justify-content:center;gap:7px;">
            ${SLIDES.map((_, i) => `
              <div class="ob-dot" style="
                width: ${i === currentIndex ? '22px' : '7px'};
                height: 7px;
                border-radius: 9999px;
                background: ${i === currentIndex ? slide.accentColor : '#2a2a2a'};
              "></div>
            `).join('')}
          </div>

          ${isLast ? `
            <!-- Get Started -->
            <button id="get-started-btn" class="ob-btn-start" style="
              width: 100%;
              height: 58px;
              background: linear-gradient(135deg, ${slide.accentColor}, #ff6b6b);
              border: none;
              border-radius: 9999px;
              color: #410006;
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-size: 16px;
              font-weight: 800;
              cursor: pointer;
              box-shadow: 0 12px 32px ${slide.accentColor}40;
              transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease;
            ">Let's Go 🎉</button>
          ` : `
            <!-- Prev / Next row -->
            <div style="display:flex;align-items:center;gap:12px;">
              <button id="back-btn" style="
                width: 52px;
                height: 52px;
                border-radius: 50%;
                background: #1a1a1a;
                border: 1px solid #2a2a2a;
                color: #555;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                flex-shrink: 0;
                transition: all 0.2s ease;
                visibility: ${currentIndex === 0 ? 'hidden' : 'visible'};
              ">
                <span class="material-symbols-outlined" style="font-size:20px;">arrow_back</span>
              </button>

              <button id="next-btn" class="ob-btn-next" style="
                flex: 1;
                height: 52px;
                background: ${slide.accentColor};
                border: none;
                border-radius: 9999px;
                color: #0f0f0f;
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 15px;
                font-weight: 800;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                box-shadow: 0 8px 24px ${slide.accentColor}35;
                transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease;
              ">
                Continue
                <span class="material-symbols-outlined" style="font-size:18px;">arrow_forward</span>
              </button>
            </div>
          `}
        </div>
      </div>
    `

    bindButtons()
  }

  async function complete(): Promise<void> {
    // Fade out the whole shell before navigating
    const shell = document.getElementById('ob-shell')
    if (shell) {
      shell.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1)'
      shell.style.opacity = '0'
      shell.style.transform = 'scale(0.97)'
      await new Promise<void>(r => setTimeout(r, 300))
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', user.id)
    }
    localStorage.setItem('onboarding_complete', Date.now().toString())
    renderApp()
  }

  function transitionTo(direction: 'forward' | 'back'): void {
    if (transitioning) return
    transitioning = true

    const content = document.getElementById('slide-content')
    if (!content) { transitioning = false; return }

    const exitX = direction === 'forward' ? '-60px' : '60px'

    // Fade + slide out current content
    content.style.transition = 'opacity 0.18s ease, transform 0.18s ease'
    content.style.opacity = '0'
    content.style.transform = `translateX(${exitX})`

    setTimeout(() => {
      if (direction === 'forward') currentIndex++
      else currentIndex--

      // Re-render with new slide
      render()

      // Animate new content in from opposite side
      const newContent = document.getElementById('slide-content')
      if (!newContent) { transitioning = false; return }

      const enterX = direction === 'forward' ? '60px' : '-60px'
      newContent.style.transition = 'none'
      newContent.style.opacity = '0'
      newContent.style.transform = `translateX(${enterX})`

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          newContent.style.transition = 'opacity 0.28s cubic-bezier(0.22,1,0.36,1), transform 0.28s cubic-bezier(0.22,1,0.36,1)'
          newContent.style.opacity = '1'
          newContent.style.transform = 'translateX(0)'
          setTimeout(() => { transitioning = false }, 280)
        })
      })
    }, 180)
  }

  function bindButtons(): void {
    document.getElementById('back-btn')?.addEventListener('click', () => {
      if (currentIndex > 0) transitionTo('back')
    })

    document.getElementById('next-btn')?.addEventListener('click', () => {
      if (currentIndex < SLIDES.length - 1) transitionTo('forward')
    })

    document.getElementById('skip-btn')?.addEventListener('click', () => complete())
    document.getElementById('get-started-btn')?.addEventListener('click', () => complete())
  }

  function bindSwipe(container: HTMLElement): void {
    let touchStartX = 0
    let touchStartY = 0

    container.addEventListener('touchstart', (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].clientX
      touchStartY = e.changedTouches[0].clientY
    }, { passive: true })

    container.addEventListener('touchend', (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX
      const dy = e.changedTouches[0].clientY - touchStartY
      // Only trigger on horizontal swipes
      if (Math.abs(dx) < Math.abs(dy) * 1.5 || Math.abs(dx) < 40) return
      if (dx < 0 && currentIndex < SLIDES.length - 1) transitionTo('forward')
      else if (dx > 0 && currentIndex > 0) transitionTo('back')
    }, { passive: true })
  }

  render()
  bindSwipe(root)
}
