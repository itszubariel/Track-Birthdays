import { createClient } from '@supabase/supabase-js'

export default async (req: Request) => {
  const { userId } = await req.json()
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.auth.admin.deleteUser(userId)
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
}

export const config = { path: '/api/delete-user' }