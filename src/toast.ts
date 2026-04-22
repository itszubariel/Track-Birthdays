export function showToast(message: string, type: 'error' | 'success' | 'info' = 'info') {
  const existing = document.getElementById('toast')
  if (existing) { existing.style.opacity = '0'; setTimeout(() => existing.remove(), 150) }

  const config: Record<string, { color: string; icon: string }> = {
    error: { color: '#ff4444', icon: 'error' },
    success: { color: '#52dea2', icon: 'check_circle' },
    info: { color: '#ffb3b0', icon: 'info' },
  }
  const { color, icon } = config[type]

  const toast = document.createElement('div')
  toast.id = 'toast'
  toast.innerHTML = `
    <span class="material-symbols-outlined" style="font-size:14px;font-variation-settings:'FILL' 1;color:${color};flex-shrink:0;">${icon}</span>
    <span style="font-size:12px;font-weight:600;color:#e5e2e1;font-family:'Inter',sans-serif;">${message}</span>
  `
  Object.assign(toast.style, {
    position: 'absolute',
    top: '4.5rem',
    right: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(28,28,28,0.92)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${color}33`,
    borderLeft: `3px solid ${color}`,
    borderRadius: '8px',
    padding: '7px 12px',
    zIndex: '9999',
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    opacity: '0',
    transform: 'translateX(8px)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    maxWidth: 'calc(100% - 2rem)',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  })

  const root = document.getElementById('phone-screen') || document.body
  root.appendChild(toast)

  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(0)'
  })

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(8px)'
    setTimeout(() => toast.remove(), 200)
  }, 2500)
}
