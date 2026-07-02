export function animatePageEnter(container: HTMLElement): void {
  container.style.opacity = "0";
  container.style.transform = "translateY(8px)";
  container.style.transition = "none";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.style.transition = "opacity 0.2s ease-out, transform 0.2s ease-out";
      container.style.opacity = "1";
      container.style.transform = "translateY(0)";
    });
  });
}

export function animateSlideUp(container: HTMLElement): void {
  container.style.opacity = "0";
  container.style.transform = "translateY(12px)";
  container.style.transition = "none";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.style.transition = "opacity 0.2s ease-out, transform 0.2s ease-out";
      container.style.opacity = "1";
      container.style.transform = "translateY(0)";
    });
  });
}

export function animateListItems(
  parent: HTMLElement,
  selector: string,
  baseDelay = 30,
): void {
  const items = Array.from(parent.querySelectorAll<HTMLElement>(selector));
  items.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
    el.style.transition = "none";
    const delay = i * baseDelay;
    setTimeout(() => {
      requestAnimationFrame(() => {
        el.style.transition = `opacity 0.2s ease-out ${delay}ms, transform 0.2s ease-out ${delay}ms`;
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
    }, 0);
  });
}

export function animateModalIn(overlay: HTMLElement): void {
  const card = overlay.firstElementChild as HTMLElement | null;
  overlay.style.opacity = "0";
  overlay.style.transition = "none";
  if (card) {
    card.style.transform = "scale(0.97)";
    card.style.transition = "none";
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.transition = "opacity 0.15s ease-out";
      overlay.style.opacity = "1";
      if (card) {
        card.style.transition = "transform 0.2s ease-out";
        card.style.transform = "scale(1)";
      }
    });
  });
}

export function animateSheetIn(overlay: HTMLElement): void {
  const sheet = overlay.firstElementChild as HTMLElement | null;
  overlay.style.opacity = "0";
  overlay.style.transition = "none";
  if (sheet) {
    sheet.style.transform = "translateY(100%)";
    sheet.style.transition = "none";
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.transition = "opacity 0.15s ease-out";
      overlay.style.opacity = "1";
      if (sheet) {
        sheet.style.transition = "transform 0.25s ease-out";
        sheet.style.transform = "translateY(0)";
      }
    });
  });
}

export function bindButtonFeedback(container: HTMLElement): void {
  const press = (el: HTMLElement) => {
    el.style.transition = "transform 0.08s ease";
    el.style.transform = "scale(0.95)";
  };
  const release = (el: HTMLElement) => {
    el.style.transition = "transform 0.2s ease-out";
    el.style.transform = "scale(1)";
  };

  container.addEventListener(
    "touchstart",
    (e) => {
      const btn = (e.target as HTMLElement).closest(
        "button",
      ) as HTMLButtonElement | null;
      if (btn && !btn.disabled) press(btn);
    },
    { passive: true },
  );

  container.addEventListener(
    "touchend",
    (e) => {
      const btn = (e.target as HTMLElement).closest(
        "button",
      ) as HTMLElement | null;
      if (btn) release(btn);
    },
    { passive: true },
  );

  container.addEventListener(
    "touchcancel",
    (e) => {
      const btn = (e.target as HTMLElement).closest(
        "button",
      ) as HTMLElement | null;
      if (btn) release(btn);
    },
    { passive: true },
  );
}

export function animateNavTab(_btn: HTMLElement): void {
}

export function animateSpotlight(el: HTMLElement): void {
  el.style.opacity = "0";
  el.style.transform = "scale(0.98)";
  el.style.transition = "none";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.3s ease-out, transform 0.3s ease-out";
      el.style.opacity = "1";
      el.style.transform = "scale(1)";
    });
  });
}
