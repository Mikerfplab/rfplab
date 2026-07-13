import { useState, useEffect, useRef } from "react";
import {
  C,
  css,
  DEFAULT_BID_SETTINGS,
  ALL_CARRIERS,
  LANES,
  LANES_RAW,
  SEED_LOG,
  BID_DOC_DEFS,
  BID_DOCS,
  getDocUrl,
  EVENT_TYPE_META,
  formatTs,
  pctFromLow,
  toBracket,
  carrierFeedback,
  applyScenario,
  fmtDate,
  fmtDateShort,
  fmtDateTime,
  WTog,
  Toggle,
  FileUploadZone,
  WIZ_STEP_GROUPS,
  W_SUGGESTED,
  WStep1,
  WStep2,
  WStep3,
  WStep4,
  WStep5,
  WStep6,
  WStep7,
  WStep8,
  WStep9,
  WStep10,
  RFPWizard,
  RFPLabLogo,
  Sidebar,
  RoleSwitcher,
  ActivityLogPage,
  EventPage,
  SpotBoard,
  ResultsPage
} from './AppPart1.jsx';

function BidPage({ bidSettings, carrierName, addLog }) {
  const myLanes = LANES.map(l=>({...l, myBid: l.bids.find(b=>b.carrier===carrierName)}));
  const [rates, setRates] = useState(()=>{
    const r={};
    myLanes.forEach(l=>{ r[l.id]=l.myBid?.rate?.toString()||""; });
    return r;
  });
  const [saved,setSaved]=useState(false);

  const handleSave=()=>{
    const count = Object.values(rates).filter(Boolean).length;
    addLog({ carrier:carrierName, event:"rates_submitted", detail:`${count} lane rates submitted`, actor:"carrier" });
    setSaved(true);setTimeout(()=>setSaved(false),3000);
  };
  const submitted=Object.values(rates).filter(Boolean).length;

  return (
    <div>
      <div className="section-header">
        <div><div className="page-title">Submit Rates</div><div className="page-sub">Spindrift May–Aug 2026 · Flat linehaul per load · Deadline Apr 30, 2026</div></div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-outline">⬇ Download Lane Template</button>
          <button className="btn btn-outline">⬆ Upload Rate File</button>
          <button className="btn btn-green" onClick={handleSave}>✓ Save & Submit</button>
        </div>
      </div>
      {saved && <div className="alert success">✓ {submitted} rates submitted to Spindrift. You may update until Apr 30.</div>}
      <div className="alert info">💡 Enter your flat linehaul rate per load. Do not include FSC. Leave blank to pass on a lane. You will not see other carriers' rates or identities.</div>
      {bidSettings.feedbackEnabled && (
        <div className="alert purple">📊 This shipper has enabled bid feedback: <strong>{
          bidSettings.feedbackType==="rank" ? "your rank among all bidders" :
          bidSettings.feedbackType==="bracket" ? "% bracket above low bid (0–5%, 5–10%, 10–20%, 20%+)" :
          bidSettings.feedbackType==="percent" ? "your % above low bid" : "$ amount above low bid"
        }</strong> — visible after you submit.</div>
      )}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div className="table-scroll">
          <table>
            <thead><tr>
              <th>Lane</th><th>Type</th><th>Origin</th><th>Destination</th><th>Mode</th><th>Vol</th><th>Miles</th>
              <th style={{width:120}}>My Rate ($)</th>
              {bidSettings.feedbackEnabled && <th>Feedback</th>}
            </tr></thead>
            <tbody>
              {myLanes.map(l=>{
                const fb = rates[l.id] ? carrierFeedback({...l,bids:l.bids.map(b=>b.carrier===carrierName?{...b,rate:parseFloat(rates[l.id])||b.rate}:b)}, carrierName, bidSettings) : null;
                return (
                  <tr key={l.id}>
                    <td className="mono" style={{fontSize:11,color:C.stone}}>{l.id}</td>
                    <td><span className={`badge ${l.type.toLowerCase()}`}>{l.type}</span></td>
                    <td>{l.origCity}, {l.origSt}</td>
                    <td>{l.destCity}, {l.destSt}</td>
                    <td style={{fontSize:11}}>
                      <div>{l.mode}</div>
                      {(l.mode==="Reefer"||l.mode==="Frozen") && l.tempRange && (
                        <div style={{fontSize:9,color:C.green,fontWeight:700,marginTop:1}}>🌡 {l.tempRange}</div>
                      )}
                    </td>
                    <td className="mono">{Math.round(l.vol)}<div style={{fontSize:9,color:C.stone,fontWeight:400}}>{"{"}bidSettings?.volPeriod||"mo"{"}"}</div></td>
                    <td className="mono">{l.miles.toLocaleString()}</td>
                    <td>
                      <input className="rate-input" type="number" placeholder="—"
                        value={rates[l.id]||""}
                        onChange={e=>setRates(r=>({...r,[l.id]:e.target.value}))} />
                    </td>
                    {bidSettings.feedbackEnabled && (
                      <td>
                        {fb
                          ? <span style={{fontSize:11,fontWeight:600,color:fb.color}}>{fb.label}</span>
                          : <span style={{fontSize:11,color:C.stone}}>Enter rate to see feedback</span>}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.sand}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:12,color:C.stone}}>{submitted} of {LANES.length} lanes rated</span>
          <button className="btn btn-green" onClick={handleSave}>✓ Save & Submit</button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: Standing (Carrier) ─────────────────────────────────────────────────
function StandingPage({ bidSettings, carrierName }) {
  const myLanes = LANES.map(l=>({...l,myBid:l.bids.find(b=>b.carrier===carrierName),myRank:l.bids.findIndex(b=>b.carrier===carrierName)+1})).filter(l=>l.myBid);
  const r1Count = myLanes.filter(l=>l.myRank===1).length;

  if (!bidSettings.feedbackEnabled) return (
    <div className="card" style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:32,marginBottom:12}}>🔒</div>
      <div className="page-title" style={{marginBottom:8}}>Feedback Not Enabled</div>
      <div style={{color:C.stone,fontSize:13}}>The shipper has not enabled competitive feedback for this bid. Submit your rates in the Bid tab.</div>
    </div>
  );

  return (
    <div>
      <div className="section-header">
        <div><div className="page-title">My Competitive Standing</div><div className="page-sub">Spindrift May–Aug 2026 · Feedback: {bidSettings.feedbackType}</div></div>
      </div>
      <div className="alert purple">Shipper feedback mode: <strong>{
        bidSettings.feedbackType==="rank"?"Rank among all bidders":
        bidSettings.feedbackType==="bracket"?"% bracket above low (0–5%, 5–10%, 10–20%, 20%+)":
        bidSettings.feedbackType==="percent"?"Your % above the lowest rate":
        "$ amount above lowest rate"
      }</strong>. Carrier identities are never revealed.</div>
      <div className="stat-grid">
        <div className="stat-tile"><div className="stat-label">Lanes Bid</div><div className="stat-value">{myLanes.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Low Bid</div><div className="stat-value">{r1Count}</div><div className="stat-sub">lanes</div></div>
        <div className="stat-tile"><div className="stat-label">Competitive</div><div className="stat-value">{myLanes.filter(l=>l.myRank<=2).length}</div><div className="stat-sub">top 2 bids</div></div>
        <div className="stat-tile"><div className="stat-label">Uncompetitive</div><div className="stat-value">{myLanes.filter(l=>l.myRank>2).length}</div><div className="stat-sub">rank 3+</div></div>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table>
          <thead><tr>
            <th>Lane</th><th>Origin</th><th>Destination</th><th>Mode</th><th>Vol</th><th>My Rate</th><th>Feedback</th>
          </tr></thead>
          <tbody>
            {myLanes.map(l=>{
              const fb = carrierFeedback(l, carrierName, bidSettings);
              return (
                <tr key={l.id} style={l.myRank===1?{background:C.greenlt}:{}}>
                  <td className="mono" style={{fontSize:11,color:C.stone}}>{l.id}</td>
                  <td>{l.origCity}, {l.origSt}</td>
                  <td>{l.destCity}, {l.destSt}</td>
                  <td style={{fontSize:11}}>{l.mode}</td>
                  <td className="mono">{Math.round(l.vol)}</td>
                  <td className="mono" style={{fontWeight:700}}>${l.myBid.rate.toLocaleString()}</td>
                  <td>{fb ? <span style={{fontWeight:600,color:fb.color}}>{fb.label}</span> : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PAGE: Invite Carriers ────────────────────────────────────────────────────
function InvitePage() {
  const [invited, setInvited] = useState(ALL_CARRIERS.filter(c=>c.invited).map(c=>c.contact));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({name:"",scac:"",email:"",contact:""});
  const [sent, setSent] = useState(false);

  const handleInvite = () => {
    if (!form.email) return;
    setInvited(i=>[...i, form.email]);
    setSent(true);
    setModal(false);
    setForm({name:"",scac:"",email:"",contact:""});
    setTimeout(()=>setSent(false),4000);
  };

  const handleRevoke = (email) => setInvited(i=>i.filter(x=>x!==email));

  const invitedCarriers = ALL_CARRIERS.filter(c=>invited.includes(c.contact));
  const notInvited = ALL_CARRIERS.filter(c=>!invited.includes(c.contact));

  return (
    <div>
      <div className="section-header">
        <div><div className="page-title">Carrier & Broker Access</div><div className="page-sub">Only invited contacts can view the bid and submit rates</div></div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}>+ Invite Carrier / Broker</button>
      </div>
      {sent && <div className="alert success">✓ Invitation sent. They'll receive a secure, unique access link via email.</div>}

      <div className="alert info">🔒 <strong>Access is invite-only.</strong> Carriers can only see the bid, download the lane file, and submit rates if their email is on this list. They cannot see other participants or rates.</div>

      <div className="card">
        <div className="card-header"><div className="card-title">Invited Participants ({invitedCarriers.length})</div></div>
        <table>
          <thead><tr><th>Carrier / Broker</th><th>SCAC</th><th>Type</th><th>Email</th><th>Status</th><th>Bids</th><th>Action</th></tr></thead>
          <tbody>
            {invitedCarriers.map(c=>(
              <tr key={c.id}>
                <td style={{fontWeight:600}}>{c.name}</td>
                <td className="mono" style={{color:C.stone}}>{c.scac}</td>
                <td><span className={`badge ${c.type}`}>{c.type}</span></td>
                <td style={{fontSize:12,color:C.stone}}>{c.contact}</td>
                <td>{c.submitted?<span style={{color:C.green,fontWeight:600,fontSize:12}}>✓ Submitted</span>:<span style={{color:C.amber,fontWeight:600,fontSize:12}}>Invited — Pending</span>}</td>
                <td className="mono">{c.bids||"—"}</td>
                <td style={{display:"flex",gap:6}}>
                  {!c.submitted && <button className="btn btn-sm btn-outline">Remind</button>}
                  <button className="btn btn-sm" style={{background:C.rustlt,color:C.rust,border:"none",cursor:"pointer"}} onClick={()=>handleRevoke(c.contact)}>Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notInvited.length>0 && (
        <div className="card">
          <div className="card-header"><div className="card-title" style={{color:C.stone}}>Not Yet Invited ({notInvited.length})</div></div>
          <table>
            <thead><tr><th>Carrier / Broker</th><th>SCAC</th><th>Type</th><th>Email</th><th></th></tr></thead>
            <tbody>
              {notInvited.map(c=>(
                <tr key={c.id}>
                  <td style={{fontWeight:500,color:C.stone}}>{c.name}</td>
                  <td className="mono" style={{color:C.stone}}>{c.scac}</td>
                  <td><span className={`badge ${c.type}`}>{c.type}</span></td>
                  <td style={{fontSize:12,color:C.stone}}>{c.contact}</td>
                  <td><button className="btn btn-sm btn-primary" onClick={()=>{setInvited(i=>[...i,c.contact]);setSent(true);setTimeout(()=>setSent(false),3000);}}>Invite</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Invite New Carrier / Broker</div><button className="btn btn-ghost" onClick={()=>setModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Company Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Apex Freight"/></div>
                <div className="form-group"><label>SCAC Code</label><input value={form.scac} onChange={e=>setForm(f=>({...f,scac:e.target.value}))} placeholder="e.g. APXF"/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Contact Email <span style={{color:C.rust}}>*</span></label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="rates@carrier.com"/></div>
                <div className="form-group"><label>Contact Name</label><input value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))} placeholder="First Last"/></div>
              </div>
              <div className="alert info" style={{marginTop:4}}>A unique, secure access link will be sent to this email. Only they can use it. No other carrier identities or rates will be visible to them.</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={!form.email} onClick={handleInvite}>Send Secure Invite →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAGE: New RFP (with bid settings) ───────────────────────────────────────
function NewRFPPage({ setPage, setBidSettings }) {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState({...DEFAULT_BID_SETTINGS});
  const [done, setDone] = useState(false);

  const handleLaunch = () => { setBidSettings(settings); setDone(true); };

  if (done) return (
    <div className="card" style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:40,marginBottom:12}}>🎉</div>
      <div className="page-title" style={{marginBottom:8}}>RFP Launched!</div>
      <div style={{color:C.stone,fontSize:13,marginBottom:20}}>Your bid is live. Invite carriers to participate.</div>
      <button className="btn btn-primary" onClick={()=>setPage("invite")}>Invite Carriers →</button>
    </div>
  );

  return (
    <div style={{maxWidth:660}}>
      <div className="page-title" style={{marginBottom:4}}>Create New RFP</div>
      <div className="page-sub" style={{marginBottom:16}}>Step {step} of 4</div>
      <div className="progress-bar" style={{marginBottom:24}}><div className="progress-fill" style={{width:`${(step/4)*100}%`}}/></div>

      {step===1 && (
        <div className="card">
          <div className="card-title" style={{marginBottom:16}}>1. RFP Details</div>
          <div className="form-row">
            <div className="form-group"><label>RFP Name</label><input defaultValue="Spindrift May–Aug 2026"/></div>
            <div className="form-group"><label>Shipper Name</label><input defaultValue="Spindrift Beverages"/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Bid Open</label><input type="date" defaultValue="2026-03-20"/></div>
            <div className="form-group"><label>Bid Close</label><input type="date" defaultValue="2026-04-30"/></div>
          </div>
          <div className="form-group"><label>Contract Term</label><select><option>May – Aug 2026 (4 months)</option><option>Q3 2026</option><option>Annual 2026</option></select></div>
          <div className="form-group"><label>Rate Structure</label><select><option>Flat Linehaul ONLY</option><option>All-In Rate</option></select></div>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button className="btn btn-primary" onClick={()=>setStep(2)}>Next →</button></div>
        </div>
      )}

      {step===2 && (
        <div className="card">
          <div className="card-title" style={{marginBottom:16}}>2. Upload Lane File</div>
          <div className="upload-zone">
            <div style={{fontSize:32,marginBottom:8}}>📂</div>
            <div style={{fontSize:13,color:C.stone}}><strong style={{color:C.ash}}>Click to upload</strong> or drag & drop your lane file</div>
            <div style={{fontSize:11,color:C.stone,marginTop:6}}>Accepts .xlsx · Use the RFPlab template</div>
          </div>
          <div style={{marginTop:12,padding:"10px 14px",background:C.greenlt,border:`1px solid ${C.green}`,borderRadius:8,fontSize:12,color:C.green}}>
            ✓ Spindrift_TL_RFP_2026_May_to_Aug.xlsx — 97 lanes detected
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
            <button className="btn btn-outline" onClick={()=>setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(3)}>Next →</button>
          </div>
        </div>
      )}

      {step===3 && (
        <div className="card">
          <div className="card-title" style={{marginBottom:16}}>3. Carrier Feedback Settings</div>
          <div className="form-group" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",border:`1px solid ${C.sand}`,borderRadius:8,marginBottom:16}}>
            <div>
              <div style={{fontWeight:600,fontSize:13}}>Enable competitive feedback for carriers</div>
              <div style={{fontSize:11,color:C.stone,marginTop:2}}>Carriers see limited information about their bid position — never other carriers' identities or exact rates</div>
            </div>
            <Toggle checked={settings.feedbackEnabled} onChange={v=>setSettings(s=>({...s,feedbackEnabled:v}))} />
          </div>

          {settings.feedbackEnabled && (
            <div>
              <label style={{marginBottom:8}}>Feedback type (carriers see this after submitting)</label>
              {[
                {key:"rank", title:"Rank only", desc:"e.g. \"Your rank: #2 of 14 bidders\""},
                {key:"bracket", title:"% bracket above low bid", desc:"e.g. \"5–10% above low bid\" — never reveals exact low rate"},
                {key:"percent", title:"Exact % above low bid", desc:"e.g. \"+7.4% above low bid\""},
                {key:"dollar", title:"Dollar amount above low bid", desc:"e.g. \"$85 above low bid\""},
              ].map(opt=>(
                <div key={opt.key} className={`feedback-option${settings.feedbackType===opt.key?" selected":""}`} style={{marginBottom:8}}
                  onClick={()=>setSettings(s=>({...s,feedbackType:opt.key}))}>
                  <input type="radio" readOnly checked={settings.feedbackType===opt.key}/>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>{opt.title}</div>
                    <div style={{fontSize:11,color:C.stone,marginTop:2}}>{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
            <button className="btn btn-outline" onClick={()=>setStep(2)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(4)}>Next →</button>
          </div>
        </div>
      )}

      {step===4 && (
        <div className="card">
          <div className="card-title" style={{marginBottom:16}}>4. Bid Rules & Preferences</div>
          <div className="form-group"><label>Max awarded carriers per lane</label>
            <select value={settings.maxCarriersPerLane} onChange={e=>setSettings(s=>({...s,maxCarriersPerLane:parseInt(e.target.value)}))}>
              <option value={2}>2 (Primary + 1 backup)</option>
              <option value={3}>3 (Primary + 2 backups)</option>
              <option value={5}>5</option>
            </select>
          </div>
          <div className="form-group"><label>Asset vs. broker target split (for scenario modeling)</label>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <input type="range" min={0} max={100} value={settings.assetVsBrokerSplit}
                onChange={e=>setSettings(s=>({...s,assetVsBrokerSplit:parseInt(e.target.value)}))} style={{width:180,border:"none",padding:0}}/>
              <span style={{fontSize:13,fontWeight:600,color:C.ash}}>{settings.assetVsBrokerSplit}% asset / {100-settings.assetVsBrokerSplit}% broker</span>
            </div>
          </div>
          <div className="form-group"><label>FSC treatment</label><select><option>Not included — linehaul only</option><option>Included in rate</option></select></div>
          <div className="form-group"><label>Carrier notes</label><textarea rows={2} defaultValue="All rates are per load, flat linehaul. No accessorials. May–Aug 2026 contract." /></div>

          <div style={{background:C.parchment,border:`1px solid ${C.sand}`,borderRadius:8,padding:14,marginTop:8,fontSize:12,color:C.stone}}>
            <div style={{fontWeight:700,color:C.black,marginBottom:8}}>Summary</div>
            <div>Feedback: <strong style={{color:settings.feedbackEnabled?C.green:C.stone}}>{settings.feedbackEnabled?`Enabled — ${settings.feedbackType}`:"Disabled (blind bid)"}</strong></div>
            <div>Max carriers/lane: <strong>{settings.maxCarriersPerLane}</strong></div>
            <div>Scenario split target: <strong>{settings.assetVsBrokerSplit}% asset / {100-settings.assetVsBrokerSplit}% broker</strong></div>
          </div>

          <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
            <button className="btn btn-outline" onClick={()=>setStep(3)}>← Back</button>
            <button className="btn btn-green" onClick={handleLaunch}>🚀 Launch RFP</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// ─── RISK MANAGEMENT ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const RISK_CARRIERS = [
  { id:1, name:"Your Company (Demo)", scac:"DEMO", type:"broker", dot:"1234567", mc:"MC-987654",
    status:"approved", relationship:"Preferred", since:"2021-03", totalLoads:842, totalSpend:1240000,
    otd:94.2, acceptance:96.8, claimRatio:0.3, claims:3,
    contacts:[
      {name:"John Smith", role:"Account Manager", email:"john@roar.com", phone:"312-555-0101"},
      {name:"Maria Lopez", role:"Dispatch", email:"dispatch@roar.com", phone:"312-555-0102"},
      {name:"Tim Reed", role:"Compliance", email:"compliance@roar.com", phone:"312-555-0103"},
    ],
    insurance:{ autoCoverage:1000000, autoExp:"2026-09-15", cargoCoverage:100000, cargoExp:"2026-09-15", glCoverage:2000000, glExp:"2026-09-15", wcExp:"2026-09-15" },
    safety:{ rating:"Satisfactory", inspections:48, violations:2, smsUnsafeScore:12, smsHosSScore:8, smsDrvrFitnessScore:5 },
    vetting:{ tools:["Carrier411","FMCSA Portal"], lastVetted:"2026-01-10", nextDue:"2027-01-10", notes:"Clean record. Preferred broker for CA lanes." },
    rfpHistory:[{rfp:"RFP-2026-001",lanes:62,awarded:18,spend:265000},{rfp:"RFP-2025-044",lanes:45,awarded:12,spend:188000}],
  },
  { id:2, name:"Elberta Carriers", scac:"ELFI", type:"asset", dot:"4567890", mc:"MC-334421",
    status:"approved", relationship:"Standard", since:"2022-07", totalLoads:311, totalSpend:520000,
    otd:97.1, acceptance:98.2, claimRatio:0.1, claims:0,
    contacts:[
      {name:"Dana Reed", role:"Account Manager", email:"rates@elberta.com", phone:"404-555-0201"},
      {name:"Chris Mann", role:"Safety Director", email:"safety@elberta.com", phone:"404-555-0202"},
    ],
    insurance:{ autoCoverage:1000000, autoExp:"2026-08-01", cargoCoverage:100000, cargoExp:"2026-08-01", glCoverage:1000000, glExp:"2026-08-01", wcExp:"2026-08-01" },
    safety:{ rating:"Satisfactory", inspections:22, violations:0, smsUnsafeScore:5, smsHosSScore:3, smsDrvrFitnessScore:2 },
    vetting:{ tools:["Highway","FMCSA Portal"], lastVetted:"2026-03-01", nextDue:"2027-03-01", notes:"Asset carrier. Excellent safety record. Strong reefer capability." },
    rfpHistory:[{rfp:"RFP-2026-001",lanes:34,awarded:8,spend:142000},{rfp:"RFP-2025-044",lanes:28,awarded:6,spend:98000}],
  },
  { id:3, name:"Market Express", scac:"MKXD", type:"asset", dot:"9988776", mc:"MC-445512",
    status:"probation", relationship:"Watch List", since:"2023-11", totalLoads:89, totalSpend:142000,
    otd:86.5, acceptance:88.0, claimRatio:2.2, claims:2,
    contacts:[
      {name:"Alex Torres", role:"Account Manager", email:"rfp@marketexp.com", phone:"214-555-0301"},
    ],
    insurance:{ autoCoverage:1000000, autoExp:"2026-07-20", cargoCoverage:100000, cargoExp:"2026-07-20", glCoverage:1000000, glExp:"2026-07-20", wcExp:"2026-11-01" },
    safety:{ rating:"Conditional", inspections:31, violations:8, smsUnsafeScore:45, smsHosSScore:62, smsDrvrFitnessScore:38 },
    vetting:{ tools:["FMCSA Portal"], lastVetted:"2025-11-15", nextDue:"2026-05-15", notes:"OTD issues on TX lanes. 2 open claims. Review before next award." },
    rfpHistory:[{rfp:"RFP-2026-001",lanes:41,awarded:3,spend:52000}],
  },
  { id:4, name:"C.H. Robinson", scac:"RBTW", type:"broker", dot:"2345678", mc:"MC-881234",
    status:"approved", relationship:"Preferred", since:"2019-06", totalLoads:2108, totalSpend:3840000,
    otd:93.8, acceptance:95.1, claimRatio:0.4, claims:8,
    contacts:[
      {name:"Sarah Lane", role:"Account Manager", email:"rates@chr.com", phone:"800-555-0401"},
      {name:"Jake Morris", role:"Compliance", email:"compliance@chr.com", phone:"800-555-0402"},
    ],
    insurance:{ autoCoverage:2000000, autoExp:"2027-01-01", cargoCoverage:500000, cargoExp:"2027-01-01", glCoverage:5000000, glExp:"2027-01-01", wcExp:"2027-01-01" },
    safety:{ rating:"Satisfactory", inspections:0, violations:0, smsUnsafeScore:0, smsHosSScore:0, smsDrvrFitnessScore:0 },
    vetting:{ tools:["Carrier411","MyCarrierPackets","FMCSA Portal"], lastVetted:"2026-02-01", nextDue:"2027-02-01", notes:"Long-term partner. Brokerage — verify underlying carrier vetting program annually." },
    rfpHistory:[{rfp:"RFP-2026-001",lanes:71,awarded:22,spend:410000},{rfp:"RFP-2025-044",lanes:42,awarded:15,spend:285000}],
  },
];

const STATUS_META = {
  approved:  { color:"#5C6B2E", bg:"#EBF0DC", label:"Approved" },
  probation: { color:"#9B3A1E", bg:"#F5E6E0", label:"Probation" },
  suspended: { color:"#7A1F1F", bg:"#F5E0E0", label:"Suspended" },
  inactive:  { color:"#8C8070", bg:"#EDE8DF", label:"Inactive" },
  pending:   { color:"#7A5A10", bg:"#F5EDD4", label:"Pending Review" },
};

const RELATIONSHIP_META = {
  "Preferred":   { color:"#C9A84C", bg:"#F5EDD4" },
  "Standard":    { color:"#5A534A", bg:"#EDE8DF" },
  "Watch List":  { color:"#9B3A1E", bg:"#F5E6E0" },
  "New":         { color:"#5C6B2E", bg:"#EBF0DC" },
};

function daysUntil(dateStr) {
  const d = new Date(dateStr);
  return Math.ceil((d - Date.now()) / 86400000);
}

function expiryColor(days) {
  if (days < 30)  return "#7A1F1F";
  if (days < 60)  return "#9B3A1E";
  if (days < 90)  return "#7A5A10";
  return "#5C6B2E";
}

function ScoreBar({ value, max=100, danger=70, warn=85 }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = value >= danger ? "#7A1F1F" : value >= warn ? "#9B3A1E" : "#5C6B2E";
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:6,background:"#D4C9B8",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:6,width:`${pct}%`,background:color,borderRadius:3,transition:"width .4s"}}/>
      </div>
      <span style={{fontSize:11,fontWeight:700,color,minWidth:24,textAlign:"right"}}>{value}</span>
    </div>
  );
}

// ── PAGE 1: Carrier Network ──────────────────────────────────────────────────
function RiskCarriersPage({ dbProfile }) {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("profile");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  // In production: load carriers from rfp_invites WHERE shipper_id = dbProfile.id
  // For now shows the demo carrier network with a clear label
  const [isDemo] = useState(!dbProfile);

  const filtered = RISK_CARRIERS.filter(c => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.scac.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const alerts = RISK_CARRIERS.flatMap(c => {
    const a = [];
    const autoD = daysUntil(c.insurance.autoExp);
    if (autoD < 60) a.push({carrier:c.name, msg:`Auto liability expires in ${autoD} days`, sev: autoD < 30 ? "high" : "med"});
    if (c.status === "probation") a.push({carrier:c.name, msg:"On probation — review before next award", sev:"high"});
    if (c.safety.rating === "Conditional") a.push({carrier:c.name, msg:"Conditional safety rating — monitor closely", sev:"high"});
    const vetDue = daysUntil(c.vetting.nextDue);
    if (vetDue < 30) a.push({carrier:c.name, msg:`Vetting re-review due in ${vetDue} days`, sev:"med"});
    return a;
  });

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">Carrier Network</div>
          <div className="page-sub">Profiles, relationships, performance history, and vetting status</div>
        </div>
        <button className="btn btn-primary">+ Add Carrier</button>
      </div>
      {isDemo && (
        <div className="alert info" style={{marginBottom:14,fontSize:12}}>
          📊 <strong>Demo data shown.</strong> Your live carrier network will populate here from your RFP invite history once bids are active. Each shipper sees only their own carrier relationships.
        </div>
      )}

      {/* Alerts strip */}
      {alerts.length > 0 && (
        <div style={{background:"#F5E6E0",border:"1px solid #D4A090",borderRadius:7,padding:"10px 14px",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:800,color:"#7A1F1F",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>⚠ Action Required — {alerts.length} alert{alerts.length!==1?"s":""}</div>
          {alerts.map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#5A2010",marginBottom:3}}>
              <span style={{fontWeight:700}}>{a.carrier}:</span> {a.msg}
            </div>
          ))}
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-tile"><div className="stat-label">Total Partners</div><div className="stat-value">{RISK_CARRIERS.length}</div><div className="stat-sub">{RISK_CARRIERS.filter(c=>c.type==="asset").length} asset · {RISK_CARRIERS.filter(c=>c.type==="broker").length} broker</div></div>
        <div className="stat-tile"><div className="stat-label">Approved</div><div className="stat-value">{RISK_CARRIERS.filter(c=>c.status==="approved").length}</div></div>
        <div className="stat-tile"><div className="stat-label">On Probation</div><div className="stat-value" style={{color:"#9B3A1E"}}>{RISK_CARRIERS.filter(c=>c.status==="probation").length}</div></div>
        <div className="stat-tile"><div className="stat-label">Avg OTD</div><div className="stat-value">{(RISK_CARRIERS.reduce((s,c)=>s+c.otd,0)/RISK_CARRIERS.length).toFixed(1)}%</div></div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <input style={{maxWidth:260}} placeholder="Search by name or SCAC…" value={search} onChange={e=>setSearch(e.target.value)}/>
        {["all","approved","probation","suspended"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`btn btn-sm ${filter===f?"btn-primary":"btn-outline"}`}
            style={{textTransform:"capitalize"}}>{f==="all"?"All":STATUS_META[f]?.label||f}</button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:selected?"1fr 1fr":"1fr",gap:14,alignItems:"start"}}>
        {/* Carrier list */}
        <div>
          {filtered.map(c => {
            const sm = STATUS_META[c.status]||STATUS_META.approved;
            const rm = RELATIONSHIP_META[c.relationship]||RELATIONSHIP_META["Standard"];
            const autoD = daysUntil(c.insurance.autoExp);
            return (
              <div key={c.id} className="card" style={{marginBottom:8,cursor:"pointer",borderLeft:`3px solid ${sm.color}`,background:selected?.id===c.id?"#F5EDD4":"#FDFCF9"}}
                onClick={()=>setSelected(c===selected?null:c)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:14,color:"#111111"}}>{c.name}</div>
                    <div style={{fontSize:11,color:"#8C8070",marginTop:2}}>{c.scac} · DOT {c.dot} · {c.type==="asset"?"Asset Carrier":"Broker / 3PL"}</div>
                  </div>
                  <div style={{display:"flex",gap:5,flexShrink:0}}>
                    <span style={{background:sm.bg,color:sm.color,padding:"2px 8px",borderRadius:2,fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:.5}}>{sm.label}</span>
                    <span style={{background:rm.bg,color:rm.color,padding:"2px 8px",borderRadius:2,fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:.5}}>{c.relationship}</span>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {[["OTD",`${c.otd}%`,c.otd<90?"#9B3A1E":"#5C6B2E"],["Accept",`${c.acceptance}%`,c.acceptance<92?"#9B3A1E":"#5C6B2E"],["Claims",c.claims,"#5A534A"],["Loads",c.totalLoads.toLocaleString(),"#5A534A"]].map(([k,v,col])=>(
                    <div key={k}>
                      <div style={{fontSize:9,fontWeight:800,color:"#8C8070",letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                      <div style={{fontSize:13,fontWeight:800,color:col}}>{v}</div>
                    </div>
                  ))}
                </div>
                {autoD < 60 && <div style={{marginTop:8,fontSize:10,fontWeight:700,color:expiryColor(autoD)}}>⚠ Auto insurance expires in {autoD} days</div>}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="card" style={{position:"sticky",top:0,maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{fontWeight:800,fontSize:15,color:"#111111"}}>{selected.name}</div>
                <div style={{fontSize:11,color:"#8C8070",marginTop:2}}>{selected.scac} · DOT {selected.dot} · MC {selected.mc}</div>
                <div style={{fontSize:11,color:"#8C8070"}}>Partner since {fmtDate(selected.since+"-01").replace(/\d+,\s/,"")}</div>
              </div>
              <button className="btn btn-ghost" onClick={()=>setSelected(null)}>✕</button>
            </div>

            <div className="tab-bar" style={{marginBottom:12}}>
              {["profile","insurance","safety","performance","history"].map(t=>(
                <div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)} style={{textTransform:"capitalize",fontSize:10}}>{t}</div>
              ))}
            </div>

            {tab==="profile" && (
              <div>
                <div style={{fontSize:10,fontWeight:800,color:"#8C8070",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Contacts</div>
                {selected.contacts.map((con,i)=>(
                  <div key={i} style={{padding:"8px 10px",border:"1px solid #D4C9B8",borderRadius:5,marginBottom:6}}>
                    <div style={{fontWeight:700,fontSize:12,color:"#111111"}}>{con.name}</div>
                    <div style={{fontSize:10,color:"#8C8070",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>{con.role}</div>
                    <div style={{fontSize:11,color:"#5A534A"}}>{con.email} · {con.phone}</div>
                  </div>
                ))}
                <div style={{marginTop:12,fontSize:10,fontWeight:800,color:"#8C8070",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Vetting</div>
                <div style={{padding:"10px 12px",border:"1px solid #D4C9B8",borderRadius:5}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:11,color:"#8C8070"}}>Tools used</span>
                    <span style={{fontSize:11,fontWeight:700}}>{selected.vetting.tools.join(", ")}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:11,color:"#8C8070"}}>Last vetted</span>
                    <span style={{fontSize:11,fontWeight:700}}>{selected.vetting.lastVetted}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:11,color:"#8C8070"}}>Next review due</span>
                    <span style={{fontSize:11,fontWeight:700,color:expiryColor(daysUntil(selected.vetting.nextDue))}}>{selected.vetting.nextDue}</span>
                  </div>
                  <div style={{fontSize:11,color:"#5A534A",lineHeight:1.6,fontStyle:"italic"}}>"{selected.vetting.notes}"</div>
                </div>
              </div>
            )}

            {tab==="insurance" && (
              <div>
                {[
                  {label:"Auto Liability", coverage:selected.insurance.autoCoverage, exp:selected.insurance.autoExp},
                  {label:"Cargo", coverage:selected.insurance.cargoCoverage, exp:selected.insurance.cargoExp},
                  {label:"General Liability", coverage:selected.insurance.glCoverage, exp:selected.insurance.glExp},
                  {label:"Workers Comp", coverage:null, exp:selected.insurance.wcExp},
                ].map(ins=>{
                  const days = daysUntil(ins.exp);
                  const col = expiryColor(days);
                  return (
                    <div key={ins.label} style={{padding:"10px 12px",border:`1px solid ${days<60?"#D4A090":"#D4C9B8"}`,borderRadius:6,marginBottom:8,background:days<30?"#F5E6E0":"#FDFCF9"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <span style={{fontWeight:700,fontSize:12,color:"#111111"}}>{ins.label}</span>
                        <span style={{fontSize:10,fontWeight:800,color:col}}>{days > 0 ? `${days} days` : "EXPIRED"}</span>
                      </div>
                      {ins.coverage && <div style={{fontSize:11,color:"#5A534A"}}>Coverage: <strong>${ins.coverage.toLocaleString()}</strong></div>}
                      <div style={{fontSize:11,color:col,fontWeight:600}}>Expires: {ins.exp}</div>
                    </div>
                  );
                })}
                <button className="btn btn-outline btn-sm" style={{marginTop:4}}>📎 Upload COI</button>
              </div>
            )}

            {tab==="safety" && (
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",border:"1px solid #D4C9B8",borderRadius:6,marginBottom:12}}>
                  <div style={{fontWeight:800,fontSize:18,color:selected.safety.rating==="Satisfactory"?"#5C6B2E":selected.safety.rating==="Conditional"?"#9B3A1E":"#7A1F1F"}}>{selected.safety.rating}</div>
                  <div style={{fontSize:11,color:"#8C8070"}}>FMCSA Safety Rating</div>
                </div>
                <div style={{fontSize:10,fontWeight:800,color:"#8C8070",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>SMS Percentile Scores <span style={{color:"#D4C9B8",fontWeight:400}}>(lower is better)</span></div>
                {[["Unsafe Driving",selected.safety.smsUnsafeScore],["Hours of Service",selected.safety.smsHosSScore],["Driver Fitness",selected.safety.smsDrvrFitnessScore]].map(([label,score])=>(
                  <div key={label} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,color:"#5A534A"}}>{label}</span>
                    </div>
                    <ScoreBar value={score} max={100} danger={70} warn={50}/>
                  </div>
                ))}
                <div style={{marginTop:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div style={{padding:"8px 10px",border:"1px solid #D4C9B8",borderRadius:5,textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:800,color:"#111111"}}>{selected.safety.inspections}</div>
                    <div style={{fontSize:9,color:"#8C8070",textTransform:"uppercase",letterSpacing:.5}}>Inspections</div>
                  </div>
                  <div style={{padding:"8px 10px",border:`1px solid ${selected.safety.violations>0?"#D4A090":"#D4C9B8"}`,borderRadius:5,textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:800,color:selected.safety.violations>0?"#9B3A1E":"#5C6B2E"}}>{selected.safety.violations}</div>
                    <div style={{fontSize:9,color:"#8C8070",textTransform:"uppercase",letterSpacing:.5}}>Violations</div>
                  </div>
                </div>
              </div>
            )}

            {tab==="performance" && (
              <div>
                {[
                  {label:"On-Time Delivery",value:selected.otd,suffix:"%",danger:90,warn:94,flip:false},
                  {label:"Load Acceptance Rate",value:selected.acceptance,suffix:"%",danger:92,warn:96,flip:false},
                ].map(m=>{
                  const col = m.value < m.danger ? "#7A1F1F" : m.value < m.warn ? "#9B3A1E" : "#5C6B2E";
                  return (
                    <div key={m.label} style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:12,fontWeight:600,color:"#5A534A"}}>{m.label}</span>
                        <span style={{fontSize:14,fontWeight:800,color:col}}>{m.value}{m.suffix}</span>
                      </div>
                      <div style={{height:6,background:"#D4C9B8",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:6,width:`${m.value}%`,background:col,borderRadius:3}}/>
                      </div>
                    </div>
                  );
                })}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8}}>
                  {[["Total Loads",selected.totalLoads.toLocaleString()],["Total Spend","$"+(selected.totalSpend/1000).toFixed(0)+"K"],["Claim Ratio",selected.claimRatio+"%"]].map(([k,v])=>(
                    <div key={k} style={{padding:"8px 10px",border:"1px solid #D4C9B8",borderRadius:5,textAlign:"center"}}>
                      <div style={{fontSize:16,fontWeight:800,color:"#111111"}}>{v}</div>
                      <div style={{fontSize:9,color:"#8C8070",textTransform:"uppercase",letterSpacing:.5}}>{k}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab==="history" && (
              <div>
                <div style={{fontSize:10,fontWeight:800,color:"#8C8070",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>RFP Participation History</div>
                {selected.rfpHistory.map((r,i)=>(
                  <div key={i} style={{padding:"10px 12px",border:"1px solid #D4C9B8",borderRadius:6,marginBottom:8}}>
                    <div style={{fontWeight:700,fontSize:12,color:"#111111",marginBottom:6}}>{r.rfp}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      {[["Lanes Bid",r.lanes],["Lanes Won",r.awarded],["Spend","$"+(r.spend/1000).toFixed(0)+"K"]].map(([k,v])=>(
                        <div key={k}>
                          <div style={{fontSize:9,color:"#8C8070",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{k}</div>
                          <div style={{fontSize:13,fontWeight:800,color:"#111111"}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PAGE 2: Insurance & COI Tracker ──────────────────────────────────────────
function RiskInsurancePage() {
  const [filter, setFilter] = useState("all");

  const allPolicies = RISK_CARRIERS.flatMap(c=>[
    {carrier:c.name, type:"Auto Liability",       coverage:c.insurance.autoCoverage, exp:c.insurance.autoExp,  req:1000000},
    {carrier:c.name, type:"Cargo",                coverage:c.insurance.cargoCoverage,exp:c.insurance.cargoExp, req:100000},
    {carrier:c.name, type:"General Liability",    coverage:c.insurance.glCoverage,   exp:c.insurance.glExp,    req:1000000},
    {carrier:c.name, type:"Workers Comp",         coverage:null,                      exp:c.insurance.wcExp,    req:null},
  ]).map(p=>({...p, days:daysUntil(p.exp), underCovered: p.req && p.coverage < p.req}));

  const filtered = allPolicies.filter(p=>{
    if (filter==="expiring30") return p.days >= 0 && p.days < 30;
    if (filter==="expiring90") return p.days >= 0 && p.days < 90;
    if (filter==="expired")    return p.days < 0;
    return true;
  });

  const expiring30 = allPolicies.filter(p=>p.days>=0&&p.days<30).length;
  const expiring90 = allPolicies.filter(p=>p.days>=0&&p.days<90).length;
  const expired    = allPolicies.filter(p=>p.days<0).length;

  return (
    <div>
      <div className="section-header">
        <div><div className="page-title">Insurance & COI Tracker</div><div className="page-sub">Policy coverage, expiration monitoring, and compliance requirements</div></div>
        <button className="btn btn-primary">⬆ Upload COI</button>
      </div>

      <div className="stat-grid">
        <div className="stat-tile"><div className="stat-label">Total Policies</div><div className="stat-value">{allPolicies.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Expiring &lt;30 days</div><div className="stat-value" style={{color:expiring30>0?"#7A1F1F":"#5C6B2E"}}>{expiring30}</div></div>
        <div className="stat-tile"><div className="stat-label">Expiring &lt;90 days</div><div className="stat-value" style={{color:expiring90>0?"#9B3A1E":"#5C6B2E"}}>{expiring90}</div></div>
        <div className="stat-tile"><div className="stat-label">Expired</div><div className="stat-value" style={{color:expired>0?"#7A1F1F":"#5C6B2E"}}>{expired}</div></div>
      </div>

      {expiring30 > 0 && (
        <div className="alert warn">⚠ <strong>{expiring30} policies</strong> expire within 30 days. Request updated COIs from affected carriers immediately.</div>
      )}

      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[["all","All Policies"],["expiring30","Expiring &lt;30 days"],["expiring90","Expiring &lt;90 days"],["expired","Expired"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} className={`btn btn-sm ${filter===k?"btn-primary":"btn-outline"}`} dangerouslySetInnerHTML={{__html:l}}/>
        ))}
      </div>

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table>
          <thead><tr>
            <th>Carrier</th><th>Policy Type</th><th>Coverage</th><th>Required</th><th>Status</th><th>Expiration</th><th>Days Left</th>
          </tr></thead>
          <tbody>
            {filtered.sort((a,b)=>a.days-b.days).map((p,i)=>{
              const col = p.days<0?"#7A1F1F":expiryColor(p.days);
              const bg  = p.days<0?"#F5E0E0":p.days<30?"#F5E6E0":p.days<90?"#F5EDD4":"transparent";
              return (
                <tr key={i} style={{background:bg}}>
                  <td style={{fontWeight:700,color:"#111111"}}>{p.carrier}</td>
                  <td style={{color:"#5A534A"}}>{p.type}</td>
                  <td className="mono">{p.coverage?"$"+p.coverage.toLocaleString():"—"}</td>
                  <td className="mono" style={{color:p.underCovered?"#7A1F1F":"#5C6B2E"}}>{p.req?"$"+p.req.toLocaleString():"—"}</td>
                  <td>
                    {p.days<0
                      ? <span style={{background:"#F5E0E0",color:"#7A1F1F",padding:"2px 8px",borderRadius:2,fontSize:9,fontWeight:800}}>EXPIRED</span>
                      : p.underCovered
                        ? <span style={{background:"#F5E6E0",color:"#9B3A1E",padding:"2px 8px",borderRadius:2,fontSize:9,fontWeight:800}}>UNDER LIMIT</span>
                        : <span style={{background:"#EBF0DC",color:"#5C6B2E",padding:"2px 8px",borderRadius:2,fontSize:9,fontWeight:800}}>COMPLIANT</span>}
                  </td>
                  <td className="mono" style={{color:col,fontWeight:600}}>{p.exp}</td>
                  <td style={{fontWeight:800,color:col}}>{p.days<0?"Expired":`${p.days}d`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── PAGE 3: Performance Scorecards ───────────────────────────────────────────
function RiskScorecardsPage() {
  const [selected, setSelected] = useState(RISK_CARRIERS[0]);

  const overall = (c) => {
    const otdScore     = c.otd >= 95 ? 100 : c.otd >= 90 ? 75 : c.otd >= 85 ? 50 : 25;
    const acceptScore  = c.acceptance >= 97 ? 100 : c.acceptance >= 93 ? 75 : c.acceptance >= 88 ? 50 : 25;
    const claimScore   = c.claimRatio <= 0.5 ? 100 : c.claimRatio <= 1.5 ? 75 : c.claimRatio <= 3 ? 50 : 25;
    const safetyScore  = c.safety.rating==="Satisfactory"?100:c.safety.rating==="Conditional"?50:0;
    const smsScore     = c.safety.smsUnsafeScore < 20 ? 100 : c.safety.smsUnsafeScore < 50 ? 65 : 25;
    return Math.round((otdScore*.30)+(acceptScore*.25)+(claimScore*.20)+(safetyScore*.15)+(smsScore*.10));
  };

  const grade = (score) => score>=90?"A":score>=80?"B":score>=70?"C":score>=60?"D":"F";
  const gradeColor = (score) => score>=80?"#5C6B2E":score>=65?"#9B3A1E":"#7A1F1F";

  return (
    <div>
      <div className="section-header">
        <div><div className="page-title">Performance Scorecards</div><div className="page-sub">Weighted scoring across OTD, acceptance, claims, safety, and compliance</div></div>
        <button className="btn btn-outline">⬇ Export All Scorecards</button>
      </div>

      {/* Overview grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {RISK_CARRIERS.map(c=>{
          const score = overall(c);
          const g = grade(score);
          const col = gradeColor(score);
          const sm = STATUS_META[c.status]||STATUS_META.approved;
          return (
            <div key={c.id} className="card" style={{cursor:"pointer",borderTop:`3px solid ${col}`,background:selected?.id===c.id?"#F5EDD4":"#FDFCF9"}} onClick={()=>setSelected(c)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{fontSize:36,fontWeight:800,color:col,lineHeight:1}}>{g}</div>
                <span style={{background:sm.bg,color:sm.color,padding:"2px 6px",borderRadius:2,fontSize:9,fontWeight:800,textTransform:"uppercase"}}>{sm.label}</span>
              </div>
              <div style={{fontWeight:700,fontSize:12,color:"#111111",marginBottom:2}}>{c.name}</div>
              <div style={{fontSize:10,color:"#8C8070"}}>{c.scac} · {c.type}</div>
              <div style={{marginTop:8,fontSize:11,color:col,fontWeight:700}}>Score: {score}/100</div>
            </div>
          );
        })}
      </div>

      {/* Detailed scorecard */}
      {selected && (
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
            <div>
              <div style={{fontWeight:800,fontSize:16,color:"#111111"}}>{selected.name} — Performance Scorecard</div>
              <div style={{fontSize:11,color:"#8C8070",marginTop:2}}>{selected.scac} · {selected.type} · Partner since {fmtDate(selected.since+"-01").replace(/\d+,\s/,"")}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:48,fontWeight:800,color:gradeColor(overall(selected)),lineHeight:1}}>{grade(overall(selected))}</div>
              <div style={{fontSize:13,fontWeight:700,color:gradeColor(overall(selected))}}>{overall(selected)}/100</div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <div>
              <div style={{fontSize:10,fontWeight:800,color:"#8C8070",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Operational Performance</div>
              {[
                {label:"On-Time Delivery", value:selected.otd, suffix:"%", target:"≥95%", weight:"30%", danger:90, warn:95},
                {label:"Load Acceptance Rate", value:selected.acceptance, suffix:"%", target:"≥97%", weight:"25%", danger:92, warn:97},
              ].map(m=>{
                const col = m.value<m.danger?"#7A1F1F":m.value<m.warn?"#9B3A1E":"#5C6B2E";
                return (
                  <div key={m.label} style={{marginBottom:14,padding:"10px 12px",border:"1px solid #D4C9B8",borderRadius:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"#111111"}}>{m.label}</div>
                        <div style={{fontSize:10,color:"#8C8070"}}>Target: {m.target} · Weight: {m.weight}</div>
                      </div>
                      <div style={{fontSize:20,fontWeight:800,color:col}}>{m.value}{m.suffix}</div>
                    </div>
                    <div style={{height:6,background:"#D4C9B8",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:6,width:`${m.value}%`,background:col,borderRadius:3}}/>
                    </div>
                  </div>
                );
              })}
              <div style={{padding:"10px 12px",border:"1px solid #D4C9B8",borderRadius:6,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#111111"}}>Claim Ratio</div>
                    <div style={{fontSize:10,color:"#8C8070"}}>Target: ≤0.5% · Weight: 20%</div>
                  </div>
                  <div style={{fontSize:20,fontWeight:800,color:selected.claimRatio<=0.5?"#5C6B2E":selected.claimRatio<=1.5?"#9B3A1E":"#7A1F1F"}}>{selected.claimRatio}%</div>
                </div>
                <div style={{fontSize:11,color:"#8C8070"}}>{selected.claims} total claims · ${(selected.totalSpend/1000).toFixed(0)}K total spend</div>
              </div>
            </div>

            <div>
              <div style={{fontSize:10,fontWeight:800,color:"#8C8070",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Safety & Compliance</div>
              <div style={{padding:"10px 12px",border:"1px solid #D4C9B8",borderRadius:6,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#111111"}}>FMCSA Safety Rating</div>
                  <div style={{fontWeight:800,fontSize:13,color:selected.safety.rating==="Satisfactory"?"#5C6B2E":selected.safety.rating==="Conditional"?"#9B3A1E":"#7A1F1F"}}>{selected.safety.rating}</div>
                </div>
                <div style={{fontSize:10,color:"#8C8070"}}>Weight: 15%</div>
              </div>
              <div style={{padding:"10px 12px",border:"1px solid #D4C9B8",borderRadius:6,marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:"#111111",marginBottom:8}}>SMS Scores <span style={{fontSize:10,color:"#8C8070",fontWeight:400}}>(lower = better · Weight: 10%)</span></div>
                {[["Unsafe Driving",selected.safety.smsUnsafeScore],["Hours of Service",selected.safety.smsHosSScore],["Driver Fitness",selected.safety.smsDrvrFitnessScore]].map(([l,v])=>(
                  <div key={l} style={{marginBottom:8}}>
                    <div style={{fontSize:11,color:"#5A534A",marginBottom:3}}>{l}</div>
                    <ScoreBar value={v} max={100} danger={70} warn={50}/>
                  </div>
                ))}
              </div>
              <div style={{padding:"12px",background:"#EDE8DF",borderRadius:6}}>
                <div style={{fontSize:10,fontWeight:800,color:"#8C8070",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Score Breakdown</div>
                {[["OTD (30%)",selected.otd>=95?30:selected.otd>=90?22:selected.otd>=85?15:8,"30"],["Acceptance (25%)",selected.acceptance>=97?25:selected.acceptance>=93?19:selected.acceptance>=88?13:6,"25"],["Claims (20%)",selected.claimRatio<=0.5?20:selected.claimRatio<=1.5?15:selected.claimRatio<=3?10:5,"20"],["Safety (15%)",selected.safety.rating==="Satisfactory"?15:selected.safety.rating==="Conditional"?8:0,"15"],["SMS (10%)",selected.safety.smsUnsafeScore<20?10:selected.safety.smsUnsafeScore<50?6:3,"10"]].map(([l,v,max])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0",borderBottom:"1px solid #D4C9B8"}}>
                    <span style={{color:"#5A534A"}}>{l}</span>
                    <span style={{fontWeight:700,color:"#111111"}}>{v}/{max}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:800,marginTop:6,color:"#111111"}}>
                  <span>Total</span><span>{overall(selected)}/100</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{marginTop:16,display:"flex",gap:8}}>
            <button className="btn btn-outline btn-sm">⬇ Export PDF Scorecard</button>
            <button className="btn btn-outline btn-sm">📧 Send to Carrier</button>
            <button className="btn btn-outline btn-sm">📝 Add Note</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PAGE 4: Loadsure Cargo Insurance Integration ─────────────────────────────
// All API calls go via /api/loadsure-proxy (Vercel serverless) to keep key server-side
// Direct browser calls also work since Loadsure supports CORS with Bearer auth

const LS_BASE = "https://api.loadsure.net";

async function lsRequest(endpoint, method="GET", body=null) {
  const key = localStorage.getItem("ls_api_key");
  if (!key) throw new Error("No API key configured");
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${LS_BASE}${endpoint}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
  return data;
}

// ── Loadsure commodity list (fetched live from API) ───────────────────────────
const LS_FALLBACK_COMMODITIES = [
  { id:"FOOD_BEVERAGE", label:"Food & Beverage" },
  { id:"GENERAL_FREIGHT", label:"General Freight" },
  { id:"BUILDING_MATERIALS", label:"Building Materials" },
  { id:"CLOTHING_TEXTILES", label:"Clothing & Textiles" },
  { id:"INDUSTRIAL_MACHINERY", label:"Industrial Machinery" },
  { id:"AUTOMOTIVE_PARTS", label:"Automotive Parts" },
  { id:"CHEMICALS", label:"Chemicals (non-hazardous)" },
  { id:"MEDICAL_SUPPLIES", label:"Medical Supplies" },
  { id:"PAPER_PRODUCTS", label:"Paper Products" },
  { id:"ELECTRONICS", label:"Electronics" },
];

function LoadsureStatusBadge({ status }) {
  const map = {
    ACTIVE:             { bg:C.greenlt, color:C.green, label:"Active" },
    CANCELLED:          { bg:C.parchment, color:C.stone, label:"Cancelled" },
    DRAFT_LOSS_NOTICE:  { bg:C.goldlt, color:"#7A5A10", label:"Draft" },
    AWAITING_DOCUMENTS: { bg:C.goldlt, color:"#7A5A10", label:"Awaiting Docs" },
    UNDER_REVIEW:       { bg:C.goldlt, color:"#7A5A10", label:"Under Review" },
    PAYMENT_PROPOSED:   { bg:C.greenlt, color:C.green, label:"Payment Proposed" },
    PAID:               { bg:C.greenlt, color:C.green, label:"Paid" },
    WITHDRAWN:          { bg:C.parchment, color:C.stone, label:"Withdrawn" },
    REJECTED:           { bg:C.rustlt, color:C.rust, label:"Rejected" },
  };
  const s = map[status] || { bg:C.parchment, color:C.stone, label:status };
  return <span style={{background:s.bg,color:s.color,padding:"2px 8px",borderRadius:2,fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:.5}}>{s.label}</span>;
}

// ── Real Quote Modal — hits actual Loadsure API ───────────────────────────────
// Coverage Rating maps to deductible tier as shown in Loadsure portal:
//   BASE_RATES      = First dollar / full value (no deductible, shipper bears zero risk)
//   DEDUCTIBLE_100K = Sits on top of carrier MTC — covers losses above $100K carrier liability
//   DEDUCTIBLE_250K = Same structure, $250K threshold — used when carrier MTC is strong

const LS_COVERAGE_RATINGS = [
  {
    value: "BASE_RATES",
    label: "Base Rates — First Dollar",
    desc: "Full invoice value coverage from dollar one. Shipper bears no deductible. Highest premium, broadest protection.",
    deductibleNote: "No deductible",
    badge: "Full Value",
  },
  {
    value: "DEDUCTIBLE_100K",
    label: "$100K Deductible",
    desc: "Sits on top of the carrier's Motor Truck Cargo (MTC) policy. Coverage kicks in above $100K carrier liability. Lower premium.",
    deductibleNote: "$100,000 deductible",
    badge: "Carrier MTC + Excess",
  },
  {
    value: "DEDUCTIBLE_250K",
    label: "$250K Deductible",
    desc: "Same structure as $100K but higher threshold. Best used when carrier MTC limit is strong. Lowest premium.",
    deductibleNote: "$250,000 deductible",
    badge: "High-Deductible Excess",
  },
];

function LoadsureQuoteModal({ load, onClose }) {
  const [step, setStep] = useState("form");
  const [shipValue, setShipValue] = useState(load?.value ? String(load.value) : "185000");
  const [commodityId, setCommodityId] = useState("FOOD_BEVERAGE");
  const [coverageRating, setCoverageRating] = useState("BASE_RATES");
  const [commodities, setCommodities] = useState([]);
  const [loadingCommodities, setLoadingCommodities] = useState(true);
  const [quote, setQuote] = useState(null);
  const [cert, setCert] = useState(null);
  const [error, setError] = useState("");
  const [rawReq, setRawReq] = useState(null);
  const [rawRes, setRawRes] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // Fetch real commodity list from Loadsure on mount
  useEffect(() => {
    lsRequest("/api/commodities")
      .then(data => {
        let list = Array.isArray(data) ? data : data.commodities || data.data || [];
        if (list.length > 0) setCommodities(list);
        else setCommodities([
          {id:"FOOD_BEVERAGE",label:"Food & Beverage"},
          {id:"GENERAL_FREIGHT",label:"General Freight"},
          {id:"BUILDING_MATERIALS",label:"Building Materials"},
          {id:"CLOTHING_TEXTILES",label:"Clothing & Textiles"},
          {id:"INDUSTRIAL_MACHINERY",label:"Industrial Machinery"},
          {id:"AUTOMOTIVE_PARTS",label:"Automotive Parts"},
          {id:"CHEMICALS",label:"Chemicals (non-hazardous)"},
          {id:"MEDICAL_SUPPLIES",label:"Medical Supplies"},
          {id:"PAPER_PRODUCTS",label:"Paper Products"},
          {id:"ELECTRONICS",label:"Electronics"},
        ]);
      })
      .catch(() => {
        setCommodities([
          {id:"FOOD_BEVERAGE",label:"Food & Beverage"},
          {id:"GENERAL_FREIGHT",label:"General Freight"},
          {id:"BUILDING_MATERIALS",label:"Building Materials"},
          {id:"CLOTHING_TEXTILES",label:"Clothing & Textiles"},
          {id:"INDUSTRIAL_MACHINERY",label:"Industrial Machinery"},
          {id:"AUTOMOTIVE_PARTS",label:"Automotive Parts"},
          {id:"CHEMICALS",label:"Chemicals (non-hazardous)"},
          {id:"MEDICAL_SUPPLIES",label:"Medical Supplies"},
          {id:"PAPER_PRODUCTS",label:"Paper Products"},
          {id:"ELECTRONICS",label:"Electronics"},
        ]);
      })
      .finally(() => setLoadingCommodities(false));
  }, []);

  const selectedRating = LS_COVERAGE_RATINGS.find(r => r.value === coverageRating) || LS_COVERAGE_RATINGS[0];

  const handleGetQuote = async () => {
    setStep("quoting"); setError("");
    const val = parseFloat(shipValue) || 185000;

    const reqBody = {
      assuredName: load?.shipperName || "RFPlab Shipper",
      coverageRating,                          // BASE_RATES | DEDUCTIBLE_100K | DEDUCTIBLE_250K
      cargo: {
        commodity: commodityId,
        value: val,
        currency: "USD",
      },
      equipment: {
        type: load?.mode === "Reefer" ? "REEFER"
            : load?.mode === "Flatbed" ? "FLATBED"
            : "DRY_VAN",
      },
      stops: [
        {
          sequence: 1,
          type: "PICKUP",
          date: load?.pickup || load?.pickup_date || new Date().toISOString().slice(0,10),
          location: {
            city:    load?.origin?.city  || load?.orig_city  || "",
            state:   load?.origin?.state || load?.orig_state || "",
            country: "US",
          },
        },
        {
          sequence: 2,
          type: "DELIVERY",
          date: load?.delivery || load?.delivery_date || new Date(Date.now()+172800000).toISOString().slice(0,10),
          location: {
            city:    load?.dest?.city  || load?.dest_city  || "",
            state:   load?.dest?.state || load?.dest_state || "",
            country: "US",
          },
        },
      ],
    };

    setRawReq(reqBody);

    try {
      const data = await lsRequest("/api/insureLoad/quote", "POST", reqBody);
      setRawRes(data);
      setQuote(data);
      setStep("quoted");
    } catch(e) {
      setError(e.message);
      setRawRes({ error: e.message });
      setStep("form");
    }
  };

  const handlePurchase = async () => {
    setStep("purchasing"); setError("");
    try {
      const data = await lsRequest("/api/insureLoad/purchaseQuote", "POST", {
        quoteToken: quote.quoteToken,
      });
      setRawRes(data);
      setCert(data);
      setStep("purchased");
    } catch(e) {
      setError(e.message);
      setStep("quoted");
    }
  };

  const product  = quote?.insuranceProduct || quote?.product || {};
  const premium  = +(product.premium  || quote?.premium  || 0);
  const svcFee   = +(product.serviceFee|| quote?.serviceFee|| 0);
  const tax      = +(product.tax       || quote?.tax       || 0);
  const limit    = +(product.limit     || quote?.limit     || parseFloat(shipValue)||0);
  const deduct   = +(product.deductible|| quote?.deductible|| 0);
  const total    = (premium + svcFee + tax).toFixed(2);
  const prodName = product.name || quote?.productName || "All Risk";
  const prodDesc = product.description || "";
  const exclusions = product.commodityExclusions || [];

  const mono = {fontFamily:"'DM Mono',monospace"};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:600}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">🔗 Loadsure — Cargo Insurance Quote</div>
            {load && <div style={{fontSize:11,color:C.stone,marginTop:3}}>
              {load.origin?.city||load.orig_city}, {load.origin?.state||load.orig_state} → {load.dest?.city||load.dest_city}, {load.dest?.state||load.dest_state}
            </div>}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button className="btn btn-ghost" style={{fontSize:10,color:C.stone}} onClick={()=>setShowDebug(d=>!d)}>
              {showDebug?"Hide Debug":"Debug"}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          {error && <div className="alert warn" style={{marginBottom:12}}>{error}</div>}

          {/* Debug panel */}
          {showDebug && (
            <div style={{background:"#0A1A14",borderRadius:6,padding:12,marginBottom:14,maxHeight:240,overflowY:"auto"}}>
              <div style={{fontSize:9,fontWeight:800,color:C.green,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>API Debug</div>
              {rawReq && <><div style={{fontSize:9,color:"rgba(232,242,238,.4)",marginBottom:3}}>→ POST /api/insureLoad/quote</div>
                <pre style={{fontSize:10,color:"rgba(232,242,238,.8)",whiteSpace:"pre-wrap",marginBottom:8,...mono}}>{JSON.stringify(rawReq,null,2)}</pre></>}
              {rawRes && <><div style={{fontSize:9,color:"rgba(232,242,238,.4)",marginBottom:3}}>← RESPONSE</div>
                <pre style={{fontSize:10,color:C.green,whiteSpace:"pre-wrap",...mono}}>{JSON.stringify(rawRes,null,2)}</pre></>}
              {!rawReq && <div style={{fontSize:11,color:"rgba(232,242,238,.4)"}}>No request sent yet</div>}
            </div>
          )}

          {step==="form" && (
            <div>
              {/* Coverage Rating selector — the main differentiator */}
              <div style={{marginBottom:16}}>
                <label style={{marginBottom:8}}>Coverage Rating</label>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {LS_COVERAGE_RATINGS.map(r=>(
                    <div key={r.value} onClick={()=>setCoverageRating(r.value)}
                      style={{border:`2px solid ${coverageRating===r.value?C.green:C.sand}`,
                        borderRadius:7,padding:"12px 14px",cursor:"pointer",
                        background:coverageRating===r.value?C.greenlt:C.warmWhite,
                        transition:"all .15s"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${coverageRating===r.value?C.green:C.sand}`,background:coverageRating===r.value?C.green:"transparent",flexShrink:0}}/>
                          <span style={{fontWeight:700,fontSize:13,color:C.black}}>{r.label}</span>
                        </div>
                        <span style={{fontSize:9,fontWeight:800,background:coverageRating===r.value?C.green:C.parchment,
                          color:coverageRating===r.value?C.black:C.stone,
                          padding:"2px 8px",borderRadius:2,letterSpacing:.5,textTransform:"uppercase"}}>
                          {r.badge}
                        </span>
                      </div>
                      <div style={{fontSize:11,color:C.stone,lineHeight:1.6,paddingLeft:24}}>{r.desc}</div>
                      <div style={{fontSize:10,fontWeight:700,color:coverageRating===r.value?C.green:C.stone,paddingLeft:24,marginTop:4}}>
                        {r.deductibleNote}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div className="fg">
                  <label>Declared Shipment Value (USD)</label>
                  <input type="number" value={shipValue} onChange={e=>setShipValue(e.target.value)} placeholder="185000"/>
                  <div style={{fontSize:10,color:C.stone,marginTop:3}}>Coverage limit = this value</div>
                </div>
                <div className="fg">
                  <label>Commodity {loadingCommodities&&<span style={{fontSize:9,color:C.stone}}>(loading…)</span>}</label>
                  <select value={commodityId} onChange={e=>setCommodityId(e.target.value)} disabled={loadingCommodities}>
                    {commodities.map(c=>(
                      <option key={c.id||c.value||c} value={c.id||c.value||c}>
                        {c.label||c.name||c.description||c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {load && (
                <div style={{background:C.parchment,borderRadius:7,padding:"12px 14px",marginBottom:14}}>
                  <div style={{fontSize:9,fontWeight:800,color:C.stone,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Shipment Details</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px 12px"}}>
                    {[
                      ["Origin",`${load.origin?.city||load.orig_city||"—"}, ${load.origin?.state||load.orig_state||""}`],
                      ["Destination",`${load.dest?.city||load.dest_city||"—"}, ${load.dest?.state||load.dest_state||""}`],
                      ["Mode",load.mode||"Dry Van"],
                      ["Pickup",load.pickup||load.pickup_date||"—"],
                      ["Delivery",load.delivery||load.delivery_date||"—"],
                      ["Carrier",load.awardedTo||load.awarded_to||"TBD"],
                    ].map(([k,v])=>(
                      <div key={k}>
                        <div style={{fontSize:9,color:C.stone,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:1}}>{k}</div>
                        <div style={{fontSize:12,fontWeight:600,color:C.black}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",fontSize:13}} onClick={handleGetQuote}>
                Get Live Quote — {selectedRating.label} →
              </button>
            </div>
          )}

          {step==="quoting" && (
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:28,marginBottom:12}}>⏳</div>
              <div style={{fontWeight:700,fontSize:14,color:C.black,marginBottom:6}}>Getting your quote…</div>
              <div style={{fontSize:12,color:C.stone}}>Calling Loadsure API · {selectedRating.label}</div>
            </div>
          )}

          {step==="quoted" && quote && (
            <div>
              <div style={{background:C.greenlt,border:`1px solid ${C.green}`,borderRadius:8,padding:"16px 18px",marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:800,color:C.green,letterSpacing:1,textTransform:"uppercase"}}>✓ Quote Ready — {prodName}</div>
                    {prodDesc && <div style={{fontSize:11,color:C.ash,lineHeight:1.5,marginTop:3,maxWidth:360}}>{prodDesc}</div>}
                  </div>
                  <span style={{fontSize:9,fontWeight:800,background:C.green,color:C.black,padding:"2px 8px",borderRadius:2,whiteSpace:"nowrap",marginLeft:8}}>
                    {selectedRating.badge}
                  </span>
                </div>
                {[
                  ["Coverage Limit",  "$"+Number(limit).toLocaleString()],
                  ["Deductible",       deduct?"$"+Number(deduct).toLocaleString():selectedRating.deductibleNote],
                  ["Premium",         "$"+premium.toFixed(2)],
                  ["Service Fee",     "$"+svcFee.toFixed(2)],
                  ["Tax & Fees",      "$"+tax.toFixed(2)],
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",
                    borderBottom:`1px solid rgba(0,200,83,.12)`,fontSize:12}}>
                    <span style={{color:C.ash}}>{k}</span>
                    <span style={{fontWeight:700,color:C.black,...mono}}>{v}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0",fontSize:15,fontWeight:800}}>
                  <span style={{color:C.black}}>Total Due</span>
                  <span style={{color:C.green,...mono}}>${total}</span>
                </div>
              </div>

              <div style={{fontSize:10,color:C.stone,marginBottom:12}}>
                Token: <span style={mono}>{quote.quoteToken}</span> · Expires 10 min · Invoice payment
              </div>

              {exclusions.length > 0 && (
                <div className="alert warn" style={{marginBottom:12,fontSize:11}}>
                  <strong>Exclusions:</strong> {exclusions.join(", ")}
                </div>
              )}

              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-outline" style={{flex:1,justifyContent:"center"}} onClick={()=>setStep("form")}>← Revise</button>
                <button className="btn btn-green" style={{flex:2,justifyContent:"center"}} onClick={handlePurchase}>
                  Purchase Coverage — ${total} →
                </button>
              </div>
            </div>
          )}

          {step==="purchasing" && (
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:28,marginBottom:12}}>⏳</div>
              <div style={{fontWeight:700,fontSize:14,color:C.black,marginBottom:6}}>Purchasing coverage…</div>
              <div style={{fontSize:12,color:C.stone}}>Submitting to Loadsure</div>
            </div>
          )}

          {step==="purchased" && cert && (
            <div>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:42,marginBottom:8}}>✅</div>
                <div style={{fontWeight:800,fontSize:16,color:C.black,marginBottom:4}}>Coverage Active</div>
                <div style={{fontSize:12,color:C.stone}}>Certificate issued by Loadsure · {selectedRating.label}</div>
              </div>
              <div style={{background:C.parchment,borderRadius:8,padding:"14px 16px",marginBottom:14}}>
                {[
                  ["Certificate #", cert.certificateNumber||cert.id||"—"],
                  ["Coverage Rating", selectedRating.label],
                  ["Coverage Limit", "$"+Number(cert.limit||cert.coverage||limit).toLocaleString()],
                  ["Deductible", deduct?"$"+Number(cert.deductible||deduct).toLocaleString():selectedRating.deductibleNote],
                  ["Total Paid", "$"+Number(cert.premium||premium).toFixed(2)],
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",
                    borderBottom:`1px solid ${C.sand}`,fontSize:12}}>
                    <span style={{color:C.stone}}>{k}</span>
                    <span style={{fontWeight:700,color:C.black}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                {cert.certificateLink && <a href={cert.certificateLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{flex:1,justifyContent:"center",textDecoration:"none"}}>⬇ Certificate</a>}
                {cert.fileClaimLink && <a href={cert.fileClaimLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{flex:1,justifyContent:"center",textDecoration:"none"}}>📋 File Claim</a>}
              </div>
              <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:8}} onClick={onClose}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RiskLoadsurePage({ setPage }) {
  const [apiKey]      = useState(localStorage.getItem("ls_api_key")||"");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [connected, setConnected]     = useState(!!localStorage.getItem("ls_api_key"));
  const [connecting, setConnecting]   = useState(false);
  const [connErr, setConnErr]         = useState("");
  const [activeTab, setActiveTab]     = useState("certificates");
  const [quoteModal, setQuoteModal]   = useState(false);

  // Live data from API
  const [certs, setCerts]   = useState([]);
  const [claims, setClaims] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // API test panel
  const [testValue, setTestValue]   = useState("185000");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting]       = useState(false);
  const [testErr, setTestErr]       = useState("");

  useEffect(() => {
    if (!connected) return;
    loadData();
  }, [connected]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const certsData = await lsRequest("/api/certificates");
      setCerts(Array.isArray(certsData) ? certsData : certsData.certificates || certsData.data || []);
    } catch(e) { setCerts([]); }
    try {
      const claimsData = await lsRequest("/api/claims");
      setClaims(Array.isArray(claimsData) ? claimsData : claimsData.claims || claimsData.data || []);
    } catch(e) { setClaims([]); }
    setLoadingData(false);
  };

  const handleConnect = async () => {
    if (!apiKeyInput.trim()) return;
    setConnecting(true); setConnErr("");
    try {
      // Validate key with a real API call — fetch commodity list
      const key = apiKeyInput.trim();
      const res = await fetch(`${LS_BASE}/api/commodities`, {
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error(`Invalid key — HTTP ${res.status}`);
      localStorage.setItem("ls_api_key", key);
      setConnected(true);
    } catch(e) {
      setConnErr(e.message || "Could not validate API key");
    }
    setConnecting(false);
  };

  const handleDisconnect = () => {
    localStorage.removeItem("ls_api_key");
    setConnected(false); setApiKeyInput("");
    setCerts([]); setClaims([]);
  };

  const handleTestQuote = async () => {
    setTesting(true); setTestErr(""); setTestResult(null);
    const val = parseFloat(testValue) || 185000;
    const baseBody = {
      assuredName: "RFPlab API Test",
      cargo: { commodity: "FOOD_BEVERAGE", value: val, currency: "USD" },
      equipment: { type: "DRY_VAN" },
      stops: [
        { sequence:1, type:"PICKUP",   date:"2026-08-01", location:{ city:"Chicago", state:"IL", country:"US" } },
        { sequence:2, type:"DELIVERY", date:"2026-08-03", location:{ city:"Dallas",  state:"TX", country:"US" } },
      ],
    };

    // Fire all three coverage ratings in parallel
    const ratings = ["BASE_RATES", "DEDUCTIBLE_100K", "DEDUCTIBLE_250K"];
    try {
      const results = await Promise.allSettled(
        ratings.map(r => lsRequest("/api/insureLoad/quote", "POST", { ...baseBody, coverageRating: r }))
      );
      const all = {};
      ratings.forEach((r, i) => {
        all[r] = results[i].status === "fulfilled"
          ? results[i].value
          : { error: results[i].reason?.message || "Failed" };
      });
      setTestResult({ success: true, all, request: baseBody });
    } catch(e) {
      setTestErr(e.message);
      setTestResult({ success: false, error: e.message });
    }
    setTesting(false);
  };

  const maskedKey = apiKey ? apiKey.slice(0,8)+"••••••••••••"+apiKey.slice(-4) : "";
  const activeCerts  = certs.filter(c=>c.status==="ACTIVE");
  const totalPremium = activeCerts.reduce((s,c)=>s+(c.premium||0),0);
  const totalCoverage= activeCerts.reduce((s,c)=>s+(c.limit||c.coverage||0),0);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">Cargo Insurance — Loadsure</div>
          <div className="page-sub">Per-load all-risk coverage · Live API connection</div>
        </div>
        {connected && <button className="btn btn-green" onClick={()=>setQuoteModal(true)}>+ Get Quote & Purchase</button>}
      </div>

      {/* Connection card */}
      <div className="card" style={{marginBottom:16,borderLeft:`3px solid ${connected?C.green:C.sand}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,background:connected?C.greenlt:C.parchment,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🔗</div>
            <div>
              <div style={{fontWeight:800,fontSize:14,color:C.black,display:"flex",alignItems:"center",gap:8}}>
                Loadsure
                {connected
                  ? <span style={{background:C.greenlt,color:C.green,padding:"2px 8px",borderRadius:2,fontSize:9,fontWeight:800,letterSpacing:.5}}>CONNECTED</span>
                  : <span style={{background:C.parchment,color:C.stone,padding:"2px 8px",borderRadius:2,fontSize:9,fontWeight:800,letterSpacing:.5}}>NOT CONNECTED</span>}
              </div>
              <div style={{fontSize:11,color:C.stone,marginTop:2}}>
                {connected ? <>API key: <span style={{fontFamily:"'DM Mono',monospace"}}>{maskedKey}</span></> : "Paste your Loadsure API key to connect"}
              </div>
            </div>
          </div>
          {connected
            ? <button className="btn btn-outline btn-sm" onClick={handleDisconnect}>Disconnect</button>
            : <div style={{display:"flex",gap:8,alignItems:"center",flex:1,maxWidth:400}}>
                <input type="password" value={apiKeyInput} onChange={e=>setApiKeyInput(e.target.value)}
                  placeholder="Paste Loadsure API key…"
                  style={{fontFamily:"'DM Mono',monospace",fontSize:12}}/>
                <button className="btn btn-primary btn-sm" onClick={handleConnect} disabled={connecting||!apiKeyInput.trim()}>
                  {connecting?"Checking…":"Connect"}
                </button>
              </div>}
        </div>
        {connErr && <div className="alert warn" style={{marginTop:12,marginBottom:0}}>{connErr}</div>}
      </div>

      {connected && (
        <>
          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-tile"><div className="stat-label">Active Certs</div><div className="stat-value">{loadingData?"…":activeCerts.length}</div></div>
            <div className="stat-tile"><div className="stat-label">Total Coverage</div><div className="stat-value" style={{fontSize:18}}>{loadingData?"…":"$"+(totalCoverage/1000).toFixed(0)+"K"}</div></div>
            <div className="stat-tile"><div className="stat-label">YTD Premiums</div><div className="stat-value" style={{fontSize:18,fontFamily:"'DM Mono',monospace"}}>{loadingData?"…":"$"+totalPremium.toFixed(2)}</div></div>
            <div className="stat-tile"><div className="stat-label">Open Claims</div><div className="stat-value" style={{color:claims.length>0?C.rust:C.green}}>{loadingData?"…":claims.length}</div></div>
          </div>

          <div className="tab-bar">
            {["certificates","claims","api_test","settings"].map(t=>(
              <div key={t} className={`tab${activeTab===t?" active":""}`} onClick={()=>setActiveTab(t)}
                style={{textTransform:"capitalize"}}>{t==="api_test"?"API Test":t}</div>
            ))}
          </div>

          {/* Certificates */}
          {activeTab==="certificates" && (
            <div>
              {loadingData
                ? <div className="card" style={{textAlign:"center",padding:32,color:C.stone}}>Loading from Loadsure…</div>
                : certs.length===0
                  ? <div className="card" style={{textAlign:"center",padding:"44px 20px",border:`2px dashed ${C.sand}`}}>
                      <div style={{fontSize:32,marginBottom:10}}>📄</div>
                      <div style={{fontWeight:600,fontSize:14,color:C.black,marginBottom:6}}>No certificates yet</div>
                      <div style={{fontSize:12,color:C.stone,marginBottom:16}}>Purchase your first per-load coverage to see certificates here.</div>
                      <button className="btn btn-green" onClick={()=>setQuoteModal(true)}>Get First Quote →</button>
                    </div>
                  : <div className="card" style={{padding:0,overflow:"hidden"}}>
                      <table>
                        <thead><tr>
                          <th>Certificate #</th><th>Load / Route</th><th>Coverage</th><th>Premium</th><th>Pickup</th><th>Status</th><th></th>
                        </tr></thead>
                        <tbody>
                          {certs.map((c,i)=>(
                            <tr key={c.certificateNumber||c.id||i}>
                              <td className="mono" style={{fontSize:10,color:C.stone}}>{(c.certificateNumber||c.id||"").slice(0,12)}…</td>
                              <td style={{fontWeight:600,fontSize:11}}>{c.originCity||"—"} → {c.destinationCity||"—"}</td>
                              <td className="mono">${Number(c.limit||c.coverage||0).toLocaleString()}</td>
                              <td className="mono" style={{fontWeight:700,color:C.green}}>${Number(c.premium||0).toFixed(2)}</td>
                              <td style={{fontSize:11,color:C.stone}}>{c.pickupDate||c.pickup_date||"—"}</td>
                              <td><LoadsureStatusBadge status={c.status}/></td>
                              <td>
                                {c.certificateLink && <a href={c.certificateLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs" style={{textDecoration:"none"}}>⬇</a>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>}
            </div>
          )}

          {/* Claims */}
          {activeTab==="claims" && (
            <div>
              {loadingData
                ? <div className="card" style={{textAlign:"center",padding:32,color:C.stone}}>Loading…</div>
                : claims.length===0
                  ? <div className="card" style={{textAlign:"center",padding:"44px 20px",border:`2px dashed ${C.sand}`}}>
                      <div style={{fontSize:32,marginBottom:10}}>📋</div>
                      <div style={{fontWeight:600,fontSize:14,color:C.black,marginBottom:6}}>No claims filed</div>
                      <div style={{fontSize:12,color:C.stone}}>Claims are filed against active certificates when cargo is lost or damaged.</div>
                    </div>
                  : <div className="card" style={{padding:0,overflow:"hidden"}}>
                      <table>
                        <thead><tr>
                          <th>Claim #</th><th>Certificate</th><th>Cause of Loss</th><th>Amount</th><th>Filed</th><th>Status</th>
                        </tr></thead>
                        <tbody>
                          {claims.map((cl,i)=>(
                            <tr key={cl.claimNumber||cl.id||i}>
                              <td className="mono" style={{fontSize:10,fontWeight:700}}>{cl.claimNumber||cl.id}</td>
                              <td className="mono" style={{fontSize:10,color:C.stone}}>{(cl.certificateNumber||"").slice(0,12)}…</td>
                              <td style={{fontSize:11}}>{(cl.causeOfLoss||"").replace(/_/g," ")}</td>
                              <td className="mono" style={{fontWeight:700,color:C.rust}}>${Number(cl.lostValue||cl.amount||0).toLocaleString()}</td>
                              <td style={{fontSize:11,color:C.stone}}>{cl.filedDate||cl.filed||"—"}</td>
                              <td><LoadsureStatusBadge status={cl.status}/></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>}
            </div>
          )}

          {/* API Test Panel */}
          {activeTab==="api_test" && (
            <div>
              <div className="card">
                <div className="card-title" style={{marginBottom:4}}>Live API Test — All Coverage Ratings</div>
                <div style={{fontSize:12,color:C.stone,marginBottom:16}}>
                  Fires a real quote request for all three coverage ratings simultaneously so you can compare pricing and verify the API is returning correct values.
                </div>
                <div style={{display:"flex",gap:10,alignItems:"flex-end",marginBottom:14}}>
                  <div style={{flex:1}}>
                    <label>Declared Value (USD)</label>
                    <input type="number" value={testValue} onChange={e=>setTestValue(e.target.value)} placeholder="185000"/>
                  </div>
                  <button className="btn btn-primary" onClick={handleTestQuote} disabled={testing} style={{flexShrink:0}}>
                    {testing?"Testing all 3…":"Run Test — All Ratings"}
                  </button>
                  <button className="btn btn-outline" onClick={loadData} style={{flexShrink:0}}>↻ Refresh</button>
                </div>
                {testErr && <div className="alert warn" style={{marginBottom:10}}>{testErr}</div>}

                {testResult && testResult.success && testResult.all && (
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:10,fontWeight:800,color:C.stone,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Premium Comparison — ${Number(testValue).toLocaleString()}</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                      {LS_COVERAGE_RATINGS.map(r=>{
                        const res = testResult.all[r.value];
                        const prod = res?.insuranceProduct || res?.product || {};
                        const prem = +(prod.premium||res?.premium||0);
                        const fee  = +(prod.serviceFee||res?.serviceFee||0);
                        const tax2 = +(prod.tax||res?.tax||0);
                        const tot  = (prem+fee+tax2).toFixed(2);
                        const ok   = !!res && !res.error;
                        return (
                          <div key={r.value} style={{border:`1px solid ${ok?C.green:C.sand}`,borderRadius:7,padding:"12px 14px",background:ok?C.greenlt:C.parchment}}>
                            <div style={{fontWeight:700,fontSize:12,color:C.black,marginBottom:4}}>{r.label}</div>
                            <div style={{fontSize:10,color:C.stone,marginBottom:8}}>{r.deductibleNote}</div>
                            {ok
                              ? <>
                                  <div style={{fontSize:20,fontWeight:800,color:C.green,fontFamily:"'DM Mono',monospace"}}>${tot}</div>
                                  <div style={{fontSize:10,color:C.stone,marginTop:2}}>
                                    Premium: ${prem.toFixed(2)} · Fee: ${fee.toFixed(2)} · Tax: ${tax2.toFixed(2)}
                                  </div>
                                </>
                              : <div style={{fontSize:11,color:C.rust}}>{res?.error||"No response"}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {testResult && (
                  <div style={{background:"#0A1A14",borderRadius:6,padding:14,maxHeight:400,overflowY:"auto"}}>
                    <div style={{fontSize:9,fontWeight:800,color:C.green,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>→ Requests / ← Responses</div>
                    {testResult.success && testResult.all
                      ? Object.entries(testResult.all).map(([rating,resp])=>(
                          <div key={rating} style={{marginBottom:12}}>
                            <div style={{fontSize:9,color:"rgba(232,242,238,.4)",marginBottom:3}}>{rating}</div>
                            <pre style={{fontSize:10,color:resp?.error?C.rust:C.green,whiteSpace:"pre-wrap",fontFamily:"'DM Mono',monospace"}}>{JSON.stringify(resp,null,2)}</pre>
                          </div>
                        ))
                      : <pre style={{fontSize:10,color:C.rust,whiteSpace:"pre-wrap",fontFamily:"'DM Mono',monospace"}}>{JSON.stringify(testResult,null,2)}</pre>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab==="settings" && (
            <div>
              <div className="card">
                <div className="card-title" style={{marginBottom:16}}>Integration Settings</div>
                {[
                  {label:"Auto-quote on load post", desc:"Automatically request a quote when a spot load is posted.", enabled:true},
                  {label:"Require coverage before award", desc:"Block load award until an active certificate is in place.", enabled:false},
                  {label:"Email certificate to carrier", desc:"Send a copy of each certificate to the awarded carrier.", enabled:true},
                  {label:"Notify on claim status change", desc:"Send email alerts when a claim status changes.", enabled:true},
                ].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${C.sand}`}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:C.black}}>{s.label}</div>
                      <div style={{fontSize:11,color:C.stone,marginTop:2}}>{s.desc}</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked={s.enabled} readOnly/>
                      <span className="toggle-slider"/>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {quoteModal && <LoadsureQuoteModal load={null} onClose={()=>{setQuoteModal(false);loadData();}}/>}
    </div>
  );
}
// ─── END RISK MANAGEMENT ──────────────────────────────────────────────────────

// ─── Organization Team Members Page ──────────────────────────────────────────
function OrgTeamPage({ dbProfile, role }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', jobTitle:'', orgRole:'member' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const company = dbProfile?.company || "Your Company";

  useEffect(() => {
    if (!dbProfile) { setLoading(false); return; }
    import('./supabase.js').then(({ getOrgMembers }) => {
      getOrgMembers(company).then(data => { setMembers(data); setLoading(false); });
    });
  }, [dbProfile]);

  const handleInvite = async () => {
    if (!form.name || !form.email) return;
    setSending(true);
    try {
      const { sendUserInvite } = await import('./supabase.js');
      await sendUserInvite({ email: form.email, full_name: form.name, role, company });
    } catch(e) {}
    setSent(true); setSending(false);
    setTimeout(() => { setSent(false); setInviteModal(false); setForm({name:'',email:'',jobTitle:'',orgRole:'member'}); }, 2000);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">Team Members</div>
          <div className="page-sub">{company} · {members.length} member{members.length!==1?'s':''} with portal access</div>
        </div>
        <button className="btn btn-green" onClick={()=>setInviteModal(true)}>+ Invite Team Member</button>
      </div>

      <div className="alert info" style={{marginBottom:16,fontSize:12}}>
        All team members share access to <strong>{company}</strong>'s RFPs, spot loads, and carrier network. Managers can create RFPs. Members can view and monitor activity.
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {loading
          ? <div style={{padding:40,textAlign:'center',color:C.stone,fontSize:13}}>Loading…</div>
          : members.length===0
            ? <div style={{padding:'52px 20px',textAlign:'center'}}>
                <div style={{fontSize:36,marginBottom:12}}>👥</div>
                <div style={{fontWeight:700,fontSize:14,color:C.black,marginBottom:6}}>Just you so far</div>
                <div style={{fontSize:12,color:C.stone,marginBottom:16,maxWidth:320,margin:'0 auto 16px'}}>Invite colleagues to collaborate on bids, monitor carrier activity, and manage spot loads together.</div>
                <button className="btn btn-green" onClick={()=>setInviteModal(true)}>Invite First Team Member →</button>
              </div>
            : <table>
                <thead><tr><th>Name</th><th>Email</th><th>Platform Role</th><th>Access</th><th>Joined</th></tr></thead>
                <tbody>
                  {members.map(m=>(
                    <tr key={m.id}>
                      <td style={{fontWeight:700}}>
                        {m.full_name||'—'}
                        {m.id===dbProfile?.id&&<span style={{fontSize:9,fontWeight:800,background:C.greenlt,color:C.green,padding:'1px 6px',borderRadius:2,marginLeft:6}}>YOU</span>}
                      </td>
                      <td style={{color:C.stone,fontSize:12}}>{m.email}</td>
                      <td><span style={{background:C.black,color:C.green,fontSize:9,fontWeight:800,padding:'2px 7px',borderRadius:2,textTransform:'uppercase',letterSpacing:.5}}>{m.role}</span></td>
                      <td style={{fontSize:12,color:C.stone}}>Full access</td>
                      <td style={{fontSize:11,color:C.stone}}>{fmtDateShort(m.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>}
      </div>

      {inviteModal && (
        <div className="modal-overlay" onClick={()=>setInviteModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Invite Team Member to {company}</div>
              <button className="btn btn-ghost" onClick={()=>setInviteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {sent && <div className="alert" style={{background:C.greenlt,color:C.green,borderLeft:`3px solid ${C.green}`,marginBottom:12}}>✓ Invite sent!</div>}
              <div className="alert info" style={{marginBottom:14}}>They'll receive an email to set their password and join <strong>{company}</strong>'s portal.</div>
              <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="First Last"/></div>
              <div className="form-group"><label>Work Email</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="colleague@company.com"/></div>
              <div className="form-group"><label>Job Title (optional)</label><input value={form.jobTitle} onChange={e=>setForm(f=>({...f,jobTitle:e.target.value}))} placeholder="Logistics Manager"/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setInviteModal(false)}>Cancel</button>
              <button className="btn btn-green" onClick={handleInvite} disabled={sending||sent||!form.name||!form.email}>
                {sending?'⏳ Sending…':sent?'✓ Sent!':'📧 Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Carrier Bid List — shows all bids the carrier is invited to ──────────────
// Real bids loaded from Supabase rfp_invites table filtered by carrier email
const CARRIER_SAMPLE_BIDS = []; // empty — data comes from Supabase
function CarrierBidList({ setPage, dbProfile, onSelectBid }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dbProfile) { setLoading(false); return; }
    // Load RFPs this carrier has been invited to
    import('./supabase.js').then(({ getMyInvites }) => {
      getMyInvites(dbProfile.email || "").then(invites => {
        // Map invite records to bid objects
        const mapped = (invites || []).map(inv => ({
          id:          inv.rfps?.id || inv.rfp_id,
          name:        inv.rfps?.name || "RFP Invitation",
          shipper:     inv.rfps?.shipper_name || "Shipper",
          modes:       inv.rfps?.modes || [],
          deadline:    inv.rfps?.rate_deadline,
          awardDate:   inv.rfps?.award_date,
          goLive:      inv.rfps?.go_live_date,
          status:      inv.rfps?.status || "active",
          myStatus:    inv.status || "invited",
          lanesTotal:  inv.rfps?.lane_count || 0,
          lanesRated:  inv.lanes_rated || 0,
          rateDeadline: inv.rfps?.rate_deadline,
          // Pass full rfp data for bid detail view
          ...inv.rfps,
          carrierInviteId: inv.id,
        }));
        setBids(mapped);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, [dbProfile]);

  const statusMeta = {
    invited:   { label:"Invited — Not Acknowledged", bg:"#F5EDD4", color:"#7A5A10" },
    confirmed: { label:"Confirmed — Participating",  bg:"#E6F9EE", color:"#00A043" },
    submitted: { label:"Rates Submitted",            bg:"#E6F9EE", color:"#00A043" },
    declined:  { label:"Declined",                   bg:"#FFEBEE", color:"#B71C1C" },
    awarded:   { label:"Awarded",                    bg:"#E6F9EE", color:"#00A043" },
    not_awarded:{ label:"Not Awarded",               bg:"#EEF3F0", color:"#6B8B7E" },
  };

  const rfpStatusMeta = {
    active:  { label:"Active — Accepting Bids", color:"#00C853" },
    awarded: { label:"Awarded",                  color:"#2E7D32" },
    closed:  { label:"Closed",                   color:"#6B8B7E" },
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">Bid Details</div>
          <div className="page-sub">All RFPs you've been invited to participate in</div>
        </div>
      </div>

      {loading
        ? <div className="card" style={{textAlign:"center",padding:40,color:C.stone}}>Loading your bids…</div>
        : bids.length === 0
        ? <div className="card" style={{textAlign:"center",padding:"52px 20px",border:`2px dashed ${C.sand}`}}>
            <div style={{fontSize:36,marginBottom:12}}>📬</div>
            <div style={{fontWeight:700,fontSize:14,color:C.black,marginBottom:6}}>No active bid invitations</div>
            <div style={{fontSize:12,color:C.stone}}>When a shipper invites you to an RFP, it will appear here.</div>
          </div>
        : <div>
            {bids.map(bid => {
              const sm = statusMeta[bid.myStatus]  || statusMeta.invited;
              const rm = rfpStatusMeta[bid.status] || rfpStatusMeta.active;
              const daysLeft = Math.ceil((new Date(bid.deadline) - Date.now()) / 86400000);
              return (
                <div key={bid.id} className="card" style={{marginBottom:10,cursor:"pointer",borderLeft:`3px solid ${rm.color}`}}
                  onClick={()=>{ onSelectBid(bid); }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:15,color:C.black,marginBottom:3}}>{bid.name}</div>
                      <div style={{fontSize:12,color:C.stone}}>{bid.shipper} · {bid.modes}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      <span style={{background:sm.bg,color:sm.color,padding:"3px 10px",borderRadius:3,fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:.5}}>{sm.label}</span>
                      <span style={{fontSize:10,color:rm.color,fontWeight:700}}>{rm.label}</span>
                    </div>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,padding:"10px 0",borderTop:`1px solid ${C.sand}`}}>
                    {[
                      ["Rates Due",    fmtDateShort(bid.deadline)],
                      ["Awards",       fmtDateShort(bid.awardDate)],
                      ["Go Live",      fmtDateShort(bid.goLive)],
                      ["Lanes",        `${bid.lanesTotal} total`],
                      ["Submitted",    `${bid.lanesRated} of ${bid.lanesTotal}`],
                    ].map(([k,v])=>(
                      <div key={k}>
                        <div style={{fontSize:9,color:C.stone,fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{k}</div>
                        <div style={{fontSize:12,fontWeight:700,color:C.black}}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {bid.status==="active" && daysLeft >= 0 && (
                    <div style={{marginTop:10,display:"flex",alignItems:"center",gap:10}}>
                      <div style={{flex:1,height:4,background:C.sand,borderRadius:2}}>
                        <div style={{height:4,background:daysLeft<3?C.rust:daysLeft<7?C.gold:C.green,borderRadius:2,width:`${Math.max(5,Math.min(100,(bid.lanesRated/bid.lanesTotal)*100))}%`}}/>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:daysLeft<3?C.rust:C.stone}}>{daysLeft} days left to bid</span>
                      <button className="btn btn-green btn-sm" style={{flexShrink:0}}>
                        {bid.myStatus==="submitted" ? "Update Rates →" : bid.myStatus==="confirmed" ? "Submit Rates →" : "View & Respond →"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>}
    </div>
  );
}

// ─── Shipper / Admin RFP Detail — monitoring view ────────────────────────────
function ShipperRFPDetail({ rfp, setPage, dbProfile }) {
  const [tab, setTab] = useState("overview");
  const [addCarrierModal, setAddCarrierModal] = useState(false);
  const [newCarrier, setNewCarrier] = useState({name:"",email:"",scac:"",contact:""});
  const [awardModal, setAwardModal] = useState(null); // lane object
  const [selectedAward, setSelectedAward] = useState({});

  // Carrier list from the RFP — comes from rfp.carrierInvites (loaded from Supabase)
  const carriers = rfp?.carrierInvites || rfp?.carriers || [];
  const sampleLanes = rfp?.lanes || [];

  const statusMeta = {
    submitted: {label:"Submitted",    bg:C.greenlt, color:C.green},
    confirmed: {label:"Acknowledged", bg:"#E6F9EE", color:"#00A043"},
    invited:   {label:"Invited",      bg:C.goldlt,  color:"#7A5A10"},
    declined:  {label:"Declined",     bg:C.rustlt,  color:C.rust},
  };

  const submitted   = carriers.filter(c=>c.status==="submitted").length;
  const acknowledged= carriers.filter(c=>c.acknowledged==="yes").length;
  const declined    = carriers.filter(c=>c.status==="declined").length;
  const totalLanesRated = carriers.reduce((s,c)=>s+c.lanesRated,0);

  const handleAddCarrier = () => {
    if (!newCarrier.name || !newCarrier.email) return;
    // In production: insert into rfp_invites table + send email
    setAddCarrierModal(false);
    setNewCarrier({name:"",email:"",scac:"",contact:""});
  };

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div>
          <button className="btn btn-ghost" style={{fontSize:11,marginBottom:6}} onClick={()=>setPage("rfps")}>← Back to My RFPs</button>
          <div className="page-title">{rfp?.name||"RFP Detail"}</div>
          <div className="page-sub">{rfp?.shipper_name||rfp?.shipper||"—"} · {(rfp?.modes||[]).join(", ")||"Truckload"} · Rate deadline: {fmtDateShort(rfp?.rate_deadline)}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-outline" onClick={()=>setAddCarrierModal(true)}>+ Add Carrier</button>
          <span style={{background:C.greenlt,color:C.green,padding:"5px 12px",borderRadius:4,fontSize:11,fontWeight:800,display:"flex",alignItems:"center"}}>
            ● ACTIVE
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{marginBottom:16}}>
        <div className="stat-tile"><div className="stat-label">Carriers Invited</div><div className="stat-value">{carriers.length}</div><div className="stat-sub">{acknowledged} acknowledged</div></div>
        <div className="stat-tile"><div className="stat-label">Rates Submitted</div><div className="stat-value" style={{color:C.green}}>{submitted}</div><div className="stat-sub">of {carriers.length} invited</div></div>
        <div className="stat-tile"><div className="stat-label">Declined</div><div className="stat-value" style={{color:declined>0?C.rust:C.stone}}>{declined}</div></div>
        <div className="stat-tile"><div className="stat-label">Lane Coverage</div><div className="stat-value">{sampleLanes.filter(l=>l.bids.length>0).length}</div><div className="stat-sub">of {sampleLanes.length} lanes have bids</div></div>
      </div>

      <div className="tab-bar">
        {["overview","carriers","lanes","activity"].map(t=>(
          <div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)} style={{textTransform:"capitalize"}}>{t}</div>
        ))}
      </div>

      {/* Overview */}
      {tab==="overview" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>📋 Bid Configuration</div>
            {[
              ["Rate Format",    rfp?.rate_format==="flat_linehaul"?"Flat Linehaul — no fuel":"All-In"],
              ["Award Model",    rfp?.award_model||"Primary + Backup"],
              ["Max / Lane",     rfp?.max_carriers_per_lane||3],
              ["Rounds",         rfp?.two_rounds?"2 rounds":"1 round"],
              ["Feedback",       rfp?.feedback_enabled?`Enabled — ${rfp.feedback_type}`:"Disabled"],
              ["Rates Due",      fmtDateShort(rfp?.rate_deadline)],
              ["Awards",         fmtDateShort(rfp?.award_date)],
              ["Go Live",        fmtDateShort(rfp?.go_live_date)],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.sand}`,fontSize:12}}>
                <span style={{color:C.stone}}>{k}</span><span style={{fontWeight:600,color:C.black}}>{v}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>📊 Submission Progress</div>
            {carriers.map(c=>{
              const sm = statusMeta[c.status]||statusMeta.invited;
              const pct = c.lanesTotal>0?Math.round((c.lanesRated/c.lanesTotal)*100):0;
              return (
                <div key={c.id} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:12,color:C.black}}>{c.name}</span>
                    <span style={{background:sm.bg,color:sm.color,fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:2}}>{sm.label}</span>
                  </div>
                  <div style={{height:6,background:C.sand,borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:6,width:`${pct}%`,background:pct===100?C.green:pct>0?"#C9A84C":C.sand,borderRadius:3,transition:"width .4s"}}/>
                  </div>
                  <div style={{fontSize:10,color:C.stone,marginTop:2}}>{c.lanesRated} of {c.lanesTotal} lanes · {pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Carriers */}
      {tab==="carriers" && (
        <div>
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <table>
              <thead><tr>
                <th>Carrier</th><th>SCAC</th><th>Email</th><th>Acknowledged</th><th>Lanes Submitted</th><th>Last Activity</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>
                {carriers.map(c=>{
                  const sm = statusMeta[c.status]||statusMeta.invited;
                  return (
                    <tr key={c.id}>
                      <td style={{fontWeight:700,color:C.black}}>{c.name}</td>
                      <td className="mono" style={{color:C.stone}}>{c.scac}</td>
                      <td style={{fontSize:11,color:C.stone}}>{c.email}</td>
                      <td>
                        {c.acknowledged==="yes"
                          ? <span style={{color:C.green,fontWeight:700,fontSize:11}}>✓ Yes</span>
                          : c.acknowledged==="no"
                            ? <span style={{color:C.rust,fontSize:11}}>✕ Declined</span>
                            : <span style={{color:C.stone,fontSize:11}}>—</span>}
                      </td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:80,height:5,background:C.sand,borderRadius:3}}>
                            <div style={{height:5,width:`${c.lanesTotal>0?Math.round((c.lanesRated/c.lanesTotal)*100):0}%`,background:C.green,borderRadius:3}}/>
                          </div>
                          <span style={{fontSize:11,color:C.stone}}>{c.lanesRated}/{c.lanesTotal}</span>
                        </div>
                      </td>
                      <td style={{fontSize:11,color:C.stone}}>{c.lastActivity?fmtDateShort(c.lastActivity):"—"}</td>
                      <td><span style={{background:sm.bg,color:sm.color,fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:2,textTransform:"uppercase"}}>{sm.label}</span></td>
                      <td>
                        <div style={{display:"flex",gap:4}}>
                          <button className="btn btn-ghost btn-xs" style={{fontSize:10}}>📧 Remind</button>
                          <button className="btn btn-ghost btn-xs" style={{fontSize:10,color:C.rust}}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="btn btn-green btn-sm" style={{marginTop:10}} onClick={()=>setAddCarrierModal(true)}>+ Add Carrier to Bid</button>
        </div>
      )}

      {/* Lanes — rate view with award capability */}
      {tab==="lanes" && (
        <div>
          <div className="alert info" style={{marginBottom:12,fontSize:12}}>
            You can award lanes before the bid closes. Awards are provisional until the bid deadline passes.
          </div>
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <table>
              <thead><tr>
                <th>Lane</th><th>Origin</th><th>Destination</th><th>Mode</th><th>Vol</th><th>Miles</th><th>Bids</th><th>Low Bid</th><th>Award</th>
              </tr></thead>
              <tbody>
                {sampleLanes.map(lane=>{
                  const sorted = [...lane.bids].sort((a,b)=>a.rate-b.rate);
                  const low = sorted[0];
                  const awarded = selectedAward[lane.id];
                  return (
                    <tr key={lane.id} style={{background:awarded?C.greenlt:"transparent"}}>
                      <td className="mono" style={{fontSize:11,color:C.stone}}>{lane.id}</td>
                      <td style={{fontSize:12}}>{lane.orig}</td>
                      <td style={{fontSize:12}}>{lane.dest}</td>
                      <td><span style={{fontSize:10,fontWeight:700,color:lane.mode==="Reefer"?C.green:C.stone}}>{lane.mode}</span></td>
                      <td className="mono" style={{fontSize:11}}>{lane.vol}</td>
                      <td className="mono" style={{fontSize:11}}>{lane.miles.toLocaleString()}</td>
                      <td style={{fontSize:11,color:C.stone}}>{lane.bids.length} bid{lane.bids.length!==1?"s":""}</td>
                      <td style={{fontWeight:700,color:C.green,fontFamily:"'DM Mono',monospace"}}>
                        {low?`$${low.rate.toLocaleString()}`:"—"}
                        {low&&<div style={{fontSize:9,color:C.stone,fontWeight:400}}>{low.carrier}</div>}
                      </td>
                      <td>
                        {awarded
                          ? <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <span style={{fontSize:10,fontWeight:700,color:C.green}}>✓ {awarded}</span>
                              <button className="btn btn-ghost btn-xs" style={{fontSize:9}} onClick={()=>setSelectedAward(a=>({...a,[lane.id]:null}))}>Change</button>
                            </div>
                          : <select style={{fontSize:11,padding:"3px 6px"}} value="" onChange={e=>{if(e.target.value)setSelectedAward(a=>({...a,[lane.id]:e.target.value}));}}>
                              <option value="">— Select carrier —</option>
                              {sorted.map(b=><option key={b.carrier} value={b.carrier}>{b.carrier} (${b.rate.toLocaleString()})</option>)}
                            </select>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {Object.values(selectedAward).some(Boolean) && (
            <div style={{marginTop:12,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:C.stone}}>{Object.values(selectedAward).filter(Boolean).length} lane{Object.values(selectedAward).filter(Boolean).length!==1?"s":""} provisionally awarded</span>
              <button className="btn btn-green">✓ Confirm All Awards & Notify Carriers</button>
              <button className="btn btn-outline">Export Award Summary</button>
            </div>
          )}
        </div>
      )}

      {/* Activity */}
      {tab==="activity" && (
        <div className="card">
          <div className="card-title" style={{marginBottom:14}}>📜 Bid Activity Log</div>
          {(rfp?.activityLog||[]).length===0
            ? <div style={{textAlign:"center",padding:"32px",color:C.stone,fontSize:13}}>No activity yet — invite your carriers to get started.</div>
            : (rfp?.activityLog||[]).map((e,i)=>{
            const icons = {rates_submitted:"📊",file_downloaded:"⬇",intent_yes:"✅",intent_no:"❌",invite_sent:"📧"};
            return (
              <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.sand}`}}>
                <span style={{fontSize:18,flexShrink:0}}>{icons[e.event]||"•"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.black}}>{e.carrier} — {e.detail}</div>
                  <div style={{fontSize:10,color:C.stone,marginTop:2}}>{fmtDateTime(e.ts||e.created_at)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Carrier Modal */}
      {addCarrierModal && (
        <div className="modal-overlay" onClick={()=>setAddCarrierModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Carrier to Bid</div>
              <button className="btn btn-ghost" onClick={()=>setAddCarrierModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert info" style={{marginBottom:14}}>The carrier will receive an invite email with their secure bid link immediately.</div>
              <div className="form-group"><label>Company Name *</label><input value={newCarrier.name} onChange={e=>setNewCarrier(c=>({...c,name:e.target.value}))} placeholder="Carrier / Broker name"/></div>
              <div className="form-group"><label>Contact Email *</label><input type="email" value={newCarrier.email} onChange={e=>setNewCarrier(c=>({...c,email:e.target.value}))} placeholder="rates@carrier.com"/></div>
              <div className="form-group"><label>SCAC (optional)</label><input value={newCarrier.scac} onChange={e=>setNewCarrier(c=>({...c,scac:e.target.value}))} placeholder="e.g. ROAR"/></div>
              <div className="form-group"><label>Contact Name (optional)</label><input value={newCarrier.contact} onChange={e=>setNewCarrier(c=>({...c,contact:e.target.value}))} placeholder="First Last"/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setAddCarrierModal(false)}>Cancel</button>
              <button className="btn btn-green" onClick={handleAddCarrier} disabled={!newCarrier.name||!newCarrier.email}>📧 Add & Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── END SHIPPER RFP DETAIL ───────────────────────────────────────────────────

function PlaceholderPage({ title, sub }) {
  return (
    <div className="card" style={{textAlign:"center",padding:60}}>
      <div style={{fontSize:32,marginBottom:12}}>🚧</div>
      <div className="page-title" style={{marginBottom:6}}>{title}</div>
      <div style={{color:C.stone,fontSize:13}}>{sub||"Coming in next build"}</div>
    </div>
  );
}

// ─── Simple dashboards ────────────────────────────────────────────────────────
// ─── My RFPs Page — with drafts, progress, timestamps ────────────────────────
function MyRFPsPage({ setPage, role, dbProfile, onSelectRFP }) {
  const [drafts,  setDrafts]  = useState([]);
  const [rfps,    setRfps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");

  useEffect(() => {
    // Load drafts from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('rfplab_drafts') || '[]');
      setDrafts(saved.sort((a,b) => new Date(b.savedAt) - new Date(a.savedAt)));
    } catch(e) { setDrafts([]); }

    // Load live RFPs from Supabase
    if (dbProfile) {
      import('./supabase.js').then(({ getRFPs }) => {
        getRFPs(dbProfile.id).then(data => {
          setRfps(data || []);
          setLoading(false);
        }).catch(() => setLoading(false));
      });
    } else {
      setLoading(false);
    }
  }, [dbProfile]);

  useEffect(() => {
    // Load saved drafts from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('rfplab_drafts') || '[]');
      setDrafts(saved.sort((a,b) => new Date(b.savedAt) - new Date(a.savedAt)));
    } catch(e) { setDrafts([]); }
  }, []);

  const deleteDraft = (id) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem('rfplab_drafts', JSON.stringify(updated));
  };

  const statusBadge = (status) => {
    const map = {
      draft:   {bg:C.amberlt, color:C.amber,  label:"Draft"},
      active:  {bg:C.greenlt, color:C.green,  label:"Active"},
      awarded: {bg:C.greenlt,     color:C.ash,  label:"Awarded"},
      closed:  {bg:C.parchment,color:C.stone,   label:"Closed"},
    };
    const s = map[status] || map.draft;
    return <span style={{background:s.bg,color:s.color,padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700}}>{s.label}</span>;
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">My RFPs</div>
          <div className="page-sub">Active bids, drafts in progress, and completed awards</div>
        </div>
        <button className="btn btn-green" onClick={() => setPage("new_rfp")}>🚀 New RFP</button>
      </div>

      <div className="tab-bar">
        {["active","drafts","awarded","closed"].map(t => (
          <div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)} style={{textTransform:"capitalize"}}>
            {t}
            {t==="drafts" && drafts.length > 0 && (
              <span style={{background:C.amber,color:"white",borderRadius:20,fontSize:9,fontWeight:700,padding:"1px 6px",marginLeft:6}}>{drafts.length}</span>
            )}
          </div>
        ))}
      </div>

      {/* Drafts tab */}
      {tab === "drafts" && (
        <div>
          {drafts.length === 0
            ? <div className="card" style={{textAlign:"center",padding:"48px 20px",border:`2px dashed ${C.sand}`}}>
                <div style={{fontSize:32,marginBottom:10}}>📝</div>
                <div style={{fontWeight:600,fontSize:14,color:C.black,marginBottom:6}}>No drafts saved</div>
                <div style={{fontSize:12,color:C.stone,marginBottom:16}}>Start building an RFP and click "Save Draft" to pick up where you left off.</div>
                <button className="btn btn-primary" onClick={() => setPage("new_rfp")}>Start New RFP →</button>
              </div>
            : drafts.map(draft => {
                const savedDate = new Date(draft.savedAt);
                const ago = (() => {
                  const mins = Math.floor((Date.now() - savedDate) / 60000);
                  if (mins < 1) return "just now";
                  if (mins < 60) return `${mins}m ago`;
                  const hrs = Math.floor(mins / 60);
                  if (hrs < 24) return `${hrs}h ago`;
                  return fmtDateShort(draft.savedAt);
                })();

                return (
                  <div key={draft.id} className="card" style={{marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:C.black}}>{draft.name || "Untitled RFP"}</div>
                        <div style={{fontSize:11,color:C.stone,marginTop:3}}>
                          Step {draft.step} of 10 — {WIZ_STEP_GROUPS.flatMap(g=>g.steps).find(s=>s.id===draft.step)?.label}
                          <span style={{margin:"0 6px",color:C.sand}}>·</span>
                          Last saved {ago}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{background:C.amberlt,color:C.amber,padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700}}>Draft</span>
                        <button className="btn btn-ghost btn-sm" style={{color:C.rust,fontSize:11}} onClick={() => deleteDraft(draft.id)}>✕ Delete</button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:10,color:C.stone}}>Progress</span>
                        <span style={{fontSize:10,fontWeight:700,color:C.ash}}>{draft.pct}%</span>
                      </div>
                      <div style={{height:6,background:C.sand,borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:6,background:C.green,borderRadius:3,width:`${draft.pct}%`,transition:"width .4s"}}/>
                      </div>
                    </div>

                    {/* Step pills */}
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
                      {WIZ_STEP_GROUPS.flatMap(g=>g.steps).map(s => {
                        const done = (draft.completed||[]).includes(s.id);
                        const current = s.id === draft.step;
                        return (
                          <span key={s.id} style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,
                            background: done?C.greenlt : current?C.greenlt : C.parchment,
                            color: done?C.green : current?C.ash : C.stone,
                            border: `1px solid ${done?C.green:current?C.green:C.sand}`}}>
                            {done?"✓ ":""}{s.label}
                          </span>
                        );
                      })}
                    </div>

                    <div style={{display:"flex",gap:8}}>
                      <button className="btn btn-primary btn-sm" onClick={() => setPage("new_rfp")}>
                        ✏️ Continue Building →
                      </button>
                      <span style={{fontSize:11,color:C.stone,alignSelf:"center"}}>
                        Saved {fmtDateTime(draft.savedAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
        </div>
      )}

      {/* Active / Awarded / Closed tabs — real data from Supabase will populate these */}
      {tab !== "drafts" && (
        <div>
          {loading
            ? <div className="card" style={{textAlign:"center",padding:40,color:C.stone}}>Loading RFPs…</div>
            : (() => {
                const filtered = rfps.filter(r => {
                  if (tab==="active")  return ["active","draft"].includes(r.status);
                  if (tab==="awarded") return r.status==="awarded";
                  if (tab==="closed")  return r.status==="closed";
                  return true;
                });
                if (filtered.length === 0) return (
                  <div className="card" style={{textAlign:"center",padding:"48px 20px",border:`2px dashed ${C.sand}`}}>
                    <div style={{fontSize:32,marginBottom:10}}>{tab==="active"?"📋":tab==="awarded"?"🏆":"📦"}</div>
                    <div style={{fontWeight:600,fontSize:14,color:C.black,marginBottom:6}}>No {tab} RFPs yet</div>
                    <div style={{fontSize:12,color:C.stone,marginBottom:16}}>
                      {tab==="active" ? "Launch your first RFP to start collecting carrier rates."
                       : tab==="awarded" ? "Awarded RFPs will appear here once you finalize selections."
                       : "Closed bids archive here for reference."}
                    </div>
                    {tab==="active" && <button className="btn btn-green" onClick={() => setPage("new_rfp")}>🚀 Build Your First RFP →</button>}
                  </div>
                );
                return filtered.map(rfp => (
                  <div key={rfp.id} className="card" style={{marginBottom:10,cursor:"pointer"}} onClick={()=>onSelectRFP?onSelectRFP(rfp):setPage("results")}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div>
                        <div style={{fontWeight:800,fontSize:14,color:C.black}}>{rfp.name}</div>
                        <div style={{fontSize:12,color:C.stone,marginTop:2}}>{rfp.shipper_name} · {(rfp.modes||[]).join(", ")}</div>
                      </div>
                      <span style={{background:rfp.status==="active"?C.greenlt:C.parchment,
                        color:rfp.status==="active"?C.green:C.stone,
                        padding:"2px 8px",borderRadius:2,fontSize:9,fontWeight:800,textTransform:"uppercase"}}>
                        {rfp.status}
                      </span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                      {[
                        ["Rate Deadline", fmtDateShort(rfp.rate_deadline)],
                        ["Awards", fmtDateShort(rfp.award_date)],
                        ["Go Live", fmtDateShort(rfp.go_live_date)],
                        ["Created", fmtDateShort(rfp.created_at)],
                      ].map(([k,v])=>(
                        <div key={k}>
                          <div style={{fontSize:9,color:C.stone,textTransform:"uppercase",letterSpacing:.5,fontWeight:700,marginBottom:2}}>{k}</div>
                          <div style={{fontSize:12,fontWeight:600,color:C.black}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
        </div>
      )}
    </div>
  );
}

// ─── Admin: User Management ───────────────────────────────────────────────────
function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ email:'', full_name:'', company:'', role:'shipper' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { getAllUsers } = await import('./supabase.js');
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!form.email || !form.full_name || !form.company) { setErr('All fields required'); return; }
    setSending(true); setErr('');
    const { sendUserInvite } = await import('./supabase.js');
    const { error } = await sendUserInvite(form);
    if (error) { setErr(error.message); setSending(false); return; }
    setSent(true);
    setSending(false);
    setTimeout(() => { setSent(false); setModal(false); setForm({email:'',full_name:'',company:'',role:'shipper'}); loadUsers(); }, 2000);
  };

  const handleRoleChange = async (userId, newRole) => {
    const { updateUserRole } = await import('./supabase.js');
    await updateUserRole(userId, newRole);
    setUsers(prev => prev.map(u => u.id === userId ? {...u, role: newRole} : u));
  };

  const rolePillStyle = (r) => ({
    display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700,
    background: r==='admin' ? C.black : r==='shipper' ? C.green : C.amber,
    color: 'white'
  });

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-sub">Create and manage shipper and carrier accounts</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setModal(true); setErr(''); setSent(false); }}>
          + Invite User
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-tile"><div className="stat-label">Total Users</div><div className="stat-value">{users.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Shippers</div><div className="stat-value">{users.filter(u=>u.role==='shipper').length}</div></div>
        <div className="stat-tile"><div className="stat-label">Carriers</div><div className="stat-value">{users.filter(u=>u.role==='carrier').length}</div></div>
        <div className="stat-tile"><div className="stat-label">Admins</div><div className="stat-value">{users.filter(u=>u.role==='admin').length}</div></div>
      </div>

      <div className="tab-bar">
        {['all','shipper','carrier','admin'].map(f => (
          <div key={f} className={`tab${filter===f?' active':''}`}
            onClick={() => setFilter(f)}
            style={{textTransform:'capitalize'}}>{f === 'all' ? 'All Users' : f+'s'}</div>
        ))}
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {loading
          ? <div style={{padding:40,textAlign:'center',color:C.stone,fontSize:13}}>Loading users…</div>
          : filtered.length === 0
            ? <div style={{padding:40,textAlign:'center',color:C.stone,fontSize:13}}>
                No {filter === 'all' ? '' : filter} users yet.{' '}
                <span style={{color:C.ash,cursor:'pointer'}} onClick={() => setModal(true)}>Invite one →</span>
              </div>
            : <table>
                <thead><tr>
                  <th>Name</th><th>Email</th><th>Company</th><th>Role</th><th>Joined</th><th>Change Role</th>
                </tr></thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td style={{fontWeight:600}}>{u.full_name || '—'}</td>
                      <td style={{color:C.stone,fontSize:12}}>{u.email}</td>
                      <td>{u.company || '—'}</td>
                      <td><span style={rolePillStyle(u.role)}>{u.role}</span></td>
                      <td style={{color:C.stone,fontSize:11}}>{fmtDateShort(u.created_at)}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          style={{fontSize:11,padding:'4px 6px',width:'auto'}}>
                          <option value="shipper">Shipper</option>
                          <option value="carrier">Carrier</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>}
      </div>

      {/* Invite Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Invite New User</div>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert info" style={{marginBottom:14}}>
                The user will receive an email with a secure link to create their password and access their portal. Their role is set by you — they cannot change it.
              </div>
              {err && <div className="alert" style={{background:C.rustlt,color:C.rust,borderLeft:`3px solid ${C.rust}`,marginBottom:12}}>{err}</div>}
              {sent && <div className="alert" style={{background:C.greenlt,color:C.green,borderLeft:`3px solid ${C.green}`,marginBottom:12}}>✓ Invite sent! They'll receive an email shortly.</div>}

              <div className="form-group">
                <label>Role</label>
                <div style={{display:'flex',gap:8,marginTop:4}}>
                  {[['shipper','🏢 Shipper'],['carrier','🚛 Carrier / Broker'],['admin','⚙️ Admin']].map(([v,l]) => (
                    <div key={v} onClick={() => setForm(f=>({...f,role:v}))}
                      style={{flex:1,padding:'9px 8px',border:`2px solid ${form.role===v?C.green:C.sand}`,
                        borderRadius:7,textAlign:'center',cursor:'pointer',fontSize:11,fontWeight:form.role===v?700:500,
                        background:form.role===v?C.greenlt:'white'}}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} placeholder="First Last"/>
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} placeholder="Company name"/>
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="user@company.com"/>
              </div>
              <div style={{background:C.parchment,border:`1px solid ${C.sand}`,borderRadius:8,padding:'10px 14px',fontSize:12,color:C.stone,marginTop:4}}>
                <strong style={{color:C.black}}>What happens next:</strong> They'll get an email to set their password. When they click the link, they land on the RFPlab login page with their role pre-set as <strong>{form.role}</strong>. They cannot self-upgrade to admin.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleInvite} disabled={sending||sent}>
                {sending ? '⏳ Sending…' : sent ? '✓ Sent!' : `📧 Send ${form.role} Invite`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ setPage }) {
  const [stats, setStats] = useState({ rfps:0, spotLoads:0, users:0, shippers:0, carriers:0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function load() {
      const { getAllUsers, getAllRFPs, getAllSpotLoads } = await import('./supabase.js');
      const [users, rfps, spotLoads] = await Promise.all([getAllUsers(), getAllRFPs(), getAllSpotLoads()]);
      setStats({
        rfps: rfps.length,
        spotLoads: spotLoads.filter(l => l.status === 'live').length,
        users: users.length,
        shippers: users.filter(u => u.role === 'shipper').length,
        carriers: users.filter(u => u.role === 'carrier').length,
      });
      setRecentUsers(users.slice(0, 8));
      setLoadingStats(false);
    }
    load();
  }, []);

  const rolePill = (r) => ({
    display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700,
    background: r==='admin'?C.black : r==='shipper'?C.green : C.amber, color:'white'
  });

  return (
    <div>
      <div className="section-header">
        <div><div className="page-title">Platform Overview</div><div className="page-sub">Live data — all shippers, carriers, and bids</div></div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-outline" onClick={()=>setPage("users")}>👥 Manage Users</button>
          <button className="btn btn-green" onClick={()=>setPage("new_rfp")}>🚀 New RFP</button>
        </div>
      </div>

      {/* Procurement mode cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        <div style={{background:`linear-gradient(135deg,${C.black},${C.ink})`,borderRadius:10,padding:"16px 18px",cursor:"pointer"}} onClick={()=>setPage("new_rfp")}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:36,height:36,background:"rgba(255,255,255,.1)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📋</div>
            <div><div style={{fontWeight:700,fontSize:13,color:"white"}}>Contracted RFP</div><div style={{fontSize:11,color:"rgba(255,255,255,.55)"}}>Multi-lane · Multi-carrier</div></div>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.6,marginBottom:10}}>Build and manage structured bids for shippers — lane files, carrier invites, award modeling.</div>
          <div style={{fontSize:12,fontWeight:600,color:C.green}}>Launch RFP Wizard →</div>
        </div>
        <div style={{background:`linear-gradient(135deg,#7C3AED,#5B21B6)`,borderRadius:10,padding:"16px 18px",cursor:"pointer"}} onClick={()=>setPage("spot")}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:36,height:36,background:"rgba(255,255,255,.1)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚡</div>
            <div><div style={{fontWeight:700,fontSize:13,color:"white"}}>Spot Load Auction</div><div style={{fontSize:11,color:"rgba(255,255,255,.55)"}}>Single load · Real-time quotes</div></div>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.6,marginBottom:10}}>Post a single load, set a timed quote window, award to the best quote in real time.</div>
          <div style={{fontSize:12,fontWeight:600,color:"#C4B5FD"}}>View Spot Board →</div>
        </div>
      </div>

      {/* Live stats from DB */}
      <div className="stat-grid">
        <div className="stat-tile"><div className="stat-label">Total Users</div><div className="stat-value">{loadingStats ? '…' : stats.users}</div><div className="stat-sub">{stats.shippers} shippers · {stats.carriers} carriers</div></div>
        <div className="stat-tile"><div className="stat-label">RFPs Created</div><div className="stat-value">{loadingStats ? '…' : stats.rfps}</div></div>
        <div className="stat-tile"><div className="stat-label">Live Spot Loads</div><div className="stat-value">{loadingStats ? '…' : stats.spotLoads}</div></div>
        <div className="stat-tile"><div className="stat-label">Platform</div><div className="stat-value" style={{fontSize:14,color:C.green,fontWeight:700}}>Live ✓</div></div>
      </div>

      {/* Recent users */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Users</div>
          <button className="btn btn-sm btn-outline" onClick={()=>setPage("users")}>View all →</button>
        </div>
        {loadingStats
          ? <div style={{padding:"20px 0",textAlign:"center",color:C.stone,fontSize:12}}>Loading…</div>
          : recentUsers.length === 0
            ? <div style={{padding:"20px 0",textAlign:"center",color:C.stone,fontSize:12}}>
                No users yet. <span style={{color:C.ash,cursor:"pointer"}} onClick={()=>setPage("users")}>Invite your first shipper →</span>
              </div>
            : recentUsers.map(u=>(
                <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.sand}`}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>{u.full_name || u.email}</div>
                    <div style={{fontSize:11,color:C.stone}}>{u.company || u.email}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={rolePill(u.role)}>{u.role}</span>
                    <span style={{fontSize:11,color:C.stone}}>{fmtDateShort(u.created_at)}</span>
                  </div>
                </div>
              ))}
      </div>
    </div>
  );
}

function ShipperDashboard({ setPage, dbProfile }) {
  const name = dbProfile?.company || dbProfile?.full_name || "Your Company";
  const isReal = !!dbProfile; // real logged-in user vs demo

  if (isReal) {
    // Clean dashboard for real users — no hardcoded Spindrift data
    return (
      <div>
        <div className="section-header">
          <div>
            <div className="page-title">Welcome, {name}</div>
            <div className="page-sub">Procurement Hub — choose how you want to move freight today</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          <div style={{background:`linear-gradient(135deg,${C.black},${C.ink})`,borderRadius:10,padding:"18px 20px",cursor:"pointer"}} onClick={()=>setPage("new_rfp")}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:40,height:40,background:"rgba(255,255,255,.1)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📋</div>
              <div><div style={{fontWeight:700,fontSize:14,color:"white"}}>Contracted RFP</div><div style={{fontSize:11,color:"rgba(255,255,255,.55)"}}>Multi-lane · Multi-carrier bid</div></div>
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.7,marginBottom:12}}>Run a structured bid across all your lanes. Set award strategy, invite carriers, and build your routing guide.</div>
            <button className="btn btn-sm btn-green" onClick={e=>{e.stopPropagation();setPage("new_rfp");}}>🚀 Start New RFP →</button>
          </div>
          <div style={{background:`linear-gradient(135deg,#4C1D95,#6D28D9)`,borderRadius:10,padding:"18px 20px",cursor:"pointer"}} onClick={()=>setPage("spot")}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:40,height:40,background:"rgba(255,255,255,.1)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>⚡</div>
              <div><div style={{fontWeight:700,fontSize:14,color:"white"}}>Spot Load</div><div style={{fontSize:11,color:"rgba(255,255,255,.55)"}}>Single load · Timed quote window</div></div>
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.7,marginBottom:12}}>Post a single load and award to the best quote in real time. Quotes close automatically when your window expires.</div>
            <button className="btn btn-sm" style={{background:"rgba(255,255,255,.9)",color:C.ash,border:"none",fontWeight:700}} onClick={e=>{e.stopPropagation();setPage("spot");}}>⚡ Post a Load →</button>
          </div>
        </div>
        <div className="card" style={{textAlign:"center",padding:"36px 20px",border:`2px dashed ${C.sand}`}}>
          <div style={{fontSize:32,marginBottom:12}}>📋</div>
          <div style={{fontWeight:600,fontSize:14,color:C.black,marginBottom:6}}>No RFPs yet</div>
          <div style={{fontSize:12,color:C.stone,marginBottom:16}}>Create your first RFP to start inviting carriers and collecting rates.</div>
          <button className="btn btn-primary" onClick={()=>setPage("new_rfp")}>🚀 Build Your First RFP →</button>
        </div>
      </div>
    );
  }

  // Demo mode — keep the Spindrift example for illustration
  return (
    <div>
      <div className="section-header">
        <div><div className="page-title">Procurement Hub</div><div className="page-sub">Spindrift Beverages · Demo mode</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        <div style={{background:`linear-gradient(135deg,${C.black},${C.ink})`,borderRadius:10,padding:"18px 20px",cursor:"pointer"}} onClick={()=>setPage("rfps")}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:40,height:40,background:"rgba(255,255,255,.1)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📋</div>
            <div><div style={{fontWeight:700,fontSize:14,color:"white"}}>Contracted RFP</div><div style={{fontSize:11,color:"rgba(255,255,255,.55)"}}>Multi-lane · Multi-carrier bid</div></div>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.7,marginBottom:12}}>Structured bid across all your lanes with award modeling and routing guides.</div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-sm" style={{background:"rgba(255,255,255,.1)",color:"white",border:"1px solid rgba(255,255,255,.2)"}} onClick={e=>{e.stopPropagation();setPage("rfps");}}>View RFPs</button>
            <button className="btn btn-sm btn-green" onClick={e=>{e.stopPropagation();setPage("new_rfp");}}>🚀 New RFP</button>
          </div>
        </div>
        <div style={{background:`linear-gradient(135deg,#4C1D95,#6D28D9)`,borderRadius:10,padding:"18px 20px",cursor:"pointer"}} onClick={()=>setPage("spot")}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:40,height:40,background:"rgba(255,255,255,.1)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>⚡</div>
            <div><div style={{fontWeight:700,fontSize:14,color:"white"}}>Spot Load Auction</div><div style={{fontSize:11,color:"rgba(255,255,255,.55)"}}>Single load · Timed quotes</div></div>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.7,marginBottom:12}}>Post a load, set a timed window, award to the best quote in real time.</div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-sm" style={{background:"rgba(255,255,255,.1)",color:"white",border:"1px solid rgba(255,255,255,.2)"}} onClick={e=>{e.stopPropagation();setPage("spot");}}>Spot Board</button>
            <button className="btn btn-sm" style={{background:"rgba(255,255,255,.9)",color:C.ash,border:"none",fontWeight:700}} onClick={e=>{e.stopPropagation();setPage("spot");}}>⚡ Post Load</button>
          </div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-tile"><div className="stat-label">Active RFP Lanes</div><div className="stat-value">97</div><div className="stat-sub">May–Aug 2026</div></div>
        <div className="stat-tile"><div className="stat-label">RFP Carriers In</div><div className="stat-value">11<span style={{fontSize:14}}>/13</span></div></div>
        <div className="stat-tile"><div className="stat-label">Spot Loads Live</div><div className="stat-value">2</div></div>
        <div className="stat-tile"><div className="stat-label">Spot Awarded Today</div><div className="stat-value">1</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <div className="card"><div className="card-header"><div className="card-title">RFP Bid Timeline — May–Aug 2026</div></div>
          <div className="timeline">
            {[["done","RFP Created","Mar 15, 2026"],["done","Carriers Invited","Mar 18, 2026"],["done","Lane File Sent","Mar 20, 2026"],["active","Bid Window Open","Mar 20 – Apr 30"],["pending","Analysis & Awards","May 1–7"],["pending","Go Live","May 12, 2026"]].map(([s,l,d])=>(
              <div key={l} className="timeline-item"><div className={`timeline-dot ${s}`}/><div className="timeline-label">{l}</div><div className="timeline-date">{d}</div></div>
            ))}
          </div>
        </div>
        <div className="card"><div className="card-title" style={{marginBottom:12}}>Quick Actions</div>
          {[["📊","RFP Results","results"],["🏆","Award Lanes","awards"],["🚛","Manage Invites","invite"],["⚡","Spot Board","spot"]].map(([i,l,p])=>(
            <button key={p+l} className="btn btn-outline" style={{width:"100%",justifyContent:"flex-start",marginBottom:8}} onClick={()=>setPage(p)}>{i} {l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}


function CarrierDashboard({ setPage, bidSettings, dbProfile }) {
  const myLanes = LANES.filter(l=>l.bids.some(b=>b.carrier===carrierName));
  const r1 = myLanes.filter(l=>l.bids[0]?.carrier===carrierName).length;
  return (
    <div>
      <div className="section-header"><div><div className="page-title">{carrierName||"Carrier"} — Portal</div><div className="page-sub">Contracted RFP + Spot Load Board</div></div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        <div className="card-sm" style={{cursor:"pointer",borderLeft:`4px solid ${C.ash}`}} onClick={()=>setPage("event")}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>📋 Spindrift RFP — May–Aug 2026</div>
          <div style={{fontSize:11,color:C.stone,marginBottom:8}}>97 lanes · Deadline Apr 30, 2026</div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-sm btn-outline" onClick={e=>{e.stopPropagation();setPage("event");}}>View Bid Details</button>
            <button className="btn btn-sm btn-primary" onClick={e=>{e.stopPropagation();setPage("bid");}}>💲 Submit Rates</button>
          </div>
        </div>
        <div className="card-sm" style={{cursor:"pointer",borderLeft:`4px solid ${C.ash}`}} onClick={()=>setPage("spot")}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>⚡ Spot Load Board</div>
          <div style={{fontSize:11,color:C.stone,marginBottom:8}}><span className="live-dot" style={{display:"inline-block",marginRight:4}}/>2 loads live · Blind auction</div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-sm" style={{background:C.greenlt,color:C.ash,border:`1px solid #C4B5FD`}} onClick={e=>{e.stopPropagation();setPage("spot");}}>View Spot Board →</button>
          </div>
        </div>
      </div>
      <div className="alert info">📩 You are invited to bid on 97 lanes for Spindrift. Deadline: Apr 30, 2026. You will not see other participants or their rates.</div>
      {bidSettings.feedbackEnabled && <div className="alert purple">📊 Shipper has enabled feedback: <strong>{bidSettings.feedbackType}</strong> visible after you submit.</div>}
      <div className="stat-grid">
        <div className="stat-tile"><div className="stat-label">RFP Lanes</div><div className="stat-value">97</div></div>
        <div className="stat-tile"><div className="stat-label">Rates Submitted</div><div className="stat-value">{myLanes.length}</div></div>
        <div className="stat-tile"><div className="stat-label">Low Bidder On</div><div className="stat-value">{r1}</div></div>
        <div className="stat-tile"><div className="stat-label">Spot Loads Open</div><div className="stat-value">2</div></div>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App({ dbUser = null, dbProfile = null, initialRole = null }) {
  const [role, setRole] = useState(initialRole || dbProfile?.role || "shipper");
  const [page, setPage] = useState(role === "carrier" ? "event" : "dashboard");
  const [selectedBid, setSelectedBid] = useState(null);
  const [selectedRFP, setSelectedRFP] = useState(null);
  const [bidSettings, setBidSettings] = useState({...DEFAULT_BID_SETTINGS});

  // Real users get EMPTY state — data comes from Supabase
  // Demo mode (no dbUser) shows seed data for illustration only
  const [activityLog, setActivityLog] = useState(dbUser ? [] : SEED_LOG);
  const nextId = useState(SEED_LOG.length + 1);
  const isDemo = !dbUser;

  const isLocked = dbProfile && dbProfile.role !== 'admin';
  const displayName = dbProfile?.company || dbProfile?.full_name ||
    (role === "carrier" ? "Carrier" : role === "shipper" ? "Shipper" : "RFPlab Admin");

  const handleSignOut = async () => {
    const { signOut } = await import('./supabase.js');
    await signOut();
    window.location.reload();
  };

  const addLog = (entry) => {
    setActivityLog(log => [
      ...log,
      { id: nextId[0]++, ts: new Date().toISOString(), ...entry }
    ]);
  };

  const handleSetPage = (p) => {
    if (role === "carrier" && p === "event") {
      addLog({ carrier: displayName, event:"invite_viewed", detail:"Event page viewed", actor:"carrier" });
    }
    setPage(p);
  };

  const handleSetRole = (r) => {
    if (isLocked) return;
    setRole(r);
    setPage(r === "carrier" ? "event" : "dashboard");
  };

  const renderPage = () => {
    // RFP Wizard — now inside the shell, sidebar stays visible
    if (page === "new_rfp") {
      return (
        <RFPWizard
          builderRole={role}
          initialShipper={role === "shipper" ? displayName : ""}
          dbProfile={dbProfile}
          onClose={() => setPage("dashboard")}
          onLaunched={() => setPage("rfps")}
        />
      );
    }
    if (page === "spot") return <SpotBoard role={role} dbProfile={dbProfile}/>;

    if (role==="admin") {
      if (page==="dashboard") return <AdminDashboard setPage={setPage}/>;
      if (page==="users")     return <AdminUserManagement/>;
      if (page==="activity")  return <ActivityLogPage activityLog={activityLog} viewerRole="admin" dbProfile={dbProfile}/>;
      if (page==="rfps")      return <MyRFPsPage setPage={setPage} role={role} dbProfile={dbProfile} onSelectRFP={rfp=>{setSelectedRFP(rfp);setPage("rfp_detail");}}/>;
      if (page==="rfp_detail") return <ShipperRFPDetail rfp={selectedRFP} setPage={setPage} dbProfile={dbProfile}/>;
      if (page==="risk_carriers")  return <RiskCarriersPage dbProfile={dbProfile}/>;
      if (page==="risk_insurance") return <RiskInsurancePage/>;
      if (page==="risk_scorecards")return <RiskScorecardsPage/>;
      if (page==="risk_loadsure")  return <RiskLoadsurePage setPage={setPage}/>;
      return <PlaceholderPage title={page}/>;
    }
    if (role==="shipper") {
      if (page==="dashboard") return <ShipperDashboard setPage={setPage} dbProfile={dbProfile}/>;
      if (page==="invite")    return <InvitePage dbProfile={dbProfile}/>;
      if (page==="results" || page==="awards") return <ResultsPage bidSettings={bidSettings} dbProfile={dbProfile}/>;
      if (page==="activity")  return <ActivityLogPage activityLog={activityLog} viewerRole="shipper" dbProfile={dbProfile}/>;
      if (page==="rfps")      return <MyRFPsPage setPage={setPage} role={role} dbProfile={dbProfile} onSelectRFP={rfp=>{setSelectedRFP(rfp);setPage("rfp_detail");}}/>;
      if (page==="rfp_detail") return <ShipperRFPDetail rfp={selectedRFP} setPage={setPage} dbProfile={dbProfile}/>;
      if (page==="risk_carriers")  return <RiskCarriersPage dbProfile={dbProfile}/>;
      if (page==="risk_insurance") return <RiskInsurancePage/>;
      if (page==="risk_scorecards")return <RiskScorecardsPage/>;
      if (page==="risk_loadsure")  return <RiskLoadsurePage setPage={setPage}/>;
      if (page==="org_team")       return <OrgTeamPage dbProfile={dbProfile} role={role}/>;
      return <PlaceholderPage title={page}/>;
    }
    if (role==="carrier") {
      if (page==="event")     return <CarrierBidList setPage={setPage} dbProfile={dbProfile} onSelectBid={(bid)=>{ setSelectedBid(bid); setPage("bid_detail"); }}/>;
      if (page==="bid_detail")return <EventPage carrierName={displayName} addLog={addLog} activityLog={activityLog} setPage={setPage} dbProfile={dbProfile} bidSettings={selectedBid||bidSettings}/>;
      if (page==="bid")       return <BidPage bidSettings={selectedBid||bidSettings} carrierName={displayName} addLog={addLog} dbProfile={dbProfile}/>;
      if (page==="standing")  return <StandingPage bidSettings={selectedBid||bidSettings} carrierName={displayName} dbProfile={dbProfile}/>;
      if (page==="activity")  return <ActivityLogPage activityLog={activityLog} viewerRole="carrier" dbProfile={dbProfile}/>;
      if (page==="dashboard") return <CarrierDashboard setPage={setPage} bidSettings={bidSettings} dbProfile={dbProfile}/>;
      if (page==="spot")      return <SpotBoard role={role} dbProfile={dbProfile}/>;
      if (page==="org_team")  return <OrgTeamPage dbProfile={dbProfile} role={role}/>;
    }
  };

  const roleLabels = { admin:"Admin Console", shipper: displayName, carrier: displayName };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <Sidebar role={role} page={page} setPage={handleSetPage} dbProfile={dbProfile}/>
        <div className="main">
          <div className="topbar">
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <RFPLabLogo dark={false} size="sm"/>
              <div style={{width:"1px",height:28,background:C.sand}}/>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span className={`role-pill ${role}`}>{role}</span>
                <span style={{fontSize:13,color:C.stone}}>{roleLabels[role]}</span>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {!isLocked && <RoleSwitcher role={role} setRole={handleSetRole} setPage={setPage}/>}
              {dbUser && (
                <button onClick={handleSignOut} style={{background:"none",border:`1px solid ${C.sand}`,borderRadius:6,padding:"5px 12px",fontSize:11,color:C.stone,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                  Sign out
                </button>
              )}
            </div>
          </div>
          <div className="content">{renderPage()}</div>
        </div>
      </div>
    </>
  );
}
