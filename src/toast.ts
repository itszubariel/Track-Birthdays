const MAX_TOASTS = 5;
const TOAST_CONTAINER_ID = "toast-container";

export function showToast(
  message: string,
  type: "error" | "success" | "info" = "info",
) {
  const config: Record<string, { color: string; icon: string }> = {
    error: { color: "#ff4444", icon: "error" },
    success: { color: "#52dea2", icon: "check_circle" },
    info: { color: "#ffb3b0", icon: "info" },
  };
  const { color, icon } = config[type];

  // Get or create toast container
  const root = document.getElementById("phone-screen") || document.body;
  let container = document.getElementById(TOAST_CONTAINER_ID) as HTMLElement;

  if (!container) {
    container = document.createElement("div");
    container.id = TOAST_CONTAINER_ID;
    Object.assign(container.style, {
      position: "absolute",
      top: "4.5rem",
      right: "1rem",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      zIndex: "9999",
      maxWidth: "calc(100% - 2rem)",
      pointerEvents: "none",
    });
    root.appendChild(container);
  }

  // Remove oldest toast if we're at max capacity
  const existingToasts = container.querySelectorAll(".toast-item");
  if (existingToasts.length >= MAX_TOASTS) {
    const oldestToast = existingToasts[existingToasts.length - 1];
    (oldestToast as HTMLElement).style.opacity = "0";
    (oldestToast as HTMLElement).style.transform = "translateX(8px)";
    setTimeout(() => oldestToast.remove(), 200);
  }

  const toast = document.createElement("div");
  toast.className = "toast-item";
  toast.innerHTML = `
    <span class="material-symbols-outlined" style="font-size:14px;font-variation-settings:'FILL' 1;color:${color};flex-shrink:0;">${icon}</span>
    <span style="font-size:12px;font-weight:600;color:#e5e2e1;font-family:'Inter',sans-serif;">${message}</span>
  `;
  Object.assign(toast.style, {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(28,28,28,0.92)",
    backdropFilter: "blur(12px)",
    border: `1px solid ${color}33`,
    borderLeft: `3px solid ${color}`,
    borderRadius: "8px",
    padding: "7px 12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
    opacity: "0",
    transform: "translateX(8px)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
    whiteSpace: "normal",
    wordBreak: "break-word",
    pointerEvents: "auto",
  });

  // Insert at the top
  container.insertBefore(toast, container.firstChild);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(8px)";
    setTimeout(() => {
      toast.remove();
      // Clean up container if empty
      if (container.children.length === 0) {
        container.remove();
      }
    }, 200);
  }, 2500);
}
