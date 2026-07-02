import { useState } from 'react'
import { signIn, signUp, supabase } from './supabase.js'

const C = {
  navy:"#0D1F3C", slate:"#1E3A5F", steel:"#2B5F8E", sky:"#4A9FC8",
  green:"#1A7A4A", greenlt:"#E6F4EC", gray:"#64748B", line:"#E2E8F0",
  text:"#1A2B3C", red:"#B91C1C", redlt:"#FEE2E2", off:"#F5F8FB", ice:"#D6EDF7",
}

function Logo() {
  const bW=148,bH=74,lW=22,tot=bW+6+lW,sc=0.55
  return (
    <svg width={tot*sc} height={bH*sc} viewBox={`0 0 ${tot} ${bH}`} xmlns="http://www.w3.org/2000/svg" style={{display:"block",margin:"0 auto 8px"}}>
      <rect x={0} y={0} width={bW} height={bH} fill={C.navy}/>
      <text x={bW/2} y={bH*.735} textAnchor="middle" fontFamily="'Arial Black',Arial,sans-serif" fontWeight="900" fontSize="44" letterSpacing="10" fill="white">R F P</text>
      <text x={bW+6+lW/2} y={bH*.5} textAnchor="middle" dominantBaseline="central" fontFamily="'Arial Black',Arial,sans-serif" fontWeight="900" fontSize="18" letterSpacing="3" fill={C.navy} transform={`rotate(90,${bW+6+lW/2},${bH*.5})`}>LAB</text>
    </svg>
  )
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:${C.off};color:${C.text};}
  input,select{font-family:'Inter',sans-serif;font-size:13px;border:1px solid ${C.line};
    border-radius:6px;padding:9px 12px;background:white;color:${C.text};width:100%;}
  input:focus,select:focus{outline:none;border-color:${C.sky};box-shadow:0 0 0 3px rgba(74,159,200,.15);}
  label{font-size:11px;font-weight:600;color:${C.gray};display:block;margin-bottom:4px;
    text-transform:uppercase;letter-spacing:.3px;}
  .auth-btn{width:100%;padding:11px;border:none;border-radius:7px;font-weight:700;
    font-size:14px;cursor:pointer;font-family:'Inter',sans-serif;transition:opacity .15s;}
  .auth-btn:hover{opacity:.9;}
  .auth-btn:disabled{opacity:.5;cursor:not-allowed;}
