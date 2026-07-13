import { useState } from 'react'
import { signIn, signUp, supabase } from './supabase.js'

// rfplab.com brand: black + cream
const C = {
  black:"#111111", ink:"#1E1E1E", charcoal:"#2A2A2A",
  cream:"#F5F0E8", warmWhite:"#FDFCF9", parchment:"#EDE8DF",
  sand:"#D4C9B8", stone:"#8C8070", ash:"#5A534A",
  gold:"#C9A84C", goldlt:"#F5EDD4",
  olive:"#5C6B2E", olivelt:"#EBF0DC",
  crimson:"#7A1F1F", crimsonlt:"#F5E0E0",
}

function Logo() {
  const bW=210, bH=130, gap=10, labW=32, sc=0.44;
  const tot = bW + gap + labW;
  const labCX = bW + gap + labW/2, labCY = bH/2;
  return (
    <svg width={tot*sc} height={bH*sc} viewBox={`0 0 ${tot} ${bH}`}
      xmlns="http://www.w3.org/2000/svg" style={{display:"block",margin:"0 auto 10px"}}>
      <rect x={0} y={0} width={bW} height={bH} fill="#111111"/>
      <text x={bW/2} y={bH*0.72} textAnchor="middle"
        fontFamily="'Arial Black','Impact','Franklin Gothic Heavy',Arial,sans-serif"
        fontWeight="900" fontSize="72" letterSpacing="14" fill="#F5F0E8">R F P</text>
      <text x={labCX} y={labCY} textAnchor="middle" dominantBaseline="central"
        fontFamily="'Arial Black','Impact','Franklin Gothic Heavy',Arial,sans-serif"
        fontWeight="900" fontSize="26" letterSpacing="5" fill="#111111"
        transform={`rotate(90,${labCX},${labCY})`}>LAB</text>
    </svg>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:${C.warmWhite};color:${C.ash};}
  input,select{font-family:'Inter',sans-serif;font-size:13px;border:1px solid ${C.sand};
    border-radius:4px;padding:9px 12px;background:${C.warmWhite};color:${C.ash};width:100%;}
  input:focus,select:focus{outline:none;border-color:${C.gold};box-shadow:0 0 0 3px rgba(201,168,76,.1);}
  label{font-size:10px;font-weight:800;color:${C.stone};display:block;margin-bottom:4px;
    text-transform:uppercase;letter-spacing:1px;}
  .auth-btn{width:100%;padding:11px;border:none;border-radius:4px;font-weight:800;
    font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;transition:opacity .15s;
    letter-spacing:.5px;text-transform:uppercase;}
  .auth-btn:hover{opacity:.88;}
  .auth-btn:disabled{opacity:.4;cursor:not-allowed;}
`

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('signin')
  const [role, setRole] = useState('shipper')
  const [form, setForm] = useState({ email:'', password:'', name:'', company:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const urlParams = new URLSearchParams(window.location.search)
  const inviteToken = urlParams.get('invite')
  const inviteRole  = urlParams.get('role')
  const inviteEmail = urlParams.get('email')
  const inviteCompany = urlParams.get('company')
  const isInvited = !!inviteToken

  if (isInvited && mode === 'signin') {
    setTimeout(() => {
      setMode('signup')
      if (inviteEmail) setForm(f => ({...f, email: inviteEmail, company: inviteCompany || ''}))
      if (inviteRole)  setRole(inviteRole)
    }, 0)
  }

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleSignIn = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    const { data, error } = await signIn(form.email, form.password)
    if (error) { setError(error.message); setLoading(false); return }
    onAuth(data.user)
  }

  const handleSignUp = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    const { data, error } = await signUp(form.email, form.password, {
      full_name: form.name, role: isInvited ? inviteRole : role, company: form.company,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess('Account created. Sign in to continue.')
    setMode('signin'); setLoading(false)
  }

  const handleForgot = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}`,
    })
    if (error) setError(error.message)
    else setSuccess('Reset email sent. Check your inbox.')
    setLoading(false)
  }

  const roleOptions = [['shipper','Shipper'],['carrier','Carrier / Broker']]

  return (
    <>
      <style>{css}</style>
      {/* Full-page: black left panel, warm white right */}
      <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Inter',sans-serif"}}>

        {/* Left — brand panel */}
        <div style={{width:"42%",background:C.black,display:"flex",flexDirection:"column",
          justifyContent:"center",padding:"60px 56px",position:"relative"}}>
          {/* Subtle grid texture via linear-gradient */}
          <div style={{position:"absolute",inset:0,opacity:.03,backgroundImage:"linear-gradient(rgba(245,240,232,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(245,240,232,.5) 1px,transparent 1px)",backgroundSize:"32px 32px"}}/>
          <div style={{position:"relative"}}>
            <div style={{marginBottom:48}}>
              <Logo/>
            </div>
            <div style={{fontWeight:800,fontSize:28,color:C.cream,lineHeight:1.2,letterSpacing:"-0.5px",marginBottom:16}}>
              Transportation<br/>Procurement<br/>Intelligence
            </div>
            <div style={{fontSize:13,color:"rgba(245,240,232,.45)",lineHeight:1.8,maxWidth:280,fontWeight:400}}>
              Expert RFP management, carrier engagement, and award analysis — purpose-built for freight.
            </div>
            <div style={{marginTop:48,paddingTop:32,borderTop:"1px solid rgba(245,240,232,.08)"}}>
              {["Full Truckload RFP Management","Spot Load Procurement","Carrier Bid Analysis","Award Scenario Modeling"].map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <div style={{width:5,height:5,background:C.gold,borderRadius:"50%",flexShrink:0}}/>
                  <span style={{fontSize:12,color:"rgba(245,240,232,.5)",fontWeight:500}}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form panel */}
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
          padding:"40px 60px",background:C.warmWhite}}>
          <div style={{width:"100%",maxWidth:380}}>
            <div style={{marginBottom:32}}>
              <div style={{fontSize:22,fontWeight:800,color:C.black,letterSpacing:"-.5px",marginBottom:6}}>
                {mode==='signin'?"Sign in to RFPlab"
                 :mode==='forgot'?"Reset your password"
                 :isInvited?`You've been invited`
                 :"Create your account"}
              </div>
              <div style={{fontSize:12,color:C.stone}}>
                {isInvited ? `Joining as ${inviteRole}${inviteCompany?` · ${inviteCompany}`:""}` : "Freight Intelligence Platform"}
              </div>
            </div>

            {error && (
              <div style={{background:C.crimsonlt,color:C.crimson,borderLeft:`3px solid ${C.crimson}`,
                padding:"10px 14px",borderRadius:4,fontSize:12,marginBottom:16,fontWeight:500}}>{error}</div>
            )}
            {success && (
              <div style={{background:C.olivelt,color:C.olive,borderLeft:`3px solid ${C.olive}`,
                padding:"10px 14px",borderRadius:4,fontSize:12,marginBottom:16,fontWeight:500}}>{success}</div>
            )}

            {mode==='signin' && (
              <form onSubmit={handleSignIn}>
                <div style={{marginBottom:14}}>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com" required autoFocus/>
                </div>
                <div style={{marginBottom:24}}>
                  <label>Password</label>
                  <input type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" required/>
                </div>
                <button type="submit" className="auth-btn" disabled={loading}
                  style={{background:C.black,color:C.cream}}>
                  {loading ? "Signing in…" : "Sign In →"}
                </button>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:18,fontSize:12}}>
                  <span style={{color:C.gold,cursor:"pointer",fontWeight:600}} onClick={()=>{setMode('forgot');setError('');setSuccess('')}}>Forgot password?</span>
                  <span style={{color:C.stone,cursor:"pointer"}} onClick={()=>{setMode('signup');setError('');setSuccess('')}}>Create account →</span>
                </div>
              </form>
            )}

            {mode==='signup' && (
              <form onSubmit={handleSignUp}>
                {!isInvited && (
                  <div style={{marginBottom:16}}>
                    <label style={{marginBottom:8}}>I am a</label>
                    <div style={{display:"flex",gap:8}}>
                      {roleOptions.map(([v,l])=>(
                        <div key={v} onClick={()=>setRole(v)}
                          style={{flex:1,padding:"10px",border:`2px solid ${role===v?C.gold:C.sand}`,
                            borderRadius:4,textAlign:"center",cursor:"pointer",
                            background:role===v?C.goldlt:C.warmWhite,
                            fontSize:12,fontWeight:role===v?800:500,
                            color:role===v?C.black:C.ash,transition:"all .15s"}}>
                          {l}
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:10,color:C.stone,marginTop:8,textAlign:"center",letterSpacing:.5}}>
                      ADMIN ACCOUNTS ARE CREATED BY RFPLAB
                    </div>
                  </div>
                )}
                {isInvited && (
                  <div style={{background:C.goldlt,border:`1px solid #D4B870`,borderRadius:6,
                    padding:"10px 14px",marginBottom:14,fontSize:12,color:"#7A5A10",fontWeight:500}}>
                    🔒 Joining as <strong>{inviteRole}</strong>{inviteCompany?` for ${inviteCompany}`:''} — role set by admin.
                  </div>
                )}
                <div style={{marginBottom:12}}><label>Full Name</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="First Last" required/></div>
                <div style={{marginBottom:12}}><label>Company</label><input value={form.company} onChange={e=>set('company',e.target.value)} placeholder="Company name" required/></div>
                <div style={{marginBottom:12}}><label>Email</label>
                  <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com" required
                    readOnly={isInvited&&!!inviteEmail} style={isInvited&&inviteEmail?{background:C.parchment,color:C.stone}:{}}/>
                </div>
                <div style={{marginBottom:24}}><label>Password</label><input type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Min 6 characters" minLength={6} required/></div>
                <button type="submit" className="auth-btn" disabled={loading}
                  style={{background:C.olive,color:"white"}}>
                  {loading ? "Creating account…" : "Create Account →"}
                </button>
                <div style={{textAlign:"center",marginTop:16,fontSize:12,color:C.stone}}>
                  Already have an account?{' '}
                  <span style={{color:C.gold,cursor:"pointer",fontWeight:600}} onClick={()=>{setMode('signin');setError('');setSuccess('')}}>Sign in →</span>
                </div>
              </form>
            )}

            {mode==='forgot' && (
              <form onSubmit={handleForgot}>
                <div style={{marginBottom:24}}>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com" required autoFocus/>
                </div>
                <button type="submit" className="auth-btn" disabled={loading}
                  style={{background:C.ash,color:"white"}}>
                  {loading ? "Sending…" : "Send Reset Email"}
                </button>
                <div style={{textAlign:"center",marginTop:16,fontSize:12}}>
                  <span style={{color:C.gold,cursor:"pointer",fontWeight:600}} onClick={()=>{setMode('signin');setError('');setSuccess('')}}>← Back to sign in</span>
                </div>
              </form>
            )}

            <div style={{marginTop:40,paddingTop:20,borderTop:`1px solid ${C.sand}`,
              fontSize:10,color:C.stone,textAlign:"center",letterSpacing:.5,textTransform:"uppercase"}}>
              Secure · Encrypted · rfplab.com
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
