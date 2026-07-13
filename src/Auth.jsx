import { useState } from 'react'
import { signIn, signUp, supabase } from './supabase.js'

// rfplab.com brand: deep teal + bright green
const C = {
  black:"#0A1A14", ink:"#0F2318", charcoal:"#1A3028",
  warmWhite:"#F8FAF9", parchment:"#EEF3F0",
  sand:"#C8D9D2", stone:"#6B8B7E", ash:"#2D4A3E",
  green:"#00C853", greenlt:"#E6F9EE", greendk:"#00A043",
  rust:"#B71C1C", rustlt:"#FFEBEE",
  cream:"#E8F2EE",
}

function Logo() {
  const sc=0.38, blockFill="#0A1A14", rfpFill="#00C853", labFill="#0A1A14";
  const R=[[28,24,18,112],[28,24,64,18],[74,24,18,46],[28,66,58,16],[60,82,16,54],[76,108,22,28]];
  const F=[[112,24,18,112],[112,24,62,18],[112,68,50,16]];
  const P=[[198,24,18,112],[198,24,62,18],[242,24,18,46],[198,66,62,18]];
  return (
    <svg width={510*sc} height={160*sc} viewBox="0 0 510 160"
      xmlns="http://www.w3.org/2000/svg" style={{display:"block",margin:"0 auto 12px"}}>
      <rect x={0} y={0} width={420} height={160} fill={blockFill}/>
      {R.map(([x,y,w,h],i)=><rect key={i} x={x} y={y} width={w} height={h} fill={rfpFill}/>)}
      {F.map(([x,y,w,h],i)=><rect key={i} x={x} y={y} width={w} height={h} fill={rfpFill}/>)}
      {P.map(([x,y,w,h],i)=><rect key={i} x={x} y={y} width={w} height={h} fill={rfpFill}/>)}
      <g transform="translate(469,80) rotate(90)" fill={labFill}>
        <rect x={-76} y={-28} width={11} height={56}/>
        <rect x={-76} y={18} width={33} height={11}/>
        <rect x={-32} y={-28} width={11} height={56}/>
        <rect x={3} y={-28} width={11} height={56}/>
        <rect x={-32} y={-28} width={46} height={11}/>
        <rect x={-32} y={2} width={46} height={10}/>
        <rect x={24} y={-28} width={11} height={56}/>
        <rect x={24} y={-28} width={34} height={11}/>
        <rect x={46} y={-28} width={12} height={30}/>
        <rect x={24} y={0} width={34} height={10}/>
        <rect x={46} y={10} width={12} height={30}/>
        <rect x={24} y={18} width={34} height={11}/>
      </g>
    </svg>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Barlow+Condensed:wght@900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:${C.warmWhite};color:${C.ash};}
  input,select{font-family:'Inter',sans-serif;font-size:13px;border:1px solid ${C.sand};
    border-radius:4px;padding:9px 12px;background:${C.warmWhite};color:${C.ash};width:100%;}
  input:focus,select:focus{outline:none;border-color:${C.green};box-shadow:0 0 0 3px rgba(0,200,83,.1);}
  label{font-size:10px;font-weight:800;color:${C.stone};display:block;margin-bottom:4px;
    text-transform:uppercase;letter-spacing:1px;}
  .auth-btn{width:100%;padding:12px;border:none;border-radius:4px;font-weight:800;
    font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;
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

  return (
    <>
      <style>{css}</style>
      <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Inter',sans-serif"}}>

        {/* Left — dark teal brand panel */}
        <div style={{width:"44%",background:C.black,display:"flex",flexDirection:"column",
          justifyContent:"center",padding:"60px 52px",position:"relative"}}>
          {/* Subtle dot grid */}
          <div style={{position:"absolute",inset:0,opacity:.04,backgroundImage:"radial-gradient(circle,rgba(0,200,83,.8) 1px,transparent 1px)",backgroundSize:"28px 28px"}}/>
          <div style={{position:"relative"}}>
            <div style={{marginBottom:44}}><Logo/></div>
            <div style={{fontWeight:800,fontSize:28,color:C.warmWhite,lineHeight:1.15,letterSpacing:"-.5px",marginBottom:16}}>
              Transportation<br/>Procurement<br/>Intelligence
            </div>
            <div style={{fontSize:13,color:"rgba(232,242,238,.45)",lineHeight:1.8,maxWidth:280}}>
              Expert RFP management, carrier engagement, and award analysis — purpose-built for freight.
            </div>
            <div style={{marginTop:44,paddingTop:32,borderTop:"1px solid rgba(232,242,238,.08)"}}>
              {["Full Truckload RFP Management","Spot Load Procurement","Carrier Bid Analysis","Award Scenario Modeling"].map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <div style={{width:5,height:5,background:C.green,borderRadius:"50%",flexShrink:0}}/>
                  <span style={{fontSize:12,color:"rgba(232,242,238,.5)",fontWeight:500}}>{f}</span>
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
                 :isInvited?"You've been invited"
                 :"Create your account"}
              </div>
              <div style={{fontSize:12,color:C.stone}}>
                {isInvited?`Joining as ${inviteRole}${inviteCompany?` · ${inviteCompany}`:""}` : "Freight Intelligence Platform"}
              </div>
            </div>

            {error && <div style={{background:C.rustlt,color:C.rust,borderLeft:`3px solid ${C.rust}`,padding:"10px 14px",borderRadius:4,fontSize:12,marginBottom:16,fontWeight:500}}>{error}</div>}
            {success && <div style={{background:C.greenlt,color:C.greendk,borderLeft:`3px solid ${C.green}`,padding:"10px 14px",borderRadius:4,fontSize:12,marginBottom:16,fontWeight:500}}>{success}</div>}

            {mode==='signin' && (
              <form onSubmit={handleSignIn}>
                <div style={{marginBottom:14}}><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com" required autoFocus/></div>
                <div style={{marginBottom:24}}><label>Password</label><input type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" required/></div>
                <button type="submit" className="auth-btn" disabled={loading} style={{background:C.black,color:C.green}}>
                  {loading?"Signing in…":"Sign In →"}
                </button>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:18,fontSize:12}}>
                  <span style={{color:C.green,cursor:"pointer",fontWeight:600}} onClick={()=>{setMode('forgot');setError('');setSuccess('')}}>Forgot password?</span>
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
                      {[['shipper','Shipper'],['carrier','Carrier / Broker']].map(([v,l])=>(
                        <div key={v} onClick={()=>setRole(v)} style={{flex:1,padding:"10px",
                          border:`2px solid ${role===v?C.green:C.sand}`,borderRadius:4,textAlign:"center",
                          cursor:"pointer",background:role===v?C.greenlt:C.warmWhite,
                          fontSize:12,fontWeight:role===v?800:500,color:role===v?C.black:C.ash,transition:"all .15s"}}>
                          {l}
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:10,color:C.stone,marginTop:8,textAlign:"center",letterSpacing:.5}}>ADMIN ACCOUNTS ARE CREATED BY RFPLAB</div>
                  </div>
                )}
                {isInvited && <div style={{background:C.greenlt,border:`1px solid ${C.green}`,borderRadius:6,padding:"10px 14px",marginBottom:14,fontSize:12,color:C.greendk,fontWeight:500}}>🔒 Joining as <strong>{inviteRole}</strong>{inviteCompany?` for ${inviteCompany}`:''} — role set by admin.</div>}
                <div style={{marginBottom:12}}><label>Full Name</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="First Last" required/></div>
                <div style={{marginBottom:12}}><label>Company</label><input value={form.company} onChange={e=>set('company',e.target.value)} placeholder="Company name" required/></div>
                <div style={{marginBottom:12}}><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com" required readOnly={isInvited&&!!inviteEmail} style={isInvited&&inviteEmail?{background:C.parchment,color:C.stone}:{}}/></div>
                <div style={{marginBottom:24}}><label>Password</label><input type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Min 6 characters" minLength={6} required/></div>
                <button type="submit" className="auth-btn" disabled={loading} style={{background:C.green,color:C.black}}>
                  {loading?"Creating account…":"Create Account →"}
                </button>
                <div style={{textAlign:"center",marginTop:16,fontSize:12,color:C.stone}}>
                  Already have an account?{' '}
                  <span style={{color:C.green,cursor:"pointer",fontWeight:600}} onClick={()=>{setMode('signin');setError('');setSuccess('')}}>Sign in →</span>
                </div>
              </form>
            )}

            {mode==='forgot' && (
              <form onSubmit={handleForgot}>
                <div style={{marginBottom:24}}><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com" required autoFocus/></div>
                <button type="submit" className="auth-btn" disabled={loading} style={{background:C.ash,color:"white"}}>
                  {loading?"Sending…":"Send Reset Email"}
                </button>
                <div style={{textAlign:"center",marginTop:16,fontSize:12}}>
                  <span style={{color:C.green,cursor:"pointer",fontWeight:600}} onClick={()=>{setMode('signin');setError('');setSuccess('')}}>← Back to sign in</span>
                </div>
              </form>
            )}

            <div style={{marginTop:40,paddingTop:20,borderTop:`1px solid ${C.sand}`,fontSize:10,color:C.stone,textAlign:"center",letterSpacing:.5,textTransform:"uppercase"}}>
              Secure · Encrypted · rfplab.com
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
