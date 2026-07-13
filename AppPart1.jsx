import { useState, useEffect, useRef } from "react";

// ─── RFPlab.com Brand Tokens ──────────────────────────────────────────────────
// Matched to rfplab.com website: dark teal backgrounds, bright green accent,
// white/cream text. Editorial, bold, freight-industry authority.
const C = {
  // Core dark backgrounds — website uses deep teal-black
  black:    "#0A1A14",   // deepest bg — sidebar, hero panels
  ink:      "#0F2318",   // secondary dark — card backgrounds on dark
  charcoal: "#1A3028",   // borders on dark, lifted panels
  teal:     "#0D2B1F",   // mid-tone dark teal — section backgrounds

  // Light surfaces — page background and cards
  warmWhite:"#F8FAF9",   // page background — very slight cool tint
  parchment:"#EEF3F0",   // card alt rows, hover states
  sand:     "#C8D9D2",   // borders on light backgrounds
  stone:    "#6B8B7E",   // secondary text / labels
  ash:      "#2D4A3E",   // body text on light backgrounds

  // Primary accent — bright green from website
  green:    "#00C853",   // bright green — CTAs, active states, highlights
  greenlt:  "#E6F9EE",   // light green backgrounds
  greendk:  "#00A043",   // darker green for hover states
  neon:     "#39FF6B",   // the brightest green used sparingly

  // Semantic colors
  gold:     "#C9A84C",   // warning / attention
  goldlt:   "#F5EDD4",   // warning background
  olive:    "#2E7D32",   // success (darker green)
  olivelt:  "#E8F5E9",   // success background
  rust:     "#B71C1C",   // error / danger
  rustlt:   "#FFEBEE",   // error background
  amber:    "#E65100",   // urgent
  amberlt:  "#FFF3E0",   // urgent background

  // Aliases kept for backward compat with existing component references
  navy:     "#0A1A14",
  slate:    "#0F2318",
  steel:    "#1A3028",
  sky:      "#00C853",   // green replaces sky blue as accent
  ice:      "#E6F9EE",   // greenlt replaces ice
  white:    "#F8FAF9",
  offwhite: "#EEF3F0",
  cream:    "#E8F2EE",   // text on dark backgrounds
  greenlt2: "#E6F9EE",
  amber2:   "#E65100",
  amberlt2: "#FFF3E0",
  red:      "#B71C1C",
  redlt:    "#FFEBEE",
  gray:     "#6B8B7E",
  grayli:   "#C8D9D2",
  text:     "#0A1A14",
  purple:   "#1B5E20",
  purplt:   "#E8F5E9",
};

