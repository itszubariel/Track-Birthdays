const MAX_TOASTS = 5;
const TOAST_CONTAINER_ID = "toast-container";

export function showToast(
  message: string,
  type: "error" | "success" | "info" = "info",
  onClick?: () => void,
  duration = 2500,
) {
  const config: Record<string, { accent: string; icon: string }> = {
    error: { accent: "var(--pink)", icon: "error" },
    success: { accent: "var(--lime)", icon: "check_circle" },
    info: { accent: "var(--orange)", icon: "info" },
  };
  const { accent } = config[type];
  const icons: Record<string, string> = {
    error: "close",
    success: "check",
    info: "info",
  };
  const icon = icons[type];

  const root = document.getElementById("phone-screen") || document.body;
  let container = document.getElementById(TOAST_CONTAINER_ID) as HTMLElement;

  if (!container) {
    container = document.createElement("div");
    container.id = TOAST_CONTAINER_ID;
    Object.assign(container.style, {
      position: "absolute",
      top: "1rem",
      right: "1rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "8px",
      zIndex: "9999",
      maxWidth: "220px",
      pointerEvents: "none",
    });
    root.appendChild(container);
  }

  const existingToasts = container.querySelectorAll(".toast-item");
  if (existingToasts.length >= MAX_TOASTS) {
    const oldest = existingToasts[existingToasts.length - 1] as HTMLElement;
    oldest.style.opacity = "0";
    oldest.style.transform = "translateY(-6px) scale(0.95)";
    setTimeout(() => oldest.remove(), 200);
  }

  const toast = document.createElement("div");
  toast.className = "toast-item";
  toast.innerHTML = `
    <span style="
      width:22px;height:22px;border-radius:50%;
      background:${accent};
      display:flex;align-items:center;justify-content:center;
      flex-shrink:0;
    ">
      <span class="material-symbols-outlined" style="font-size:0.85rem;font-variation-settings:'FILL' 1;color:#1a1a1a;">${icon}</span>
    </span>
    <span style="font-size:0.82rem;font-weight:700;color:var(--ink);font-family:'Inter',sans-serif;line-height:1.4;">${message}</span>
  `;

  Object.assign(toast.style, {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--paper)",
    border: "2px solid var(--ink)",
    borderLeft: `4px solid ${accent}`,
    borderRadius: "0.85rem",
    padding: "0.6rem 1rem",
    boxShadow: "none",
    opacity: "0",
    transform: "translateY(-8px) scale(0.97)",
    transition:
      "opacity 0.2s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
    whiteSpace: "normal",
    wordBreak: "break-word",
    pointerEvents: "auto",
    cursor: onClick ? "pointer" : "default",
  });

  container.insertBefore(toast, container.firstChild);

  if (onClick) {
    toast.addEventListener("click", () => {
      onClick();
      dismiss(toast, container);
    });
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0) scale(1)";
    });
  });

  setTimeout(() => dismiss(toast, container), duration);
}

function dismiss(toast: HTMLElement, container: HTMLElement) {
  toast.style.opacity = "0";
  toast.style.transform = "translateY(-6px) scale(0.95)";
  setTimeout(() => {
    toast.remove();
    if (container.children.length === 0) container.remove();
  }, 220);
}