`

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('signin') // signin | signup | forgot | invited
  // invited = user arrived via an admin invite link with ?invite=TOKEN in URL

  const [role, setRole] = useState('shipper') // only shipper or carrier — no admin in public signup
  const [form, setForm] = useState({ email:'', password:'', name:'', company:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Check for invite token in URL on mount
  const urlParams = new URLSearchParams(window.location.search)
  const inviteToken = urlParams.get('invite')
  const inviteRole  = urlParams.get('role')   // 'shipper' or 'carrier'
  const inviteEmail = urlParams.get('email')
  const inviteCompany = urlParams.get('company')

  // If there's an invite link, pre-fill and lock the signup form
  const isInvited = !!inviteToken
  if (isInvited && mode === 'signin') {
    // auto-switch to signup on first render if invite params present
    setTimeout(() => {
      setMode('signup')
      if (inviteEmail) setForm(f => ({...f, email: inviteEmail, company: inviteCompany || ''}))
      if (inviteRole)  setRole(inviteRole)
    }, 0)
  }

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error } = await signIn(form.email, form.password)
    if (error) { setError(error.message); setLoading(false); return }
    onAuth(data.user)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error } = await signUp(form.email, form.password, {
      full_name: form.name,
      role:      isInvited ? inviteRole : role, // use invite role if invited
      company:   form.company,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess('Account created! You can now sign in.')
    setMode('signin')
    setLoading(false)
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}`,
    })
    if (error) setError(error.message)
    else setSuccess('Password reset email sent. Check your inbox.')
    setLoading(false)
  }

  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
        background:`linear-gradient(135deg, ${C.navy} 0%, ${C.slate} 100%)`,padding:20}}>
        <div style={{background:"white",borderRadius:14,padding:"36px 40px",width:"100%",
          maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,.25)"}}>

          <Logo/>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:18,fontWeight:700,color:C.navy}}>
              {mode==='signin' ? "Welcome back"
               : mode==='forgot' ? "Reset your password"
               : isInvited ? `You've been invited`
               : "Create your account"}
            </div>
            <div style={{fontSize:12,color:C.gray,marginTop:3}}>
              {isInvited
                ? `Join as ${inviteRole || 'a user'} — ${inviteCompany || ''}`
                : "Freight Intelligence Platform"}
            </div>
          </div>

          {error   && <div style={{background:C.redlt,color:C.red,borderLeft:`3px solid ${C.red}`,padding:"10px 14px",borderRadius:7,fontSize:12,marginBottom:14}}>{error}</div>}
          {success && <div style={{background:C.greenlt,color:C.green,borderLeft:`3px solid ${C.green}`,padding:"10px 14px",borderRadius:7,fontSize:12,marginBottom:14}}>{success}</div>}

          {/* ── SIGN IN ── */}
          {mode==='signin' && (
            <form onSubmit={handleSignIn}>
              <div style={{marginBottom:12}}>
                <label>Email</label>
                <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com" required autoFocus/>
              </div>
              <div style={{marginBottom:20}}>
                <label>Password</label>
                <input type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" required/>
              </div>
              <button type="submit" className="auth-btn" disabled={loading} style={{background:C.navy,color:"white"}}>
                {loading ? "Signing in…" : "Sign In →"}
              </button>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:16,fontSize:12}}>
                <span style={{color:C.steel,cursor:"pointer"}} onClick={()=>{setMode('forgot');setError('');setSuccess('')}}>Forgot password?</span>
                <span style={{color:C.steel,cursor:"pointer"}} onClick={()=>{setMode('signup');setError('');setSuccess('')}}>Create account →</span>
              </div>
            </form>
          )}

          {/* ── SIGN UP (only shipper or carrier — no admin option) ── */}
          {mode==='signup' && (
            <form onSubmit={handleSignUp}>
              {/* Role selector — hidden if arriving via invite (role is pre-set) */}
              {!isInvited && (
                <div style={{marginBottom:14}}>
                  <label style={{marginBottom:6}}>I am a</label>
                  <div style={{display:"flex",gap:8}}>
                    {[['shipper','Shipper'],['carrier','Carrier / Broker']].map(([v,l])=>(
                      <div key={v} onClick={()=>setRole(v)} style={{flex:1,padding:"9px 10px",
                        border:`2px solid ${role===v ? C.sky : C.line}`,borderRadius:7,
                        textAlign:"center",cursor:"pointer",
                        background:role===v ? C.ice : "white",
                        fontSize:12,fontWeight:role===v ? 700 : 500}}>
                        {l}
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:10,color:C.gray,marginTop:6,textAlign:"center"}}>
                    Admin accounts are created by RFPlab — contact us to get set up.
                  </div>
                </div>
              )}

              {isInvited && (
                <div style={{background:C.ice,border:`1px solid ${C.sky}`,borderRadius:8,
                  padding:"10px 14px",marginBottom:14,fontSize:12,color:C.slate}}>
                  🔒 You're joining as a <strong>{inviteRole}</strong>
                  {inviteCompany ? ` for ${inviteCompany}` : ''}. This role was set by your admin.
                </div>
              )}

              <div style={{marginBottom:10}}><label>Full Name</label>
                <input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="First Last" required/>
              </div>
              <div style={{marginBottom:10}}><label>Company</label>
                <input value={form.company} onChange={e=>set('company',e.target.value)} placeholder="Company name" required/>
              </div>
              <div style={{marginBottom:10}}><label>Email</label>
                <input type="email" value={form.email} onChange={e=>set('email',e.target.value)}
                  placeholder="you@company.com" required
                  readOnly={isInvited && !!inviteEmail}
                  style={isInvited && inviteEmail ? {background:C.off,color:C.gray} : {}}/>
              </div>
              <div style={{marginBottom:20}}><label>Password</label>
                <input type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Min 6 characters" minLength={6} required/>
              </div>
              <button type="submit" className="auth-btn" disabled={loading} style={{background:C.green,color:"white"}}>
                {loading ? "Creating account…" : "Create Account →"}
              </button>
              <div style={{textAlign:"center",marginTop:14,fontSize:12}}>
                Already have an account?{' '}
                <span style={{color:C.steel,cursor:"pointer"}} onClick={()=>{setMode('signin');setError('');setSuccess('')}}>Sign in →</span>
              </div>
            </form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {mode==='forgot' && (
            <form onSubmit={handleForgot}>
              <div style={{marginBottom:20}}>
                <label>Email</label>
                <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com" required autoFocus/>
              </div>
              <button type="submit" className="auth-btn" disabled={loading} style={{background:C.steel,color:"white"}}>
                {loading ? "Sending…" : "Send Reset Email"}
              </button>
              <div style={{textAlign:"center",marginTop:14,fontSize:12}}>
                <span style={{color:C.steel,cursor:"pointer"}} onClick={()=>{setMode('signin');setError('');setSuccess('')}}>← Back to sign in</span>
              </div>
            </form>
          )}

          <div style={{marginTop:24,paddingTop:18,borderTop:`1px solid ${C.line}`,
            fontSize:11,color:C.gray,textAlign:"center",lineHeight:1.6}}>
            Secure login · Data encrypted at rest · rfplab.com
          </div>
        </div>
      </div>
    </>
  )
}