// ─── Date formatting — always Month D, YYYY throughout the platform ───────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr + (dateStr.length === 10 ? "T12:00:00" : ""));
    return d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  } catch { return dateStr; }
}
function fmtDateShort(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr + (dateStr.length === 10 ? "T12:00:00" : ""));
    return d.toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" });
  } catch { return dateStr; }
}
function fmtDateTime(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" }) +
           " at " + d.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" });
  } catch { return dateStr; }
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Barlow+Condensed:wght@700;900&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:${C.warmWhite};color:${C.ash};}
  .mono{font-family:'DM Mono',monospace;}
  .app{display:flex;height:100vh;overflow:hidden;}

  /* ── Sidebar ── deep teal, rfplab.com style */
  .sidebar{width:224px;min-width:224px;background:${C.black};display:flex;flex-direction:column;overflow-y:auto;border-right:1px solid ${C.charcoal};}
  .main{flex:1;overflow-y:auto;display:flex;flex-direction:column;}
  .topbar{background:${C.warmWhite};border-bottom:1px solid ${C.sand};padding:12px 24px;display:flex;align-items:center;justify-content:space-between;}
  .content{padding:28px;flex:1;}
  .sidebar-logo{padding:20px 16px 16px;border-bottom:1px solid ${C.charcoal};}
  .sidebar-section{padding:10px 0;}
  .sidebar-label{font-size:8px;font-weight:800;letter-spacing:2px;color:rgba(232,242,238,.25);text-transform:uppercase;padding:0 16px;margin-bottom:4px;}
  .nav-item{display:flex;align-items:center;gap:9px;padding:8px 16px;cursor:pointer;color:rgba(232,242,238,.45);font-size:12px;font-weight:500;transition:all 0.15s;border-left:2px solid transparent;letter-spacing:0.2px;}
  .nav-item:hover{background:rgba(0,200,83,.06);color:rgba(232,242,238,.9);}
  .nav-item.active{background:rgba(0,200,83,.12);color:${C.green};border-left-color:${C.green};}
  .sidebar-user{margin-top:auto;padding:14px 16px;border-top:1px solid ${C.charcoal};font-size:11px;color:rgba(232,242,238,.3);}
  .sidebar-role{display:inline-block;background:${C.charcoal};color:${C.green};font-size:8px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:2px 7px;border-radius:2px;margin-bottom:4px;}
  .nav-section-divider{height:1px;background:${C.charcoal};margin:4px 16px;}
  .nav-section-head{font-size:8px;font-weight:800;letter-spacing:2px;color:rgba(0,200,83,.35);text-transform:uppercase;padding:10px 16px 4px;}

  /* ── Role switcher / pills ── */
  .role-btn{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:4px;border:1px solid ${C.sand};background:${C.warmWhite};cursor:pointer;font-size:11px;font-weight:600;color:${C.ash};transition:all 0.15s;letter-spacing:.3px;}
  .role-btn:hover{background:${C.parchment};border-color:${C.stone};}
  .role-pill{font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:2px;}
  .role-pill.admin{background:${C.black};color:${C.green};}
  .role-pill.shipper{background:${C.olive};color:white;}
  .role-pill.carrier{background:${C.stone};color:white;}

  /* ── Cards ── warm white, subtle border */
  .card{background:${C.warmWhite};border:1px solid ${C.sand};border-radius:8px;padding:20px;margin-bottom:16px;}
  .card-sm{background:${C.warmWhite};border:1px solid ${C.sand};border-radius:7px;padding:14px 16px;}
  .card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
  .card-title{font-size:13px;font-weight:700;color:${C.black};letter-spacing:0.3px;}

  /* ── Stat tiles ── */
  .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
  .stat-tile{background:${C.warmWhite};border:1px solid ${C.sand};border-radius:8px;padding:16px 18px;}
  .stat-label{font-size:9px;font-weight:800;color:${C.stone};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;}
  .stat-value{font-size:26px;font-weight:800;color:${C.black};letter-spacing:-1px;}
  .stat-sub{font-size:11px;color:${C.stone};margin-top:3px;}

  /* ── Tables ── */
  table{width:100%;border-collapse:collapse;font-size:12px;}
  th{background:${C.parchment};color:${C.stone};font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:8px 12px;text-align:left;border-bottom:1px solid ${C.sand};white-space:nowrap;}
  td{padding:9px 12px;border-bottom:1px solid ${C.sand};vertical-align:middle;white-space:nowrap;color:${C.ash};}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:${C.parchment};}

  /* ── Badges ── */
  .badge{display:inline-block;padding:2px 8px;border-radius:2px;font-size:9px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;}
  .badge.inbound{background:${C.olivelt};color:${C.olive};}
  .badge.outbound{background:${C.goldlt};color:#7A5A10;}
  .badge.open{background:${C.parchment};color:${C.stone};border:1px solid ${C.sand};}
  .badge.awarded{background:${C.olivelt};color:${C.olive};}
  .badge.pending{background:${C.goldlt};color:#7A5A10;}
  .badge.asset{background:${C.parchment};color:${C.ash};font-size:9px;border:1px solid ${C.sand};}
  .badge.broker{background:${C.charcoal};color:${C.warmWhite};font-size:9px;}
  .badge-asset{background:${C.parchment};color:${C.ash};border:1px solid ${C.sand};}
  .badge-broker{background:${C.charcoal};color:${C.warmWhite};}
  .badge-green{background:${C.olivelt};color:${C.olive};}
  .badge-gray{background:${C.parchment};color:${C.stone};border:1px solid ${C.sand};}

  /* ── Buttons ── */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:700;transition:all 0.15s;letter-spacing:.3px;font-family:'Inter',sans-serif;}
  .btn-sm{padding:5px 12px;font-size:11px;border-radius:3px;}
  .btn-xs{padding:3px 8px;font-size:10px;border-radius:3px;}
  .btn-primary{background:${C.black};color:${C.green};}
  .btn-primary:hover{background:${C.ink};}
  .btn-outline{background:transparent;color:${C.ash};border:1px solid ${C.sand};}
  .btn-outline:hover{background:${C.parchment};border-color:${C.stone};}
  .btn-green{background:${C.green};color:${C.black};}
  .btn-green:hover{background:${C.greendk};}
  .btn-purple{background:${C.ash};color:white;}
  .btn-purple:hover{background:${C.charcoal};}
  .btn-danger{background:${C.rustlt};color:${C.rust};border:1px solid #FFCDD2;}
  .btn-danger:hover{background:#FFCDD2;}
  .btn-ghost{background:transparent;color:${C.stone};border:none;cursor:pointer;padding:5px 8px;font-family:'Inter',sans-serif;font-size:12px;}
  .btn-ghost:hover{color:${C.ash};}
  .btn-orange{background:${C.amber};color:white;}

  /* ── Inputs ── */
  input,select,textarea{font-family:'Inter',sans-serif;font-size:13px;border:1px solid ${C.sand};border-radius:4px;padding:7px 10px;background:${C.warmWhite};color:${C.ash};width:100%;transition:border .15s,box-shadow .15s;}
  input:focus,select:focus,textarea:focus{outline:none;border-color:${C.green};box-shadow:0 0 0 3px rgba(0,200,83,.1);}
  label{font-size:11px;font-weight:700;color:${C.stone};margin-bottom:4px;display:block;letter-spacing:.5px;text-transform:uppercase;}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
  .form-group{margin-bottom:12px;}
  .fg{margin-bottom:10px;}

  /* ── Upload zones ── */
  .upload-zone{border:2px dashed ${C.sand};border-radius:7px;padding:32px;text-align:center;cursor:pointer;transition:all 0.2s;background:${C.warmWhite};}
  .upload-zone:hover{border-color:${C.gold};background:${C.goldlt};}
  .upload-z{border:2px dashed ${C.sand};border-radius:7px;padding:24px;text-align:center;cursor:pointer;transition:all .2s;background:${C.warmWhite};}
  .upload-z:hover{border-color:${C.gold};background:${C.goldlt};}
  .upload-ok{background:${C.olivelt};border:1px solid ${C.olive};border-radius:6px;padding:10px 14px;font-size:12px;color:${C.olive};font-weight:700;margin-top:8px;}

  /* ── Progress bars ── */
  .progress-bar{height:4px;background:${C.sand};border-radius:2px;overflow:hidden;}
  .progress-fill{height:100%;background:${C.gold};border-radius:2px;transition:width 0.4s;}

  /* ── Timeline ── */
  .timeline{position:relative;padding-left:24px;}
  .timeline::before{content:'';position:absolute;left:7px;top:0;bottom:0;width:1px;background:${C.sand};}
  .timeline-item{position:relative;margin-bottom:16px;}
  .timeline-dot{position:absolute;left:-21px;top:3px;width:10px;height:10px;border-radius:50%;border:2px solid ${C.warmWhite};}
  .timeline-dot.done{background:${C.olive};}
  .timeline-dot.active{background:${C.gold};box-shadow:0 0 0 3px rgba(201,168,76,.2);}
  .timeline-dot.pending{background:${C.sand};}
  .timeline-label{font-size:12px;font-weight:600;color:${C.black};}
  .timeline-date{font-size:11px;color:${C.stone};}

  /* ── Modals ── */
  .modal-overlay{position:fixed;inset:0;background:rgba(17,17,17,.6);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;}
  .modal{background:${C.warmWhite};border-radius:8px;width:100%;max-width:620px;max-height:90vh;overflow-y:auto;border:1px solid ${C.sand};}
  .modal-lg{max-width:820px;}
  .modal-header{padding:18px 22px 14px;border-bottom:1px solid ${C.sand};display:flex;align-items:center;justify-content:space-between;}
  .modal-title{font-size:14px;font-weight:800;color:${C.black};letter-spacing:.3px;}
  .modal-body{padding:18px 22px;}
  .modal-footer{padding:14px 22px;border-top:1px solid ${C.sand};display:flex;gap:8px;justify-content:flex-end;}

  /* ── Typography ── */
  .page-title{font-size:22px;font-weight:800;color:${C.black};letter-spacing:-.5px;}
  .page-sub{font-size:12px;color:${C.stone};margin-top:3px;font-weight:400;}
  .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}

  /* ── Tabs ── */
  .tab-bar{display:flex;gap:0;border-bottom:1px solid ${C.sand};margin-bottom:20px;}
  .tab{padding:8px 16px;font-size:12px;font-weight:600;color:${C.stone};cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s;letter-spacing:.3px;text-transform:uppercase;}
  .tab:hover{color:${C.ash};}
  .tab.active{color:${C.black};border-bottom-color:${C.green};font-weight:800;}

  /* ── Alerts ── */
  .alert{padding:11px 14px;border-radius:6px;font-size:12px;margin-bottom:12px;line-height:1.5;}
  .alert.info{background:${C.goldlt};color:#7A5A10;border-left:3px solid ${C.gold};}
  .alert.success{background:${C.olivelt};color:${C.olive};border-left:3px solid ${C.olive};}
  .alert.warn{background:${C.rustlt};color:${C.rust};border-left:3px solid ${C.rust};}
  .alert.purple{background:${C.parchment};color:${C.ash};border-left:3px solid ${C.stone};}
  .wiz-alr{padding:11px 14px;border-radius:6px;font-size:12px;margin-bottom:12px;line-height:1.5;}
  .wiz-alr.info{background:${C.goldlt};color:#7A5A10;border-left:3px solid ${C.gold};}
  .wiz-alr.warn{background:${C.rustlt};color:${C.rust};border-left:3px solid ${C.rust};}
  .wiz-alr.ok{background:${C.olivelt};color:${C.olive};border-left:3px solid ${C.olive};}

  /* ── Table scroll ── */
  .table-scroll{max-height:460px;overflow-y:auto;}

  /* ── Incumbent tag ── */
  .incumbent-tag{display:inline-flex;align-items:center;gap:3px;background:${C.goldlt};border:1px solid #D4B870;color:#7A5A10;font-size:9px;font-weight:800;padding:1px 6px;border-radius:2px;letter-spacing:.5px;text-transform:uppercase;}

  /* ── Scenario bar ── */
  .scenario-bar{background:${C.parchment};border:1px solid ${C.sand};border-radius:8px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
  .scenario-title{font-size:12px;font-weight:800;color:${C.black};letter-spacing:.3px;}
  .scenario-desc{font-size:11px;color:${C.stone};margin-top:2px;}
  .scenario-pill{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:2px;font-size:10px;font-weight:800;cursor:pointer;border:1px solid;transition:all .15s;letter-spacing:.5px;text-transform:uppercase;}
  .scenario-pill.active-s{background:${C.black};color:${C.warmWhite};border-color:${C.black};}
  .scenario-pill.inactive-s{background:transparent;color:${C.ash};border-color:${C.sand};}
  .scenario-pill:hover{opacity:.8;}

  /* ── Toggles ── */
  .toggle-wrap{display:flex;align-items:center;gap:8px;}
  .toggle{position:relative;width:38px;height:20px;cursor:pointer;}
  .toggle input{opacity:0;width:0;height:0;position:absolute;}
  .toggle-slider{position:absolute;inset:0;background:${C.sand};border-radius:20px;transition:.2s;}
  .toggle input:checked + .toggle-slider{background:${C.gold};}
  .toggle-slider:before{content:'';position:absolute;width:14px;height:14px;background:white;border-radius:50%;top:3px;left:3px;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.2);}
  .toggle input:checked + .toggle-slider:before{transform:translateX(18px);}
  .toggle-label{font-size:12px;font-weight:500;color:${C.ash};}
  .wiz-tog{position:relative;width:38px;height:20px;cursor:pointer;}
  .wiz-tog input{opacity:0;width:0;height:0;position:absolute;}
  .wiz-tog-sl{position:absolute;inset:0;background:${C.sand};border-radius:20px;transition:.2s;}
  .wiz-tog input:checked+.wiz-tog-sl{background:${C.gold};}
  .wiz-tog-sl:before{content:'';position:absolute;width:14px;height:14px;background:white;border-radius:50%;top:3px;left:3px;transition:.2s;}
  .wiz-tog input:checked+.wiz-tog-sl:before{transform:translateX(18px);}
  .tog-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid ${C.sand};}
  .tog-row:last-child{border-bottom:none;}
  .feedback-option{border:1px solid ${C.sand};border-radius:6px;padding:10px 14px;cursor:pointer;transition:all .15s;display:flex;align-items:flex-start;gap:10px;margin-bottom:6px;}
  .feedback-option.selected{border-color:${C.gold};background:${C.goldlt};}
  .feedback-option input[type=radio]{margin-top:2px;accent-color:${C.gold};}

  /* ── Chips ── */
  .invite-chip{display:inline-flex;align-items:center;gap:6px;background:${C.parchment};border:1px solid ${C.sand};border-radius:2px;padding:4px 10px;font-size:12px;margin:3px;}
  .chip2{display:inline-flex;align-items:center;gap:5px;background:${C.warmWhite};border:1px solid ${C.sand};border-radius:20px;padding:4px 11px;font-size:11px;font-weight:500;cursor:pointer;transition:all .15s;}
  .chip2.sel{background:${C.black};border-color:${C.black};color:${C.warmWhite};font-weight:700;}
  .chip-grp{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}

  /* ── Misc ── */
  .rank-badge{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;font-size:11px;font-weight:800;}
  .rank-badge.r1{background:${C.olivelt};color:${C.olive};}
  .rank-badge.r2{background:${C.parchment};color:${C.ash};}
  .rank-badge.r3{background:${C.parchment};color:${C.stone};}
  .rank-badge.rn{background:${C.parchment};color:${C.stone};}
  .divider{border:none;border-top:1px solid ${C.sand};margin:16px 0;}
  .rate-input{width:100px;padding:4px 8px;font-size:12px;font-family:'DM Mono',monospace;}
  .blinded-overlay{display:flex;align-items:center;justify-content:center;background:${C.parchment};border-radius:4px;padding:4px 8px;font-size:11px;color:${C.stone};font-style:italic;}

  /* ── Wizard CSS ── */
  .wiz-overlay{position:fixed;inset:0;z-index:200;display:flex;background:${C.warmWhite};}
  .wiz-left{width:240px;min-width:240px;background:${C.black};display:flex;flex-direction:column;overflow-y:auto;}
  .wiz-logo{padding:16px 16px 16px;border-bottom:1px solid ${C.charcoal};}
  .wiz-logo-sub{font-size:8px;color:rgba(0,200,83,.6);letter-spacing:2px;text-transform:uppercase;margin-top:6px;font-weight:700;}
  .wiz-steps{padding:16px 0;flex:1;}
  .wiz-step-group{margin-bottom:4px;}
  .wiz-group-label{font-size:8px;font-weight:800;letter-spacing:2px;color:rgba(0,200,83,.3);text-transform:uppercase;padding:8px 16px 4px;}
  .step-item{display:flex;align-items:center;gap:10px;padding:7px 16px;cursor:pointer;transition:background .15s;border-left:2px solid transparent;}
  .step-item:hover{background:rgba(0,200,83,.03);}
  .step-item.wiz-active{background:rgba(0,200,83,.1);border-left-color:${C.green};}
  .step-num{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0;}
  .step-num.done{background:${C.green};color:${C.black};}
  .step-num.wiz-act{background:${C.green};color:${C.black};}
  .step-num.pend{background:rgba(232,242,238,.08);color:rgba(232,242,238,.3);}
  .step-lbl{font-size:11px;font-weight:500;color:rgba(232,242,238,.45);}
  .step-lbl.wiz-act{color:${C.green};}
  .step-lbl.done{color:rgba(232,242,238,.7);}
  .wiz-body{flex:1;overflow-y:auto;}
  .wiz-content{max-width:760px;margin:0 auto;padding:28px 32px;}
  .wiz-topbar{background:${C.warmWhite};border-bottom:1px solid ${C.sand};padding:10px 20px;display:flex;align-items:center;justify-content:space-between;}
  .wiz-progress{height:2px;background:${C.sand};}
  .wiz-progress-fill{height:2px;background:${C.green};transition:width .4s;}
  .wiz-footer{display:flex;justify-content:space-between;align-items:center;padding-top:20px;border-top:1px solid ${C.sand};margin-top:8px;}
  .option-card{border:1px solid ${C.sand};border-radius:6px;padding:14px 16px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:14px;margin-bottom:8px;}
  .option-card:hover{border-color:${C.green};background:${C.greenlt};}
  .option-card.sel{border-color:${C.green};background:${C.greenlt};box-shadow:0 0 0 1px ${C.green};}
  .option-card input[type=radio]{margin-top:0;accent-color:${C.green};width:16px;height:16px;flex-shrink:0;}
  .option-title{font-size:13px;font-weight:700;color:${C.black};}
  .option-desc{font-size:11px;color:${C.stone};margin-top:3px;line-height:1.6;}
  .wiz-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .wiz-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
  .wiz-fg{margin-bottom:12px;}
  .wiz-badge-asset{background:${C.parchment};color:${C.ash};border:1px solid ${C.sand};}
  .wiz-badge-broker{background:${C.charcoal};color:${C.warmWhite};}
  .wiz-badge-green{background:${C.olivelt};color:${C.olive};}
  .wiz-badge-gray{background:${C.parchment};color:${C.stone};border:1px solid ${C.sand};}
  .fld-row{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border:1px solid ${C.sand};border-radius:6px;margin-bottom:6px;background:${C.warmWhite};}
  .fld-name{flex:1;font-size:12px;font-weight:500;color:${C.ash};}
  .tline-item{display:grid;grid-template-columns:180px 1fr 1fr;gap:10px;align-items:center;padding:10px 12px;border:1px solid ${C.sand};border-radius:6px;background:${C.warmWhite};}
  .tline-lbl{font-size:12px;font-weight:700;color:${C.black};}
  .notif-card{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border:1px solid ${C.sand};border-radius:6px;margin-bottom:6px;}
  .sum-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid ${C.sand};font-size:12px;}
  .sum-row:last-child{border-bottom:none;}
  .sum-key{color:${C.stone};}
  .sum-val{font-weight:700;color:${C.black};text-align:right;max-width:58%;}
  .step-prog{height:2px;background:${C.sand};border-radius:1px;}
  .step-prog-fill{height:2px;background:${C.gold};border-radius:1px;transition:width .3s;}

  /* ── Spot Load ── */
  .live-dot{width:7px;height:7px;border-radius:50%;background:${C.olive};display:inline-block;animation:pulse-dot 1.5s infinite;}
  @keyframes pulse-dot{0%,100%{opacity:1;}50%{opacity:.3;}}
  .countdown-pill{font-family:'DM Mono',monospace;font-size:11px;font-weight:600;color:${C.rust};background:${C.rustlt};padding:3px 9px;border-radius:20px;display:inline-flex;align-items:center;gap:4px;border:1px solid #D4A090;}
  .countdown-pill.urgent{color:${C.rust};background:${C.rustlt};border-color:#FFCDD2;}
  .countdown-pill.closed{color:${C.stone};background:${C.parchment};border-color:${C.sand};}
  .load-card-spot{background:${C.warmWhite};border:1px solid ${C.sand};border-radius:8px;padding:14px 16px;margin-bottom:8px;cursor:pointer;transition:border-color .15s,box-shadow .15s;}
  .load-card-spot:hover{border-color:${C.gold};box-shadow:0 2px 8px rgba(201,168,76,.1);}
  .load-card-spot.awarded{border-left:3px solid ${C.olive};}
  .load-card-spot.closed-s{opacity:.6;}
  .route-pill{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:${C.black};}
  .rdot-o{width:7px;height:7px;border-radius:50%;background:${C.gold};flex-shrink:0;}
  .rdot-d{width:7px;height:7px;border-radius:50%;background:${C.olive};flex-shrink:0;}
  .rdash{flex:0 0 16px;height:1px;background:${C.sand};}
  .quote-bar{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid ${C.sand};border-radius:6px;margin-bottom:5px;font-size:12px;transition:all .15s;}
  .quote-bar.winning{background:${C.olivelt};border-color:${C.olive};}
  .quote-bar.myquote{background:${C.goldlt};border-color:${C.gold};}
  .rank-circ{width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0;}
  .rc1{background:${C.olivelt};color:${C.olive};}
  .rc2{background:${C.parchment};color:${C.ash};}
  .rc3{background:${C.parchment};color:${C.stone};}
  .rcn{background:${C.parchment};color:${C.stone};}
  .spot-modal-bg{position:fixed;inset:0;background:rgba(17,17,17,.55);display:flex;align-items:center;justify-content:center;z-index:300;padding:16px;}
  .spot-modal{background:${C.warmWhite};border-radius:8px;width:100%;max-width:680px;max-height:92vh;overflow-y:auto;border:1px solid ${C.sand};}
  .spot-modal-hdr{padding:16px 20px 12px;border-bottom:1px solid ${C.sand};display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
  .spot-modal-body{padding:16px 20px;}
  .spot-modal-foot{padding:12px 20px;border-top:1px solid ${C.sand};display:flex;gap:8px;justify-content:flex-end;}
  .spot-tab-bar{display:flex;gap:0;border-bottom:1px solid ${C.sand};margin-bottom:14px;}
  .spot-tab{padding:6px 14px;font-size:11px;font-weight:700;color:${C.stone};cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;text-transform:uppercase;letter-spacing:.5px;}
  .spot-tab:hover{color:${C.ash};}
  .spot-tab.active{color:${C.black};border-bottom-color:${C.gold};font-weight:800;}
  .bid-zone{display:flex;align-items:center;gap:8px;padding:12px 14px;background:${C.parchment};border:1px solid ${C.sand};border-radius:7px;margin-top:10px;}
  .bid-zone input{max-width:130px;font-size:15px;font-weight:700;font-family:'DM Mono',monospace;border:2px solid ${C.gold};border-radius:4px;padding:7px 10px;}
  .spot-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;}
  .spot-dr{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid ${C.sand};font-size:12px;}
  .spot-dr:last-child{border-bottom:none;}
  .sdk{color:${C.stone};}
  .sdv{font-weight:700;color:${C.black};}
  .proc-icon{width:40px;height:40px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}

  @media(max-width:900px){
    .sidebar{width:52px;min-width:52px;}
    .sidebar-logo,.sidebar-label,.sidebar-section,.sidebar-user,.nav-section-head,.nav-section-divider{display:none;}
    .nav-item{justify-content:center;}
    .stat-grid{grid-template-columns:1fr 1fr;}
  }
`;


// ─── BID SETTINGS (what the shipper configures on the RFP) ───────────────────
const DEFAULT_BID_SETTINGS = {
  feedbackEnabled: true,
  feedbackType: "bracket", // "none" | "rank" | "bracket" | "percent" | "dollar"
  feedbackBrackets: ["0-5%","5-10%","10-20%","20%+"],
  maxCarriersPerLane: 3,
  assetVsBrokerSplit: 60,
};

// ─── CARRIERS — empty, data comes from Supabase ──────────────────────────────
const ALL_CARRIERS = [];

// ─── LANES — empty, loaded from Supabase per RFP ────────────────────────────
const LANES_RAW = [];
const LANES = [];
// ─── Helpers ──────────────────────────────────────────────────────────────────
function pctFromLow(rate, low) { return low ? (((rate - low) / low) * 100).toFixed(1) : null; }
function toBracket(pct) {
  const p = parseFloat(pct);
  if (p <= 5) return "0–5%";
  if (p <= 10) return "5–10%";
  if (p <= 20) return "10–20%";
  return "20%+";
}
function carrierFeedback(lane, carrierName, settings) {
  if (!settings.feedbackEnabled) return null;
  const myBid = lane.bids.find(b => b.carrier === carrierName);
  if (!myBid) return null;
  const low = lane.bids[0].rate;
  const myRank = lane.bids.findIndex(b => b.carrier === carrierName) + 1;
  const pct = pctFromLow(myBid.rate, low);
  const ft = settings.feedbackType;
  if (ft === "rank") return { label: `Your rank: #${myRank} of ${lane.bids.length}`, color: myRank === 1 ? C.green : C.stone };
  if (ft === "bracket") return { label: myRank === 1 ? "You are low bid ✓" : `${toBracket(pct)} above low`, color: myRank === 1 ? C.green : C.amber };
  if (ft === "percent") return { label: myRank === 1 ? "You are low bid ✓" : `+${pct}% above low`, color: myRank === 1 ? C.green : C.amber };
  if (ft === "dollar") return { label: myRank === 1 ? "You are low bid ✓" : `$${(myBid.rate - low).toLocaleString()} above low`, color: myRank === 1 ? C.green : C.amber };
  return null;
}

// ─── Scenario engine ──────────────────────────────────────────────────────────
function applyScenario(lanes, scenario) {
  return lanes.map(l => {
    const sorted = l.bids; // already sorted low-high
    if (scenario === "lowest") {
      return { ...l, scenarioAward: sorted[0]?.carrier, scenarioRate: sorted[0]?.rate };
    }
    if (scenario === "lowestAsset") {
      const assetBids = sorted.filter(b => b.type === "asset");
      const winner = assetBids[0] || sorted[0];
      return { ...l, scenarioAward: winner.carrier, scenarioRate: winner.rate };
    }
    if (scenario === "splitModel") {
      const assetBids = sorted.filter(b => b.type === "asset");
      const brokerBids = sorted.filter(b => b.type === "broker");
      const primary = assetBids[0] || brokerBids[0];
      const secondary = brokerBids[0] || assetBids[1];
      const primaryVol = Math.round(l.vol * 0.6);
      const secondaryVol = Math.round(l.vol * 0.4);
      return { ...l, scenarioAward: primary?.carrier, scenarioRate: primary?.rate, scenarioSecondary: secondary?.carrier, scenarioSecondaryRate: secondary?.rate, primaryVol, secondaryVol };
    }
    return { ...l, scenarioAward: null };
  });
}

// ─── Activity Log (shared state lives in App, passed down) ────────────────────
function formatTs(ts) {
  return new Date(ts).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});
}

const EVENT_TYPE_META = {
  invite_sent:      {icon:"📩", label:"Invite Sent",         color:"#1D4ED8"},
  invite_viewed:    {icon:"👁️", label:"Bid Page Viewed",     color:C.stone},
  intent_yes:       {icon:"✅", label:"Intent: Will Bid",    color:C.green},
  intent_no:        {icon:"❌", label:"Intent: Declining",   color:C.rust},
  intent_maybe:     {icon:"🤔", label:"Intent: Undecided",  color:C.amber},
  file_downloaded:  {icon:"⬇️", label:"File Downloaded",    color:C.ash},
  rates_submitted:  {icon:"💲", label:"Rates Submitted",    color:C.green},
  rates_updated:    {icon:"✏️", label:"Rates Updated",      color:C.amber},
  award_viewed:     {icon:"🏆", label:"Award Viewed",       color:C.ash},
};

const SEED_LOG = []; // Real activity loaded from Supabase
// ─── PAGE: Carrier Event / Bid Landing Page ───────────────────────────────────
// BID_DOCS is now a function that takes the bidSettings/lanes state
// to determine which docs are available and their download URLs
const BID_DOC_DEFS = [
  {name:"Lane File",             icon:"📊", desc:"Master template — enter your rates here",  stateKey:"laneFileUploaded",     ext:"XLSX", required:true},
  {name:"FSC Table",             icon:"⛽", desc:"Current fuel surcharge schedule",           stateKey:"fscUploaded",          ext:"XLSX", required:false},
  {name:"Term Sheet",            icon:"📝", desc:"Must be signed and returned with bid",      stateKey:"termSheetUploaded",    ext:"PDF",  required:true},
  {name:"Accessorial Schedule",  icon:"💰", desc:"All accessorial charges and rules",         stateKey:"accessorialUploaded",  ext:"PDF",  required:false},
  {name:"Loading Locations",     icon:"📍", desc:"Warehouse contacts & addresses",            stateKey:"loadingUploaded",      ext:"XLSX", required:false},
  {name:"Delivery Instructions", icon:"🚚", desc:"Customer delivery requirements",            stateKey:"deliveryUploaded",     ext:"XLSX", required:false},
  {name:"Deductions Guide",      icon:"⚠️",  desc:"Deduction policies by customer",            stateKey:"deductionsUploaded",   ext:"DOCX", required:false},
  {name:"Processes & Procedures",icon:"📋", desc:"Shipper logistics P&P — required reading",  stateKey:"proceduresUploaded",   ext:"PDF",  required:false},
];

// Build the real download URL from Supabase storage
// Files are stored under: rfp-docs/{rfpId}/{key}_{originalFilename}
// For now we use a signed URL approach — in production this calls supabase.storage.from('rfp-docs').createSignedUrl()
function getDocUrl(rfpId, stateKey, filename) {
  if (!rfpId || !filename) return null;
  // Supabase public storage URL pattern
  const SUPABASE_URL = "https://eyybzgkayabxtsdajgez.supabase.co";
  return `${SUPABASE_URL}/storage/v1/object/public/rfp-docs/${rfpId}/${stateKey}_${encodeURIComponent(filename)}`;
}

// Legacy constant for any code still referencing BID_DOCS
const BID_DOCS = BID_DOC_DEFS;

function EventPage({ carrierName, addLog, activityLog, setPage, bidSettings }) {
  const [intent, setIntent] = useState(null); // null | "yes" | "no" | "maybe"
  const [intentSaved, setIntentSaved] = useState(false);
  const [downloadedDocs, setDownloadedDocs] = useState([]);
  const [intentNotes, setIntentNotes] = useState("");
  const myLog = activityLog.filter(e => e.carrier === carrierName);

  const handleIntent = (val) => {
    setIntent(val);
    setIntentSaved(true);
    const evtMap = {yes:"intent_yes", no:"intent_no", maybe:"intent_maybe"};
    const detailMap = {yes:"Confirmed intent to participate", no:"Declining — will not bid", maybe:"Marked intent as undecided"};
    addLog({ carrier:carrierName, event:evtMap[val], detail:detailMap[val] + (intentNotes?` — "${intentNotes}"`:""), actor:"carrier" });
  };

  const handleDownload = (doc) => {
    // Build URL from bidSettings — shipper uploaded these in the wizard
    const s = bidSettings || {};
    const rfpId = s.rfpId || s.id || null;
    const filename = s[doc.stateKey + "_name"] || null;
    const url = getDocUrl(rfpId, doc.stateKey, filename);
    const isAvailable = !!(s[doc.stateKey] && filename);

    if (!isAvailable) return; // doc wasn't uploaded — button is disabled

    // Trigger real download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `${doc.name}.${doc.ext.toLowerCase()}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (!downloadedDocs.includes(doc.stateKey)) {
      setDownloadedDocs(d => [...d, doc.stateKey]);
      addLog({ carrier:carrierName, event:"file_downloaded", detail:`${doc.name} downloaded`, actor:"carrier" });
    }
  };

  const intentStatus = myLog.find(e=>["intent_yes","intent_no","intent_maybe"].includes(e.event));

  // Access control: check if carrier's email is on the invite list
  // If bidSettings has an inviteList, gate access
  const carrierEmail = typeof carrierName === "string" && carrierName.includes("@") ? carrierName : null;
  const inviteList = bidSettings?.inviteList || []; // array of invited emails
  const shipperDomain = bidSettings?.shipperDomain || null;

  // Access check: 1) invited directly, 2) same domain as an existing invitee, 3) no list set (demo mode)
  const hasAccess = inviteList.length === 0 || // no restriction in demo mode
    (carrierEmail && inviteList.some(e => e.toLowerCase() === carrierEmail.toLowerCase())) ||
    (carrierEmail && inviteList.some(e => e.split("@")[1]?.toLowerCase() === carrierEmail.split("@")[1]?.toLowerCase()));

  if (!hasAccess && inviteList.length > 0) {
    return (
      <div style={{maxWidth:520,margin:"60px auto",textAlign:"center",padding:"0 32px"}}>
        <div style={{fontSize:48,marginBottom:16}}>🔒</div>
        <div style={{fontWeight:800,fontSize:20,color:C.black,marginBottom:8}}>Access Restricted</div>
        <div style={{fontSize:13,color:C.stone,lineHeight:1.7,marginBottom:24}}>
          This RFP is invite-only. Your email address was not found on the invited carrier list for this bid.
        </div>
        <div style={{background:C.parchment,borderRadius:8,padding:"14px 18px",fontSize:12,color:C.ash,marginBottom:20,textAlign:"left"}}>
          <strong>Are you part of an invited carrier?</strong><br/>
          If a colleague at your company was invited, they can share access with you. Contact them to add your email, or reach out to <a href="mailto:Mike@rfplab.com" style={{color:C.green}}>Mike@rfplab.com</a> for assistance.
        </div>
      </div>
    );
  }

  return (
    <div style={{maxWidth:800}}>
      {/* Header — uses shipper logo if uploaded, else shipper initials */}
      <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:24}}>
        <div style={{width:64,height:64,background:C.parchment,border:`1px solid ${C.sand}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
          {bidSettings?.shipperLogoUrl
            ? <img src={bidSettings.shipperLogoUrl} alt={bidSettings?.shipper||"Shipper"} style={{maxWidth:60,maxHeight:60,objectFit:"contain"}}/>
            : <span style={{fontSize:22,fontWeight:900,color:C.black,letterSpacing:-1}}>
                {(bidSettings?.shipper||"?").split(" ").map(w=>w[0]).slice(0,2).join("")}
              </span>}
        </div>
        <div>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",color:C.green,marginBottom:4}}>Invitation to Bid</div>
          <div className="page-title">{bidSettings?.name||"RFP Invitation"}</div>
          <div style={{fontSize:13,fontWeight:500,color:C.stone,marginTop:2}}>
            {bidSettings?.shipper||"Shipper"} · {(bidSettings?.modes||[]).join(", ")||"Truckload"}
            {bidSettings?.startDate && bidSettings?.endDate && ` · ${fmtDateShort(bidSettings.startDate)} – ${fmtDateShort(bidSettings.endDate)}`}
          </div>
        </div>
        <div style={{marginLeft:"auto",textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:10,color:C.stone,fontWeight:600,marginBottom:2}}>RFP ID</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:C.black}}>{bidSettings?.id||"RFP-2026-001"}</div>
          {bidSettings?.rateDeadline && (
            <div style={{marginTop:8,padding:"4px 12px",background:C.goldlt,color:"#7A5A10",borderRadius:20,fontSize:10,fontWeight:700}}>
              ⏰ DEADLINE: {fmtDateShort(bidSettings.rateDeadline)}
            </div>
          )}
        </div>
      </div>

      {/* Intent acknowledgment banner */}
      {!intentStatus ? (
        <div style={{background:C.black,borderRadius:10,padding:"18px 22px",marginBottom:20,color:"white"}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>📩 Please acknowledge this invitation</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:14}}>Let Spindrift and RFPlab know whether you intend to participate in this bid.</div>
          <div style={{marginBottom:12}}>
            <input style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"white",fontSize:12,borderRadius:6,padding:"7px 10px"}}
              placeholder="Optional note to the shipper (e.g. lane coverage, conditions)..."
              value={intentNotes} onChange={e=>setIntentNotes(e.target.value)} />
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="btn btn-green" onClick={()=>handleIntent("yes")}>✅ Yes, we will bid</button>
            <button className="btn" style={{background:"rgba(255,255,255,0.1)",color:"white",border:"1px solid rgba(255,255,255,0.3)"}} onClick={()=>handleIntent("maybe")}>🤔 Undecided</button>
            <button className="btn" style={{background:"rgba(185,28,28,0.3)",color:"#FCA5A5",border:"1px solid rgba(185,28,28,0.5)"}} onClick={()=>handleIntent("no")}>❌ We will not bid</button>
          </div>
        </div>
      ) : (
        <div className={`alert ${intentStatus.event==="intent_yes"?"success":intentStatus.event==="intent_no"?"warn":"info"}`} style={{marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>{intentStatus.event==="intent_yes"?"✅ You confirmed intent to participate":intentStatus.event==="intent_no"?"❌ You declined this bid":"🤔 Marked as undecided"} — {formatTs(intentStatus.ts)}</span>
          <button style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:C.ash,textDecoration:"underline"}} onClick={()=>{setIntentSaved(false);}}>Change</button>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16}}>
        <div>
          {/* Overview — dynamic from bid settings */}
          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>📋 RFP Overview</div>
            <div style={{fontSize:13,lineHeight:1.7,color:C.black}}>
              {bidSettings?.rfpOverview ||
                `We are excited to invite you to participate in this freight RFP. Please review the lane file, download all supporting documents, and submit your flat linehaul rate for each lane you can service. All bids are blind — you will not see other carriers' rates or identities.`}
            </div>
          </div>

          {/* Timeline — mapped from bid dates */}
          <div className="card">
            <div className="card-title" style={{marginBottom:14}}>📅 RFP Timeline</div>
            <div className="timeline">
              {(() => {
                const s = bidSettings || {};
                const today = new Date();
                const isAfter = (d) => d && new Date(d+"T12:00:00") < today;
                const isToday = (d) => { if(!d) return false; const dt=new Date(d+"T12:00:00"); return dt.toDateString()===today.toDateString(); };
                const st = (d) => isToday(d)?"active":isAfter(d)?"done":"pending";
                const entries = [
                  [s.inviteDate||null,   "RFP sent to carrier partners"],
                  [s.ackDeadline||null,  "Acknowledgment deadline"],
                  [s.rateDeadline||null, "Rates due — submission deadline"],
                  [s.reviewDate||null,   "Internal review"],
                  [s.awardDate||null,    "Award notifications sent"],
                  [s.goLiveDate||null,   "Rates go live — contract begins"],
                ].filter(([d])=>d);
                if (entries.length === 0) return <div style={{fontSize:12,color:C.stone}}>Timeline dates will appear once the shipper sets bid deadlines.</div>;
                return entries.map(([d,l])=>(
                  <div key={l} className="timeline-item">
                    <div className={`timeline-dot ${st(d)}`}/>
                    <div className="timeline-label">{l}{isToday(d)?" ← TODAY":""}</div>
                    <div className="timeline-date">{fmtDateShort(d)}</div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Guidelines — dynamic from bid settings */}
          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>📐 Guidelines & Assumptions</div>
            <div style={{fontSize:12,lineHeight:1.8,color:C.black}}>
              {(() => {
                const s = bidSettings || {};
                const rawGuide = s.guidelines || "";
                const lines = rawGuide.split("\n").filter(l=>l.trim());
                const defaults = [
                  `Assume ${s.maxWeight||"44,500"} lbs per shipment`,
                  `Submit FLAT Linehaul ONLY pricing, excluding fuel`,
                  "Signed term sheet must be returned with RFP submission",
                  `This RFP is ${s.twoRounds?"2 rounds":"1 round only"} — put your best foot forward`,
                  "Omit lanes you cannot service with high confidence",
                  "Awarded rates must be honored for the full commitment term",
                ];
                return (lines.length > 0 ? lines : defaults).map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:4}}>
                    <span style={{color:C.green,flexShrink:0,marginTop:1}}>•</span>
                    <span>{item}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        <div>
          {/* Documents */}
          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>📁 Bid Documents</div>
            <div style={{fontSize:11,color:C.stone,marginBottom:12}}>Download all documents before submitting. The Lane File is where you enter your rates.</div>
            {BID_DOC_DEFS.map(doc=>{
              const s = bidSettings || {};
              const available = !!(s[doc.stateKey]);
              const fname = s[doc.stateKey+"_name"] || "";
              const downloaded = downloadedDocs.includes(doc.stateKey);
              return (
                <div key={doc.stateKey}
                  onClick={()=>available && handleDownload(doc)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:7,
                    border:`1px solid ${downloaded?C.green:available?C.sand:C.sand}`,
                    background:downloaded?C.greenlt:available?"#FDFCF9":C.parchment,
                    cursor:available?"pointer":"default",marginBottom:7,transition:"all 0.15s",
                    opacity:available?1:0.5}}>
                  <span style={{fontSize:18,flexShrink:0}}>{doc.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:available?C.black:C.stone}}>
                      {doc.name}
                      {doc.required&&<span style={{color:C.rust,marginLeft:3}}>*</span>}
                    </div>
                    <div style={{fontSize:10,color:C.stone}}>{fname||doc.desc}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                    <span style={{fontSize:9,fontWeight:700,background:C.parchment,border:`1px solid ${C.sand}`,borderRadius:3,padding:"1px 5px",color:C.stone}}>{doc.ext}</span>
                    {downloaded
                      ? <span style={{fontSize:9,color:C.green,fontWeight:700}}>✓ Downloaded</span>
                      : available
                        ? <span style={{fontSize:9,color:C.green,fontWeight:700}}>⬇ Download</span>
                        : <span style={{fontSize:9,color:C.stone}}>Not uploaded</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick stats */}
          <div className="card-sm" style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:C.stone,marginBottom:10}}>BID DETAILS</div>
            {[
              ["Lanes","97 total"],["Modes","Dry Van, Reefer, IMDL"],["Term","May 3 – Sep 5, 2026"],
              ["Rate Structure","Flat Linehaul ONLY"],["Rounds","1 round — final"],["Weight","44,500 lbs / load"],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.sand}`,fontSize:12}}>
                <span style={{color:C.stone}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>

          {/* My activity on this bid */}
          <div className="card-sm">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:C.stone}}>MY ACTIVITY</div>
              <button style={{fontSize:11,color:C.ash,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}} onClick={()=>setPage("activity")}>Full log →</button>
            </div>
            {myLog.length===0
              ? <div style={{fontSize:12,color:C.stone,textAlign:"center",padding:"12px 0"}}>No activity yet</div>
              : myLog.slice(-5).reverse().map(e=>{
                  const meta = EVENT_TYPE_META[e.event]||{icon:"•",label:e.event,color:C.stone};
                  return (
                    <div key={e.id} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.sand}`}}>
                      <span style={{fontSize:14,flexShrink:0}}>{meta.icon}</span>
                      <div>
                        <div style={{fontSize:11,fontWeight:600,color:meta.color}}>{meta.label}</div>
                        <div style={{fontSize:10,color:C.stone}}>{formatTs(e.ts)}</div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

      {/* Submit rates CTA */}
      {intentStatus?.event==="intent_yes" && (
        <div style={{background:`linear-gradient(135deg, ${C.ink}, ${C.ash})`,borderRadius:10,padding:"20px 24px",marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:700,fontSize:15,color:"white"}}>Ready to submit your rates?</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:2}}>Download the Lane File, enter your rates, then submit directly in RFPlab.</div>
          </div>
          <button className="btn btn-green" style={{flexShrink:0}} onClick={()=>setPage("bid")}>💲 Enter Rates Now →</button>
        </div>
      )}
    </div>
  );
}

// ─── PAGE: Activity Log (all-carrier view for shipper/admin) ──────────────────
function ActivityLogPage({ activityLog, viewerRole, dbProfile }) {
  const [filterCarrier, setFilterCarrier] = useState("all");
  const [filterEvent, setFilterEvent] = useState("all");
  const isReal = !!dbProfile;
  const carrierName = dbProfile?.company || dbProfile?.full_name || "Your Company";

  // For real users with no activity yet, show a clean empty state
  if (isReal && activityLog.length === 0) {
    return (
      <div>
        <div className="section-header">
          <div>
            <div className="page-title">{viewerRole==="carrier" ? "My Activity" : "Activity Log"}</div>
            <div className="page-sub">All timestamped actions on your bids and loads</div>
          </div>
        </div>
        <div className="card" style={{textAlign:"center",padding:"52px 20px",border:`2px dashed ${C.sand}`}}>
          <div style={{fontSize:36,marginBottom:12}}>📜</div>
          <div style={{fontWeight:600,fontSize:14,color:C.black,marginBottom:6}}>No activity yet</div>
          <div style={{fontSize:12,color:C.stone,maxWidth:380,margin:"0 auto"}}>
            Activity is recorded automatically as carriers view invites, download files, confirm intent, and submit rates. It will appear here once your first RFP is active.
          </div>
        </div>
      </div>
    );
  }

  const displayLog = activityLog
    .filter(e => viewerRole==="carrier" ? e.carrier===carrierName : (filterCarrier==="all" || e.carrier===filterCarrier))
    .filter(e => filterEvent==="all" || e.event===filterEvent)
    .slice().reverse();

  const carriers = [...new Set(activityLog.map(e=>e.carrier))];

  const summary = {};
  activityLog.forEach(e=>{
    if (!summary[e.carrier]) summary[e.carrier]={name:e.carrier,viewed:0,downloaded:0,intent:null,submitted:false};
    if (e.event==="invite_viewed") summary[e.carrier].viewed++;
    if (e.event==="file_downloaded") summary[e.carrier].downloaded++;
    if (["intent_yes","intent_no","intent_maybe"].includes(e.event)) summary[e.carrier].intent=e.event;
    if (e.event==="rates_submitted"||e.event==="rates_updated") summary[e.carrier].submitted=true;
  });

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">{viewerRole==="carrier"?"My Activity Log":"Carrier Activity Log"}</div>
          <div className="page-sub">{viewerRole==="carrier"?"Your complete timestamped activity":"All carrier/broker interactions — timestamped"}</div>
        </div>
        <button className="btn btn-outline">⬇ Export CSV</button>
      </div>

      {viewerRole!=="carrier" && carriers.length > 0 && (
        <div className="card" style={{marginBottom:16,padding:"16px 20px"}}>
          <div className="card-title" style={{marginBottom:12}}>Participation Summary</div>
          <div style={{overflowX:"auto"}}>
            <table>
              <thead><tr>
                <th>Carrier / Broker</th><th>Invite Sent</th><th>Page Views</th><th>Files Downloaded</th><th>Intent</th><th>Rates</th>
              </tr></thead>
              <tbody>
                {carriers.map(name=>{
                  const s = summary[name]||{viewed:0,downloaded:0,intent:null,submitted:false};
                  const intentMeta = s.intent ? EVENT_TYPE_META[s.intent] : null;
                  return (
                    <tr key={name}>
                      <td style={{fontWeight:600}}>{name}</td>
                      <td style={{color:C.green,fontSize:12}}>✓ Sent</td>
                      <td className="mono">{s.viewed||<span style={{color:C.stone}}>—</span>}</td>
                      <td className="mono">{s.downloaded||<span style={{color:C.stone}}>—</span>}</td>
                      <td>{intentMeta
                        ? <span style={{fontSize:11,fontWeight:600,color:intentMeta.color}}>{intentMeta.icon} {intentMeta.label.replace("Intent: ","")}</span>
                        : <span style={{color:C.stone,fontSize:11}}>No response</span>}</td>
                      <td>{s.submitted
                        ? <span style={{color:C.green,fontWeight:600,fontSize:12}}>✓ Submitted</span>
                        : <span style={{color:C.stone,fontSize:12}}>—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {viewerRole!=="carrier" && (
          <select style={{maxWidth:200}} value={filterCarrier} onChange={e=>setFilterCarrier(e.target.value)}>
            <option value="all">All carriers</option>
            {carriers.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <select style={{maxWidth:220}} value={filterEvent} onChange={e=>setFilterEvent(e.target.value)}>
          <option value="all">All event types</option>
          {Object.entries(EVENT_TYPE_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <div style={{fontSize:12,color:C.stone,alignSelf:"center",marginLeft:"auto"}}>{displayLog.length} events</div>
      </div>

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        {displayLog.length===0
          ? <div style={{padding:32,textAlign:"center",color:C.stone,fontSize:13}}>No events match your filters</div>
          : displayLog.map((e,i)=>{
              const meta = EVENT_TYPE_META[e.event]||{icon:"•",label:e.event,color:C.stone};
              return (
                <div key={e.id||i} style={{display:"flex",gap:14,padding:"12px 18px",borderBottom:`1px solid ${C.sand}`,alignItems:"flex-start"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:C.parchment,border:`1px solid ${C.sand}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{meta.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      {viewerRole!=="carrier" && <span style={{fontWeight:700,fontSize:13}}>{e.carrier}</span>}
                      <span style={{fontWeight:600,fontSize:12,color:meta.color}}>{meta.label}</span>
                      <span style={{fontSize:11,color:C.stone,marginLeft:"auto",fontFamily:"'DM Mono',monospace"}}>{formatTs(e.ts)}</span>
                    </div>
                    <div style={{fontSize:12,color:C.stone,marginTop:3}}>{e.detail}</div>
                    <div style={{fontSize:10,color:C.stone,marginTop:2,fontStyle:"italic"}}>logged by {e.actor}</div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── EMBEDDED RFP WIZARD ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const WIZ_STEP_GROUPS = [
  {label:"Contract Setup",steps:[{id:1,label:"Basics & Term"},{id:2,label:"Rate Structure"},{id:3,label:"Award Strategy"}]},
  {label:"Lane Data",    steps:[{id:4,label:"Upload Lanes"},{id:5,label:"Lane Requirements"}]},
  {label:"Carrier Info", steps:[{id:6,label:"Data Fields"},{id:7,label:"Carrier List"}]},
  {label:"Process",      steps:[{id:8,label:"Timeline & Rounds"},{id:9,label:"Notifications"},{id:10,label:"Review & Launch"}]},
];

function WTog({ checked, onChange }) {
  return (
    <label className="wiz-tog">
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/>
      <span className="wiz-tog-sl"/>
    </label>
  );
}

function WizNav({ step, completed, onClose, builderRole }) {
  return (
    <div className="wiz-left">
      <div className="wiz-logo">
        <RFPLabLogo dark size="sm"/>
        <div className="wiz-logo-sub" style={{marginTop:8}}>New RFP Builder</div>
        {builderRole==="admin" && (
          <div style={{marginTop:8,display:"inline-block",background:C.greenlt,color:C.green,fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"2px 8px",borderRadius:4}}>Admin Mode</div>
        )}
      </div>
      <div className="wiz-steps">
        {WIZ_STEP_GROUPS.map(g=>(
          <div className="wiz-step-group" key={g.label}>
            <div className="wiz-group-label">{g.label}</div>
            {g.steps.map(s=>{
              const isAct=s.id===step, isDone=completed.has(s.id);
              const nc=isDone?"done":isAct?"wiz-act":"pend";
              const lc=isDone?"done":isAct?"wiz-act":"";
              return (
                <div key={s.id} className={`step-item${isAct?" wiz-active":""}`}>
                  <div className={`step-num ${nc}`}>{isDone?"✓":s.id}</div>
                  <div className={`step-lbl ${lc}`}>{s.label}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{padding:"14px 16px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
        <button onClick={onClose} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:6,color:"rgba(255,255,255,.5)",fontSize:12,padding:"6px 12px",cursor:"pointer",width:"100%",fontFamily:"'Inter',sans-serif"}}>
          ✕ Exit Wizard
        </button>
      </div>
    </div>
  );
}

// ── Wiz Step 1 ────────────────────────────────────────────────────────────────
function WStep1({ data, set }) {
  const terms=[
    {val:"1mo", label:"1 Month",   desc:"Short-term bridge"},
    {val:"3mo", label:"3 Months",  desc:"Quarterly"},
    {val:"4mo", label:"4 Months",  desc:"Seasonal program"},
    {val:"6mo", label:"6 Months",  desc:"Semi-annual"},
    {val:"12mo",label:"Annual",    desc:"Standard annual bid"},
    {val:"18mo",label:"18 Months", desc:"Extended agreement"},
    {val:"custom",label:"Custom",  desc:"Define exact dates"},
  ];
  return (
    <div>
      <div className="page-title">Contract Basics</div>
      <div className="page-sub">Name your RFP, define the contract term, and set service geography.</div>
      <div className="card">
        <div className="card-title">📋 RFP Identity</div>
        <div className="wiz-row2">
          <div className="wiz-fg"><label>RFP Name</label><input value={data.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Spindrift May–Aug 2026"/></div>
          <div className="wiz-fg"><label>Shipper / Company</label><input value={data.shipper} onChange={e=>set("shipper",e.target.value)} placeholder="e.g. Spindrift Beverages"/></div>
        </div>
        {/* Shipper logo upload */}
        <div style={{marginTop:12}}>
          <label style={{marginBottom:6}}>Company Logo <span style={{fontWeight:400,fontSize:10,color:C.stone}}>(shown on the carrier bid page — PNG, JPG, or SVG)</span></label>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {data.shipperLogoUrl
              ? <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:C.greenlt,border:`1px solid ${C.green}`,borderRadius:7,flex:1}}>
                  <img src={data.shipperLogoUrl} alt="logo" style={{height:36,maxWidth:120,objectFit:"contain"}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.green}}>Logo uploaded</div>
                    <div style={{fontSize:10,color:C.stone}}>{data.shipperLogoName||""}</div>
                  </div>
                  <button className="btn btn-ghost btn-xs" style={{color:C.stone}} onClick={()=>{set("shipperLogoUrl",null);set("shipperLogoName","");}}>Remove</button>
                </div>
              : <div className="upload-z" style={{flex:1,padding:"14px 20px"}} onClick={()=>document.getElementById("logo-upload-input").click()}>
                  <div style={{fontSize:13,color:C.ash}}><strong style={{color:C.black}}>Click to upload</strong> your company logo</div>
                  <div style={{fontSize:11,color:C.stone,marginTop:2}}>PNG, JPG, SVG · Shown on carrier bid invitations</div>
                </div>}
            <input id="logo-upload-input" type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" style={{display:"none"}}
              onChange={(e)=>{
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  set("shipperLogoUrl", ev.target.result); // base64 data URL
                  set("shipperLogoName", file.name);
                };
                reader.readAsDataURL(file);
                e.target.value = "";
              }}/>
          </div>
        </div>
        <div className="wiz-row2">
          <div className="wiz-fg"><label>Mode(s) — select all that apply</label>
            <div className="chip-grp">{["Dry Van","Reefer","Flatbed","IMDL","Power Only","Tanker"].map(m=>(
              <div key={m} className={`chip2${data.modes.includes(m)?" sel":""}`} onClick={()=>set("modes",data.modes.includes(m)?data.modes.filter(x=>x!==m):[...data.modes,m])}>{m}</div>
            ))}</div>
          </div>
          <div className="wiz-fg"><label>Temp Requirements — select all that apply</label>
            <div className="chip-grp">{["N/A — Dry","34–38°F Reefer","0°F Frozen","Ambient","Lane-specific"].map(t=>(
              <div key={t} className={`chip2${(data.tempReqs||[]).includes(t)?" sel":""}`} onClick={()=>{const cur=data.tempReqs||[];set("tempReqs",cur.includes(t)?cur.filter(x=>x!==t):[...cur,t]);}}>{t}</div>
            ))}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{marginBottom:12}}>📅 Contract Term</div>
        {/* Compact pill-grid — much cleaner than tall option cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
          {terms.map(t=>(
            <div key={t.val} onClick={()=>set("term",t.val)}
              style={{padding:"10px 12px",border:`2px solid ${data.term===t.val?C.green:C.sand}`,
                borderRadius:8,cursor:"pointer",textAlign:"center",
                background:data.term===t.val?C.greenlt:C.warmWhite,transition:"all .15s"}}>
              <div style={{fontWeight:700,fontSize:13,color:data.term===t.val?C.ash:C.black}}>{t.label}</div>
              <div style={{fontSize:10,color:C.stone,marginTop:2}}>{t.desc}</div>
            </div>
          ))}
        </div>
        <div className="wiz-row2">
          <div className="wiz-fg">
            <label>Contract Start Date</label>
            <input type="date" value={data.startDate} onChange={e=>set("startDate",e.target.value)}/>
          </div>
          <div className="wiz-fg">
            <label>Contract End Date</label>
            <input type="date" value={data.endDate} onChange={e=>set("endDate",e.target.value)}/>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">⚖️ Load Parameters</div>
        <div className="wiz-row3">
          <div className="wiz-fg"><label>Max Weight (lbs)</label><input value={data.maxWeight} onChange={e=>set("maxWeight",e.target.value)} placeholder="44,500"/></div>
          <div className="wiz-fg"><label>Load Type</label><select value={data.loadType} onChange={e=>set("loadType",e.target.value)}><option>Full Truckload (FTL)</option><option>Partial / LTL</option><option>Both</option></select></div>
          <div className="wiz-fg"><label>Geography</label><select value={data.geo} onChange={e=>set("geo",e.target.value)}><option>US Domestic</option><option>Canada</option><option>Cross-border MX</option><option>Intermodal</option></select></div>
        </div>
        <div className="wiz-row2" style={{marginTop:10}}>
          <div className="wiz-fg">
            <label>Volume Period</label>
            <select value={data.volPeriod||"month"} onChange={e=>set("volPeriod",e.target.value)}>
              <option value="week">Per Week</option>
              <option value="month">Per Month</option>
              <option value="quarter">Per Quarter</option>
              <option value="year">Per Year (Annual)</option>
              <option value="term">Per Contract Term</option>
            </select>
            <div style={{fontSize:10,color:"#6B8B7E",marginTop:3}}>The timeframe for volume numbers in your lane file — carriers will see this context.</div>
          </div>
          <div className="wiz-fg">
            <label>RFP Overview <span style={{fontWeight:400,fontSize:10,color:"#6B8B7E"}}>(shown to carriers on bid page)</span></label>
            <textarea rows={4} value={data.rfpOverview||""} onChange={e=>set("rfpOverview",e.target.value)}
              placeholder={`We are excited to kick off the ${data.name||"RFP"}. Below you will find the master template with all anticipated lanes and volumes for the contract term. Please submit your linehaul-only rate for each lane.`}
              style={{fontSize:12}}/>
          </div>
        </div>
        <div className="wiz-fg" style={{marginTop:8}}>
          <label>Guidelines & Assumptions <span style={{fontWeight:400,fontSize:10,color:"#6B8B7E"}}>(editable — shown to carriers)</span></label>
          <textarea rows={6} value={data.guidelines||""} onChange={e=>set("guidelines",e.target.value)}
            placeholder={"Assume 44,500 lbs per shipment\nSubmit FLAT Linehaul ONLY pricing, excluding fuel\nSigned term sheet must be returned with RFP submission\nThis RFP is 1 round only — put your best foot forward\nOmit lanes you cannot service with high confidence\nAwarded rates must be honored for the full commitment term"}
            style={{fontSize:12,fontFamily:"inherit"}}/>
          <div style={{fontSize:10,color:"#6B8B7E",marginTop:3}}>One guideline per line. Displayed as bullet points on the carrier bid page.</div>
        </div>
      </div>
    </div>
  );
}

// ── Wiz Step 2 ────────────────────────────────────────────────────────────────
function WStep2({ data, set }) {
  const fscRef = useRef(null);
  const handleFscFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      set("fscUploaded", true);
      set("fscUploaded_name", file.name);
      set("fscUploaded_size", file.size);
    }
    e.target.value = "";
  };

  return (
    <div>
      <div className="page-title">Rate Structure</div>
      <div className="page-sub">Define how carriers should price their lanes and how fuel will be handled.</div>
      <div className="card">
        <div className="card-title">💲 Rate Submission Format</div>
        {[
          {val:"flat_linehaul",label:"Flat Linehaul — no fuel",desc:"Carriers submit a flat per-load linehaul rate only. Fuel handled separately via FSC. Most common for contracted TL."},
          {val:"rpm_no_fuel",  label:"Rate Per Mile (RPM) — no fuel",desc:"Carriers quote a per-mile linehaul rate. RFPlab calculates lane totals from uploaded mileages. Fuel separate."},
          {val:"flat_allin",   label:"Flat All-In Rate — fuel included",desc:"Single per-load rate inclusive of all fuel. Simplest for carriers; harder to re-benchmark when diesel fluctuates."},
        ].map(o=>(
          <div key={o.val} className={`option-card${data.rateFormat===o.val?" sel":""}`} onClick={()=>set("rateFormat",o.val)}>
            <input type="radio" readOnly checked={data.rateFormat===o.val}/><div><div className="option-title">{o.label}</div><div className="option-desc">{o.desc}</div></div>
          </div>
        ))}
      </div>

      {(data.rateFormat==="flat_linehaul"||data.rateFormat==="rpm_no_fuel") && (
        <div className="card">
          <div className="card-title">⛽ Fuel Surcharge Table</div>
          <div className="wiz-alr info">Upload your FSC schedule — carriers will use this table to calculate total cost. Shared in the bid portal.</div>
          <input type="file" ref={fscRef} accept=".xlsx,.csv,.xls,.pdf" style={{display:"none"}} onChange={handleFscFile}/>
          {data.fscUploaded
            ? <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:C.greenlt,border:`1px solid ${C.green}`,borderRadius:7,marginBottom:10}}>
                <span style={{fontSize:18}}>✅</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:12,color:C.green}}>FSC table uploaded</div>
                  <div style={{fontSize:11,color:C.stone}}>{data.fscUploaded_name}</div>
                </div>
                <button className="btn btn-ghost btn-xs" style={{color:C.stone}} onClick={()=>fscRef.current?.click()}>Replace</button>
              </div>
            : <div className="upload-z" onClick={()=>fscRef.current?.click()}>
                <div style={{fontSize:28,marginBottom:6}}>⛽</div>
                <div style={{fontSize:13,color:C.ash}}><strong style={{color:C.black}}>Click to upload</strong> your FSC table</div>
                <div style={{fontSize:11,color:C.stone,marginTop:3}}>.xlsx, .csv, or .pdf · DOE diesel index format</div>
              </div>}
          <div style={{marginTop:10}}>
            <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Show FSC table to carriers</div><div style={{fontSize:11,color:C.stone}}>Carriers can review the schedule before submitting</div></div><WTog checked={data.fscVisible} onChange={v=>set("fscVisible",v)}/></div>
            <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Auto-calculate all-in estimate in results</div><div style={{fontSize:11,color:C.stone}}>RFPlab computes total cost using current DOE diesel price</div></div><WTog checked={data.calcAllin} onChange={v=>set("calcAllin",v)}/></div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">📐 Rate Rules</div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>One round only — best foot forward</div><div style={{fontSize:11,color:C.stone}}>No rebidding after submission</div></div><WTog checked={data.oneRound} onChange={v=>set("oneRound",v)}/></div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Allow volume-based creative pricing</div><div style={{fontSize:11,color:C.stone}}>Carriers can offer conditional rate reductions by volume threshold</div></div><WTog checked={data.allowCreative} onChange={v=>set("allowCreative",v)}/></div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Allow IMDL alternate lane bids</div><div style={{fontSize:11,color:C.stone}}>Carriers can submit separate IMDL alternatives for eligible lanes</div></div><WTog checked={data.allowImdl} onChange={v=>set("allowImdl",v)}/></div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Rates must be honored for full term</div><div style={{fontSize:11,color:C.stone}}>Deviations result in removal from spot market access</div></div><WTog checked={data.rateLock} onChange={v=>set("rateLock",v)}/></div>
      </div>
    </div>
  );
}

// ── Wiz Step 3 ────────────────────────────────────────────────────────────────
function WStep3({ data, set }) {
  return (
    <div>
      <div className="page-title">Award Strategy</div>
      <div className="page-sub">How will you allocate lanes and volume among your carrier base?</div>
      <div className="card">
        <div className="card-title">🏆 Primary Award Model</div>
        {[
          {val:"primary_backup",label:"Primary + Backup(s)",desc:"One carrier gets first right of refusal per lane, with ranked fallbacks. Most common contracted model."},
          {val:"split",label:"Split Award",desc:"Multiple carriers share volume on a lane by percentage — e.g. 60% primary, 40% secondary."},
          {val:"waterfall",label:"Waterfall",desc:"Tender in strict rank order: #1 gets the load, fallback only on decline. Maximizes primary utilization."},
          {val:"matrix",label:"Carrier Matrix / Routing Guide",desc:"Full routing guide per lane — carrier order, frequency, and conditions all defined per lane."},
        ].map(o=>(
          <div key={o.val} className={`option-card${data.awardModel===o.val?" sel":""}`} onClick={()=>set("awardModel",o.val)}>
            <input type="radio" readOnly checked={data.awardModel===o.val}/><div><div className="option-title">{o.label}</div><div className="option-desc">{o.desc}</div></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">🔢 Carrier Mix</div>
        <div className="wiz-row2">
          <div className="wiz-fg"><label>Max Carriers Awarded Per Lane</label><select value={data.maxCarriers} onChange={e=>set("maxCarriers",e.target.value)}>{["1","2","3","4","5"].map(n=><option key={n}>{n}</option>)}</select></div>
          {data.awardModel==="split" && (
            <div className="wiz-fg"><label>Primary / Secondary Split</label>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input type="range" min={50} max={90} step={5} value={data.splitPct} onChange={e=>set("splitPct",parseInt(e.target.value))} style={{flex:1,border:"none",padding:0}}/>
                <span style={{fontWeight:700,color:C.ash,fontSize:13,minWidth:80}}>{data.splitPct}% / {100-data.splitPct}%</span>
              </div>
            </div>
          )}
        </div>
        <div className="wiz-fg"><label>Asset vs. Broker Target Mix</label>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="range" min={0} max={100} step={10} value={data.assetPct} onChange={e=>set("assetPct",parseInt(e.target.value))} style={{flex:1,border:"none",padding:0}}/>
            <span style={{fontWeight:700,color:C.ash,fontSize:13,minWidth:100}}>{data.assetPct}% asset / {100-data.assetPct}% broker</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">📊 Carrier Feedback</div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Enable carrier bid feedback</div><div style={{fontSize:11,color:C.stone}}>Carriers see limited feedback — never other carriers' identities or rates</div></div><WTog checked={data.feedbackEnabled} onChange={v=>set("feedbackEnabled",v)}/></div>
        {data.feedbackEnabled && (
          <div style={{marginTop:12}}>
            <label style={{marginBottom:8}}>Feedback type</label>
            {[
              {val:"rank",label:"Rank only",desc:"e.g. \"Your rank: #2 of 14\""},
              {val:"bracket",label:"% bracket above low",desc:"e.g. \"5–10% above low\" — most common"},
              {val:"percent",label:"Exact % above low",desc:"e.g. \"+7.4% above low bid\""},
              {val:"dollar",label:"Dollar amount above low",desc:"e.g. \"$85 above low bid\""},
            ].map(o=>(
              <div key={o.val} className={`option-card${data.feedbackType===o.val?" sel":""}`} style={{marginBottom:6}} onClick={()=>set("feedbackType",o.val)}>
                <input type="radio" readOnly checked={data.feedbackType===o.val}/><div><div className="option-title">{o.label}</div><div className="option-desc">{o.desc}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Wiz Step 4 ────────────────────────────────────────────────────────────────
function FileUploadZone({ label, accept, icon, hint, uploaded, filename, onFile }) {
  const ref = useRef(null);
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };
  return (
    <div>
      <input type="file" ref={ref} accept={accept} style={{display:"none"}} onChange={handleChange}/>
      {uploaded
        ? <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:C.greenlt,border:`1px solid ${C.green}`,borderRadius:7}}>
            <span style={{fontSize:18}}>✅</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:12,color:C.green}}>Uploaded successfully</div>
              <div style={{fontSize:11,color:C.stone}}>{filename}</div>
            </div>
            <button className="btn btn-ghost btn-xs" style={{color:C.stone}} onClick={()=>ref.current?.click()}>Replace</button>
          </div>
        : <div className="upload-z" onClick={()=>ref.current?.click()}>
            <div style={{fontSize:28,marginBottom:6}}>{icon}</div>
            <div style={{fontSize:13,color:C.ash}}><strong style={{color:C.black}}>Click to upload</strong> {label}</div>
            {hint && <div style={{fontSize:11,color:C.stone,marginTop:3}}>{hint}</div>}
          </div>}
    </div>
  );
}

function WStep4({ data, set }) {
  const setFile = (key, file) => {
    set(key, true);
    set(key+"_name", file.name);
    set(key+"_size", file.size);
  };
  return (
    <div>
      <div className="page-title">Lane Data</div>
      <div className="page-sub">Upload your lanes — a pre-built list or raw load data we aggregate for you.</div>
      <div className="card">
        <div className="card-title">📂 Upload Method</div>
        {[
          {val:"lane_list",label:"Pre-built lane file",desc:"You already know the lanes and estimated volumes. Upload your formatted lane list — RFPlab will match the template."},
          {val:"raw_data",label:"Raw load-level data — we'll aggregate",desc:"Upload your TMS/ERP shipment history. RFPlab aggregates by lane, estimates volumes, and surfaces historical carrier and rate data as incumbent information."},
        ].map(o=>(
          <div key={o.val} className={`option-card${data.laneMethod===o.val?" sel":""}`} onClick={()=>set("laneMethod",o.val)}>
            <input type="radio" readOnly checked={data.laneMethod===o.val}/><div><div className="option-title">{o.label}</div><div className="option-desc">{o.desc}</div></div>
          </div>
        ))}
      </div>
      {data.laneMethod==="lane_list" && (
        <div className="card">
          <div className="card-title">📊 Lane File</div>
          <div className="wiz-alr info">Required columns: Lane ID, Origin, Destination, Mode, Estimated Volume, Term.</div>
          <FileUploadZone
            label="lane file" accept=".xlsx,.csv,.xls" icon="📊"
            hint=".xlsx or .csv — must match RFPlab template"
            uploaded={data.laneFileUploaded} filename={data.laneFileUploaded_name}
            onFile={f=>setFile("laneFileUploaded",f)}/>
        </div>
      )}
      {data.laneMethod==="raw_data" && (
        <div className="card">
          <div className="card-title">🔬 Load-Level Data</div>
          <div className="wiz-alr info">Upload your TMS export. RFPlab will aggregate by O/D/Mode, calculate volumes, and map incumbents.</div>
          <FileUploadZone
            label="shipment history" accept=".xlsx,.csv,.xls" icon="🔬"
            hint=".xlsx or .csv · TMS or ERP export"
            uploaded={data.rawDataUploaded} filename={data.rawDataUploaded_name}
            onFile={f=>setFile("rawDataUploaded",f)}/>
        </div>
      )}
      <div className="card">
        <div className="card-title">📎 Supporting Documents</div>
        <div style={{fontSize:12,color:C.stone,marginBottom:12}}>These documents are shared with invited carriers in their bid portal.</div>
        {[
          {key:"termSheetUploaded",   label:"Term Sheet",                         req:true,  icon:"📋"},
          {key:"fscUploaded",         label:"FSC Table / Schedule",               req:false, icon:"⛽"},
          {key:"accessorialUploaded", label:"Accessorial Schedule",               req:false, icon:"💲"},
          {key:"loadingUploaded",     label:"Loading Locations / Warehouse Contacts", req:false, icon:"📍"},
          {key:"deliveryUploaded",    label:"Delivery Instructions",              req:false, icon:"🚚"},
          {key:"deductionsUploaded",  label:"Deductions Guide",                   req:false, icon:"📉"},
          {key:"proceduresUploaded",  label:"Processes & Procedures",             req:false, icon:"📖"},
        ].map(doc=>(
          <div key={doc.key} style={{marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:14}}>{doc.icon}</span>
              <span style={{fontWeight:600,fontSize:12,color:C.black}}>
                {doc.label}{doc.req&&<span style={{color:C.rust,marginLeft:4}}>*</span>}
              </span>
              {data[doc.key] && <span style={{fontSize:9,fontWeight:800,background:C.greenlt,color:C.green,padding:"1px 6px",borderRadius:2}}>UPLOADED</span>}
            </div>
            <FileUploadZone
              label={doc.label} accept=".pdf,.xlsx,.csv,.docx,.xls" icon="📄"
              hint="PDF, Excel, Word, or CSV"
              uploaded={data[doc.key]} filename={data[doc.key+"_name"]}
              onFile={f=>setFile(doc.key,f)}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Wiz Step 5 ────────────────────────────────────────────────────────────────
const W_DEFAULT_FIELDS = [
  {id:1,label:"Pickup Type",show:true,req:false},{id:2,label:"Delivery Type",show:true,req:false},
  {id:3,label:"Equipment Type",show:true,req:true},{id:4,label:"Operational Lead Time",show:true,req:false},
  {id:5,label:"Transit Time (days)",show:true,req:false},{id:6,label:"Carrier OTD Requirement",show:true,req:false},
  {id:7,label:"Load Acceptance Rate",show:true,req:false},{id:8,label:"Insurance Minimum ($)",show:false,req:false},
  {id:9,label:"Temperature Range",show:false,req:false},{id:10,label:"Tracking Required",show:false,req:false},
  {id:11,label:"EDI Capable",show:false,req:false},{id:12,label:"Team Driver Required",show:false,req:false},
];

function WStep5({ data, set }) {
  const [newFld, setNewFld] = useState("");
  const fields = data.fields || W_DEFAULT_FIELDS;
  const setF = f=>set("fields",typeof f==="function"?f(fields):f);
  const tog=(id,k)=>setF(fields.map(f=>f.id===id?{...f,[k]:!f[k]}:f));
  const addF=()=>{if(!newFld.trim())return;setF([...fields,{id:Date.now(),label:newFld,show:true,req:false,custom:true}]);setNewFld("");};
  return (
    <div>
      <div className="page-title">Lane Requirements</div>
      <div className="page-sub">Choose which fields carriers must complete per lane. Toggle on/off, mark required, or add custom fields.</div>
      <div className="card">
        <div className="card-title">⚙️ Operational Fields</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 60px 60px",gap:8,padding:"0 0 8px",borderBottom:`1px solid ${C.sand}`,marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:700,color:C.stone}}>FIELD</div>
          <div style={{fontSize:10,fontWeight:700,color:C.stone,textAlign:"center"}}>VISIBLE</div>
          <div style={{fontSize:10,fontWeight:700,color:C.stone,textAlign:"center"}}>REQUIRED</div>
        </div>
        {fields.map(f=>(
          <div key={f.id} className="fld-row" style={{opacity:f.show?1:0.4}}>
            <span className="fld-name">{f.label}{f.custom&&<span className="badge badge-open" style={{marginLeft:6,fontSize:9,padding:"1px 5px"}}>custom</span>}</span>
            <div style={{display:"flex",gap:16,alignItems:"center",flexShrink:0}}>
              <div style={{width:60,textAlign:"center"}}><WTog checked={f.show} onChange={()=>tog(f.id,"show")}/></div>
              <div style={{width:60,textAlign:"center"}}><input type="checkbox" checked={f.req} onChange={()=>tog(f.id,"req")} disabled={!f.show} style={{width:16,height:16,accentColor:C.green}}/></div>
            </div>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <input value={newFld} onChange={e=>setNewFld(e.target.value)} placeholder="Add custom field..." style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&addF()}/>
          <button className="btn btn-outline btn-sm" onClick={addF}>+ Add</button>
        </div>
      </div>
      <div className="card">
        <div className="card-title">📝 SOP Notes</div>
        <div className="wiz-fg"><label>General notes (visible to all carriers)</label><textarea rows={3} value={data.sopNotes||""} onChange={e=>set("sopNotes",e.target.value)} placeholder="e.g. Drivers must check in at gate office. No arrivals before 6 AM..."/></div>
        <div className="wiz-fg"><label>Internal notes (not shared with carriers)</label><textarea rows={2} value={data.privateNotes||""} onChange={e=>set("privateNotes",e.target.value)} placeholder="Internal notes for admin and procurement only..."/></div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Allow carrier lane-level notes</div><div style={{fontSize:11,color:C.stone}}>Carriers can annotate individual lanes with conditions</div></div><WTog checked={data.allowCarrierNotes!==false} onChange={v=>set("allowCarrierNotes",v)}/></div>
      </div>
    </div>
  );
}

// ── Wiz Step 6 ────────────────────────────────────────────────────────────────
const W_PROFILE_FIELDS = [
  {id:1,label:"Company Name",req:true,show:true},{id:2,label:"SCAC Code",req:true,show:true},
  {id:3,label:"DOT Number",req:true,show:true},{id:4,label:"MC Number",req:true,show:true},
  {id:5,label:"Primary Contact Name",req:true,show:true},{id:6,label:"Primary Contact Email",req:true,show:true},
  {id:7,label:"Primary Contact Phone",req:false,show:true},{id:8,label:"Carrier Type (Asset / Broker / Both)",req:true,show:true},
  {id:9,label:"Fleet Size (approximate)",req:false,show:true},{id:10,label:"HQ State",req:false,show:true},
  {id:11,label:"TMS Platform Used",req:false,show:true},
  {id:12,label:"Carrier Vetting Tools Used",req:false,show:true,uploadable:true,uploadHint:"Carrier may upload a PDF of their vetting SOP or program"},
  {id:13,label:"Carrier Compliance Manager Name",req:false,show:true},
  {id:14,label:"# of Active Carriers in Network",req:false,show:true},
  {id:15,label:"Operating Authority",req:false,show:false},{id:16,label:"Safety Rating",req:false,show:false},
  {id:17,label:"EDI Capable",req:false,show:false},{id:18,label:"Tracking Platform",req:false,show:false},
  {id:19,label:"Insurance Certificate on file",req:false,show:false},
];

function WStep6({ data, set }) {
  const [newFld, setNewFld] = useState("");
  const fields = data.profileFields || W_PROFILE_FIELDS;
  const setF = f=>set("profileFields",typeof f==="function"?f(fields):f);
  const tog=(id,k)=>setF(fields.map(f=>f.id===id?{...f,[k]:!f[k]}:f));
  const addF=()=>{if(!newFld.trim())return;setF([...fields,{id:Date.now(),label:newFld,req:false,show:true,custom:true}]);setNewFld("");};
  return (
    <div>
      <div className="page-title">Carrier Data Requirements</div>
      <div className="page-sub">Choose what information carriers provide when accepting the invitation.</div>
      <div className="card">
        <div className="card-title">🚛 Carrier Profile Fields</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 60px 60px",gap:8,padding:"0 0 8px",borderBottom:`1px solid ${C.sand}`,marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:700,color:C.stone}}>FIELD</div>
          <div style={{fontSize:10,fontWeight:700,color:C.stone,textAlign:"center"}}>VISIBLE</div>
          <div style={{fontSize:10,fontWeight:700,color:C.stone,textAlign:"center"}}>REQUIRED</div>
        </div>
        {fields.map(f=>(
          <div key={f.id} className="fld-row" style={{opacity:f.show?1:0.4,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:0}}>
              <div className="fld-name">{f.label}{f.custom&&<span className="badge badge-open" style={{marginLeft:6,fontSize:9,padding:"1px 5px"}}>custom</span>}</div>
              {f.uploadable&&f.show&&<div style={{fontSize:10,color:C.ash,marginTop:2}}>📎 {f.uploadHint}</div>}
            </div>
            <div style={{display:"flex",gap:16,alignItems:"center",flexShrink:0}}>
              <div style={{width:60,textAlign:"center"}}><WTog checked={f.show} onChange={()=>tog(f.id,"show")}/></div>
              <div style={{width:60,textAlign:"center"}}><input type="checkbox" checked={f.req} onChange={()=>tog(f.id,"req")} disabled={!f.show} style={{width:16,height:16,accentColor:C.green}}/></div>
            </div>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <input value={newFld} onChange={e=>setNewFld(e.target.value)} placeholder="Add custom field..." style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&addF()}/>
          <button className="btn btn-outline btn-sm" onClick={addF}>+ Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Wiz Step 7 ────────────────────────────────────────────────────────────────
const W_SUGGESTED = []; // Populated from your carrier network in Supabase

function WStep7({ data, set }) {
  const carriers = data.carriers || [];
  const setC = c=>set("carriers",typeof c==="function"?c(carriers):c);
  const [form,setForm] = useState({name:"",scac:"",contact:"",email:"",dot:"",type:"broker"});
  const [csvError, setCsvError] = useState("");
  const [showCsv, setShowCsv] = useState(false);
  const csvRef = useRef(null);

  const add=()=>{
    if(!form.name||!form.email)return;
    setC([...carriers,{...form,id:Date.now()}]);
    setForm({name:"",scac:"",contact:"",email:"",dot:"",type:"broker"});
  };
  const remove=(id)=>setC(carriers.filter(c=>c.id!==id));
  const addSug=(c)=>{if(!carriers.find(x=>x.email===c.email))setC([...carriers,c]);};

  // CSV batch import: Name, SCAC, Contact, Email, DOT, Type
  const handleCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split(/\r?\n/).filter(l=>l.trim());
        if (lines.length < 2) { setCsvError("CSV must have a header row and at least one data row."); return; }
        // Detect header
        const header = lines[0].split(",").map(h=>h.trim().toLowerCase());
        const col = (names) => names.map(n=>header.indexOf(n)).find(i=>i>=0) ?? -1;
        const nameIdx  = col(["name","company","carrier name","carrier"]);
        const emailIdx = col(["email","contact email","email address"]);
        const scacIdx  = col(["scac"]);
        const contactIdx = col(["contact","contact name","primary contact"]);
        const dotIdx   = col(["dot","dot number","usdot"]);
        const typeIdx  = col(["type","carrier type"]);

        if (nameIdx < 0 || emailIdx < 0) {
          setCsvError("CSV must have 'Name' and 'Email' columns. Optional: SCAC, Contact, DOT, Type.");
          return;
        }

        const imported = [];
        let errors = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c=>c.trim().replace(/^"|"$/g,""));
          const email = cols[emailIdx]?.trim();
          const name  = cols[nameIdx]?.trim();
          if (!name || !email || !email.includes("@")) { errors++; continue; }
          if (carriers.find(x=>x.email===email)) continue; // skip dupes
          imported.push({
            id: Date.now() + i,
            name,
            email,
            scac:    scacIdx    >= 0 ? cols[scacIdx]    : "",
            contact: contactIdx >= 0 ? cols[contactIdx] : "",
            dot:     dotIdx     >= 0 ? cols[dotIdx]     : "",
            type:    typeIdx    >= 0 ? (cols[typeIdx]||"broker").toLowerCase() : "broker",
          });
        }
        if (imported.length === 0 && errors > 0) {
          setCsvError(`No valid rows found. ${errors} rows skipped (missing name or email).`);
          return;
        }
        setC([...carriers, ...imported]);
        setCsvError("");
        setShowCsv(false);
        if (errors > 0) setCsvError(`Imported ${imported.length} carriers. ${errors} rows skipped.`);
      } catch(err) {
        setCsvError("Could not parse CSV: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div>
      <div className="page-title">Carrier & Broker List</div>
      <div className="page-sub">Add invited parties. Only these contacts can access the bid via their secure link.</div>

      {/* Batch CSV import */}
      <div className="card" style={{borderLeft:`3px solid ${C.green}`,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:C.black}}>📥 Batch Import from CSV</div>
            <div style={{fontSize:11,color:C.stone,marginTop:2}}>Upload a CSV with columns: Name, Email, SCAC, Contact, DOT, Type</div>
          </div>
          <input ref={csvRef} type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleCSV}/>
          <button className="btn btn-green btn-sm" onClick={()=>csvRef.current?.click()}>⬆ Upload CSV</button>
        </div>
        {csvError && <div className="wiz-alr warn" style={{marginTop:10,marginBottom:0}}>{csvError}</div>}
        <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.sand}`,fontSize:11,color:C.stone}}>
          <strong>Template format:</strong> Name, SCAC, Contact, Email, DOT, Type (broker/asset/both)
          <button className="btn btn-ghost btn-xs" style={{marginLeft:8}} onClick={()=>{
            const csv = "Name,SCAC,Contact,Email,DOT,Type\nExample Carrier Inc,EXMP,Jane Smith,rates@example.com,1234567,broker\nExample Asset Carrier,EXAC,John Doe,bids@exampleasset.com,7654321,asset";
            const blob = new Blob([csv], {type:"text/csv"});
            const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="carrier_template.csv"; a.click();
          }}>⬇ Download Template</button>
        </div>
      </div>

      {/* Manual add */}
      <div className="card">
        <div className="card-title">➕ Add Carrier Manually</div>
        <div className="wiz-row3">
          <div className="wiz-fg"><label>Company Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Carrier / Broker name"/></div>
          <div className="wiz-fg"><label>SCAC</label><input value={form.scac} onChange={e=>setForm(f=>({...f,scac:e.target.value}))} placeholder="e.g. ROAR"/></div>
          <div className="wiz-fg"><label>DOT Number</label><input value={form.dot} onChange={e=>setForm(f=>({...f,dot:e.target.value}))} placeholder="USDOT #"/></div>
        </div>
        <div className="wiz-row3">
          <div className="wiz-fg"><label>Contact Name</label><input value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))} placeholder="First Last"/></div>
          <div className="wiz-fg"><label>Contact Email *</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="rates@carrier.com"/></div>
          <div className="wiz-fg"><label>Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option value="broker">Broker / 3PL</option><option value="asset">Asset Carrier</option><option value="both">Both</option></select></div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={add} disabled={!form.name||!form.email}>+ Add to List</button>
      </div>

      {/* Suggestions */}
      {carriers.length===0 && (
        <div className="card">
          <div className="card-title">⭐ Suggested from Previous Bids</div>
          {W_SUGGESTED.map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",border:`1px solid ${C.sand}`,borderRadius:7,marginBottom:6}}>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:12}}>{c.name}</div><div style={{fontSize:11,color:C.stone}}>{c.scac} · {c.email} · <span className={`badge wiz-badge-${c.type}`}>{c.type}</span></div></div>
              <button className="btn btn-sm btn-primary" onClick={()=>addSug(c)}>+ Add</button>
            </div>
          ))}
        </div>
      )}

      {/* Carrier list */}
      {carriers.length>0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Invited Carriers ({carriers.length})</div>
            <div style={{fontSize:11,color:C.stone}}>{carriers.filter(c=>c.type==="asset").length} asset · {carriers.filter(c=>c.type==="broker").length} broker</div>
          </div>
          {carriers.map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",border:`1px solid ${C.sand}`,borderRadius:7,marginBottom:6}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:12}}>{c.name} <span className={`badge wiz-badge-${c.type==="asset"?"asset":"broker"}`}>{c.type}</span></div>
                <div style={{fontSize:11,color:C.stone}}>{c.scac&&`${c.scac} · `}{c.dot&&`DOT ${c.dot} · `}{c.contact&&`${c.contact} · `}{c.email}</div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{color:C.rust}} onClick={()=>remove(c.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Wiz Step 8 ────────────────────────────────────────────────────────────────
function WStep8({ data, set }) {
  return (
    <div>
      <div className="page-title">Timeline & Bid Rounds</div>
      <div className="page-sub">Set key dates and decide whether you want a second round of bidding.</div>
      <div className="card">
        <div className="card-title">📅 Round 1 — Key Dates</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{key:"inviteDate",label:"Invite Sent",sub:"Carriers receive their secure link"},{key:"ackDeadline",label:"Acknowledgment Due",sub:"Carriers confirm intent to bid"},{key:"rateDeadline",label:"Rates Due",sub:"Final submission deadline"},{key:"reviewDate",label:"Internal Review",sub:"RFPlab + shipper review session"},{key:"awardDate",label:"Awards Sent",sub:"Carriers notified of decisions"},{key:"goLiveDate",label:"Rates Go Live",sub:"Contract start date"}].map(item=>(
            <div key={item.key} className="tline-item">
              <div><div className="tline-lbl">{item.label}</div><div style={{fontSize:10,color:C.stone}}>{item.sub}</div></div>
              <input type="date" value={data[item.key]||""} onChange={e=>set(item.key,e.target.value)}/>
              <input placeholder="Note..." style={{fontSize:11}} value={data[item.key+"Note"]||""} onChange={e=>set(item.key+"Note",e.target.value)}/>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-title">🔄 Second Round</div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Enable a second round</div><div style={{fontSize:11,color:C.stone}}>Invite select carriers to re-bid on specific lanes. Max 2 rounds total.</div></div><WTog checked={data.twoRounds||false} onChange={v=>set("twoRounds",v)}/></div>
        {data.twoRounds && (
          <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.sand}`}}>
            <div className="wiz-alr warn">Round 2 is typically limited to a subset of lanes and select carriers — not a full re-bid.</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:10}}>
              {[{key:"r2InviteDate",label:"Round 2 Invite"},{key:"r2RateDeadline",label:"Round 2 Rates Due"},{key:"r2AwardDate",label:"Final Awards Sent"}].map(item=>(
                <div key={item.key} className="tline-item">
                  <div className="tline-lbl">{item.label}</div>
                  <input type="date" value={data[item.key]||""} onChange={e=>set(item.key,e.target.value)}/>
                  <input placeholder="Note..." style={{fontSize:11}} value={data[item.key+"Note"]||""} onChange={e=>set(item.key+"Note",e.target.value)}/>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Wiz Step 9 ────────────────────────────────────────────────────────────────
function WStep9({ data, set }) {
  const notifs = data.notifs || {inviteConfirm:true,ackReceived:true,rateSubmitted:true,reminderT7:true,reminderT3:true,reminderT1:true,noResponse:true,awardSent:true};
  const setN = n=>set("notifs",{...notifs,...n});
  const rows = [
    {key:"inviteConfirm",label:"Invite confirmation",sub:"Shipper notified when all invites are sent",scope:"Shipper"},
    {key:"ackReceived",label:"Intent received",sub:"Alert when a carrier acknowledges the bid",scope:"Shipper"},
    {key:"rateSubmitted",label:"Rates submitted",sub:"Alert when a carrier submits rates",scope:"Shipper"},
    {key:"reminderT7",label:"7-day reminder",sub:"Email to carriers with no submission yet",scope:"Carrier"},
    {key:"reminderT3",label:"3-day reminder",sub:"Second reminder to pending carriers",scope:"Carrier"},
    {key:"reminderT1",label:"24-hour final reminder",sub:"Urgent reminder on deadline eve",scope:"Carrier"},
    {key:"noResponse",label:"No-response flag",sub:"Alert to shipper when carrier never responded",scope:"Shipper"},
    {key:"awardSent",label:"Award notification",sub:"Carriers receive award or no-award notice",scope:"Carrier"},
  ];
  return (
    <div>
      <div className="page-title">Notifications & Reminders</div>
      <div className="page-sub">Configure automated email alerts throughout the bid process.</div>
      <div className="card">
        <div className="card-title">🔔 Notification Schedule</div>
        {rows.map(r=>(
          <div key={r.key} className="notif-card">
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{r.label}</div><div style={{fontSize:11,color:C.stone,marginTop:1}}>{r.sub}</div></div>
            <span className={`badge ${r.scope==="Shipper"?"awarded":"badge-asset"}`} style={{marginRight:12,fontSize:9}}>{r.scope}</span>
            <WTog checked={notifs[r.key]} onChange={v=>setN({[r.key]:v})}/>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">✉️ Invite Email</div>
        <div className="wiz-fg"><label>Subject line</label><input value={data.emailSubject||""} onChange={e=>set("emailSubject",e.target.value)} placeholder={`Invitation to Bid — ${data.name||"RFP 2026"}`}/></div>
        <div className="wiz-fg"><label>Email body</label><textarea rows={4} value={data.emailBody||""} onChange={e=>set("emailBody",e.target.value)} placeholder="You have been selected to participate in this RFP. Please click the secure link below to review the bid details, download lane files, and submit your rates by the deadline."/></div>
      </div>
    </div>
  );
}

// ── Wiz Step 10 ───────────────────────────────────────────────────────────────
function WStep10({ allData, onLaunch }) {
  const [showPreview, setShowPreview] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [testEmail, setTestEmail] = useState(allData.basics.shipper==="admin"?"admin@rfplab.com":"procurement@spindrift.com");
  const [testSending, setTestSending] = useState(false);
  const rL={flat_linehaul:"Flat Linehaul — no fuel",rpm_no_fuel:"Rate Per Mile — no fuel",flat_allin:"Flat All-In (fuel included)"};
  const aL={primary_backup:"Primary + Backup",split:"Split Award",waterfall:"Waterfall",matrix:"Carrier Matrix"};
  const sections=[
    {label:"RFP Name",val:allData.basics.name||"—"},
    {label:"Shipper",val:allData.basics.shipper||"—"},
    {label:"Modes",val:allData.basics.modes?.join(", ")||"—"},
    {label:"Temp Requirements",val:(allData.basics.tempReqs||[]).join(", ")||"—"},
    {label:"Contract Term",val:allData.basics.term||"—"},
    {label:"Rate Format",val:rL[allData.rates.rateFormat]||"—"},
    {label:"Award Model",val:aL[allData.award.awardModel]||"—"},
    {label:"Max Carriers/Lane",val:allData.award.maxCarriers||"—"},
    {label:"Carrier Feedback",val:allData.award.feedbackEnabled?`Enabled — ${allData.award.feedbackType}`:"Disabled"},
    {label:"Lane File",val:(allData.lanes.laneFileUploaded||allData.lanes.rawDataUploaded)?"✓ Uploaded":"Not uploaded"},
    {label:"Term Sheet",val:allData.lanes.termSheetUploaded?"✓ Uploaded":"⚠ Missing"},
    {label:"Carriers Invited",val:`${allData.carriers.carriers?.length||0} carriers`},
    {label:"Bid Rounds",val:allData.timeline.twoRounds?"2 rounds":"1 round"},
    {label:"Rates Due",val:allData.timeline.rateDeadline||"—"},
    {label:"Awards Sent",val:allData.timeline.awardDate||"—"},
    {label:"Go Live",val:allData.timeline.goLiveDate||"—"},
  ];
  const issues=[];
  if(!allData.basics.name) issues.push("RFP name is required");
  if(!allData.basics.modes?.length) issues.push("Select at least one mode");
  if(!allData.lanes.laneFileUploaded&&!allData.lanes.rawDataUploaded) issues.push("Lane file not uploaded");
  if(!allData.lanes.termSheetUploaded) issues.push("Term sheet is required");
  if(!allData.carriers.carriers?.length) issues.push("No carriers added");
  if(!allData.timeline.rateDeadline) issues.push("Rate deadline not set");

  const rfpName=allData.basics.name||"RFP 2026";
  const shipper=allData.basics.shipper||"Your Company";
  const deadline=allData.timeline.rateDeadline||"TBD";
  const emailBody=allData.notifs?.emailBody||`You have been selected to participate in the ${shipper} ${rfpName}. Please click the secure link below to review the bid details, download lane files, and submit your rates by the deadline. This is a 1-round bid — please put your best foot forward.`;
  const emailSub=allData.notifs?.emailSubject||`Invitation to Bid — ${rfpName}`;

  return (
    <div>
      <div className="page-title">Review & Launch</div>
      <div className="page-sub">Confirm configuration, preview the carrier invite, then launch.</div>
      {issues.length>0 && <div className="wiz-alr warn"><strong>Action needed:</strong><ul style={{marginTop:6,paddingLeft:16}}>{issues.map(i=><li key={i} style={{marginTop:2}}>{i}</li>)}</ul></div>}
      {issues.length===0 && <div className="wiz-alr ok">✓ All required fields complete. Ready to launch.</div>}
      <div className="card">
        <div className="card-title">📋 Configuration Summary</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px"}}>
          {sections.map(s=>(
            <div key={s.label} className="sum-row">
              <span className="sum-key">{s.label}</span>
              <span className="sum-val" style={{color:s.val?.includes("⚠")?C.amber:C.black}}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-title">🧪 Send Test Invite</div>
        <div style={{fontSize:12,color:C.stone,marginBottom:12,lineHeight:1.6}}>Send yourself a test copy of the carrier invite before going live. Clearly marked [TEST] — goes only to you.</div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <input style={{maxWidth:260}} type="email" value={testEmail} onChange={e=>setTestEmail(e.target.value)} placeholder="your@email.com"/>
          <button className="btn btn-outline" onClick={async()=>{
            setTestSending(true);
            try {
              const { sendRFPInvite } = await import('./email.js');
              await sendRFPInvite({
                carrierEmail: testEmail,
                carrierName: "Test Recipient",
                shipperName: shipper,
                rfpName: rfpName,
                lanes: allData.carriers?.carriers?.length || 0,
                deadline: fmtDateShort(allData.timeline?.rateDeadline),
              });
              setTestSent(true);
            } catch(e) { console.error("Test email failed:", e); setTestSent(true); }
            setTestSending(false);
          }} disabled={testSending||testSent} style={{minWidth:140}}>
            {testSending?"⏳ Sending…":testSent?"✓ Test Sent!":"📤 Send Test Email"}
          </button>
          <button className="btn btn-outline" onClick={()=>setShowPreview(p=>!p)}>{showPreview?"▲ Hide Preview":"👁 Preview Invite"}</button>
        </div>
        {testSent && <div className="wiz-alr ok" style={{marginTop:10}}>✓ Test invite sent to <strong>{testEmail}</strong>.</div>}
      </div>
      {showPreview && (
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{background:C.parchment,borderBottom:`1px solid ${C.sand}`,padding:"10px 18px"}}>
            <div style={{fontSize:10,fontWeight:700,color:C.stone,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>Email Preview</div>
            <div style={{display:"grid",gridTemplateColumns:"60px 1fr",gap:"3px 10px",fontSize:12}}>
              <span style={{color:C.stone}}>From:</span><span style={{fontWeight:600}}>RFPlab &lt;noreply@rfplab.com&gt;</span>
              <span style={{color:C.stone}}>To:</span><span style={{color:C.ash}}>[Carrier Contact Email]</span>
              <span style={{color:C.stone}}>Subject:</span><span style={{fontWeight:600}}>{emailSub}</span>
            </div>
          </div>
          <div style={{padding:"24px 28px",background:"white",maxWidth:580,margin:"0 auto"}}>
            <div style={{marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.sand}`}}><RFPLabLogo dark={false} size="sm"/></div>
            <div style={{fontSize:15,fontWeight:700,color:C.black,marginBottom:4}}>{rfpName}</div>
            <div style={{fontSize:12,color:C.stone,marginBottom:16}}>{shipper} · {allData.basics.modes?.join(", ")||"Truckload"} · Rates due: {fmtDateShort(deadline)}</div>
            <div style={{fontSize:13,color:C.black,lineHeight:1.75,marginBottom:20}}>{emailBody}</div>
            <div style={{textAlign:"center",margin:"20px 0"}}>
              <div style={{display:"inline-block",background:C.black,color:"white",padding:"11px 28px",borderRadius:8,fontWeight:700,fontSize:14}}>View Bid &amp; Submit Rates →</div>
              <div style={{fontSize:10,color:C.stone,marginTop:6}}>Unique secure link — expires {deadline}. Do not forward.</div>
            </div>
            <div style={{background:C.parchment,border:`1px solid ${C.sand}`,borderRadius:8,padding:"12px 16px",marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:700,color:C.stone,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>Key Dates</div>
              {[["Rates Due",allData.timeline.rateDeadline],["Awards Sent",allData.timeline.awardDate],["Go Live",allData.timeline.goLiveDate]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:`1px solid ${C.sand}`}}><span style={{color:C.stone}}>{k}</span><span style={{fontWeight:600}}>{fmtDateShort(v)}</span></div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.stone,borderTop:`1px solid ${C.sand}`,paddingTop:14,lineHeight:1.7}}>
              You received this because {shipper} invited you via RFPlab. Questions? Please email Mike@rfplab.com<br/>
              © 2026 RFPlab · rfplab.com
            </div>
          </div>
        </div>
      )}
      <div className="card">
        <div className="card-title">🚀 Launch Options</div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Send invites immediately on launch</div><div style={{fontSize:11,color:C.stone}}>Carriers receive the invite email the moment you click Launch</div></div><WTog checked={allData.basics.sendNow!==false} onChange={v=>allData.basics.setSelf("sendNow",v)}/></div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Schedule for a future date</div><div style={{fontSize:11,color:C.stone}}>Hold in draft until a specific date and time</div></div><WTog checked={allData.basics.scheduled||false} onChange={v=>allData.basics.setSelf("scheduled",v)}/></div>
        {allData.basics.scheduled && (
          <div className="wiz-row2" style={{marginTop:8}}>
            <div className="wiz-fg"><label>Send invites on</label><input type="date" value={allData.basics.schedDate||""} onChange={e=>allData.basics.setSelf("schedDate",e.target.value)}/></div>
            <div className="wiz-fg"><label>Time</label><input type="time" value={allData.basics.schedTime||""} onChange={e=>allData.basics.setSelf("schedTime",e.target.value)}/></div>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}>
        <button className="btn btn-outline">💾 Save Draft</button>
        <button className="btn btn-green" disabled={issues.length>0} onClick={onLaunch} style={{opacity:issues.length>0?0.4:1}}>🚀 Launch RFP &amp; Send Invitations →</button>
      </div>
    </div>
  );
}

// ── RFPWizard container (used by both shipper and admin) ──────────────────────
function RFPWizard({ onClose, onLaunched, builderRole = "shipper", initialShipper = "", draftData = null, dbProfile = null }) {
  const [step, setStep] = useState(draftData?.step || 1);
  const [completed, setCompleted] = useState(new Set(draftData?.completed || []));
  const [launched, setLaunched] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState(draftData?.savedAt || null);

  const [basics,  setBasicsRaw]  = useState(draftData?.basics  || {name:"",shipper:initialShipper||"",shipperId:dbProfile?.id||null,modes:[],geos:["US Domestic"],term:"",startDate:"",endDate:"",maxWeight:"44,500",loadType:"Full Truckload (FTL)",geo:"US Domestic",tempReqs:[],sendNow:true,scheduled:false});
  const [rates,   setRatesRaw]   = useState(draftData?.rates   || {rateFormat:"flat_linehaul",fscUploaded:false,fscVisible:true,calcAllin:true,oneRound:true,allowCreative:true,allowImdl:true,rateLock:true});
  const [award,   setAwardRaw]   = useState(draftData?.award   || {awardModel:"primary_backup",maxCarriers:"3",splitPct:60,assetPct:60,feedbackEnabled:true,feedbackType:"bracket"});
  const [lanes,   setLanesRaw]   = useState(draftData?.lanes   || {laneMethod:"",laneFileUploaded:false,rawDataUploaded:false,termSheetUploaded:false,accessorialUploaded:false,loadingUploaded:false,deliveryUploaded:false,deductionsUploaded:false,proceduresUploaded:false,fscUploaded:false});
  const [laneReq, setLaneReqRaw] = useState(draftData?.laneReq || {sopNotes:"",privateNotes:"",allowCarrierNotes:true});
  const [cData,   setCDataRaw]   = useState(draftData?.cData   || {carriers:[]});
  const [timeline,setTimelineRaw]= useState(draftData?.timeline || {twoRounds:false});
  const [notifD,  setNotifRaw]   = useState(draftData?.notifD  || {emailSubject:"",emailBody:""});

  const mk = setter => (key,val) => setter(prev=>({...prev,[key]:val}));
  const setB=mk(setBasicsRaw); const setR=mk(setRatesRaw); const setA=mk(setAwardRaw);
  const setL=mk(setLanesRaw); const setLR=mk(setLaneReqRaw); const setCD=mk(setCDataRaw);
  const setT=mk(setTimelineRaw); const setN=mk(setNotifRaw);

  const allData={basics:{...basics,setSelf:setB},rates,award,lanes,laneReq,carriers:cData,timeline,notifs:notifD};

  // Auto-save draft on every step transition
  const saveDraftSilent = (currentStep, currentBasics, currentRates, currentAward,
    currentLanes, currentLaneReq, currentCData, currentTimeline, currentNotifD, currentCompleted) => {
    try {
      const draftId = draftData?.id || (currentBasics.name
        ? `draft-${currentBasics.name.replace(/\s+/g,"-").toLowerCase()}`
        : `draft-autosave`);
      const draft = {
        id:        draftId,
        name:      currentBasics.name || "Untitled RFP",
        shipper:   currentBasics.shipper || "",
        step:      currentStep,
        pct:       Math.round(((currentStep-1)/10)*100),
        completed: [...currentCompleted],
        savedAt:   new Date().toISOString(),
        basics:    { ...currentBasics },
        rates:     { ...currentRates },
        award:     { ...currentAward },
        lanes:     { ...currentLanes },
        laneReq:   { ...currentLaneReq },
        cData:     { ...currentCData, carriers: currentCData.carriers || [] },
        timeline:  { ...currentTimeline },
        notifD:    { ...currentNotifD },
      };
      const existing = JSON.parse(localStorage.getItem('rfplab_drafts') || '[]');
      // Always update same draft — never create new ones (keep 1 draft per RFP)
      const updated = [...existing.filter(d=>d.id!==draft.id), draft];
      localStorage.setItem('rfplab_drafts', JSON.stringify(updated));
    } catch(e) {}
  };

  const goTo=(n)=>{
    const newCompleted = new Set(completed);
    newCompleted.add(step);
    setCompleted(newCompleted);
    setStep(n);
    // Auto-save on every step change
    saveDraftSilent(n, basics, rates, award, lanes, laneReq, cData, timeline, notifD, newCompleted);
  };
  const next=()=>{if(step<10)goTo(step+1);};
  const prev=()=>{if(step>1)setStep(step-1);};
  const pct=Math.round(((step-1)/10)*100);

  const handleLaunch = async () => {
    let rfpId = null;

    // 1. Save RFP to Supabase with shipper_id
    try {
      const { createRFP } = await import('./supabase.js');
      const rfpPayload = {
        name:           basics.name || "Untitled RFP",
        shipper_id:     dbProfile?.id || basics.shipperId || null,   // use live dbProfile.id
        shipper_name:   basics.shipper || dbProfile?.company || "",
        status:         "active",
        modes:          basics.modes || [],
        term:           basics.term || "",
        start_date:     basics.startDate || null,
        end_date:       basics.endDate   || null,
        rate_format:    rates.rateFormat || "flat_linehaul",
        award_model:    award.awardModel || "primary_backup",
        max_carriers_per_lane: parseInt(award.maxCarriers) || 3,
        asset_pct:      award.assetPct || 60,
        feedback_enabled: award.feedbackEnabled || false,
        feedback_type:  award.feedbackType || "bracket",
        two_rounds:     timeline.twoRounds || false,
        invite_date:    timeline.inviteDate   || null,
        rate_deadline:  timeline.rateDeadline || null,
        award_date:     timeline.awardDate    || null,
        go_live_date:   timeline.goLiveDate   || null,
        notes:          laneReq.sopNotes || "",
      };
      const { data: rfpData, error: rfpError } = await createRFP(rfpPayload);
      if (rfpError) console.warn("Supabase RFP error:", rfpError.message);
      else rfpId = rfpData?.id;
    } catch(e) {
      console.warn("Could not save RFP to Supabase:", e.message);
    }

    // 2. Send invite emails to all carriers
    const carriers = cData.carriers || [];
    if (carriers.length > 0) {
      try {
        const { sendRFPInvitesToAll } = await import('./email.js');
        const rfpDetails = {
          shipperName: basics.shipper || "RFPlab Shipper",
          rfpName:     basics.name || "RFP 2026",
          lanes:       `${(lanes.laneFileUploaded||lanes.rawDataUploaded) ? "See attached" : "TBD"}`,
          deadline:    fmtDateShort(timeline.rateDeadline) || "See email for details",
          bidUrl:      `${window.location.origin}?role=carrier`,
        };
        const result = await sendRFPInvitesToAll(carriers, rfpDetails);
        console.log(`Invites: ${result.sent} sent, ${result.failed} failed`);
      } catch(e) {
        console.warn("Could not send invite emails:", e.message);
      }
    }

    // 3. Clear draft from localStorage (it's now live)
    const draftId = draftData?.id ||
      (basics.name ? `draft-${basics.name.replace(/\s+/g,"-").toLowerCase()}` : "draft-autosave");
    try {
      const existing = JSON.parse(localStorage.getItem('rfplab_drafts') || '[]');
      localStorage.setItem('rfplab_drafts', JSON.stringify(
        existing.filter(d => d.id !== draftId && d.name !== basics.name)
      ));
    } catch(e) {}

    setLaunched(true);
    onLaunched && onLaunched(allData);
  };

  const handleSaveDraft = () => {
    const now = new Date().toISOString();
    // Stable ID: prefer existing draft ID, then name-based, then single fallback
    const draftId = draftData?.id ||
      (basics.name ? `draft-${basics.name.replace(/\s+/g,"-").toLowerCase()}` : "draft-autosave");
    const draft = {
      id:        draftId,
      name:      basics.name || "Untitled RFP",
      shipper:   basics.shipper || "",
      step, pct,
      completed: [...completed],
      savedAt:   now,
      basics:    { ...basics },
      rates:     { ...rates },
      award:     { ...award },
      lanes:     { ...lanes },
      laneReq:   { ...laneReq },
      cData:     { ...cData, carriers: cData.carriers || [] },
      timeline:  { ...timeline },
      notifD:    { ...notifD },
    };
    try {
      const existing = JSON.parse(localStorage.getItem('rfplab_drafts') || '[]');
      // Filter out any draft with same id OR same name (prevent duplicates)
      const filtered = existing.filter(d => d.id !== draftId && d.name !== draft.name);
      localStorage.setItem('rfplab_drafts', JSON.stringify([...filtered, draft]));
      setLastSaved(now);
      setDraftSaved(true);
      setTimeout(()=>setDraftSaved(false), 2500);
    } catch(e) {
      console.error("Could not save draft:", e);
    }
  };

  const renderStep=()=>{
    if(step===1) return <WStep1 data={basics} set={setB}/>;
    if(step===2) return <WStep2 data={rates}  set={setR}/>;
    if(step===3) return <WStep3 data={award}  set={setA}/>;
    if(step===4) return <WStep4 data={lanes}  set={setL}/>;
    if(step===5) return <WStep5 data={laneReq} set={setLR}/>;
    if(step===6) return <WStep6 data={cData}  set={setCD}/>;
    if(step===7) return <WStep7 data={cData}  set={setCD}/>;
    if(step===8) return <WStep8 data={timeline} set={setT}/>;
    if(step===9) return <WStep9 data={{...notifD, name:basics.name}} set={setN}/>;
    if(step===10)return <WStep10 allData={allData} onLaunch={handleLaunch}/>;
  };

  if(launched) return (
    <div style={{maxWidth:520,margin:"60px auto",textAlign:"center",padding:"0 32px"}}>
      <div style={{fontSize:52,marginBottom:16}}>🎉</div>
      <div style={{fontSize:22,fontWeight:700,color:C.black,marginBottom:8}}>RFP Launched!</div>
      <div style={{fontSize:14,color:C.stone,marginBottom:24,lineHeight:1.6}}>
        <strong>{basics.name||"Your RFP"}</strong> is live. Invitations being sent to <strong>{cData.carriers?.length||0} carriers and brokers</strong>.
      </div>
      <button className="btn btn-primary" onClick={onClose}>← Back to Dashboard</button>
    </div>
  );

  const stepLabel = WIZ_STEP_GROUPS.flatMap(g=>g.steps).find(s=>s.id===step)?.label;

  return (
    <div style={{display:"flex",gap:0,minHeight:"calc(100vh - 50px)"}}>
      {/* Left wizard nav — compact, fits inside content area */}
      <div style={{width:200,minWidth:200,background:C.black,borderRadius:"10px 0 0 10px",padding:"16px 0",flexShrink:0}}>
        <div style={{padding:"0 14px 14px",borderBottom:"1px solid rgba(255,255,255,.08)",marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:700,color:C.green,letterSpacing:1.5,textTransform:"uppercase"}}>RFP Builder</div>
          {basics.name && <div style={{fontSize:12,fontWeight:600,color:"white",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{basics.name}</div>}
          {builderRole==="admin" && <div style={{fontSize:9,fontWeight:700,color:C.green,background:C.greenlt,padding:"2px 6px",borderRadius:4,marginTop:4,display:"inline-block"}}>ADMIN MODE</div>}
        </div>
        {/* Progress bar */}
        <div style={{padding:"0 14px 12px",borderBottom:"1px solid rgba(255,255,255,.08)",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>Progress</span>
            <span style={{fontSize:10,fontWeight:700,color:C.green}}>{pct}%</span>
          </div>
          <div style={{height:4,background:"rgba(255,255,255,.1)",borderRadius:2}}>
            <div style={{height:4,background:C.green,borderRadius:2,width:`${pct}%`,transition:"width .3s"}}/>
          </div>
          {lastSaved && (
            <div style={{fontSize:9,color:"rgba(255,255,255,.3)",marginTop:5}}>
              Saved {new Date(lastSaved).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
            </div>
          )}
        </div>
        {/* Step list */}
        {WIZ_STEP_GROUPS.map(g=>(
          <div key={g.label}>
            <div style={{fontSize:8,fontWeight:700,letterSpacing:1.5,color:"rgba(255,255,255,.2)",textTransform:"uppercase",padding:"6px 14px 2px"}}>{g.label}</div>
            {g.steps.map(s=>{
              const isAct=s.id===step, isDone=completed.has(s.id);
              return (
                <div key={s.id} onClick={()=>isDone&&goTo(s.id)}
                  style={{display:"flex",alignItems:"center",gap:7,padding:"6px 14px",
                    cursor:isDone?"pointer":"default",
                    background:isAct?"rgba(74,159,200,.15)":"transparent",
                    borderLeft:`2px solid ${isAct?C.green:"transparent"}`}}>
                  <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,
                    background:isDone?C.green:isAct?C.green:"rgba(255,255,255,.1)",color:"white"}}>
                    {isDone?"✓":s.id}
                  </div>
                  <span style={{fontSize:11,fontWeight:isAct?600:400,color:isAct?C.green:isDone?"rgba(255,255,255,.7)":"rgba(255,255,255,.4)"}}>{s.label}</span>
                </div>
              );
            })}
          </div>
        ))}
        <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,.08)",marginTop:8}}>
          <button onClick={onClose} style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:5,color:"rgba(255,255,255,.4)",fontSize:11,padding:"6px 0",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
            ✕ Exit
          </button>
        </div>
      </div>

      {/* Step content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Mini topbar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",borderBottom:`1px solid ${C.sand}`,background:C.warmWhite,borderRadius:"0 10px 0 0"}}>
          <div style={{fontSize:12,color:C.stone}}>Step {step} of 10 — <strong style={{color:C.black}}>{stepLabel}</strong></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {draftSaved && <span style={{fontSize:11,color:C.green,fontWeight:600}}>✓ Draft saved</span>}
            <button className="btn btn-outline btn-sm" onClick={handleSaveDraft}>💾 Save Draft</button>
          </div>
        </div>

        {/* Step body */}
        <div style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>
          {renderStep()}

          {step<10 && (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:20,borderTop:`1px solid ${C.sand}`,marginTop:8}}>
              <button className="btn btn-outline" onClick={prev} disabled={step===1} style={{opacity:step===1?0.3:1}}>← Back</button>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-outline btn-sm" onClick={handleSaveDraft}>💾 Save Draft</button>
                <button className="btn btn-primary" onClick={next}>{step===9?"Review & Launch →":"Continue →"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── END EMBEDDED RFP WIZARD ──────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SPOT LOAD PROCUREMENT ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const _NOW = Date.now();
const _hr = 3600000, _min = 60000;

// Spot loads — no seed data. All loads come from Supabase.
// Shippers see their own loads (getSpotLoads); carriers see public loads (getPublicSpotLoads)
const SPOT_LOADS_SEED = []; // intentionally empty
function SpotCountdown({ endsAt, compact=false }) {
  const [now, setNow] = useState(Date.now());
  useEffect(()=>{ const t=setInterval(()=>setNow(Date.now()),1000); return()=>clearInterval(t); },[]);
  const diff = endsAt - now;
  if (diff<=0) return <span className="countdown-pill closed">Closed</span>;
  const h=Math.floor(diff/3600000), m=Math.floor((diff%3600000)/60000), s=Math.floor((diff%60000)/1000);
  const str = h>0?`${h}h ${m}m`:`${m}:${String(s).padStart(2,"0")}`;
  const urgent = diff<600000;
  return <span className={`countdown-pill${urgent?" urgent":""}`}>⏱ {compact?str:`Closes in ${str}`}</span>;
}

function spotStatusBadge(load) {
  if (load.status==="closed") return <span className="badge badge-open">Closed</span>;
  if (load.awarded) return <span className="badge awarded">✓ Awarded</span>;
  const diff = load.windowEnds - Date.now();
  if (diff<=0) return <span className="badge badge-open">Closed</span>;
  if (diff<600000) return <span className="badge" style={{background:C.rustlt,color:C.rust}}>⏱ Closing</span>;
  return <span className="badge" style={{background:C.greenlt,color:C.green,display:"inline-flex",alignItems:"center",gap:4}}><span className="live-dot"/> Live</span>;
}

function SpotQuoteBar({ q, idx, isAwarded, isMe, blind=false }) {
  const rc = idx===0?"rc1":idx===1?"rc2":idx===2?"rc3":"rcn";
  return (
    <div className={`quote-bar${isAwarded&&idx===0?" winning":isMe?" myquote":""}`}>
      <span className={`rank-circ ${rc}`}>#{idx+1}</span>
      {blind
        ? <div style={{flex:1,fontWeight:600,fontSize:12,color:C.stone,fontStyle:"italic"}}>{isMe?`You — ${carrierName}`:"(Confidential)"}</div>
        : <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:600,fontSize:12}}>{q.carrier}</div>
            <span className={`badge ${q.type==="asset"?"badge-asset":"badge-broker"}`} style={{fontSize:9,padding:"1px 6px"}}>{q.type}</span>
          </div>}
      <div style={{textAlign:"right"}}>
        <div className="mono" style={{fontSize:13,fontWeight:700,color:idx===0?C.green:C.black}}>${q.amount.toLocaleString()}</div>
        <div style={{fontSize:10,color:C.stone}}>{new Date(q.ts).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</div>
      </div>
      {isAwarded&&idx===0&&<span className="badge awarded" style={{marginLeft:6}}>Won</span>}
    </div>
  );
}

function SpotLoadModal({ load, role, onClose, onAward, onQuote, carrierName="" }) {
  const [tab, setTab] = useState("details");
  const [myQuote, setMyQuote] = useState("");
  const [quoteSubmitted, setQuoteSubmitted] = useState(load.quotes.some(q=>q.carrier===carrierName));
  const [submitting, setSubmitting] = useState(false);
  const [awardPick, setAwardPick] = useState(null);
  const [showInsurance, setShowInsurance] = useState(false);
  const isOpen = load.windowEnds > Date.now() && !load.awarded && load.status!=="closed";
  const sorted = [...load.quotes].sort((a,b)=>a.amount-b.amount);
  const low = sorted.length ? sorted[0].amount : null;
  const myQ = load.quotes.find(q=>q.carrier===carrierName);

  const handleSubmit = () => {
    if (!myQuote||isNaN(parseFloat(myQuote))) return;
    setSubmitting(true);
    setTimeout(()=>{
      onQuote(load.id,{id:Date.now(),carrier:carrierName,scac:"",type:"broker",amount:parseFloat(myQuote),ts:Date.now()});
      setQuoteSubmitted(true); setSubmitting(false); setTab("quotes");
    },800);
  };

  return (
    <div className="spot-modal-bg" onClick={onClose}>
      <div className="spot-modal" onClick={e=>e.stopPropagation()}>
        <div className="spot-modal-hdr">
          <div>
            <div style={{fontWeight:700,fontSize:14,color:C.black}}>{load.origin.city}, {load.origin.state} → {load.dest.city}, {load.dest.state}</div>
            <div style={{display:"flex",gap:6,alignItems:"center",marginTop:5,flexWrap:"wrap"}}>
              <span className="mono" style={{fontSize:10,color:C.stone}}>{load.id}</span>
              {spotStatusBadge(load)}
              <span className="badge badge-open">{load.mode}</span>
              {load.temp&&<span className="badge badge-open">{load.temp}</span>}
              {isOpen&&<SpotCountdown endsAt={load.windowEnds}/>}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{fontSize:18,lineHeight:1,flexShrink:0}}>✕</button>
        </div>
        <div style={{padding:"0 20px"}}>
          <div className="spot-tab-bar">
            <div className={`spot-tab${tab==="details"?" active":""}`} onClick={()=>setTab("details")}>Details</div>
            <div className={`spot-tab${tab==="quotes"?" active":""}`} onClick={()=>setTab("quotes")}>Quotes {load.quotes.length>0&&`(${load.quotes.length})`}</div>
            {role==="carrier"&&<div className={`spot-tab${tab==="submit"?" active":""}`} onClick={()=>setTab("submit")}>Submit Quote</div>}
            {(role==="shipper"||role==="admin")&&<div className={`spot-tab${tab==="award"?" active":""}`} onClick={()=>setTab("award")}>Award Load</div>}
          </div>
        </div>
        <div className="spot-modal-body" style={{paddingTop:0}}>
          {tab==="details"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                {[{lbl:"Pickup",loc:load.origin,date:load.pickup,win:load.puWindow},{lbl:"Delivery",loc:load.dest,date:load.delivery,win:load.dlWindow}].map(x=>(
                  <div key={x.lbl} className="card-sm" style={{marginBottom:0}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.stone,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>{x.lbl}</div>
                    <div style={{fontWeight:700,fontSize:13,color:C.black}}>{x.loc.city}, {x.loc.state} {x.loc.zip}</div>
                    <div style={{fontSize:11,color:C.stone}}>{x.loc.facility}</div>
                    <div style={{fontSize:11,color:C.stone,marginBottom:6}}>{x.loc.addr}</div>
                    <div style={{padding:"5px 8px",background:C.parchment,borderRadius:5,fontSize:11}}><strong>{x.date}</strong> · {x.win}</div>
                  </div>
                ))}
              </div>
              <div className="card-sm" style={{marginBottom:10}}>
                <div className="spot-detail-grid">
                  {[["Mode",load.mode],["Weight",load.weight],["Miles",`${load.miles.toLocaleString()} mi`],["Commodity",load.commodity],["Temp",load.temp||"N/A"],["Lumper",load.lumper?"Required (provided)":"Not required"],["Appointment",load.appt?"Required":"Not required"]].map(([k,v])=>(
                    <div key={k} className="spot-dr"><span className="sdk">{k}</span><span className="sdv">{v}</span></div>
                  ))}
                </div>
              </div>
              {load.notes&&<div className="alert info" style={{marginBottom:0}}><strong>Notes:</strong> {load.notes}</div>}
            </div>
          )}
          {tab==="quotes"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:600}}>{load.quotes.length} quote{load.quotes.length!==1?"s":""}</div>
                {low&&<div style={{fontSize:12,color:C.stone}}>Low: <strong className="mono" style={{color:C.green}}>${low.toLocaleString()}</strong></div>}
              </div>
              {sorted.length===0&&<div style={{textAlign:"center",padding:"28px 0",color:C.stone,fontSize:12}}>No quotes yet.</div>}
              {sorted.map((q,i)=><SpotQuoteBar key={q.id} q={q} idx={i} isAwarded={!!load.awarded} isMe={q.carrier===carrierName} blind={role==="carrier"&&q.carrier!==carrierName}/>)}
            </div>
          )}
          {tab==="submit"&&role==="carrier"&&(
            <div>
              {!isOpen&&<div className="alert warn">This quote window is closed.</div>}
              {isOpen&&<>
                <div className="alert info">Submit your all-in rate. Quotes are binding if accepted. You will not see other carriers' rates or identities.</div>
                {myQ&&<div className="alert" style={{background:C.greenlt,color:C.green,borderLeft:`3px solid ${C.green}`,marginBottom:10}}>Current quote: <strong className="mono">${myQ.amount.toLocaleString()}</strong> · Update before window closes.</div>}
                <div className="bid-zone">
                  <span style={{fontSize:12,color:C.stone,fontWeight:600}}>All-in rate ($)</span>
                  <input type="number" value={myQuote} onChange={e=>setMyQuote(e.target.value)} placeholder={myQ?myQ.amount.toString():"0.00"}/>
                  <button className="btn btn-green btn-sm" onClick={handleSubmit} disabled={submitting||!myQuote}>{submitting?"…":myQ?"Update Quote":"Submit Quote"}</button>
                </div>
                {quoteSubmitted&&<div className="alert" style={{background:C.greenlt,color:C.green,borderLeft:`3px solid ${C.green}`,marginTop:10}}>✓ Quote submitted. You'll be contacted if awarded.</div>}
              </>}
            </div>
          )}
          {tab==="award"&&(role==="shipper"||role==="admin")&&(
            <div>
              {load.awarded
                ? <div className="alert" style={{background:C.greenlt,color:C.green,borderLeft:`3px solid ${C.green}`}}>✓ Awarded to <strong>{load.awardedTo}</strong> at <strong className="mono">${load.awardedRate?.toLocaleString()}</strong>.</div>
                : sorted.length===0
                  ? <div className="alert warn">No quotes received. Consider reposting.</div>
                  : <>
                      <div className="alert info">Select the carrier to award. They will be notified immediately.</div>
                      {sorted.map((q,i)=>(
                        <div key={q.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",border:`1px solid ${awardPick===q.id?C.green:C.sand}`,borderRadius:8,marginBottom:6,background:awardPick===q.id?C.greenlt:C.warmWhite,cursor:"pointer"}} onClick={()=>setAwardPick(q.id)}>
                          <input type="radio" readOnly checked={awardPick===q.id} style={{accentColor:C.green}}/>
                          <span className={`rank-circ ${i===0?"rc1":i===1?"rc2":"rc3"}`}>#{i+1}</span>
                          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{q.carrier}</div><span className={`badge ${q.type==="asset"?"badge-asset":"badge-broker"}`} style={{fontSize:9}}>{q.type}</span></div>
                          <div className="mono" style={{fontSize:14,fontWeight:700,color:i===0?C.green:C.black}}>${q.amount.toLocaleString()}</div>
                        </div>
                      ))}
                      {awardPick&&(
                        <div style={{marginTop:10,padding:"12px 14px",background:"#EBF0DC",border:`1px solid ${C.olive}`,borderRadius:8}}>
                          <div style={{fontWeight:600,fontSize:13,color:C.olive,marginBottom:8}}>Award to <strong>{sorted.find(q=>q.id===awardPick)?.carrier}</strong> at <strong className="mono">${sorted.find(q=>q.id===awardPick)?.amount.toLocaleString()}</strong>?</div>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                            <button className="btn btn-green btn-sm" onClick={()=>{onAward(load.id,awardPick);onClose();}}>✓ Confirm Award</button>
                            <button className="btn btn-outline btn-sm" onClick={()=>setAwardPick(null)}>Cancel</button>
                            <button className="btn btn-sm" style={{background:"#EDE8DF",color:C.ash,border:"1px solid #D4C9B8",marginLeft:"auto"}} onClick={()=>setShowInsurance(true)}>
                              🔗 Get Cargo Insurance →
                            </button>
                          </div>
                          <div style={{fontSize:10,color:C.stone,marginTop:8}}>Tip: Purchase per-load cargo insurance via Loadsure before awarding.</div>
                        </div>
                      )}
                    </>}
            </div>
          )}
        </div>
      </div>
      {showInsurance && <LoadsureQuoteModal load={load} onClose={()=>setShowInsurance(false)}/>}
    </div>
  );
}

function SpotPostModal({ onClose, onPost }) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({origCity:"",origState:"CA",origZip:"",origFacility:"",destCity:"",destState:"",destZip:"",destFacility:"",pickup:"",puWindow:"07:00–10:00",delivery:"",dlWindow:"06:00–14:00",mode:"Dry Van",weight:"",commodity:"Beverage — Non-Haz",temp:"",lumper:false,appt:true,notes:"",window:"4h",inviteAll:true,carriers:[]});
  const s = (k,v)=>setF(prev=>({...prev,[k]:v}));
  const [posted,setPosted] = useState(false);
  const handlePost=()=>{
    setPosted(true);
    const wMs={"1h":_hr,"2h":2*_hr,"4h":4*_hr,"8h":8*_hr,"24h":24*_hr}[f.window]||4*_hr;
    onPost({id:`SL-0${440+Math.floor(Math.random()*100)}`,status:"live",origin:{city:f.origCity||"Origin",state:f.origState||"CA",zip:f.origZip,facility:f.origFacility,addr:""},dest:{city:f.destCity||"Destination",state:f.destState||"CO",zip:f.destZip,facility:f.destFacility,addr:""},pickup:f.pickup,puWindow:f.puWindow,delivery:f.delivery,dlWindow:f.dlWindow,mode:f.mode,weight:f.weight||"44,500 lbs",miles:Math.round(Math.random()*1200+200),commodity:f.commodity,temp:f.temp||null,lumper:f.lumper,appt:f.appt,notes:f.notes,windowEnds:_NOW+wMs,quotes:[],awarded:false,awardedTo:null,awardedRate:null});
    setTimeout(onClose,1200);
  };
  return (
    <div className="spot-modal-bg" onClick={onClose}>
      <div className="spot-modal" onClick={e=>e.stopPropagation()}>
        <div className="spot-modal-hdr">
          <div><div style={{fontWeight:700,fontSize:14}}>Post Spot Load</div><div style={{fontSize:11,color:C.stone,marginTop:2}}>Step {step} of 3</div></div>
          <button className="btn btn-ghost" onClick={onClose} style={{fontSize:18}}>✕</button>
        </div>
        <div className="step-prog"><div className="step-prog-fill" style={{width:`${(step/3)*100}%`}}/></div>
        <div className="spot-modal-body">
          {step===1&&<div>
            <div style={{fontWeight:600,fontSize:13,marginBottom:12}}>📍 Route & Schedule</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {[{lbl:"Origin",pre:"orig",dk:"pickup",wk:"puWindow"},{lbl:"Destination",pre:"dest",dk:"delivery",wk:"dlWindow"}].map(loc=>(
                <div key={loc.pre}>
                  <div style={{fontSize:10,fontWeight:700,color:C.stone,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>{loc.lbl}</div>
                  <div className="fg"><label>City</label><input value={f[loc.pre+"City"]} onChange={e=>s(loc.pre+"City",e.target.value)} placeholder={loc.pre==="orig"?"Irwindale":"Aurora"}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"60px 1fr",gap:8}}>
                    <div className="fg"><label>St</label><input value={f[loc.pre+"State"]} onChange={e=>s(loc.pre+"State",e.target.value)}/></div>
                    <div className="fg"><label>Zip</label><input value={f[loc.pre+"Zip"]} onChange={e=>s(loc.pre+"Zip",e.target.value)}/></div>
                  </div>
                  <div className="fg"><label>Facility</label><input value={f[loc.pre+"Facility"]} onChange={e=>s(loc.pre+"Facility",e.target.value)} placeholder="DC name"/></div>
                  <div className="fg"><label>Date</label><input type="date" value={f[loc.dk]} onChange={e=>s(loc.dk,e.target.value)}/></div>
                  <div className="fg"><label>Window</label><select value={f[loc.wk]} onChange={e=>s(loc.wk,e.target.value)}>{["07:00–10:00","08:00–12:00","10:00–14:00","12:00–16:00","06:00–18:00"].map(w=><option key={w}>{w}</option>)}</select></div>
                </div>
              ))}
            </div>
          </div>}
          {step===2&&<div>
            <div style={{fontWeight:600,fontSize:13,marginBottom:12}}>⚙️ Load Details</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <div className="fg"><label>Mode</label><select value={f.mode} onChange={e=>s("mode",e.target.value)}>{["Dry Van","Reefer","Flatbed","IMDL","Power Only"].map(m=><option key={m}>{m}</option>)}</select></div>
              <div className="fg"><label>Weight</label><input value={f.weight} onChange={e=>s("weight",e.target.value)} placeholder="44,500 lbs"/></div>
              <div className="fg"><label>Commodity</label><input value={f.commodity} onChange={e=>s("commodity",e.target.value)}/></div>
            </div>
            {f.mode==="Reefer"&&<div className="fg"><label>Temperature</label><select value={f.temp} onChange={e=>s("temp",e.target.value)}><option>34–38°F</option><option>0°F or below</option><option>Ambient</option></select></div>}
            <div style={{display:"flex",gap:20,marginBottom:12}}>
              {[["lumper","Lumper required"],["appt","Appointment required"]].map(([k,l])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>s(k,!f[k])}>
                  <label className="toggle"><input type="checkbox" checked={f[k]} readOnly/><span className="tog-sl"/></label>
                  <span style={{fontSize:12,fontWeight:500}}>{l}</span>
                </div>
              ))}
            </div>
            <div className="fg"><label>Notes</label><textarea rows={2} value={f.notes} onChange={e=>s("notes",e.target.value)} placeholder="Special instructions..."/></div>
            <div className="fg"><label>Quote Window</label>
              <div style={{display:"flex",gap:6,marginTop:4}}>
                {["1h","2h","4h","8h","24h"].map(w=><button key={w} className={`btn btn-sm ${f.window===w?"btn-primary":"btn-outline"}`} onClick={()=>s("window",w)}>{w}</button>)}
              </div>
            </div>
          </div>}
          {step===3&&<div>
            <div style={{fontWeight:600,fontSize:13,marginBottom:12}}>🚛 Carrier Invite</div>
            <div className="alert info">Only invited carriers can see and quote this load.</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",border:`1px solid ${C.sand}`,borderRadius:8,marginBottom:10}}>
              <div><div style={{fontWeight:600,fontSize:13}}>Invite all active carrier partners</div><div style={{fontSize:11,color:C.stone}}>13 carriers in your approved network</div></div>
              <label className="toggle"><input type="checkbox" checked={f.inviteAll} onChange={e=>s("inviteAll",e.target.checked)}/><span className="tog-sl"/></label>
            </div>
            {!posted&&<div style={{marginTop:12,padding:"14px",background:C.black,borderRadius:10,color:"white"}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>Ready to post</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.65)",marginBottom:10}}>Quote window: {f.window} · {f.inviteAll?"All 13 partners":"Selected carriers"} notified</div>
              <button className="btn btn-green" onClick={handlePost}>⚡ Post Load Now</button>
            </div>}
            {posted&&<div className="alert" style={{background:C.greenlt,color:C.green,borderLeft:`3px solid ${C.green}`}}>⚡ Load posted! Carriers are being notified.</div>}
          </div>}
        </div>
        <div className="spot-modal-foot">
          {step>1&&<button className="btn btn-outline btn-sm" onClick={()=>setStep(p=>p-1)}>← Back</button>}
          <div style={{flex:1}}/>
          {step<3&&<button className="btn btn-primary btn-sm" onClick={()=>setStep(p=>p+1)}>Continue →</button>}
        </div>
      </div>
    </div>
  );
}

function SpotLoadCard({ load, role, onClick }) {
  const sorted = [...load.quotes].sort((a,b)=>a.amount-b.amount);
  const low = sorted.length ? sorted[0].amount : null;
  const myQ = load.quotes.find(q=>q.carrier===carrierName);
  return (
    <div className={`load-card-spot${load.awarded?" awarded":load.status==="closed"?" closed-s":""}`} onClick={onClick}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
        <div className="route-pill">
          <span className="rdot-o"/>{load.origin.city}, {load.origin.state}<span className="rdash"/><span className="rdot-d"/>{load.dest.city}, {load.dest.state}
          <span style={{fontSize:11,color:C.stone,fontWeight:400,marginLeft:4}}>({load.miles.toLocaleString()} mi)</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
          {spotStatusBadge(load)}
          {load.windowEnds>Date.now()&&!load.awarded&&load.status!=="closed"&&<SpotCountdown endsAt={load.windowEnds} compact/>}
        </div>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <span className="mono" style={{fontSize:10,color:C.stone}}>{load.id}</span>
        <span className="badge badge-open">{load.mode}</span>
        {load.temp&&<span className="badge badge-open">{load.temp}</span>}
        <span style={{fontSize:11,color:C.stone}}>{load.pickup} · {load.puWindow}</span>
        <span style={{marginLeft:"auto",fontSize:11,fontWeight:600}}>
          {load.quotes.length} quote{load.quotes.length!==1?"s":""}
          {low&&<span style={{color:C.green}}> · Low: ${low.toLocaleString()}</span>}
          {role==="carrier"&&myQ&&<span style={{color:C.green}}> · Your quote: ${myQ.amount.toLocaleString()}</span>}
          {role==="carrier"&&!myQ&&load.windowEnds>Date.now()&&!load.awarded&&<span style={{color:"#C2410C"}}> · No quote →</span>}
        </span>
      </div>
      {load.awarded&&<div style={{marginTop:6,fontSize:11,color:C.green,fontWeight:600}}>✓ Awarded to {load.awardedTo} at ${load.awardedRate?.toLocaleString()}</div>}
    </div>
  );
}

function SpotBoard({ role, dbProfile }) {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showPost, setShowPost] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!dbProfile) { setLoading(false); return; }
    const loader = role === "carrier"
      ? import('./supabase.js').then(({ getPublicSpotLoads }) => getPublicSpotLoads())
      : import('./supabase.js').then(({ getSpotLoads }) => getSpotLoads(dbProfile.id));
    loader.then(data => {
      // Normalise Supabase rows to the shape SpotBoard expects
      const shaped = (data || []).map(row => ({
        ...row,
        windowEnds: row.window_ends ? new Date(row.window_ends).getTime() : Date.now() + 3600000,
        quotes: row.spot_quotes || [],
        origin: row.origin || {},
        dest:   row.dest   || {},
      }));
      setLoads(shaped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [dbProfile, role]);

  const handleAward=(loadId,quoteId)=>{
    setLoads(prev=>prev.map(l=>{if(l.id!==loadId)return l;const q=l.quotes.find(q=>q.id===quoteId);return{...l,awarded:true,awardedTo:q.carrier,awardedRate:q.amount,status:"awarded"};}));
  };
  const handleQuote=(loadId,quote)=>{
    setLoads(prev=>prev.map(l=>{if(l.id!==loadId)return l;const rest=l.quotes.filter(q=>q.carrier!==quote.carrier);return{...l,quotes:[...rest,quote].sort((a,b)=>a.amount-b.amount)};}));
    if(selected?.id===loadId)setSelected(prev=>({...prev,quotes:[...prev.quotes.filter(q=>q.carrier!==quote.carrier),quote].sort((a,b)=>a.amount-b.amount)}));
  };
  const handlePost=(load)=>setLoads(prev=>[load,...prev]);

  const live=loads.filter(l=>l.windowEnds>Date.now()&&!l.awarded&&l.status!=="closed");
  const awarded=loads.filter(l=>l.awarded);
  const totalQuotes=loads.reduce((s,l)=>s+l.quotes.length,0);
  const myCarrierName = dbProfile?.company||dbProfile?.full_name||"";
  const myQuotes=loads.reduce((s,l)=>s+l.quotes.filter(q=>q.carrier===myCarrierName).length,0);

  const filtered=loads.filter(l=>{
    if(filter==="live")return l.windowEnds>Date.now()&&!l.awarded&&l.status!=="closed";
    if(filter==="awarded")return l.awarded;
    if(filter==="closed")return(l.windowEnds<=Date.now()&&!l.awarded)||l.status==="closed";
    return true;
  });

  if (loading) return <div className="card" style={{textAlign:"center",padding:48,color:C.stone}}>Loading loads…</div>;

  return (
    <div>
      <div className="section-header">
        <div><div className="page-title">Spot Load Board</div><div className="page-sub">{role==="carrier"?"Open loads available for quoting — blind auction":"Post loads and award to the best quote in real time"}</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {live.length>0&&<span className="badge" style={{background:C.greenlt,color:C.green,fontSize:11,padding:"4px 12px",display:"inline-flex",alignItems:"center",gap:5}}><span className="live-dot"/>{live.length} live</span>}
          {role!=="carrier"&&<button className="btn btn-green" onClick={()=>setShowPost(true)}>⚡ Post Load</button>}
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-tile"><div className="stat-label">Live Loads</div><div className="stat-value">{live.length}</div><div className="stat-sub">accepting quotes</div></div>
        <div className="stat-tile"><div className="stat-label">Total Quotes</div><div className="stat-value">{totalQuotes}</div></div>
        <div className="stat-tile"><div className="stat-label">Awarded Today</div><div className="stat-value">{awarded.length}</div></div>
        <div className="stat-tile"><div className="stat-label">{role==="carrier"?"My Quotes":"Avg Quotes/Load"}</div><div className="stat-value">{role==="carrier"?myQuotes:loads.filter(l=>l.quotes.length>0).length?Math.round(totalQuotes/loads.filter(l=>l.quotes.length>0).length):0}</div></div>
      </div>
      <div className="tab-bar">
        {["all","live","awarded","closed"].map(t=><div key={t} className={`tab${filter===t?" active":""}`} onClick={()=>setFilter(t)} style={{textTransform:"capitalize"}}>{t}</div>)}
      </div>
      {filtered.map(load=><SpotLoadCard key={load.id} load={load} role={role} onClick={()=>setSelected(load)}/>)}
      {filtered.length===0&&<div className="card" style={{textAlign:"center",padding:"36px",color:C.stone,fontSize:12}}>No loads in this category.</div>}
      {selected&&<SpotLoadModal load={selected} role={role} onClose={()=>setSelected(null)} onAward={handleAward} onQuote={handleQuote} carrierName={dbProfile?.company||dbProfile?.full_name||""}/>}
      {showPost&&<SpotPostModal onClose={()=>setShowPost(false)} onPost={handlePost}/>}
    </div>
  );
}

// ─── END SPOT LOAD SECTION ────────────────────────────────────────────────────
// Black block with spaced R F P + vertical LAB alongside
function RFPLabLogo({ dark = false, size = "md" }) {
  const heights = { sm: 32, md: 44, lg: 80 };
  return (
    <img
      src="/Final Image.png"
      alt="RFPlab"
      style={{ height: heights[size], width: "auto", display: "block", flexShrink: 0 }}
    />
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ role, page, setPage, dbProfile = null }) {
  const adminNav = [
    {section:"Platform"},
    {icon:"⬜",label:"Dashboard",key:"dashboard"},
    {icon:"👥",label:"Users",key:"users"},
    {icon:"📋",label:"All RFPs",key:"rfps"},
    {icon:"🚀",label:"New RFP",key:"new_rfp"},
    {icon:"📜",label:"Activity Log",key:"activity"},
    {section:"Spot Loads"},
    {icon:"⚡",label:"Spot Board",key:"spot"},
    {section:"Risk Management"},
    {icon:"🛡️",label:"Carrier Network",key:"risk_carriers"},
    {icon:"📄",label:"Insurance",key:"risk_insurance"},
    {icon:"📊",label:"Scorecards",key:"risk_scorecards"},
    {icon:"🔗",label:"Cargo Insurance",key:"risk_loadsure"},
  ];
  const shipperNav = [
    {section:"Contracted RFP"},
    {icon:"⬜",label:"Dashboard",key:"dashboard"},
    {icon:"📋",label:"My RFPs",key:"rfps"},
    {icon:"🚀",label:"New RFP",key:"new_rfp"},
    {icon:"📊",label:"Results",key:"results"},
    {icon:"🏆",label:"Awards",key:"awards"},
    {icon:"🚛",label:"Invite Carriers",key:"invite"},
    {icon:"📜",label:"Activity Log",key:"activity"},
    {section:"Spot Loads"},
    {icon:"⚡",label:"Spot Board",key:"spot"},
    {section:"Risk Management"},
    {icon:"🛡️",label:"Carrier Network",key:"risk_carriers"},
    {icon:"📄",label:"Insurance & COIs",key:"risk_insurance"},
    {icon:"📊",label:"Scorecards",key:"risk_scorecards"},
    {icon:"🔗",label:"Cargo Insurance",key:"risk_loadsure"},
    {section:"Organization"},
    {icon:"👥",label:"Team Members",key:"org_team"},
  ];
  const carrierNav = [
    {section:"Contracted RFP"},
    {icon:"📋",label:"Bid Details",key:"event"},
    {icon:"💲",label:"Submit Rates",key:"bid"},
    {icon:"📈",label:"My Standing",key:"standing"},
    {icon:"📜",label:"My Activity",key:"activity"},
    {section:"Spot Loads"},
    {icon:"⚡",label:"Spot Board",key:"spot"},
    {section:"Organization"},
    {icon:"👥",label:"Team Members",key:"org_team"},
  ];
  const nav = role==="admin" ? adminNav : role==="shipper" ? shipperNav : carrierNav;
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <RFPLabLogo dark/>
      </div>
      <div className="sidebar-section">
        {nav.map((n,i)=>
          n.section
            ? <div key={`sec-${i}`}>
                {i>0&&<div className="nav-section-divider"/>}
                <div className="nav-section-head">{n.section}</div>
              </div>
            : <div key={n.key+n.label} className={`nav-item${page===n.key?" active":""}`} onClick={()=>setPage(n.key)}>
                <span>{n.icon}</span><span>{n.label}</span>
              </div>
        )}
      </div>
      <div className="sidebar-user">
        <div className="sidebar-role">{role}</div>
        <div style={{fontWeight:600,color:"rgba(255,255,255,0.75)",fontSize:12}}>
          {dbProfile?.company||dbProfile?.full_name||role}
        </div>
        <div style={{fontSize:11,marginTop:2}}>{role==="admin"?"admin@rfplab.com":role==="shipper"?"procurement@spindrift.com":"rates@roar.com"}</div>
      </div>
    </div>
  );
}


function RoleSwitcher({ role, setRole, setPage }) {
  return (
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      <span style={{fontSize:11,color:C.stone,marginRight:4}}>View as:</span>
      {["admin","shipper","carrier"].map(r=>(
        <button key={r} className="role-btn" onClick={()=>setRole(r)}>
          <span className={`role-pill ${r}`}>{r}</span>
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div className="toggle-wrap">
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} />
        <span className="toggle-slider"/>
      </label>
      {label && <span className="toggle-label">{label}</span>}
    </div>
  );
}

// ─── PAGE: Results (Shipper) — main enhanced page ─────────────────────────────
function ResultsPage({ bidSettings }) {
  const [tab, setTab] = useState("awards");
  const [scenario, setScenario] = useState(null); // null | "lowest" | "lowestAsset" | "splitModel"
  const [manualAwards, setManualAwards] = useState(() => {
    const a = {};
    LANES.forEach(l => { a[l.id] = l.bids[0]?.carrier || ""; });
    return a;
  });
  const [confirmed, setConfirmed] = useState(false);

  const displayLanes = scenario ? applyScenario(LANES, scenario) : LANES;

  const totalManualSpend = Object.entries(manualAwards).reduce((s,[id,carrier])=>{
    const lane = LANES.find(l=>l.id===id);
    const bid = lane?.bids.find(b=>b.carrier===carrier);
    return s + (bid ? bid.rate * lane.vol : 0);
  },0);

  const scenarioSpend = scenario ? displayLanes.reduce((s,l)=>s+(l.scenarioRate||0)*l.vol,0) : 0;

  return (
    <div>
      <div className="section-header">
        <div><div className="page-title">RFP Results — May–Aug 2026</div><div className="page-sub">Spindrift Beverages · {LANES.length} lanes shown · Bids sorted lowest → highest</div></div>
        <button className="btn btn-green">⬇ Export</button>
      </div>

      {/* Scenario bar */}
      <div className="scenario-bar">
        <div>
          <div className="scenario-title">⚡ Scenario Modeling</div>
          <div className="scenario-desc">Auto-assign awards to explore total spend outcomes — then manually adjust</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[
            {key:"lowest",label:"Lowest Bid",desc:"Best rate per lane"},
            {key:"lowestAsset",label:"Lowest Asset Carrier",desc:"Asset-based only"},
            {key:"splitModel",label:"60/40 Split",desc:"60% asset, 40% broker"},
          ].map(s=>(
            <div key={s.key} className={`scenario-pill ${scenario===s.key?"active-s":"inactive-s"}`}
              onClick={()=>setScenario(prev=>prev===s.key?null:s.key)} title={s.desc}>
              {scenario===s.key?"✓ ":""}{s.label}
            </div>
          ))}
          {scenario && <div className="scenario-pill inactive-s" onClick={()=>setScenario(null)}>✕ Clear</div>}
        </div>
        {scenario && (
          <div style={{textAlign:"right",minWidth:140}}>
            <div style={{fontSize:10,color:C.ash,fontWeight:600}}>SCENARIO SPEND</div>
            <div style={{fontSize:18,fontWeight:700,color:C.ash}}>${(scenarioSpend/1000).toFixed(0)}K</div>
            <div style={{fontSize:10,color:C.ash}}>vs ${(totalManualSpend/1000).toFixed(0)}K manual</div>
          </div>
        )}
      </div>

      <div className="tab-bar">
        <div className={`tab${tab==="awards"?" active":""}`} onClick={()=>setTab("awards")}>Lane Awards & Bids</div>
        <div className={`tab${tab==="carrier"?" active":""}`} onClick={()=>setTab("carrier")}>By Carrier</div>
      </div>

      {tab==="awards" && (
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div className="table-scroll">
            <table>
              <thead><tr>
                <th>Lane</th><th>Type</th><th>Route</th><th>Mode</th><th>Vol</th>
                <th>Incumbent</th>
                <th style={{background:"#F0FDF4",color:C.green}}>#1 Bidder</th>
                <th style={{background:"#F0FDF4",color:C.green}}>#1 Rate</th>
                <th>#2</th><th>#2 Rate</th>
                <th>#3</th><th>#3 Rate</th>
                <th>Spread #1→#3</th>
                <th>Award To</th>
              </tr></thead>
              <tbody>
                {displayLanes.map(l=>{
                  const b0=l.bids[0], b1=l.bids[1], b2=l.bids[2];
                  const spread = b0&&b2 ? `+${pctFromLow(b2.rate,b0.rate)}%` : "—";
                  const isIncumbentLow = l.incumbent && b0?.carrier===l.incumbent;
                  const scenarioCarrier = l.scenarioAward;
                  const awardedCarrier = scenario ? scenarioCarrier : manualAwards[l.id];

                  return (
                    <tr key={l.id} style={awardedCarrier ? {background:"#F0FDF4"} : {}}>
                      <td className="mono" style={{fontSize:11,color:C.stone}}>{l.id}</td>
                      <td><span className={`badge ${l.type.toLowerCase()}`}>{l.type}</span></td>
                      <td style={{fontSize:12}}>{l.origCity},{l.origSt}→{l.destCity},{l.destSt}</td>
                      <td style={{fontSize:11}}>{l.mode}</td>
                      <td className="mono">{Math.round(l.vol)}</td>
                      <td>
                        {l.incumbent
                          ? <div>
                              <span className="incumbent-tag">INCMBT</span>
                              <div style={{fontSize:11,fontWeight:600,marginTop:2}}>{l.incumbent}</div>
                              <div className="mono" style={{fontSize:10,color:C.stone}}>${l.incumbentRate?.toLocaleString()}</div>
                            </div>
                          : <span style={{color:C.stone,fontSize:11}}>New lane</span>}
                      </td>
                      <td style={{background:"#F0FDF4"}}>
                        <div style={{fontWeight:700,color:C.green,fontSize:12}}>{b0?.carrier}</div>
                        <span className={`badge ${b0?.type}`}>{b0?.type}</span>
                        {isIncumbentLow && <div style={{fontSize:9,color:C.green,marginTop:2}}>↩ Incumbent retained</div>}
                      </td>
                      <td style={{background:"#F0FDF4"}}>
                        <div className="mono" style={{fontWeight:700,color:C.green}}>${b0?.rate?.toLocaleString()}</div>
                        {l.incumbent && b0 && <div style={{fontSize:9,color:b0.rate<l.incumbentRate?C.green:C.amber}}>
                          {b0.rate<l.incumbentRate?`↓ $${(l.incumbentRate-b0.rate).toLocaleString()} vs incmbt`:`↑ $${(b0.rate-l.incumbentRate).toLocaleString()} vs incmbt`}
                        </div>}
                      </td>
                      <td>
                        <div style={{fontSize:12}}>{b1?.carrier}</div>
                        {b1 && <span className={`badge ${b1.type}`}>{b1.type}</span>}
                      </td>
                      <td className="mono" style={{color:C.stone}}>{b1 ? `$${b1.rate.toLocaleString()}` : "—"}</td>
                      <td>
                        <div style={{fontSize:12}}>{b2?.carrier}</div>
                        {b2 && <span className={`badge ${b2.type}`}>{b2.type}</span>}
                      </td>
                      <td className="mono" style={{color:C.stone}}>{b2 ? `$${b2.rate.toLocaleString()}` : "—"}</td>
                      <td className="mono" style={{color:C.amber,fontWeight:600}}>{spread}</td>
                      <td>
                        {scenario ? (
                          <div>
                            <div style={{fontWeight:700,fontSize:12,color:C.ash}}>{l.scenarioAward}</div>
                            {l.scenarioSecondary && <div style={{fontSize:10,color:C.stone}}>{l.primaryVol} loads + {l.scenarioSecondary} ({l.secondaryVol})</div>}
                          </div>
                        ) : (
                          <select style={{fontSize:11,minWidth:160}}
                            value={manualAwards[l.id]}
                            onChange={e=>setManualAwards(a=>({...a,[l.id]:e.target.value}))}>
                            <option value="">— Unawarded —</option>
                            {l.bids.map((b,i)=>(
                              <option key={b.carrier} value={b.carrier}>#{i+1} {b.carrier} (${b.rate.toLocaleString()})</option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!scenario && (
            <div style={{padding:"12px 16px",borderTop:`1px solid ${C.sand}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:12,color:C.stone}}>
                Est. total award spend: <strong style={{color:C.black}}>${(totalManualSpend/1000).toFixed(0)}K</strong>
              </div>
              {confirmed
                ? <div className="alert success" style={{margin:0,padding:"6px 12px"}}>✓ Awards confirmed and sent to admin</div>
                : <button className="btn btn-green" onClick={()=>setConfirmed(true)}>✓ Confirm Awards</button>}
            </div>
          )}
        </div>
      )}

      {tab==="carrier" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {ALL_CARRIERS.filter(c=>c.submitted).map(c=>{
            const won = LANES.filter(l=>manualAwards[l.id]===c.name).length;
            return (
              <div className="card-sm" key={c.id}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:10}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13}}>{c.name}</div>
                    <div style={{display:"flex",gap:6,marginTop:3}}>
                      <span className="mono" style={{fontSize:11,color:C.stone}}>{c.scac}</span>
                      <span className={`badge ${c.type}`}>{c.type}</span>
                    </div>
                  </div>
                  <span className="badge awarded">{won} awarded</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(100,(won/LANES.length)*100*3)}%`}}/></div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:C.stone}}>
                  <span>{c.bids} bids submitted</span>
                  <span>{c.bids>0?((won/Math.max(1,c.bids))*100).toFixed(0):0}% hit rate</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PAGE: Bid (Carrier) — blind, only sees own rates ─────────────────────────
export {
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
};
