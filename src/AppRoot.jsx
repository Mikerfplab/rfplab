import { useState, useEffect } from 'react'
import { supabase, getProfile } from './supabase.js'
import Auth from './Auth.jsx'
import App from './App.jsx'

export default function AppRoot() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfile(session.user)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(user) {
    setLoading(true)
    const p = await getProfile(user.id)
    setProfile(p)
    setLoading(false)
  }

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0D1F3C",flexDirection:"column",gap:16}}>
      <svg width={97} height={40} viewBox="0 0 176 74" xmlns="http://www.w3.org/2000/svg">
        <rect x={0} y={0} width={148} height={74} fill="white"/>
        <text x={74} y={54} textAnchor="middle" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="44" letterSpacing="10" fill="#0D1F3C">R F P</text>
        <text x={162} y={37} textAnchor="middle" dominantBaseline="central" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="18" letterSpacing="3" fill="white" transform="rotate(90,162,37)">LAB</text>
      </svg>
      <div style={{color:"rgba(255,255,255,.5)",fontSize:12,fontFamily:"'Inter',sans-serif"}}>Loading…</div>
    </div>
  )

  if (!session) return <Auth onAuth={(user) => loadProfile(user)} />

  // Pass the real role from the database profile
  // Falls back to 'shipper' if profile hasn't loaded yet
  const role = profile?.role || 'shipper'

  return <App dbUser={session.user} dbProfile={profile} initialRole={role} />
}
