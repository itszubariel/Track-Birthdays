import './style.css'
import { supabase } from './supabase'
import { renderAuth } from './pages/auth'
import { renderApp } from './app'
import { registerSW } from 'virtual:pwa-register'
import { renderResetPassword } from './pages/resetPassword'
import { renderOnboarding } from './pages/onboarding'
import { showSplash, hideSplash } from './splash'
import { loadAll, clearStore } from './store'

registerSW({ immediate: true })

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="phone-shell">
    <div id="phone-screen"></div>
  </div>
`
;(window as any).__root = () => document.getElementById('phone-screen')!

// Show splash immediately before anything else
showSplash()

// Module-level auth state — never resets unless user explicitly signs out
let isAuthenticated = false
let authListenerRegistered = false

async function routeAuthenticatedUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { await hideSplash(); renderAuth(); return }
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, onboarding_complete')
    .eq('id', user.id)
    .single()
  if (!profile || !profile.onboarding_complete) {
    await hideSplash()
    renderOnboarding((window as any).__root())
  } else {
    await hideSplash()
    renderApp()
  }
}

async function init() {
  if (authListenerRegistered) return
  authListenerRegistered = true

  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const isRecovery = hashParams.get('type') === 'recovery'

  if (isRecovery) {
    await hideSplash()
    renderResetPassword()
    return
  }

  const { data: { session } } = await supabase.auth.getSession()
  isAuthenticated = !!session

  if (session) {
    // Load all data while splash is still showing, enforce 800ms minimum
    await Promise.all([
      loadAll(session.user.id),
      new Promise<void>(resolve => setTimeout(resolve, 800)),
    ])
    await routeAuthenticatedUser()
  } else {
    await hideSplash()
    renderAuth()
  }

  supabase.auth.onAuthStateChange(async (_event, _session) => {
    if (_event === 'INITIAL_SESSION') return
    if (_event === 'TOKEN_REFRESHED') return
    if (_event === 'USER_UPDATED') return

    if (_event === 'SIGNED_IN') {
      if (!isAuthenticated && _session) {
        isAuthenticated = true
        showSplash()
        await Promise.all([
          loadAll(_session.user.id),
          new Promise<void>(resolve => setTimeout(resolve, 800)),
        ])
        await routeAuthenticatedUser()
      }
      return
    }

    if (_event === 'SIGNED_OUT') {
      isAuthenticated = false
      clearStore()
      renderAuth()
      return
    }

    if (_event === 'PASSWORD_RECOVERY') {
      renderResetPassword()
    }
  })

  window.addEventListener('storage', async (e) => {
    if (e.key === 'onboarding_complete') {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (s) renderApp()
    }
  })
}

init()
