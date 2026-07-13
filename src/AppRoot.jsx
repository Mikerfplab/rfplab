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
      <div style={{fontSize:28,fontWeight:900,color:"white",letterSpacing:4,fontFamily:"'Arial Black',Arial,sans-serif"}}>RFP <span style={{fontSize:14,verticalAlign:"super",letterSpacing:2}}>LAB</span></div>
      <div style={{color:"rgba(255,255,255,.5)",fontSize:12,fontFamily:"'Inter',sans-serif"}}>Loading…</div>
    </div>
  )

  if (!session) return <Auth onAuth={(user) => loadProfile(user)} />

  // Pass the real role from the database profile
  // Falls back to 'shipper' if profile hasn't loaded yet
  const role = profile?.role || 'shipper'

  return <App dbUser={session.user} dbProfile={profile} initialRole={role} />
}
