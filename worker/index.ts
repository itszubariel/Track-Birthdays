export interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/__scheduled') {
      await this.scheduled({}, env, {})
      return new Response('OK')
    }
    return new Response('Track Birthdays Worker')
  },

  async scheduled(_event: any, env: Env, _ctx: any) {
  const res = await fetch(`${env.SUPABASE_URL}/functions/v1/send-birthday-notifications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  console.log('Edge function response:', await res.text())
}
}