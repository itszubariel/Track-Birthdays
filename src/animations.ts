/**
 * Native-app-like animation utilities.
 * All animations use CSS transitions/keyframes via requestAnimationFrame
 * so they run on the compositor thread and never block JS.
 */

// ─── Page enter ──────────────────────────────────────────────────────────────

/**
 * Fade + slide-up a page container into view.
 * Call immediately after setting container.innerHTML.
 */
export function animatePageEnter(container: HTMLElement): void {
  container.style.opacity = '0'
  container.style.transform = 'translateY(18px)'
  container.style.transition = 'none'
  // Double rAF ensures the browser has painted the initial state
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.style.transition = 'opacity 0.28s cubic-bezier(0.22,1,0.36,1), transform 0.28s cubic-bezier(0.22,1,0.36,1)'
      container.style.opacity = '1'
      container.style.transform = 'translateY(0)'
    })
  })
}

/**
 * Slide-up from bottom (for sub-views like detail pages).
 */
export function animateSlideUp(container: HTMLElement): void {
  container.style.opacity = '0'
  container.style.transform = 'translateY(32px)'
  container.style.transition = 'none'
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.style.transition = 'opacity 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.3s cubic-bezier(0.22,1,0.36,1)'
      container.style.opacity = '1'
      container.style.transform = 'translateY(0)'
    })
  })
}

// ─── Staggered list items ─────────────────────────────────────────────────────

/**
 * Animate a list of elements in with a stagger.
 * Pass a CSS selector relative to `parent`, or an array of elements.
 */
export function animateListItems(parent: HTMLElement, selector: string, baseDelay = 40): void {
  const items = Array.from(parent.querySelectorAll<HTMLElement>(selector))
  items.forEach((el, i) => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(14px)'
    el.style.transition = 'none'
    const delay = i * baseDelay
    setTimeout(() => {
      requestAnimationFrame(() => {
        el.style.transition = `opacity 0.26s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.26s cubic-bezier(0.22,1,0.36,1) ${delay}ms`
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      })
    }, 0)
  })
}

// ─── Modal ────────────────────────────────────────────────────────────────────

/**
 * Animate a modal overlay + its inner card in.
 * The overlay fades in; the card scales up from 0.92.
 */
export function animateModalIn(overlay: HTMLElement): void {
  const card = overlay.firstElementChild as HTMLElement | null
  overlay.style.opacity = '0'
  overlay.style.transition = 'none'
  if (card) {
    card.style.transform = 'scale(0.92) translateY(12px)'
    card.style.transition = 'none'
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity 0.22s ease'
      overlay.style.opacity = '1'
      if (card) {
        card.style.transition = 'transform 0.28s cubic-bezier(0.22,1,0.36,1)'
        card.style.transform = 'scale(1) translateY(0)'
      }
    })
  })
}

/**
 * Animate a bottom-sheet modal in (slides up from bottom).
 */
export function animateSheetIn(overlay: HTMLElement): void {
  const sheet = overlay.firstElementChild as HTMLElement | null
  overlay.style.opacity = '0'
  overlay.style.transition = 'none'
  if (sheet) {
    sheet.style.transform = 'translateY(100%)'
    sheet.style.transition = 'none'
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity 0.2s ease'
      overlay.style.opacity = '1'
      if (sheet) {
        sheet.style.transition = 'transform 0.32s cubic-bezier(0.22,1,0.36,1)'
        sheet.style.transform = 'translateY(0)'
      }
    })
  })
}

// ─── Button press feedback ────────────────────────────────────────────────────

/**
 * Add native-feeling press scale to all buttons inside a container.
 * Uses touch events for mobile, mouse for desktop.
 */
export function bindButtonFeedback(container: HTMLElement): void {
  const press = (el: HTMLElement) => {
    el.style.transition = 'transform 0.08s ease'
    el.style.transform = 'scale(0.95)'
  }
  const release = (el: HTMLElement) => {
    el.style.transition = 'transform 0.2s cubic-bezier(0.22,1,0.36,1)'
    el.style.transform = 'scale(1)'
  }

  container.addEventListener('touchstart', (e) => {
    const btn = (e.target as HTMLElement).closest('button') as HTMLButtonElement | null
    if (btn && !btn.disabled) press(btn)
  }, { passive: true })

  container.addEventListener('touchend', (e) => {
    const btn = (e.target as HTMLElement).closest('button') as HTMLElement | null
    if (btn) release(btn)
  }, { passive: true })

  container.addEventListener('touchcancel', (e) => {
    const btn = (e.target as HTMLElement).closest('button') as HTMLElement | null
    if (btn) release(btn)
  }, { passive: true })
}

// ─── Nav tab switch ───────────────────────────────────────────────────────────

/**
 * Animate the active nav button with a quick bounce scale.
 */
export function animateNavTab(btn: HTMLElement): void {
  btn.style.transition = 'transform 0.1s ease'
  btn.style.transform = 'scale(0.88)'
  setTimeout(() => {
    btn.style.transition = 'transform 0.3s cubic-bezier(0.22,1,0.36,1)'
    btn.style.transform = 'scale(1)'
  }, 100)
}

// ─── Spotlight card pulse ─────────────────────────────────────────────────────

/**
 * Add a subtle entrance pulse to the spotlight card.
 */
export function animateSpotlight(el: HTMLElement): void {
  el.style.opacity = '0'
  el.style.transform = 'scale(0.97)'
  el.style.transition = 'none'
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.35s cubic-bezier(0.22,1,0.36,1)'
      el.style.opacity = '1'
      el.style.transform = 'scale(1)'
    })
  })
}
