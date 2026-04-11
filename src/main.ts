import './style.css'
import { supabase } from './supabase'
import { renderAuth } from './pages/auth'
import { renderApp } from './app'
import { registerSW } from 'virtual:pwa-register'
import { renderResetPassword } from './pages/resetPassword'
import { renderOnboarding } from './pages/onboarding'

registerSW({ immediate: true })

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="phone-shell">
    <div id="phone-screen"></div>
  </div>
`
;(window as any).__root = () => document.getElementById('phone-screen')!

// Module-level auth state — never resets unless user explicitly signs out
let isAuthenticated = false
let authListenerRegistered = false

async function routeAuthenticatedUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { renderAuth(); return }
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, onboarding_complete')
    .eq('id', user.id)
    .single()
  if (!profile || !profile.onboarding_complete) {
    renderOnboarding((window as any).__root())
  } else {
    renderApp()
  }
}

async function init() {
  if (authListenerRegistered) return
  authListenerRegistered = true

  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const isRecovery = hashParams.get('type') === 'recovery'

  if (isRecovery) {
    renderResetPassword()
  }

  // Resolve initial session before registering the listener.
  // Supabase fires SIGNED_IN / INITIAL_SESSION synchronously when the listener
  // is registered if a session already exists — resolving first means those
  // events arrive while isAuthenticated is already true, so they are ignored.
  const { data: { session } } = await supabase.auth.getSession()
  isAuthenticated = !!session

  if (!isRecovery) {
    if (session) await routeAuthenticatedUser()
    else renderAuth()
  }

  supabase.auth.onAuthStateChange(async (_event, _session) => {
    // Ignore non-transition events — these fire on tab focus / token refresh
    if (_event === 'INITIAL_SESSION') return
    if (_event === 'TOKEN_REFRESHED') return
    if (_event === 'USER_UPDATED') return

    if (_event === 'SIGNED_IN') {
      // Only re-render if we were genuinely signed out before
      if (!isAuthenticated && _session) {
        isAuthenticated = true
        await routeAuthenticatedUser()
      }
      return
    }

    if (_event === 'SIGNED_OUT') {
      isAuthenticated = false
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
