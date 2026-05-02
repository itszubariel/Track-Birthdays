export function setButtonLoading(btnId: string, loadingText = 'Saving...') {
  const btn = document.getElementById(btnId) as HTMLButtonElement
  if (!btn) return
  btn.disabled = true
  btn.dataset.originalText = btn.textContent || ''
  btn.textContent = loadingText
  btn.style.opacity = '0.7'
}

export function resetButton(btnId: string) {
  const btn = document.getElementById(btnId) as HTMLButtonElement
  if (!btn) return
  btn.disabled = false
  btn.textContent = btn.dataset.originalText || ''
  btn.style.opacity = '1'
}