import { renderApp } from '../app'
import { supabase } from '../supabase'

export interface SlideConfig {
  icon: string
  title: string
  description: string
  accentColor: string
}

export const SLIDES: SlideConfig[] = [
  {
    icon: 'cake',
    title: 'Never Miss a Birthday',
    description: 'Add the people who matter and see exactly how many days until their special day.',
    accentColor: '#ffb3b0',
  },
  {
    icon: 'calendar_month',
    title: 'Countdowns & Zodiacs',
    description: 'Every birthday comes with a live countdown and their zodiac sign automatically.',
    accentColor: '#ffb3b0',
  },
  {
    icon: 'group',
    title: 'Family, Friends & More',
    description: 'Colour-coded groups keep everyone organised — family, friends, work, whoever.',
    accentColor: '#ffb3b0',
  },
  {
    icon: 'redeem',
    title: 'AI Gift Ideas',
    description: 'Stuck on what to get? Let AI suggest the perfect gift for anyone on your list.',
    accentColor: '#ffb3b0',
  },
  {
    icon: 'notifications_active',
    title: 'Daily Reminders',
    description: 'Set a daily check time and never be caught off guard by a birthday again.',
    accentColor: '#ffb3b0',
  },
]

export function renderOnboarding(root: HTMLElement): void {
  let currentIndex = 0

  function render(): void {
    const slide = SLIDES[currentIndex]

    root.innerHTML = `
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />

      <div id="onboarding-shell" style="
        position: relative;
        width: 100%;
        height: 100%;
        background: #0f0f0f;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
        box-sizing: border-box;
        padding: 2rem 2rem 2.5rem;
      ">
      <div style="position:fixed;top:-10%;left:-10%;width:40%;height:40%;background:rgba(255,179,176,0.05);border-radius:50%;filter:blur(120px);pointer-events:none;"></div>
<div style="position:fixed;bottom:-10%;right:-10%;width:40%;height:40%;background:rgba(82,222,162,0.05);border-radius:50%;filter:blur(120px);pointer-events:none;"></div>
        <!-- Slide content -->
        <div id="slide-container" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          width: 100%;
          text-align: center;
          gap: 1.5rem;
        ">
          <!-- Icon -->
          <div style="
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: ${slide.accentColor}18;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${slide.accentColor}33;
  box-shadow: 0 0 0 12px ${slide.accentColor}08, 0 0 0 24px ${slide.accentColor}04;
">
            <span class="material-symbols-outlined" style="
              font-size: 48px;
              color: ${slide.accentColor};
              font-variation-settings: 'FILL' 1;
            ">${slide.icon}</span>
          </div>

          <!-- Title -->
          <h1 style="
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 2rem;
            font-weight: 800;
            color: #e5e2e1;
            margin: 0;
            line-height: 1.2;
          ">${slide.title}</h1>

          <!-- Description -->
          <p style="
            font-size: 15px;
            font-weight: 400;
            color: #c4a8a6;
            margin: 0;
            line-height: 1.6;
            max-width: 280px;
          ">${slide.description}</p>
        </div>

        <!-- Dot indicators -->
        <div id="dot-indicator" style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 2rem;
        ">
          ${SLIDES.map((_, i) => `
            <div style="
              width: ${i === currentIndex ? '20px' : '8px'};
              height: 8px;
              border-radius: 9999px;
              background: ${i === currentIndex ? '#ffb3b0' : '#333'};
              transition: all 0.3s ease;
            "></div>
          `).join('')}
        </div>

        <!-- Buttons row -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 12px;
        ">
          <!-- Back button (hidden on first slide) -->
          <button id="back-btn" style="
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #1a1a1a;
            border: 1px solid #333;
            color: #a78a88;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
            visibility: ${currentIndex === 0 ? 'hidden' : 'visible'};
          ">
            <span class="material-symbols-outlined" style="font-size: 20px;">arrow_back</span>
          </button>

          <!-- Skip / Get Started -->
          ${currentIndex < SLIDES.length - 1
        ? `<button id="skip-btn" style="
                flex: 1;
                height: 48px;
                background: none;
                border: 1px solid #333;
                border-radius: 9999px;
                color: #666;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
              ">Skip</button>`
        : `<button id="get-started-btn" style="
                flex: 1;
                height: 48px;
                background: linear-gradient(135deg, #ffb3b0, #ff6b6b);
                border: none;
                border-radius: 9999px;
                color: #410006;
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 15px;
                font-weight: 800;
                cursor: pointer;
              ">Get Started</button>`
      }

          <!-- Next button (hidden on last slide) -->
          <button id="next-btn" style="
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #ffb3b0;
            border: none;
            color: #410006;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
            visibility: ${currentIndex === SLIDES.length - 1 ? 'hidden' : 'visible'};
          ">
            <span class="material-symbols-outlined" style="font-size: 20px;">arrow_forward</span>
          </button>
        </div>
      </div>
    `

    bindButtons()
  }

  async function complete(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id)
    }
    localStorage.setItem('onboarding_complete', Date.now().toString())
    renderApp()
  }

  function navigateWithTransition(direction: 'forward' | 'back'): void {
    const container = document.getElementById('slide-container')
    if (!container) return

    // Prevent rapid taps during transition
    container.style.pointerEvents = 'none'

    // Slide out current content
    const exitX = direction === 'forward' ? '-100%' : '100%'
    container.style.transition = 'transform 150ms ease-in'
    container.style.transform = `translateX(${exitX})`

    setTimeout(() => {
      // Update index and re-render
      if (direction === 'forward') {
        currentIndex++
      } else {
        currentIndex--
      }
      render()

      // Slide in new content from opposite side
      const newContainer = document.getElementById('slide-container')
      if (!newContainer) return

      const enterX = direction === 'forward' ? '100%' : '-100%'
      newContainer.style.transition = 'none'
      newContainer.style.transform = `translateX(${enterX})`
      newContainer.style.pointerEvents = 'none'

      // Force reflow so the initial position is applied before animating
      newContainer.getBoundingClientRect()

      newContainer.style.transition = 'transform 150ms ease-out'
      newContainer.style.transform = 'translateX(0)'

      setTimeout(() => {
        newContainer.style.transition = ''
        newContainer.style.transform = ''
        newContainer.style.pointerEvents = ''
      }, 150)
    }, 150)
  }

  function bindSwipe(container: HTMLElement): void {
    let touchStartX = 0

    container.addEventListener('touchstart', (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].clientX
    }, { passive: true })

    container.addEventListener('touchend', (e: TouchEvent) => {
      const delta = e.changedTouches[0].clientX - touchStartX
      if (delta < -50 && currentIndex < SLIDES.length - 1) {
        navigateWithTransition('forward')
      } else if (delta > 50 && currentIndex > 0) {
        navigateWithTransition('back')
      }
    }, { passive: true })
  }

  function bindButtons(): void {
    document.getElementById('back-btn')?.addEventListener('click', () => {
      if (currentIndex > 0) {
        navigateWithTransition('back')
      }
    })

    document.getElementById('next-btn')?.addEventListener('click', () => {
      if (currentIndex < SLIDES.length - 1) {
        navigateWithTransition('forward')
      }
    })

    document.getElementById('skip-btn')?.addEventListener('click', () => complete())
    document.getElementById('get-started-btn')?.addEventListener('click', () => complete())
  }

  render()
  bindSwipe(root)
}
