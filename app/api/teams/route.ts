import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET(req: Request) {
  const supabase = createClient()

  // Check if the user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch teams for the authenticated user
  const { data: teams, error } = await supabase
    .from('team_members' as any)
    .select(`
      team_id,
      role,
      teams:team_id (
        id,
        name,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }

  if (!teams) {
    return NextResponse.json([], { status: 200 })
  }

  // Transform the data to a more convenient format
  const formattedTeams = teams.map((item: any) => ({
    ...(item.teams || {}),
    role: item.role
  }))

  return NextResponse.json(formattedTeams)
}