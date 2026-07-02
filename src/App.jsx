import { useState, useEffect } from "react";

// ─── RFPlab.com Brand Tokens ──────────────────────────────────────────────────
// Pulled directly from rfplab.com: black backgrounds, cream text, warm grays
// No blues. Monochromatic, editorial, freight-industry authority.
const C = {
  // Core brand
  black:   "#111111",   // near-black — main backgrounds (sidebar, hero)
  ink:     "#1E1E1E",   // slightly lifted black — card hover, secondary bg
  charcoal:"#2A2A2A",   // borders on dark backgrounds, secondary panels
  cream:   "#F5F0E8",   // primary text on dark — the rfplab.com cream
  warmWhite:"#FDFCF9",  // page background — warm off-white, not clinical
  parchment:"#EDE8DF",  // card backgrounds, alternate rows
  sand:    "#D4C9B8",   // muted borders, dividers on light bg
  stone:   "#8C8070",   // secondary text, labels
  ash:     "#5A534A",   // body text on light backgrounds

  // Functional accents — warm, not cool
  gold:    "#C9A84C",   // primary accent — active states, CTAs, highlights
  goldlt:  "#F5EDD4",   // light gold for badges / chips
  olive:   "#5C6B2E",   // success / awarded (muted green)
  olivelt: "#EBF0DC",   // success background
  rust:    "#9B3A1E",   // warning / urgent
  rustlt:  "#F5E6E0",   // warning background
  crimson: "#7A1F1F",   // error / danger
  crimsonlt:"#F5E0E0",  // error background

  // Keep these for functional semantics (alerts, rates, badges)
  // but they'll render in warm tones not bright blues
  navy:    "#111111",   // maps to black in this brand
  slate:   "#1E1E1E",
  steel:   "#2A2A2A",
  sky:     "#C9A84C",   // gold replaces sky blue as the "accent"
  ice:     "#F5EDD4",   // goldlt replaces ice
  white:   "#FDFCF9",
  offwhite:"#EDE8DF",
  green:   "#5C6B2E",   // olive replaces green
  greenlt: "#EBF0DC",
  amber:   "#9B3A1E",   // rust replaces amber
  amberlt: "#F5E6E0",
  red:     "#7A1F1F",
  redlt:   "#F5E0E0",
  gray:    "#8C8070",
  grayli:  "#D4C9B8",
  text:    "#1E1E1E",
  purple:  "#5A4A3A",   // warm brown replaces purple for secondary accents
  purplt:  "#EDE8DF",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:${C.warmWhite};color:${C.ash};}
  .mono{font-family:'DM Mono',monospace;}
  .app{display:flex;height:100vh;overflow:hidden;}

  /* ── Sidebar ── dark, editorial, rfplab.com style */
  .sidebar{width:224px;min-width:224px;background:${C.black};display:flex;flex-direction:column;overflow-y:auto;border-right:1px solid ${C.charcoal};}
  .main{flex:1;overflow-y:auto;display:flex;flex-direction:column;}
  .topbar{background:${C.warmWhite};border-bottom:1px solid ${C.sand};padding:12px 24px;display:flex;align-items:center;justify-content:space-between;}
  .content{padding:28px;flex:1;}
  .sidebar-logo{padding:20px 16px 16px;border-bottom:1px solid ${C.charcoal};}
  .sidebar-section{padding:10px 0;}
  .sidebar-label{font-size:8px;font-weight:800;letter-spacing:2px;color:rgba(245,240,232,.25);text-transform:uppercase;padding:0 16px;margin-bottom:4px;}
  .nav-item{display:flex;align-items:center;gap:9px;padding:8px 16px;cursor:pointer;color:rgba(245,240,232,.5);font-size:12px;font-weight:500;transition:all 0.15s;border-left:2px solid transparent;letter-spacing:0.2px;}
  .nav-item:hover{background:rgba(245,240,232,.04);color:${C.cream};}
  .nav-item.active{background:rgba(201,168,76,.08);color:${C.gold};border-left-color:${C.gold};}
  .sidebar-user{margin-top:auto;padding:14px 16px;border-top:1px solid ${C.charcoal};font-size:11px;color:rgba(245,240,232,.35);}
  .sidebar-role{display:inline-block;background:${C.charcoal};color:${C.gold};font-size:8px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:2px 7px;border-radius:2px;margin-bottom:4px;}
  .nav-section-divider{height:1px;background:${C.charcoal};margin:4px 16px;}
  .nav-section-head{font-size:8px;font-weight:800;letter-spacing:2px;color:rgba(245,240,232,.2);text-transform:uppercase;padding:10px 16px 4px;}

  /* ── Role switcher / pills ── */
  .role-btn{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:4px;border:1px solid ${C.sand};background:${C.warmWhite};cursor:pointer;font-size:11px;font-weight:600;color:${C.ash};transition:all 0.15s;letter-spacing:.3px;}
  .role-btn:hover{background:${C.parchment};border-color:${C.stone};}
  .role-pill{font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:2px;}
  .role-pill.admin{background:${C.black};color:${C.cream};}
  .role-pill.shipper{background:${C.ash};color:${C.cream};}
  .role-pill.carrier{background:${C.stone};color:${C.cream};}

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
  .badge.broker{background:${C.charcoal};color:${C.cream};font-size:9px;}
  .badge-asset{background:${C.parchment};color:${C.ash};border:1px solid ${C.sand};}
  .badge-broker{background:${C.charcoal};color:${C.cream};}
  .badge-green{background:${C.olivelt};color:${C.olive};}
  .badge-gray{background:${C.parchment};color:${C.stone};border:1px solid ${C.sand};}

  /* ── Buttons ── */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:700;transition:all 0.15s;letter-spacing:.3px;font-family:'Inter',sans-serif;}
  .btn-sm{padding:5px 12px;font-size:11px;border-radius:3px;}
  .btn-xs{padding:3px 8px;font-size:10px;border-radius:3px;}
  .btn-primary{background:${C.black};color:${C.cream};}
  .btn-primary:hover{background:${C.ink};}
  .btn-outline{background:transparent;color:${C.ash};border:1px solid ${C.sand};}
  .btn-outline:hover{background:${C.parchment};border-color:${C.stone};}
  .btn-green{background:${C.olive};color:white;}
  .btn-green:hover{background:#4A5725;}
  .btn-purple{background:${C.ash};color:white;}
  .btn-purple:hover{background:${C.charcoal};}
  .btn-danger{background:${C.crimsonlt};color:${C.crimson};border:1px solid #E0C0C0;}
  .btn-danger:hover{background:#F0D0D0;}
  .btn-ghost{background:transparent;color:${C.stone};border:none;cursor:pointer;padding:5px 8px;font-family:'Inter',sans-serif;font-size:12px;}
  .btn-ghost:hover{color:${C.ash};}
  .btn-orange{background:${C.rust};color:white;}

  /* ── Inputs ── */
  input,select,textarea{font-family:'Inter',sans-serif;font-size:13px;border:1px solid ${C.sand};border-radius:4px;padding:7px 10px;background:${C.warmWhite};color:${C.ash};width:100%;transition:border .15s,box-shadow .15s;}
  input:focus,select:focus,textarea:focus{outline:none;border-color:${C.gold};box-shadow:0 0 0 3px rgba(201,168,76,.12);}
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
  .tab.active{color:${C.black};border-bottom-color:${C.gold};font-weight:800;}

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
  .scenario-pill.active-s{background:${C.black};color:${C.cream};border-color:${C.black};}
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
  .chip2.sel{background:${C.black};border-color:${C.black};color:${C.cream};font-weight:700;}
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
  .wiz-logo-sub{font-size:8px;color:rgba(201,168,76,.7);letter-spacing:2px;text-transform:uppercase;margin-top:6px;font-weight:700;}
  .wiz-steps{padding:16px 0;flex:1;}
  .wiz-step-group{margin-bottom:4px;}
  .wiz-group-label{font-size:8px;font-weight:800;letter-spacing:2px;color:rgba(245,240,232,.2);text-transform:uppercase;padding:8px 16px 4px;}
  .step-item{display:flex;align-items:center;gap:10px;padding:7px 16px;cursor:pointer;transition:background .15s;border-left:2px solid transparent;}
  .step-item:hover{background:rgba(245,240,232,.03);}
  .step-item.wiz-active{background:rgba(201,168,76,.08);border-left-color:${C.gold};}
  .step-num{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0;}
  .step-num.done{background:${C.olive};color:white;}
  .step-num.wiz-act{background:${C.gold};color:${C.black};}
  .step-num.pend{background:rgba(245,240,232,.08);color:rgba(245,240,232,.3);}
  .step-lbl{font-size:11px;font-weight:500;color:rgba(245,240,232,.45);}
  .step-lbl.wiz-act{color:${C.gold};}
  .step-lbl.done{color:rgba(245,240,232,.7);}
  .wiz-body{flex:1;overflow-y:auto;}
  .wiz-content{max-width:720px;margin:0 auto;padding:28px 32px;}
  .wiz-topbar{background:${C.warmWhite};border-bottom:1px solid ${C.sand};padding:10px 20px;display:flex;align-items:center;justify-content:space-between;}
  .wiz-progress{height:2px;background:${C.sand};}
  .wiz-progress-fill{height:2px;background:${C.gold};transition:width .4s;}
  .wiz-footer{display:flex;justify-content:space-between;align-items:center;padding-top:20px;border-top:1px solid ${C.sand};margin-top:8px;}
  .option-card{border:1px solid ${C.sand};border-radius:6px;padding:12px 14px;cursor:pointer;transition:all .15s;display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;}
  .option-card:hover{border-color:${C.gold};background:${C.goldlt};}
  .option-card.sel{border-color:${C.gold};background:${C.goldlt};}
  .option-card input[type=radio]{margin-top:2px;accent-color:${C.gold};}
  .option-title{font-size:13px;font-weight:700;color:${C.black};}
  .option-desc{font-size:11px;color:${C.stone};margin-top:2px;line-height:1.5;}
  .wiz-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .wiz-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
  .wiz-fg{margin-bottom:12px;}
  .wiz-badge-asset{background:${C.parchment};color:${C.ash};border:1px solid ${C.sand};}
  .wiz-badge-broker{background:${C.charcoal};color:${C.cream};}
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
  .countdown-pill.urgent{color:${C.crimson};background:${C.crimsonlt};border-color:#D4A0A0;}
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

// ─── CARRIERS (with asset/broker flag) ───────────────────────────────────────
const ALL_CARRIERS = [
  { id:1, name:"ROAR Logistics",          scac:"ROAR", type:"broker",  contact:"john@roar.com",     invited:true,  submitted:true,  bids:62 },
  { id:2, name:"C.H. Robinson",           scac:"RBTW", type:"broker",  contact:"rates@chr.com",      invited:true,  submitted:true,  bids:71 },
  { id:3, name:"Echo Global",             scac:"ECHS", type:"broker",  contact:"bids@echo.com",      invited:true,  submitted:true,  bids:55 },
  { id:4, name:"Circle Logistics",        scac:"CLIM", type:"broker",  contact:"ops@circle.com",     invited:true,  submitted:true,  bids:43 },
  { id:5, name:"Total Quality Logistics", scac:"TQYL", type:"broker",  contact:"rfp@tql.com",        invited:true,  submitted:true,  bids:38 },
  { id:6, name:"Molo Solutions",          scac:"MOLY", type:"broker",  contact:"bids@molo.com",      invited:true,  submitted:true,  bids:29 },
  { id:7, name:"Allen Lund",              scac:"LUAC", type:"broker",  contact:"rfp@allenlund.com",  invited:true,  submitted:true,  bids:22 },
  { id:8, name:"Elberta Carriers",        scac:"ELFI", type:"asset",   contact:"rates@elberta.com",  invited:true,  submitted:true,  bids:34 },
  { id:9, name:"Market Express",          scac:"MKXD", type:"asset",   contact:"rfp@marketexp.com",  invited:true,  submitted:true,  bids:41 },
  { id:10,name:"JBHUNT",                  scac:"HJBB", type:"asset",   contact:"rfp@jbhunt.com",     invited:true,  submitted:true,  bids:28 },
  { id:11,name:"NFI Logistics",           scac:"NFBR", type:"asset",   contact:"rfp@nfi.com",        invited:true,  submitted:true,  bids:19 },
  { id:12,name:"PLS Logistics",           scac:"PTLC", type:"broker",  contact:"rfp@plslogistics.com",invited:true, submitted:false, bids:0  },
  { id:13,name:"Spot Freight Inc",        scac:"SFIK", type:"broker",  contact:"ops@spotfreight.com", invited:true, submitted:false, bids:0  },
];

// ─── LANES with full bid data (sorted lowest→highest by r1 after render) ─────
const LANES_RAW = [
  { id:"SD-0001", type:"INBOUND",  origCity:"Beaumont",  origSt:"CA", destCity:"Irwindale",  destSt:"CA", mode:"Reefer",   vol:44,    miles:65,    incumbent:"Spot Freight Inc", incumbentScac:"SFIK", incumbentRate:510,
    bids:[{carrier:"Spot Freight Inc",scac:"SFIK",type:"broker",rate:486},{carrier:"ROAR Logistics",scac:"ROAR",type:"broker",rate:502},{carrier:"Circle Logistics",scac:"CLIM",type:"broker",rate:521},{carrier:"Elberta Carriers",scac:"ELFI",type:"asset",rate:534}]},
  { id:"SD-0002", type:"INBOUND",  origCity:"Beaumont",  origSt:"CA", destCity:"Mooresville",destSt:"NC", mode:"Reefer",   vol:28.6,  miles:2373,  incumbent:"ROAR Logistics",   incumbentScac:"ROAR", incumbentRate:5400,
    bids:[{carrier:"ROAR Logistics",scac:"ROAR",type:"broker",rate:5150},{carrier:"C.H. Robinson",scac:"RBTW",type:"broker",rate:5325},{carrier:"Echo Global",scac:"ECHS",type:"broker",rate:5490},{carrier:"Elberta Carriers",scac:"ELFI",type:"asset",rate:5600}]},
  { id:"SD-0003", type:"INBOUND",  origCity:"Beaumont",  origSt:"CA", destCity:"Clackamas",  destSt:"OR", mode:"Reefer",   vol:42.9,  miles:565,   incumbent:"Molo Solutions",   incumbentScac:"MOLY", incumbentRate:2780,
    bids:[{carrier:"Molo Solutions",scac:"MOLY",type:"broker",rate:2568},{carrier:"ROAR Logistics",scac:"ROAR",type:"broker",rate:2700},{carrier:"Total Quality Logistics",scac:"TQYL",type:"broker",rate:2850},{carrier:"Market Express",scac:"MKXD",type:"asset",rate:2690}]},
  { id:"SD-0005", type:"OUTBOUND", origCity:"Irwindale", origSt:"CA", destCity:"Phoenix",    destSt:"AZ", mode:"Dry Van",  vol:38.6,  miles:368,   incumbent:null, incumbentScac:null, incumbentRate:null,
    bids:[{carrier:"C.H. Robinson",scac:"RBTW",type:"broker",rate:875},{carrier:"Echo Global",scac:"ECHS",type:"broker",rate:912},{carrier:"Circle Logistics",scac:"CLIM",type:"broker",rate:945},{carrier:"Elberta Carriers",scac:"ELFI",type:"asset",rate:899},{carrier:"Market Express",scac:"MKXD",type:"asset",rate:888}]},
  { id:"SD-0008", type:"OUTBOUND", origCity:"Irwindale", origSt:"CA", destCity:"Gilroy",     destSt:"CA", mode:"Dry Van",  vol:23.9,  miles:325,   incumbent:"ROAR Logistics",   incumbentScac:"ROAR", incumbentRate:1050,
    bids:[{carrier:"ROAR Logistics",scac:"ROAR",type:"broker",rate:966},{carrier:"Allen Lund",scac:"LUAC",type:"broker",rate:999},{carrier:"Total Quality Logistics",scac:"TQYL",type:"broker",rate:1020},{carrier:"JBHUNT",scac:"HJBB",type:"asset",rate:985}]},
  { id:"SD-0010", type:"INBOUND",  origCity:"Irwindale", origSt:"CA", destCity:"Redlands",   destSt:"CA", mode:"Dry Van",  vol:308,   miles:52,    incumbent:"ROAR Logistics",   incumbentScac:"ROAR", incumbentRate:420,
    bids:[{carrier:"ROAR Logistics",scac:"ROAR",type:"broker",rate:399},{carrier:"C.H. Robinson",scac:"RBTW",type:"broker",rate:415},{carrier:"Echo Global",scac:"ECHS",type:"broker",rate:430},{carrier:"Market Express",scac:"MKXD",type:"asset",rate:408},{carrier:"JBHUNT",scac:"HJBB",type:"asset",rate:412}]},
  { id:"SD-0022", type:"OUTBOUND", origCity:"Redlands",  origSt:"CA", destCity:"Aurora",     destSt:"CO", mode:"Dry Van",  vol:74.8,  miles:1003,  incumbent:null, incumbentScac:null, incumbentRate:null,
    bids:[{carrier:"C.H. Robinson",scac:"RBTW",type:"broker",rate:2450},{carrier:"Circle Logistics",scac:"CLIM",type:"broker",rate:2550},{carrier:"Echo Global",scac:"ECHS",type:"broker",rate:2700},{carrier:"Elberta Carriers",scac:"ELFI",type:"asset",rate:2490},{carrier:"NFI Logistics",scac:"NFBR",type:"asset",rate:2520}]},
  { id:"SD-0040", type:"OUTBOUND", origCity:"Charlotte", origSt:"NC", destCity:"Lakeland",   destSt:"FL", mode:"Dry Van",  vol:110,   miles:584,   incumbent:"C.H. Robinson",    incumbentScac:"RBTW", incumbentRate:1410,
    bids:[{carrier:"C.H. Robinson",scac:"RBTW",type:"broker",rate:1341},{carrier:"Echo Global",scac:"ECHS",type:"broker",rate:1389},{carrier:"ROAR Logistics",scac:"ROAR",type:"broker",rate:1450},{carrier:"JBHUNT",scac:"HJBB",type:"asset",rate:1360},{carrier:"Elberta Carriers",scac:"ELFI",type:"asset",rate:1395}]},
  { id:"SD-0047", type:"OUTBOUND", origCity:"Mooresville",origSt:"NC",destCity:"Cheshire",   destSt:"CT", mode:"Dry Van",  vol:38.5,  miles:696,   incumbent:"JBHUNT",           incumbentScac:"HJBB", incumbentRate:1950,
    bids:[{carrier:"JBHUNT",scac:"HJBB",type:"asset",rate:1809},{carrier:"C.H. Robinson",scac:"RBTW",type:"broker",rate:1875},{carrier:"Circle Logistics",scac:"CLIM",type:"broker",rate:1920},{carrier:"NFI Logistics",scac:"NFBR",type:"asset",rate:1890}]},
  { id:"SD-0065", type:"OUTBOUND", origCity:"Clackamas", origSt:"OR", destCity:"Aurora",     destSt:"CO", mode:"Dry Van",  vol:60.5,  miles:1272,  incumbent:"Elberta Carriers", incumbentScac:"ELFI", incumbentRate:2700,
    bids:[{carrier:"Elberta Carriers",scac:"ELFI",type:"asset",rate:2523},{carrier:"ROAR Logistics",scac:"ROAR",type:"broker",rate:2620},{carrier:"Total Quality Logistics",scac:"TQYL",type:"broker",rate:2750},{carrier:"Market Express",scac:"MKXD",type:"asset",rate:2560}]},
];

// Sort each lane's bids lowest to highest
const LANES = LANES_RAW.map(l => ({
  ...l,
  bids: [...l.bids].sort((a,b) => a.rate - b.rate),
}));

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
  if (ft === "rank") return { label: `Your rank: #${myRank} of ${lane.bids.length}`, color: myRank === 1 ? C.green : C.gray };
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
  invite_viewed:    {icon:"👁️", label:"Bid Page Viewed",     color:C.gray},
  intent_yes:       {icon:"✅", label:"Intent: Will Bid",    color:C.green},
  intent_no:        {icon:"❌", label:"Intent: Declining",   color:C.red},
  intent_maybe:     {icon:"🤔", label:"Intent: Undecided",  color:C.amber},
  file_downloaded:  {icon:"⬇️", label:"File Downloaded",    color:C.steel},
  rates_submitted:  {icon:"💲", label:"Rates Submitted",    color:C.green},
  rates_updated:    {icon:"✏️", label:"Rates Updated",      color:C.amber},
  award_viewed:     {icon:"🏆", label:"Award Viewed",       color:C.purple},
};

// Seed log with realistic history
const SEED_LOG = [
  {id:1, ts:"2026-03-18T09:02:00", carrier:"ROAR Logistics",  scac:"ROAR", event:"invite_sent",     detail:"Invite sent to john@roar.com",              actor:"shipper"},
  {id:2, ts:"2026-03-18T09:03:00", carrier:"C.H. Robinson",   scac:"RBTW", event:"invite_sent",     detail:"Invite sent to rates@chr.com",               actor:"shipper"},
  {id:3, ts:"2026-03-18T09:04:00", carrier:"Echo Global",     scac:"ECHS", event:"invite_sent",     detail:"Invite sent to bids@echo.com",               actor:"shipper"},
  {id:4, ts:"2026-03-18T14:17:00", carrier:"ROAR Logistics",  scac:"ROAR", event:"invite_viewed",   detail:"Event page viewed — IP: 72.34.x.x",          actor:"carrier"},
  {id:5, ts:"2026-03-18T14:19:00", carrier:"ROAR Logistics",  scac:"ROAR", event:"file_downloaded", detail:"Lane File downloaded",                        actor:"carrier"},
  {id:6, ts:"2026-03-18T14:22:00", carrier:"ROAR Logistics",  scac:"ROAR", event:"file_downloaded", detail:"FSC Table downloaded",                        actor:"carrier"},
  {id:7, ts:"2026-03-18T14:25:00", carrier:"ROAR Logistics",  scac:"ROAR", event:"intent_yes",      detail:"Confirmed intent to participate",             actor:"carrier"},
  {id:8, ts:"2026-03-19T08:44:00", carrier:"C.H. Robinson",   scac:"RBTW", event:"invite_viewed",   detail:"Event page viewed — IP: 98.12.x.x",          actor:"carrier"},
  {id:9, ts:"2026-03-19T08:46:00", carrier:"C.H. Robinson",   scac:"RBTW", event:"file_downloaded", detail:"Lane File downloaded",                        actor:"carrier"},
  {id:10,ts:"2026-03-19T08:50:00", carrier:"C.H. Robinson",   scac:"RBTW", event:"intent_yes",      detail:"Confirmed intent to participate",             actor:"carrier"},
  {id:11,ts:"2026-03-20T11:30:00", carrier:"Echo Global",     scac:"ECHS", event:"invite_viewed",   detail:"Event page viewed — IP: 204.11.x.x",         actor:"carrier"},
  {id:12,ts:"2026-03-20T11:32:00", carrier:"Echo Global",     scac:"ECHS", event:"intent_maybe",    detail:"Marked intent as undecided",                 actor:"carrier"},
  {id:13,ts:"2026-03-21T15:10:00", carrier:"Circle Logistics",scac:"CLIM", event:"invite_sent",     detail:"Invite sent to ops@circle.com",              actor:"shipper"},
  {id:14,ts:"2026-03-22T09:00:00", carrier:"Circle Logistics",scac:"CLIM", event:"invite_viewed",   detail:"Event page viewed — IP: 67.90.x.x",          actor:"carrier"},
  {id:15,ts:"2026-03-22T09:05:00", carrier:"Circle Logistics",scac:"CLIM", event:"file_downloaded", detail:"Lane File downloaded",                        actor:"carrier"},
  {id:16,ts:"2026-03-22T09:06:00", carrier:"Circle Logistics",scac:"CLIM", event:"file_downloaded", detail:"Term Sheet downloaded",                      actor:"carrier"},
  {id:17,ts:"2026-03-22T09:10:00", carrier:"Circle Logistics",scac:"CLIM", event:"intent_yes",      detail:"Confirmed intent to participate",             actor:"carrier"},
  {id:18,ts:"2026-03-28T16:45:00", carrier:"ROAR Logistics",  scac:"ROAR", event:"rates_submitted", detail:"62 lane rates submitted",                    actor:"carrier"},
  {id:19,ts:"2026-03-30T10:12:00", carrier:"C.H. Robinson",   scac:"RBTW", event:"rates_submitted", detail:"71 lane rates submitted",                    actor:"carrier"},
  {id:20,ts:"2026-04-01T13:55:00", carrier:"ROAR Logistics",  scac:"ROAR", event:"rates_updated",   detail:"Rates revised on 4 lanes",                   actor:"carrier"},
  {id:21,ts:"2026-04-02T09:20:00", carrier:"Echo Global",     scac:"ECHS", event:"intent_yes",      detail:"Updated intent to participate",               actor:"carrier"},
  {id:22,ts:"2026-04-02T14:00:00", carrier:"Echo Global",     scac:"ECHS", event:"rates_submitted", detail:"55 lane rates submitted",                    actor:"carrier"},
];

// ─── PAGE: Carrier Event / Bid Landing Page ───────────────────────────────────
const BID_DOCS = [
  {name:"Lane File",          icon:"📊", desc:"Master template — enter your rates here", key:"lane_file",    ext:"XLSX"},
  {name:"FSC Table",          icon:"⛽", desc:"Current fuel surcharge schedule",          key:"fsc_table",    ext:"XLSX"},
  {name:"FSC Program",        icon:"📄", desc:"Fuel surcharge program details",           key:"fsc_program",  ext:"DOCX"},
  {name:"4-Month Term Sheet", icon:"📝", desc:"Must be signed and returned with bid",     key:"term_sheet",   ext:"PDF"},
  {name:"Accessorial Schedule",icon:"💰",desc:"All accessorial charges and rules",        key:"accessorial",  ext:"PDF"},
  {name:"Loading Locations",  icon:"📍", desc:"Warehouse contacts & addresses",           key:"loading",      ext:"XLSX"},
  {name:"Delivery Instructions",icon:"🚚",desc:"Customer delivery requirements",          key:"delivery",     ext:"XLSX"},
  {name:"Deductions Guide",   icon:"⚠️", desc:"Deduction policies by customer",           key:"deductions",   ext:"DOCX"},
  {name:"Processes & Procedures",icon:"📋",desc:"Spindrift logistics P&P — required reading",key:"procedures",ext:"PDF"},
];

function EventPage({ carrierName, addLog, activityLog, setPage }) {
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
    if (!downloadedDocs.includes(doc.key)) {
      setDownloadedDocs(d=>[...d,doc.key]);
      addLog({ carrier:carrierName, event:"file_downloaded", detail:`${doc.name} downloaded`, actor:"carrier" });
    }
  };

  const intentStatus = myLog.find(e=>["intent_yes","intent_no","intent_maybe"].includes(e.event));

  return (
    <div style={{maxWidth:800}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:24}}>
        <div style={{width:56,height:56,background:C.white,border:`1px solid ${C.grayli}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>🌊</div>
        <div>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.steel,marginBottom:4}}>Invitation to Bid</div>
          <div className="page-title">Spindrift Beverage TL RFP</div>
          <div style={{fontSize:15,fontWeight:500,color:C.gray,marginTop:2}}>2026 May – August (4 Month Contract)</div>
        </div>
        <div style={{marginLeft:"auto",textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:11,color:C.gray,fontWeight:600}}>RFP ID</div>
          <div className="mono" style={{fontSize:13,fontWeight:700,color:C.navy}}>RFP-2026-001</div>
          <div style={{marginTop:6,padding:"4px 10px",background:C.amberlt,color:C.amber,borderRadius:20,fontSize:10,fontWeight:700}}>⏰ DEADLINE: Apr 3, 2026</div>
        </div>
      </div>

      {/* Intent acknowledgment banner */}
      {!intentStatus ? (
        <div style={{background:C.navy,borderRadius:10,padding:"18px 22px",marginBottom:20,color:"white"}}>
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
          <button style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:C.steel,textDecoration:"underline"}} onClick={()=>{setIntentSaved(false);}}>Change</button>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16}}>
        <div>
          {/* Overview */}
          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>📋 RFP Overview</div>
            <div style={{fontSize:13,lineHeight:1.7,color:C.text}}>
              We are excited to kick off Spindrift's 2026 May–August Truckload RFP. Below you will find the master template with all anticipated Spindrift lanes and volumes for the 4-month term. This is where you will input your <strong>Linehaul-only rate</strong>, carrier name, and any notes you'd like to highlight for a specific lane.
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-title" style={{marginBottom:14}}>📅 RFP Timeline</div>
            <div className="timeline">
              {[
                ["done",  "Mar 23, 2026", "RFP sent to carrier partners"],
                ["active","Apr 3, 2026",  "RFP submissions & term sheet due ← TODAY"],
                ["pending","Apr 13, 2026","RFP awards sent to carrier partners"],
                ["pending","May 3, 2026", "Awards go live — rate commitment begins"],
                ["pending","Sep 5, 2026", "Rate commitment ends"],
              ].map(([s,d,l])=>(
                <div key={l} className="timeline-item">
                  <div className={`timeline-dot ${s}`}/>
                  <div className="timeline-label">{l}</div>
                  <div className="timeline-date">{d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>📐 Guidelines & Assumptions</div>
            <div style={{fontSize:12,lineHeight:1.8,color:C.text}}>
              {[
                "Assume 44,500 lbs per shipment",
                "Submit FLAT Linehaul ONLY pricing, excluding fuel — e.g. $400.00",
                "Signed term sheet must be returned with RFP submission",
                "This RFP is 1 round only — put your best foot forward",
                "Each carrier may bid on both inbound and outbound volumes",
                "Omit lanes you cannot service with high confidence",
                "If offering IMDL services, create a separate line item and note equipment as IMDL or IMDL-Reefer",
                "Creative volume-based rate structures are welcome (e.g. 5% reduction for volume threshold)",
                "Awarded rates must be honored for the full commitment term without exception",
                "98% load acceptance required · 94% OTD or better required",
              ].map((item,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:4}}>
                  <span style={{color:C.sky,flexShrink:0,marginTop:1}}>•</span>
                  <span dangerouslySetInnerHTML={{__html:item.replace(/FLAT|ONLY|IMDL|98%|94%/g,m=>`<strong>${m}</strong>`)}}/>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {/* Documents */}
          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>📁 Bid Documents</div>
            <div style={{fontSize:11,color:C.gray,marginBottom:12}}>Download all documents before submitting. The Lane File is where you enter your rates.</div>
            {BID_DOCS.map(doc=>(
              <div key={doc.key} onClick={()=>handleDownload(doc)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:7,border:`1px solid ${downloadedDocs.includes(doc.key)?C.green:C.grayli}`,background:downloadedDocs.includes(doc.key)?C.greenlt:C.white,cursor:"pointer",marginBottom:7,transition:"all 0.15s"}}>
                <span style={{fontSize:18,flexShrink:0}}>{doc.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{doc.name}</div>
                  <div style={{fontSize:10,color:C.gray}}>{doc.desc}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                  <span style={{fontSize:9,fontWeight:700,background:C.offwhite,border:`1px solid ${C.grayli}`,borderRadius:3,padding:"1px 5px",color:C.gray}}>{doc.ext}</span>
                  {downloadedDocs.includes(doc.key)
                    ? <span style={{fontSize:9,color:C.green,fontWeight:700}}>✓ Downloaded</span>
                    : <span style={{fontSize:9,color:C.steel}}>⬇ Download</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="card-sm" style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:C.gray,marginBottom:10}}>BID DETAILS</div>
            {[
              ["Lanes","97 total"],["Modes","Dry Van, Reefer, IMDL"],["Term","May 3 – Sep 5, 2026"],
              ["Rate Structure","Flat Linehaul ONLY"],["Rounds","1 round — final"],["Weight","44,500 lbs / load"],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.grayli}`,fontSize:12}}>
                <span style={{color:C.gray}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>

          {/* My activity on this bid */}
          <div className="card-sm">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:C.gray}}>MY ACTIVITY</div>
              <button style={{fontSize:11,color:C.steel,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}} onClick={()=>setPage("activity")}>Full log →</button>
            </div>
            {myLog.length===0
              ? <div style={{fontSize:12,color:C.gray,textAlign:"center",padding:"12px 0"}}>No activity yet</div>
              : myLog.slice(-5).reverse().map(e=>{
                  const meta = EVENT_TYPE_META[e.event]||{icon:"•",label:e.event,color:C.gray};
                  return (
                    <div key={e.id} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.grayli}`}}>
                      <span style={{fontSize:14,flexShrink:0}}>{meta.icon}</span>
                      <div>
                        <div style={{fontSize:11,fontWeight:600,color:meta.color}}>{meta.label}</div>
                        <div style={{fontSize:10,color:C.gray}}>{formatTs(e.ts)}</div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

      {/* Submit rates CTA */}
      {intentStatus?.event==="intent_yes" && (
        <div style={{background:`linear-gradient(135deg, ${C.slate}, ${C.steel})`,borderRadius:10,padding:"20px 24px",marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
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
  const carrierName = dbProfile?.company || dbProfile?.full_name || "ROAR Logistics";

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
        <div className="card" style={{textAlign:"center",padding:"52px 20px",border:`2px dashed ${C.grayli}`}}>
          <div style={{fontSize:36,marginBottom:12}}>📜</div>
          <div style={{fontWeight:600,fontSize:14,color:C.navy,marginBottom:6}}>No activity yet</div>
          <div style={{fontSize:12,color:C.gray,maxWidth:380,margin:"0 auto"}}>
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
                      <td className="mono">{s.viewed||<span style={{color:C.gray}}>—</span>}</td>
                      <td className="mono">{s.downloaded||<span style={{color:C.gray}}>—</span>}</td>
                      <td>{intentMeta
                        ? <span style={{fontSize:11,fontWeight:600,color:intentMeta.color}}>{intentMeta.icon} {intentMeta.label.replace("Intent: ","")}</span>
                        : <span style={{color:C.gray,fontSize:11}}>No response</span>}</td>
                      <td>{s.submitted
                        ? <span style={{color:C.green,fontWeight:600,fontSize:12}}>✓ Submitted</span>
                        : <span style={{color:C.gray,fontSize:12}}>—</span>}</td>
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
        <div style={{fontSize:12,color:C.gray,alignSelf:"center",marginLeft:"auto"}}>{displayLog.length} events</div>
      </div>

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        {displayLog.length===0
          ? <div style={{padding:32,textAlign:"center",color:C.gray,fontSize:13}}>No events match your filters</div>
          : displayLog.map((e,i)=>{
              const meta = EVENT_TYPE_META[e.event]||{icon:"•",label:e.event,color:C.gray};
              return (
                <div key={e.id||i} style={{display:"flex",gap:14,padding:"12px 18px",borderBottom:`1px solid ${C.grayli}`,alignItems:"flex-start"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:C.offwhite,border:`1px solid ${C.grayli}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{meta.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      {viewerRole!=="carrier" && <span style={{fontWeight:700,fontSize:13}}>{e.carrier}</span>}
                      <span style={{fontWeight:600,fontSize:12,color:meta.color}}>{meta.label}</span>
                      <span style={{fontSize:11,color:C.gray,marginLeft:"auto",fontFamily:"'DM Mono',monospace"}}>{formatTs(e.ts)}</span>
                    </div>
                    <div style={{fontSize:12,color:C.gray,marginTop:3}}>{e.detail}</div>
                    <div style={{fontSize:10,color:C.gray,marginTop:2,fontStyle:"italic"}}>logged by {e.actor}</div>
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
          <div style={{marginTop:8,display:"inline-block",background:"rgba(74,159,200,.15)",color:C.sky,fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"2px 8px",borderRadius:4}}>Admin Mode</div>
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
              style={{padding:"10px 12px",border:`2px solid ${data.term===t.val?C.sky:C.grayli}`,
                borderRadius:8,cursor:"pointer",textAlign:"center",
                background:data.term===t.val?C.ice:C.white,transition:"all .15s"}}>
              <div style={{fontWeight:700,fontSize:13,color:data.term===t.val?C.steel:C.text}}>{t.label}</div>
              <div style={{fontSize:10,color:C.gray,marginTop:2}}>{t.desc}</div>
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
      </div>
    </div>
  );
}

// ── Wiz Step 2 ────────────────────────────────────────────────────────────────
function WStep2({ data, set }) {
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
          <div className="wiz-alr info">Since carriers exclude fuel, upload your FSC schedule so total cost can be calculated automatically.</div>
          {data.fscUploaded
            ? <div className="upload-ok">✓ FSC Table uploaded — 52 DOE diesel breakpoints detected</div>
            : <div className="upload-z" onClick={()=>set("fscUploaded",true)}><div style={{fontSize:24,marginBottom:6}}>⛽</div><div style={{fontSize:13,color:C.gray}}><strong style={{color:C.steel}}>Click to upload</strong> your FSC table</div><div style={{fontSize:11,color:C.gray,marginTop:3}}>.xlsx or .csv · DOE diesel index format</div></div>}
          <div style={{marginTop:10}}>
            <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Show FSC table to carriers</div><div style={{fontSize:11,color:C.gray}}>Carriers can review the schedule before submitting</div></div><WTog checked={data.fscVisible} onChange={v=>set("fscVisible",v)}/></div>
            <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Auto-calculate all-in estimate in results</div><div style={{fontSize:11,color:C.gray}}>RFPlab computes total cost using current DOE diesel price</div></div><WTog checked={data.calcAllin} onChange={v=>set("calcAllin",v)}/></div>
          </div>
        </div>
      )}
      <div className="card">
        <div className="card-title">📐 Rate Rules</div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>One round only — best foot forward</div><div style={{fontSize:11,color:C.gray}}>No rebidding after submission</div></div><WTog checked={data.oneRound} onChange={v=>set("oneRound",v)}/></div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Allow volume-based creative pricing</div><div style={{fontSize:11,color:C.gray}}>Carriers can offer conditional rate reductions by volume threshold</div></div><WTog checked={data.allowCreative} onChange={v=>set("allowCreative",v)}/></div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Allow IMDL alternate lane bids</div><div style={{fontSize:11,color:C.gray}}>Carriers can submit separate IMDL alternatives for eligible lanes</div></div><WTog checked={data.allowImdl} onChange={v=>set("allowImdl",v)}/></div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Rates must be honored for full term</div><div style={{fontSize:11,color:C.gray}}>Deviations result in removal from spot market access</div></div><WTog checked={data.rateLock} onChange={v=>set("rateLock",v)}/></div>
        <div className="wiz-row2" style={{marginTop:12}}>
          <div className="wiz-fg"><label>Load Acceptance Required</label><select value={data.acceptancePct} onChange={e=>set("acceptancePct",e.target.value)}>{["90%","94%","95%","96%","97%","98%","99%","100%"].map(p=><option key={p}>{p}</option>)}</select></div>
          <div className="wiz-fg"><label>On-Time Delivery Required</label><select value={data.otdPct} onChange={e=>set("otdPct",e.target.value)}>{["88%","90%","92%","94%","95%","96%","97%","98%"].map(p=><option key={p}>{p}</option>)}</select></div>
        </div>
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
                <span style={{fontWeight:700,color:C.purple,fontSize:13,minWidth:80}}>{data.splitPct}% / {100-data.splitPct}%</span>
              </div>
            </div>
          )}
        </div>
        <div className="wiz-fg"><label>Asset vs. Broker Target Mix</label>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="range" min={0} max={100} step={10} value={data.assetPct} onChange={e=>set("assetPct",parseInt(e.target.value))} style={{flex:1,border:"none",padding:0}}/>
            <span style={{fontWeight:700,color:C.purple,fontSize:13,minWidth:100}}>{data.assetPct}% asset / {100-data.assetPct}% broker</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">📊 Carrier Feedback</div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Enable carrier bid feedback</div><div style={{fontSize:11,color:C.gray}}>Carriers see limited feedback — never other carriers' identities or rates</div></div><WTog checked={data.feedbackEnabled} onChange={v=>set("feedbackEnabled",v)}/></div>
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
function WStep4({ data, set }) {
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
          {data.laneFileUploaded
            ? <div className="upload-ok">✓ Lane file uploaded — 97 lanes detected · Dry Van, Reefer, IMDL</div>
            : <div className="upload-z" onClick={()=>set("laneFileUploaded",true)}><div style={{fontSize:24,marginBottom:6}}>📊</div><div style={{fontSize:13,color:C.gray}}><strong style={{color:C.steel}}>Click to upload</strong> lane file (.xlsx / .csv)</div></div>}
        </div>
      )}
      {data.laneMethod==="raw_data" && (
        <div className="card">
          <div className="card-title">🔬 Load-Level Data</div>
          <div className="wiz-alr info">Upload your TMS export. RFPlab will aggregate by O/D/Mode, calculate volumes, and map incumbents automatically.</div>
          {data.rawDataUploaded
            ? <div className="upload-ok">✓ 8,847 loads · 97 unique lanes identified · 23 incumbents mapped</div>
            : <div className="upload-z" onClick={()=>set("rawDataUploaded",true)}><div style={{fontSize:24,marginBottom:6}}>🔬</div><div style={{fontSize:13,color:C.gray}}><strong style={{color:C.steel}}>Click to upload</strong> shipment history (.xlsx / .csv)</div></div>}
        </div>
      )}
      <div className="card">
        <div className="card-title">📎 Supporting Documents</div>
        {[
          {key:"termSheetUploaded",label:"Term Sheet",req:true},
          {key:"fscUploaded",label:"FSC Table / Schedule",req:false},
          {key:"accessorialUploaded",label:"Accessorial Schedule",req:false},
          {key:"loadingUploaded",label:"Loading Locations / Warehouse Contacts",req:false},
          {key:"deliveryUploaded",label:"Delivery Instructions",req:false},
          {key:"deductionsUploaded",label:"Deductions Guide",req:false},
          {key:"proceduresUploaded",label:"Processes & Procedures",req:false},
        ].map(doc=>(
          <div key={doc.key} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",border:`1px solid ${data[doc.key]?C.green:C.grayli}`,background:data[doc.key]?C.greenlt:C.white,borderRadius:7,marginBottom:6,cursor:"pointer"}} onClick={()=>set(doc.key,true)}>
            <span style={{fontSize:16}}>{data[doc.key]?"✅":"📄"}</span>
            <span style={{flex:1,fontSize:12,fontWeight:500}}>{doc.label}{doc.req&&<span style={{color:C.red,marginLeft:4}}>*</span>}</span>
            <span style={{fontSize:10,color:data[doc.key]?C.green:C.steel,fontWeight:600}}>{data[doc.key]?"Uploaded":"Click to upload"}</span>
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
        <div style={{display:"grid",gridTemplateColumns:"1fr 60px 60px",gap:8,padding:"0 0 8px",borderBottom:`1px solid ${C.grayli}`,marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:700,color:C.gray}}>FIELD</div>
          <div style={{fontSize:10,fontWeight:700,color:C.gray,textAlign:"center"}}>VISIBLE</div>
          <div style={{fontSize:10,fontWeight:700,color:C.gray,textAlign:"center"}}>REQUIRED</div>
        </div>
        {fields.map(f=>(
          <div key={f.id} className="fld-row" style={{opacity:f.show?1:0.4}}>
            <span className="fld-name">{f.label}{f.custom&&<span className="badge badge-open" style={{marginLeft:6,fontSize:9,padding:"1px 5px"}}>custom</span>}</span>
            <div style={{display:"flex",gap:16,alignItems:"center",flexShrink:0}}>
              <div style={{width:60,textAlign:"center"}}><WTog checked={f.show} onChange={()=>tog(f.id,"show")}/></div>
              <div style={{width:60,textAlign:"center"}}><input type="checkbox" checked={f.req} onChange={()=>tog(f.id,"req")} disabled={!f.show} style={{width:16,height:16,accentColor:C.sky}}/></div>
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
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Allow carrier lane-level notes</div><div style={{fontSize:11,color:C.gray}}>Carriers can annotate individual lanes with conditions</div></div><WTog checked={data.allowCarrierNotes!==false} onChange={v=>set("allowCarrierNotes",v)}/></div>
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
        <div style={{display:"grid",gridTemplateColumns:"1fr 60px 60px",gap:8,padding:"0 0 8px",borderBottom:`1px solid ${C.grayli}`,marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:700,color:C.gray}}>FIELD</div>
          <div style={{fontSize:10,fontWeight:700,color:C.gray,textAlign:"center"}}>VISIBLE</div>
          <div style={{fontSize:10,fontWeight:700,color:C.gray,textAlign:"center"}}>REQUIRED</div>
        </div>
        {fields.map(f=>(
          <div key={f.id} className="fld-row" style={{opacity:f.show?1:0.4,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:0}}>
              <div className="fld-name">{f.label}{f.custom&&<span className="badge badge-open" style={{marginLeft:6,fontSize:9,padding:"1px 5px"}}>custom</span>}</div>
              {f.uploadable&&f.show&&<div style={{fontSize:10,color:C.steel,marginTop:2}}>📎 {f.uploadHint}</div>}
            </div>
            <div style={{display:"flex",gap:16,alignItems:"center",flexShrink:0}}>
              <div style={{width:60,textAlign:"center"}}><WTog checked={f.show} onChange={()=>tog(f.id,"show")}/></div>
              <div style={{width:60,textAlign:"center"}}><input type="checkbox" checked={f.req} onChange={()=>tog(f.id,"req")} disabled={!f.show} style={{width:16,height:16,accentColor:C.sky}}/></div>
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
const W_SUGGESTED = [
  {id:1,name:"ROAR Logistics",scac:"ROAR",contact:"John Smith",email:"john@roar.com",dot:"1234567",type:"broker"},
  {id:2,name:"C.H. Robinson",scac:"RBTW",contact:"Sarah Lane",email:"rates@chr.com",dot:"2345678",type:"broker"},
  {id:3,name:"Echo Global",scac:"ECHS",contact:"Mike Torres",email:"bids@echo.com",dot:"3456789",type:"broker"},
  {id:4,name:"Elberta Carriers",scac:"ELFI",contact:"Dana Reed",email:"rates@elberta.com",dot:"4567890",type:"asset"},
  {id:5,name:"JBHUNT",scac:"HJBB",contact:"Tom Wells",email:"rfp@jbhunt.com",dot:"5678901",type:"asset"},
];

function WStep7({ data, set }) {
  const carriers = data.carriers || [];
  const setC = c=>set("carriers",typeof c==="function"?c(carriers):c);
  const [form,setForm] = useState({name:"",scac:"",contact:"",email:"",dot:"",type:"broker"});
  const add=()=>{if(!form.name||!form.email)return;setC([...carriers,{...form,id:Date.now()}]);setForm({name:"",scac:"",contact:"",email:"",dot:"",type:"broker"});};
  const remove=(id)=>setC(carriers.filter(c=>c.id!==id));
  const addSug=(c)=>{if(!carriers.find(x=>x.email===c.email))setC([...carriers,c]);};
  return (
    <div>
      <div className="page-title">Carrier & Broker List</div>
      <div className="page-sub">Add invited parties. Only these contacts can access the bid via their secure link.</div>
      <div className="card">
        <div className="card-title">➕ Add Carriers</div>
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
      {carriers.length===0 && (
        <div className="card">
          <div className="card-title">⭐ Suggested from Previous Bids</div>
          {W_SUGGESTED.map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",border:`1px solid ${C.grayli}`,borderRadius:7,marginBottom:6}}>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:12}}>{c.name}</div><div style={{fontSize:11,color:C.gray}}>{c.scac} · {c.email} · <span className={`badge wiz-badge-${c.type}`}>{c.type}</span></div></div>
              <button className="btn btn-sm btn-primary" onClick={()=>addSug(c)}>+ Add</button>
            </div>
          ))}
        </div>
      )}
      {carriers.length>0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">📋 Invited Carriers ({carriers.length})</div><div style={{fontSize:11,color:C.gray}}>{carriers.filter(c=>c.type==="asset").length} asset · {carriers.filter(c=>c.type==="broker").length} broker</div></div>
          {carriers.map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",border:`1px solid ${C.grayli}`,borderRadius:7,marginBottom:6}}>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:12}}>{c.name} <span className={`badge wiz-badge-${c.type==="asset"?"asset":"broker"}`}>{c.type}</span></div><div style={{fontSize:11,color:C.gray}}>{c.scac&&`${c.scac} · `}{c.dot&&`DOT ${c.dot} · `}{c.email}</div></div>
              <button className="btn btn-ghost btn-sm" style={{color:C.red}} onClick={()=>remove(c.id)}>✕</button>
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
              <div><div className="tline-lbl">{item.label}</div><div style={{fontSize:10,color:C.gray}}>{item.sub}</div></div>
              <input type="date" value={data[item.key]||""} onChange={e=>set(item.key,e.target.value)}/>
              <input placeholder="Note..." style={{fontSize:11}} value={data[item.key+"Note"]||""} onChange={e=>set(item.key+"Note",e.target.value)}/>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-title">🔄 Second Round</div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Enable a second round</div><div style={{fontSize:11,color:C.gray}}>Invite select carriers to re-bid on specific lanes. Max 2 rounds total.</div></div><WTog checked={data.twoRounds||false} onChange={v=>set("twoRounds",v)}/></div>
        {data.twoRounds && (
          <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.grayli}`}}>
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
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{r.label}</div><div style={{fontSize:11,color:C.gray,marginTop:1}}>{r.sub}</div></div>
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
              <span className="sum-val" style={{color:s.val?.includes("⚠")?C.amber:C.text}}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-title">🧪 Send Test Invite</div>
        <div style={{fontSize:12,color:C.gray,marginBottom:12,lineHeight:1.6}}>Send yourself a test copy of the carrier invite before going live. Clearly marked [TEST] — goes only to you.</div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <input style={{maxWidth:260}} type="email" value={testEmail} onChange={e=>setTestEmail(e.target.value)} placeholder="your@email.com"/>
          <button className="btn btn-outline" onClick={()=>{setTestSending(true);setTimeout(()=>{setTestSending(false);setTestSent(true);},1400);}} disabled={testSending||testSent} style={{minWidth:140}}>
            {testSending?"⏳ Sending…":testSent?"✓ Test Sent!":"📤 Send Test Email"}
          </button>
          <button className="btn btn-outline" onClick={()=>setShowPreview(p=>!p)}>{showPreview?"▲ Hide Preview":"👁 Preview Invite"}</button>
        </div>
        {testSent && <div className="wiz-alr ok" style={{marginTop:10}}>✓ Test invite sent to <strong>{testEmail}</strong>.</div>}
      </div>
      {showPreview && (
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{background:C.off,borderBottom:`1px solid ${C.grayli}`,padding:"10px 18px"}}>
            <div style={{fontSize:10,fontWeight:700,color:C.gray,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>Email Preview</div>
            <div style={{display:"grid",gridTemplateColumns:"60px 1fr",gap:"3px 10px",fontSize:12}}>
              <span style={{color:C.gray}}>From:</span><span style={{fontWeight:600}}>RFPlab &lt;noreply@rfplab.com&gt;</span>
              <span style={{color:C.gray}}>To:</span><span style={{color:C.steel}}>[Carrier Contact Email]</span>
              <span style={{color:C.gray}}>Subject:</span><span style={{fontWeight:600}}>{emailSub}</span>
            </div>
          </div>
          <div style={{padding:"24px 28px",background:"white",maxWidth:580,margin:"0 auto"}}>
            <div style={{marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.grayli}`}}><RFPLabLogo dark={false} size="sm"/></div>
            <div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:4}}>{rfpName}</div>
            <div style={{fontSize:12,color:C.gray,marginBottom:16}}>{shipper} · {allData.basics.modes?.join(", ")||"Truckload"} · Rates due: {deadline}</div>
            <div style={{fontSize:13,color:C.text,lineHeight:1.75,marginBottom:20}}>{emailBody}</div>
            <div style={{textAlign:"center",margin:"20px 0"}}>
              <div style={{display:"inline-block",background:C.navy,color:"white",padding:"11px 28px",borderRadius:8,fontWeight:700,fontSize:14}}>View Bid &amp; Submit Rates →</div>
              <div style={{fontSize:10,color:C.gray,marginTop:6}}>Unique secure link — expires {deadline}. Do not forward.</div>
            </div>
            <div style={{background:C.off,border:`1px solid ${C.grayli}`,borderRadius:8,padding:"12px 16px",marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:700,color:C.gray,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>Key Dates</div>
              {[["Rates Due",allData.timeline.rateDeadline||"—"],["Awards Sent",allData.timeline.awardDate||"—"],["Go Live",allData.timeline.goLiveDate||"—"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:`1px solid ${C.grayli}`}}><span style={{color:C.gray}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.gray,borderTop:`1px solid ${C.grayli}`,paddingTop:14,lineHeight:1.7}}>
              You received this because {shipper} invited you via RFPlab. Questions? Reply to this email.<br/>
              © 2026 RFPlab · rfplab.com
            </div>
          </div>
        </div>
      )}
      <div className="card">
        <div className="card-title">🚀 Launch Options</div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Send invites immediately on launch</div><div style={{fontSize:11,color:C.gray}}>Carriers receive the invite email the moment you click Launch</div></div><WTog checked={allData.basics.sendNow!==false} onChange={v=>allData.basics.setSelf("sendNow",v)}/></div>
        <div className="tog-row"><div><div style={{fontWeight:600,fontSize:13}}>Schedule for a future date</div><div style={{fontSize:11,color:C.gray}}>Hold in draft until a specific date and time</div></div><WTog checked={allData.basics.scheduled||false} onChange={v=>allData.basics.setSelf("scheduled",v)}/></div>
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
function RFPWizard({ onClose, onLaunched, builderRole = "shipper", initialShipper = "", draftData = null }) {
  const [step, setStep] = useState(draftData?.step || 1);
  const [completed, setCompleted] = useState(new Set(draftData?.completed || []));
  const [launched, setLaunched] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState(draftData?.savedAt || null);

  const [basics,  setBasicsRaw]  = useState(draftData?.basics  || {name:"",shipper:initialShipper||"",modes:[],geos:["US Domestic"],term:"",startDate:"",endDate:"",maxWeight:"44,500",loadType:"Full Truckload (FTL)",geo:"US Domestic",tempReqs:[],sendNow:true,scheduled:false});
  const [rates,   setRatesRaw]   = useState(draftData?.rates   || {rateFormat:"flat_linehaul",fscUploaded:false,fscVisible:true,calcAllin:true,oneRound:true,allowCreative:true,allowImdl:true,rateLock:true,acceptancePct:"98%",otdPct:"94%"});
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

  const goTo=(n)=>{setCompleted(prev=>{const s=new Set(prev);s.add(step);return s;});setStep(n);};
  const next=()=>{if(step<10)goTo(step+1);};
  const prev=()=>{if(step>1)setStep(step-1);};
  const pct=Math.round(((step-1)/10)*100);

  const handleLaunch=()=>{setLaunched(true);onLaunched&&onLaunched(allData);};

  const handleSaveDraft = () => {
    const draft = {
      id: draftData?.id || `draft-${Date.now()}`,
      name: basics.name || "Untitled RFP",
      step, pct,
      completed: [...completed],
      savedAt: new Date().toISOString(),
      basics, rates, award, lanes, laneReq, cData, timeline, notifD,
    };
    // Save to localStorage for now (will sync to Supabase when we wire drafts)
    const existing = JSON.parse(localStorage.getItem('rfplab_drafts') || '[]');
    const updated = [...existing.filter(d=>d.id!==draft.id), draft];
    localStorage.setItem('rfplab_drafts', JSON.stringify(updated));
    setLastSaved(draft.savedAt);
    setDraftSaved(true);
    setTimeout(()=>setDraftSaved(false), 2500);
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
      <div style={{fontSize:22,fontWeight:700,color:C.navy,marginBottom:8}}>RFP Launched!</div>
      <div style={{fontSize:14,color:C.gray,marginBottom:24,lineHeight:1.6}}>
        <strong>{basics.name||"Your RFP"}</strong> is live. Invitations being sent to <strong>{cData.carriers?.length||0} carriers and brokers</strong>.
      </div>
      <button className="btn btn-primary" onClick={onClose}>← Back to Dashboard</button>
    </div>
  );

  const stepLabel = WIZ_STEP_GROUPS.flatMap(g=>g.steps).find(s=>s.id===step)?.label;

  return (
    <div style={{display:"flex",gap:0,minHeight:"calc(100vh - 50px)"}}>
      {/* Left wizard nav — compact, fits inside content area */}
      <div style={{width:200,minWidth:200,background:C.navy,borderRadius:"10px 0 0 10px",padding:"16px 0",flexShrink:0}}>
        <div style={{padding:"0 14px 14px",borderBottom:"1px solid rgba(255,255,255,.08)",marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:700,color:C.sky,letterSpacing:1.5,textTransform:"uppercase"}}>RFP Builder</div>
          {basics.name && <div style={{fontSize:12,fontWeight:600,color:"white",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{basics.name}</div>}
          {builderRole==="admin" && <div style={{fontSize:9,fontWeight:700,color:C.sky,background:"rgba(74,159,200,.15)",padding:"2px 6px",borderRadius:4,marginTop:4,display:"inline-block"}}>ADMIN MODE</div>}
        </div>
        {/* Progress bar */}
        <div style={{padding:"0 14px 12px",borderBottom:"1px solid rgba(255,255,255,.08)",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>Progress</span>
            <span style={{fontSize:10,fontWeight:700,color:C.sky}}>{pct}%</span>
          </div>
          <div style={{height:4,background:"rgba(255,255,255,.1)",borderRadius:2}}>
            <div style={{height:4,background:C.sky,borderRadius:2,width:`${pct}%`,transition:"width .3s"}}/>
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
                    borderLeft:`2px solid ${isAct?C.sky:"transparent"}`}}>
                  <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,
                    background:isDone?C.green:isAct?C.sky:"rgba(255,255,255,.1)",color:"white"}}>
                    {isDone?"✓":s.id}
                  </div>
                  <span style={{fontSize:11,fontWeight:isAct?600:400,color:isAct?C.sky:isDone?"rgba(255,255,255,.7)":"rgba(255,255,255,.4)"}}>{s.label}</span>
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
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",borderBottom:`1px solid ${C.grayli}`,background:C.white,borderRadius:"0 10px 0 0"}}>
          <div style={{fontSize:12,color:C.gray}}>Step {step} of 10 — <strong style={{color:C.text}}>{stepLabel}</strong></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {draftSaved && <span style={{fontSize:11,color:C.green,fontWeight:600}}>✓ Draft saved</span>}
            <button className="btn btn-outline btn-sm" onClick={handleSaveDraft}>💾 Save Draft</button>
          </div>
        </div>

        {/* Step body */}
        <div style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>
          {renderStep()}

          {step<10 && (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:20,borderTop:`1px solid ${C.grayli}`,marginTop:8}}>
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

const SPOT_LOADS_SEED = [
  { id:"SL-0441", status:"live",
    origin:{city:"Irwindale",state:"CA",zip:"91010",facility:"Spindrift West DC",addr:"2400 Barranca Pkwy"},
    dest:{city:"Aurora",state:"CO",zip:"80011",facility:"Walmart DC #6084",addr:"16000 E Smith Rd"},
    pickup:"2026-07-03", puWindow:"07:00–10:00", delivery:"2026-07-05", dlWindow:"06:00–14:00",
    mode:"Dry Van", weight:"42,800 lbs", miles:1003, commodity:"Beverage — Non-Haz",
    temp:null, lumper:true, appt:true,
    notes:"Walmart-approved drivers only. Lumper provided at destination. No early arrivals.",
    windowEnds:_NOW + 2*_hr + 17*_min,
    quotes:[
      {id:1,carrier:"ROAR Logistics",scac:"ROAR",type:"broker",amount:2450,ts:_NOW-45*_min},
      {id:2,carrier:"C.H. Robinson",scac:"RBTW",type:"broker",amount:2550,ts:_NOW-38*_min},
      {id:3,carrier:"Elberta Carriers",scac:"ELFI",type:"asset",amount:2490,ts:_NOW-31*_min},
      {id:4,carrier:"Circle Logistics",scac:"CLIM",type:"broker",amount:2620,ts:_NOW-22*_min},
      {id:5,carrier:"JBHUNT",scac:"HJBB",type:"asset",amount:2700,ts:_NOW-8*_min},
    ], awarded:false, awardedTo:null, awardedRate:null },
  { id:"SL-0440", status:"live",
    origin:{city:"Beaumont",state:"CA",zip:"92223",facility:"Spindrift Beaumont",addr:"1900 Beaumont Ave"},
    dest:{city:"Clackamas",state:"OR",zip:"97015",facility:"Target FDC Portland",addr:"9355 SE Clackamas Rd"},
    pickup:"2026-07-02", puWindow:"10:00–13:00", delivery:"2026-07-03", dlWindow:"07:00–16:00",
    mode:"Reefer", weight:"44,200 lbs", miles:1089, commodity:"Beverage — Refrigerated",
    temp:"34–38°F", lumper:false, appt:true,
    notes:"Reefer pre-cool required. Continuous 34–38°F. BOL must be driver-signed.",
    windowEnds:_NOW + 28*_min,
    quotes:[
      {id:1,carrier:"Market Express",scac:"MKXD",type:"asset",amount:3100,ts:_NOW-90*_min},
      {id:2,carrier:"ROAR Logistics",scac:"ROAR",type:"broker",amount:3250,ts:_NOW-60*_min},
      {id:3,carrier:"Total Quality Logistics",scac:"TQYL",type:"broker",amount:3400,ts:_NOW-45*_min},
    ], awarded:false, awardedTo:null, awardedRate:null },
  { id:"SL-0439", status:"awarded",
    origin:{city:"Mooresville",state:"NC",zip:"28117",facility:"Spindrift East DC",addr:"111 Mooresville Industrial"},
    dest:{city:"Lakeland",state:"FL",zip:"33801",facility:"Publix #3301",addr:"3300 Publix Corp Pkwy"},
    pickup:"2026-06-30", puWindow:"08:00–12:00", delivery:"2026-07-01", dlWindow:"06:00–10:00",
    mode:"Dry Van", weight:"41,500 lbs", miles:838, commodity:"Beverage — Non-Haz",
    temp:null, lumper:false, appt:true, notes:"Delivery appointment required — no exceptions.",
    windowEnds:_NOW - 4*_hr,
    quotes:[
      {id:1,carrier:"C.H. Robinson",scac:"RBTW",type:"broker",amount:1890,ts:_NOW-6*_hr},
      {id:2,carrier:"Echo Global",scac:"ECHS",type:"broker",amount:1940,ts:_NOW-5.5*_hr},
      {id:3,carrier:"NFI Logistics",scac:"NFBR",type:"asset",amount:2010,ts:_NOW-5*_hr},
    ], awarded:true, awardedTo:"C.H. Robinson", awardedRate:1890 },
  { id:"SL-0438", status:"closed",
    origin:{city:"Redlands",state:"CA",zip:"92373",facility:"Spindrift Redlands",addr:"600 Alabama St"},
    dest:{city:"Phoenix",state:"AZ",zip:"85034",facility:"Walmart DC #7090",addr:"4545 E McDowell Rd"},
    pickup:"2026-06-29", puWindow:"09:00–12:00", delivery:"2026-06-30", dlWindow:"06:00–14:00",
    mode:"Dry Van", weight:"38,200 lbs", miles:368, commodity:"Beverage — Non-Haz",
    temp:null, lumper:false, appt:false, notes:"Closed — no quotes received.",
    windowEnds:_NOW - 26*_hr,
    quotes:[], awarded:false, awardedTo:null, awardedRate:null },
];

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
  if (diff<600000) return <span className="badge" style={{background:C.redlt,color:C.red}}>⏱ Closing</span>;
  return <span className="badge" style={{background:C.greenlt,color:C.green,display:"inline-flex",alignItems:"center",gap:4}}><span className="live-dot"/> Live</span>;
}

function SpotQuoteBar({ q, idx, isAwarded, isMe, blind=false }) {
  const rc = idx===0?"rc1":idx===1?"rc2":idx===2?"rc3":"rcn";
  return (
    <div className={`quote-bar${isAwarded&&idx===0?" winning":isMe?" myquote":""}`}>
      <span className={`rank-circ ${rc}`}>#{idx+1}</span>
      {blind
        ? <div style={{flex:1,fontWeight:600,fontSize:12,color:C.gray,fontStyle:"italic"}}>{isMe?"You — ROAR Logistics":"(Confidential)"}</div>
        : <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:600,fontSize:12}}>{q.carrier}</div>
            <span className={`badge ${q.type==="asset"?"badge-asset":"badge-broker"}`} style={{fontSize:9,padding:"1px 6px"}}>{q.type}</span>
          </div>}
      <div style={{textAlign:"right"}}>
        <div className="mono" style={{fontSize:13,fontWeight:700,color:idx===0?C.green:C.text}}>${q.amount.toLocaleString()}</div>
        <div style={{fontSize:10,color:C.gray}}>{new Date(q.ts).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</div>
      </div>
      {isAwarded&&idx===0&&<span className="badge awarded" style={{marginLeft:6}}>Won</span>}
    </div>
  );
}

function SpotLoadModal({ load, role, onClose, onAward, onQuote }) {
  const [tab, setTab] = useState("details");
  const [myQuote, setMyQuote] = useState("");
  const [quoteSubmitted, setQuoteSubmitted] = useState(load.quotes.some(q=>q.carrier==="ROAR Logistics"));
  const [submitting, setSubmitting] = useState(false);
  const [awardPick, setAwardPick] = useState(null);
  const isOpen = load.windowEnds > Date.now() && !load.awarded && load.status!=="closed";
  const sorted = [...load.quotes].sort((a,b)=>a.amount-b.amount);
  const low = sorted.length ? sorted[0].amount : null;
  const myQ = load.quotes.find(q=>q.carrier==="ROAR Logistics");

  const handleSubmit = () => {
    if (!myQuote||isNaN(parseFloat(myQuote))) return;
    setSubmitting(true);
    setTimeout(()=>{
      onQuote(load.id,{id:Date.now(),carrier:"ROAR Logistics",scac:"ROAR",type:"broker",amount:parseFloat(myQuote),ts:Date.now()});
      setQuoteSubmitted(true); setSubmitting(false); setTab("quotes");
    },800);
  };

  return (
    <div className="spot-modal-bg" onClick={onClose}>
      <div className="spot-modal" onClick={e=>e.stopPropagation()}>
        <div className="spot-modal-hdr">
          <div>
            <div style={{fontWeight:700,fontSize:14,color:C.navy}}>{load.origin.city}, {load.origin.state} → {load.dest.city}, {load.dest.state}</div>
            <div style={{display:"flex",gap:6,alignItems:"center",marginTop:5,flexWrap:"wrap"}}>
              <span className="mono" style={{fontSize:10,color:C.gray}}>{load.id}</span>
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
                    <div style={{fontSize:10,fontWeight:700,color:C.gray,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>{x.lbl}</div>
                    <div style={{fontWeight:700,fontSize:13,color:C.navy}}>{x.loc.city}, {x.loc.state} {x.loc.zip}</div>
                    <div style={{fontSize:11,color:C.gray}}>{x.loc.facility}</div>
                    <div style={{fontSize:11,color:C.gray,marginBottom:6}}>{x.loc.addr}</div>
                    <div style={{padding:"5px 8px",background:C.offwhite,borderRadius:5,fontSize:11}}><strong>{x.date}</strong> · {x.win}</div>
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
                {low&&<div style={{fontSize:12,color:C.gray}}>Low: <strong className="mono" style={{color:C.green}}>${low.toLocaleString()}</strong></div>}
              </div>
              {sorted.length===0&&<div style={{textAlign:"center",padding:"28px 0",color:C.gray,fontSize:12}}>No quotes yet.</div>}
              {sorted.map((q,i)=><SpotQuoteBar key={q.id} q={q} idx={i} isAwarded={!!load.awarded} isMe={q.carrier==="ROAR Logistics"} blind={role==="carrier"&&q.carrier!=="ROAR Logistics"}/>)}
            </div>
          )}
          {tab==="submit"&&role==="carrier"&&(
            <div>
              {!isOpen&&<div className="alert warn">This quote window is closed.</div>}
              {isOpen&&<>
                <div className="alert info">Submit your all-in rate. Quotes are binding if accepted. You will not see other carriers' rates or identities.</div>
                {myQ&&<div className="alert" style={{background:C.greenlt,color:C.green,borderLeft:`3px solid ${C.green}`,marginBottom:10}}>Current quote: <strong className="mono">${myQ.amount.toLocaleString()}</strong> · Update before window closes.</div>}
                <div className="bid-zone">
                  <span style={{fontSize:12,color:C.gray,fontWeight:600}}>All-in rate ($)</span>
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
                        <div key={q.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",border:`1px solid ${awardPick===q.id?C.green:C.grayli}`,borderRadius:8,marginBottom:6,background:awardPick===q.id?C.greenlt:C.white,cursor:"pointer"}} onClick={()=>setAwardPick(q.id)}>
                          <input type="radio" readOnly checked={awardPick===q.id} style={{accentColor:C.green}}/>
                          <span className={`rank-circ ${i===0?"rc1":i===1?"rc2":"rc3"}`}>#{i+1}</span>
                          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{q.carrier}</div><span className={`badge ${q.type==="asset"?"badge-asset":"badge-broker"}`} style={{fontSize:9}}>{q.type}</span></div>
                          <div className="mono" style={{fontSize:14,fontWeight:700,color:i===0?C.green:C.text}}>${q.amount.toLocaleString()}</div>
                        </div>
                      ))}
                      {awardPick&&(
                        <div style={{marginTop:10,padding:"12px 14px",background:C.greenlt,border:`1px solid ${C.green}`,borderRadius:8}}>
                          <div style={{fontWeight:600,fontSize:13,color:C.green,marginBottom:8}}>Award to <strong>{sorted.find(q=>q.id===awardPick)?.carrier}</strong> at <strong className="mono">${sorted.find(q=>q.id===awardPick)?.amount.toLocaleString()}</strong>?</div>
                          <div style={{display:"flex",gap:8}}>
                            <button className="btn btn-green btn-sm" onClick={()=>{onAward(load.id,awardPick);onClose();}}>✓ Confirm Award</button>
                            <button className="btn btn-outline btn-sm" onClick={()=>setAwardPick(null)}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </>}
            </div>
          )}
        </div>
      </div>
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
          <div><div style={{fontWeight:700,fontSize:14}}>Post Spot Load</div><div style={{fontSize:11,color:C.gray,marginTop:2}}>Step {step} of 3</div></div>
          <button className="btn btn-ghost" onClick={onClose} style={{fontSize:18}}>✕</button>
        </div>
        <div className="step-prog"><div className="step-prog-fill" style={{width:`${(step/3)*100}%`}}/></div>
        <div className="spot-modal-body">
          {step===1&&<div>
            <div style={{fontWeight:600,fontSize:13,marginBottom:12}}>📍 Route & Schedule</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {[{lbl:"Origin",pre:"orig",dk:"pickup",wk:"puWindow"},{lbl:"Destination",pre:"dest",dk:"delivery",wk:"dlWindow"}].map(loc=>(
                <div key={loc.pre}>
                  <div style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>{loc.lbl}</div>
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
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",border:`1px solid ${C.grayli}`,borderRadius:8,marginBottom:10}}>
              <div><div style={{fontWeight:600,fontSize:13}}>Invite all active carrier partners</div><div style={{fontSize:11,color:C.gray}}>13 carriers in your approved network</div></div>
              <label className="toggle"><input type="checkbox" checked={f.inviteAll} onChange={e=>s("inviteAll",e.target.checked)}/><span className="tog-sl"/></label>
            </div>
            {!posted&&<div style={{marginTop:12,padding:"14px",background:C.navy,borderRadius:10,color:"white"}}>
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
  const myQ = load.quotes.find(q=>q.carrier==="ROAR Logistics");
  return (
    <div className={`load-card-spot${load.awarded?" awarded":load.status==="closed"?" closed-s":""}`} onClick={onClick}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
        <div className="route-pill">
          <span className="rdot-o"/>{load.origin.city}, {load.origin.state}<span className="rdash"/><span className="rdot-d"/>{load.dest.city}, {load.dest.state}
          <span style={{fontSize:11,color:C.gray,fontWeight:400,marginLeft:4}}>({load.miles.toLocaleString()} mi)</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
          {spotStatusBadge(load)}
          {load.windowEnds>Date.now()&&!load.awarded&&load.status!=="closed"&&<SpotCountdown endsAt={load.windowEnds} compact/>}
        </div>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <span className="mono" style={{fontSize:10,color:C.gray}}>{load.id}</span>
        <span className="badge badge-open">{load.mode}</span>
        {load.temp&&<span className="badge badge-open">{load.temp}</span>}
        <span style={{fontSize:11,color:C.gray}}>{load.pickup} · {load.puWindow}</span>
        <span style={{marginLeft:"auto",fontSize:11,fontWeight:600}}>
          {load.quotes.length} quote{load.quotes.length!==1?"s":""}
          {low&&<span style={{color:C.green}}> · Low: ${low.toLocaleString()}</span>}
          {role==="carrier"&&myQ&&<span style={{color:C.sky}}> · Your quote: ${myQ.amount.toLocaleString()}</span>}
          {role==="carrier"&&!myQ&&load.windowEnds>Date.now()&&!load.awarded&&<span style={{color:"#C2410C"}}> · No quote →</span>}
        </span>
      </div>
      {load.awarded&&<div style={{marginTop:6,fontSize:11,color:C.green,fontWeight:600}}>✓ Awarded to {load.awardedTo} at ${load.awardedRate?.toLocaleString()}</div>}
    </div>
  );
}

function SpotBoard({ role }) {
  const [loads, setLoads] = useState(SPOT_LOADS_SEED);
  const [selected, setSelected] = useState(null);
  const [showPost, setShowPost] = useState(false);
  const [filter, setFilter] = useState("all");

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
  const myQuotes=loads.reduce((s,l)=>s+l.quotes.filter(q=>q.carrier==="ROAR Logistics").length,0);

  const filtered=loads.filter(l=>{
    if(filter==="live")return l.windowEnds>Date.now()&&!l.awarded&&l.status!=="closed";
    if(filter==="awarded")return l.awarded;
    if(filter==="closed")return(l.windowEnds<=Date.now()&&!l.awarded)||l.status==="closed";
    return true;
  });

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
      {filtered.length===0&&<div className="card" style={{textAlign:"center",padding:"36px",color:C.gray,fontSize:12}}>No loads in this category.</div>}
      {selected&&<SpotLoadModal load={selected} role={role} onClose={()=>setSelected(null)} onAward={handleAward} onQuote={handleQuote}/>}
      {showPost&&<SpotPostModal onClose={()=>setShowPost(false)} onPost={handlePost}/>}
    </div>
  );
}

// ─── END SPOT LOAD SECTION ────────────────────────────────────────────────────
// Black block with spaced R F P + vertical LAB alongside
function RFPLabLogo({ dark = false, size = "md" }) {
  const scales = { sm: 0.52, md: 0.72, lg: 1 };
  const sc = scales[size] || 0.72;
  const blockW = 148, blockH = 74, labW = 22;
  const totalW = blockW + 6 + labW;
  const totalH = blockH;
  // Site logo: always cream text on black/dark block
  const blockFill = dark ? "#2A2A2A" : "#111111";
  const textFill  = "#F5F0E8"; // cream — always
  const labFill   = dark ? "#F5F0E8" : "#111111";

  return (
    <svg width={totalW * sc} height={totalH * sc} viewBox={`0 0 ${totalW} ${totalH}`}
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RFPlab logo"
      style={{ display: "block", flexShrink: 0 }}>
      <rect x={0} y={0} width={blockW} height={blockH} fill={blockFill} rx={0}/>
      <text x={blockW/2} y={blockH*0.735} textAnchor="middle"
        fontFamily="'Arial Black','Arial',sans-serif" fontWeight="900"
        fontSize="44" letterSpacing="10" fill={textFill}>R F P</text>
      <text x={blockW+6+labW/2} y={totalH*0.5} textAnchor="middle"
        dominantBaseline="central" fontFamily="'Arial Black','Arial',sans-serif"
        fontWeight="900" fontSize="18" letterSpacing="3" fill={labFill}
        transform={`rotate(90,${blockW+6+labW/2},${totalH*0.5})`}>LAB</text>
    </svg>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ role, page, setPage }) {
  const adminNav = [
    {section:"Platform"},
    {icon:"⬜",label:"Dashboard",key:"dashboard"},
    {icon:"👥",label:"Users",key:"users"},
    {icon:"📋",label:"All RFPs",key:"rfps"},
    {icon:"🚀",label:"New RFP",key:"new_rfp"},
    {icon:"📜",label:"Activity Log",key:"activity"},
    {section:"Spot Loads"},
    {icon:"⚡",label:"Spot Board",key:"spot"},
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
    {icon:"➕",label:"Post Load",key:"spot"},
  ];
  const carrierNav = [
    {section:"Contracted RFP"},
    {icon:"📋",label:"Bid Details",key:"event"},
    {icon:"💲",label:"Submit Rates",key:"bid"},
    {icon:"📈",label:"My Standing",key:"standing"},
    {icon:"📜",label:"My Activity",key:"activity"},
    {section:"Spot Loads"},
    {icon:"⚡",label:"Spot Board",key:"spot"},
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
          {role==="admin"?"RFPlab Admin":role==="shipper"?"Spindrift Beverages":"ROAR Logistics"}
        </div>
        <div style={{fontSize:11,marginTop:2}}>{role==="admin"?"admin@rfplab.com":role==="shipper"?"procurement@spindrift.com":"rates@roar.com"}</div>
      </div>
    </div>
  );
}


function RoleSwitcher({ role, setRole, setPage }) {
  return (
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      <span style={{fontSize:11,color:C.gray,marginRight:4}}>View as:</span>
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
            <div style={{fontSize:10,color:C.purple,fontWeight:600}}>SCENARIO SPEND</div>
            <div style={{fontSize:18,fontWeight:700,color:C.purple}}>${(scenarioSpend/1000).toFixed(0)}K</div>
            <div style={{fontSize:10,color:C.purple}}>vs ${(totalManualSpend/1000).toFixed(0)}K manual</div>
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
                      <td className="mono" style={{fontSize:11,color:C.gray}}>{l.id}</td>
                      <td><span className={`badge ${l.type.toLowerCase()}`}>{l.type}</span></td>
                      <td style={{fontSize:12}}>{l.origCity},{l.origSt}→{l.destCity},{l.destSt}</td>
                      <td style={{fontSize:11}}>{l.mode}</td>
                      <td className="mono">{Math.round(l.vol)}</td>
                      <td>
                        {l.incumbent
                          ? <div>
                              <span className="incumbent-tag">INCMBT</span>
                              <div style={{fontSize:11,fontWeight:600,marginTop:2}}>{l.incumbent}</div>
                              <div className="mono" style={{fontSize:10,color:C.gray}}>${l.incumbentRate?.toLocaleString()}</div>
                            </div>
                          : <span style={{color:C.gray,fontSize:11}}>New lane</span>}
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
                      <td className="mono" style={{color:C.gray}}>{b1 ? `$${b1.rate.toLocaleString()}` : "—"}</td>
                      <td>
                        <div style={{fontSize:12}}>{b2?.carrier}</div>
                        {b2 && <span className={`badge ${b2.type}`}>{b2.type}</span>}
                      </td>
                      <td className="mono" style={{color:C.gray}}>{b2 ? `$${b2.rate.toLocaleString()}` : "—"}</td>
                      <td className="mono" style={{color:C.amber,fontWeight:600}}>{spread}</td>
                      <td>
                        {scenario ? (
                          <div>
                            <div style={{fontWeight:700,fontSize:12,color:C.purple}}>{l.scenarioAward}</div>
                            {l.scenarioSecondary && <div style={{fontSize:10,color:C.gray}}>{l.primaryVol} loads + {l.scenarioSecondary} ({l.secondaryVol})</div>}
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
            <div style={{padding:"12px 16px",borderTop:`1px solid ${C.grayli}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:12,color:C.gray}}>
                Est. total award spend: <strong style={{color:C.navy}}>${(totalManualSpend/1000).toFixed(0)}K</strong>
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
                      <span className="mono" style={{fontSize:11,color:C.gray}}>{c.scac}</span>
                      <span className={`badge ${c.type}`}>{c.type}</span>
                    </div>
                  </div>
                  <span className="badge awarded">{won} awarded</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(100,(won/LANES.length)*100*3)}%`}}/></div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:C.gray}}>
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
              <th>Lane</th><th>Type</th><th>Origin</th><th>Destination</th><th>Mode</th><th>Vol/Mo</th><th>Miles</th>
              <th style={{width:120}}>My Rate ($)</th>
              {bidSettings.feedbackEnabled && <th>Feedback</th>}
            </tr></thead>
            <tbody>
              {myLanes.map(l=>{
                const fb = rates[l.id] ? carrierFeedback({...l,bids:l.bids.map(b=>b.carrier===carrierName?{...b,rate:parseFloat(rates[l.id])||b.rate}:b)}, carrierName, bidSettings) : null;
                return (
                  <tr key={l.id}>
                    <td className="mono" style={{fontSize:11,color:C.gray}}>{l.id}</td>
                    <td><span className={`badge ${l.type.toLowerCase()}`}>{l.type}</span></td>
                    <td>{l.origCity}, {l.origSt}</td>
                    <td>{l.destCity}, {l.destSt}</td>
                    <td style={{fontSize:11}}>{l.mode}</td>
                    <td className="mono">{Math.round(l.vol)}</td>
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
                          : <span style={{fontSize:11,color:C.gray}}>Enter rate to see feedback</span>}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.grayli}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:12,color:C.gray}}>{submitted} of {LANES.length} lanes rated</span>
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
      <div style={{color:C.gray,fontSize:13}}>The shipper has not enabled competitive feedback for this bid. Submit your rates in the Bid tab.</div>
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
                  <td className="mono" style={{fontSize:11,color:C.gray}}>{l.id}</td>
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
                <td className="mono" style={{color:C.gray}}>{c.scac}</td>
                <td><span className={`badge ${c.type}`}>{c.type}</span></td>
                <td style={{fontSize:12,color:C.gray}}>{c.contact}</td>
                <td>{c.submitted?<span style={{color:C.green,fontWeight:600,fontSize:12}}>✓ Submitted</span>:<span style={{color:C.amber,fontWeight:600,fontSize:12}}>Invited — Pending</span>}</td>
                <td className="mono">{c.bids||"—"}</td>
                <td style={{display:"flex",gap:6}}>
                  {!c.submitted && <button className="btn btn-sm btn-outline">Remind</button>}
                  <button className="btn btn-sm" style={{background:C.redlt,color:C.red,border:"none",cursor:"pointer"}} onClick={()=>handleRevoke(c.contact)}>Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notInvited.length>0 && (
        <div className="card">
          <div className="card-header"><div className="card-title" style={{color:C.gray}}>Not Yet Invited ({notInvited.length})</div></div>
          <table>
            <thead><tr><th>Carrier / Broker</th><th>SCAC</th><th>Type</th><th>Email</th><th></th></tr></thead>
            <tbody>
              {notInvited.map(c=>(
                <tr key={c.id}>
                  <td style={{fontWeight:500,color:C.gray}}>{c.name}</td>
                  <td className="mono" style={{color:C.gray}}>{c.scac}</td>
                  <td><span className={`badge ${c.type}`}>{c.type}</span></td>
                  <td style={{fontSize:12,color:C.gray}}>{c.contact}</td>
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
                <div className="form-group"><label>Contact Email <span style={{color:C.red}}>*</span></label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="rates@carrier.com"/></div>
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
      <div style={{color:C.gray,fontSize:13,marginBottom:20}}>Your bid is live. Invite carriers to participate.</div>
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
            <div style={{fontSize:13,color:C.gray}}><strong style={{color:C.steel}}>Click to upload</strong> or drag & drop your lane file</div>
            <div style={{fontSize:11,color:C.gray,marginTop:6}}>Accepts .xlsx · Use the RFPlab template</div>
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
          <div className="form-group" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",border:`1px solid ${C.grayli}`,borderRadius:8,marginBottom:16}}>
            <div>
              <div style={{fontWeight:600,fontSize:13}}>Enable competitive feedback for carriers</div>
              <div style={{fontSize:11,color:C.gray,marginTop:2}}>Carriers see limited information about their bid position — never other carriers' identities or exact rates</div>
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
                    <div style={{fontSize:11,color:C.gray,marginTop:2}}>{opt.desc}</div>
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
              <span style={{fontSize:13,fontWeight:600,color:C.purple}}>{settings.assetVsBrokerSplit}% asset / {100-settings.assetVsBrokerSplit}% broker</span>
            </div>
          </div>
          <div className="form-group"><label>FSC treatment</label><select><option>Not included — linehaul only</option><option>Included in rate</option></select></div>
          <div className="form-group"><label>Carrier notes</label><textarea rows={2} defaultValue="All rates are per load, flat linehaul. No accessorials. May–Aug 2026 contract." /></div>

          <div style={{background:C.offwhite,border:`1px solid ${C.grayli}`,borderRadius:8,padding:14,marginTop:8,fontSize:12,color:C.gray}}>
            <div style={{fontWeight:700,color:C.text,marginBottom:8}}>Summary</div>
            <div>Feedback: <strong style={{color:settings.feedbackEnabled?C.green:C.gray}}>{settings.feedbackEnabled?`Enabled — ${settings.feedbackType}`:"Disabled (blind bid)"}</strong></div>
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
function PlaceholderPage({ title, sub }) {
  return (
    <div className="card" style={{textAlign:"center",padding:60}}>
      <div style={{fontSize:32,marginBottom:12}}>🚧</div>
      <div className="page-title" style={{marginBottom:6}}>{title}</div>
      <div style={{color:C.gray,fontSize:13}}>{sub||"Coming in next build"}</div>
    </div>
  );
}

// ─── Simple dashboards ────────────────────────────────────────────────────────
// ─── My RFPs Page — with drafts, progress, timestamps ────────────────────────
function MyRFPsPage({ setPage, role }) {
  const [drafts, setDrafts] = useState([]);
  const [tab, setTab] = useState("active");

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
      awarded: {bg:C.ice,     color:C.steel,  label:"Awarded"},
      closed:  {bg:C.offwhite,color:C.gray,   label:"Closed"},
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
            ? <div className="card" style={{textAlign:"center",padding:"48px 20px",border:`2px dashed ${C.grayli}`}}>
                <div style={{fontSize:32,marginBottom:10}}>📝</div>
                <div style={{fontWeight:600,fontSize:14,color:C.navy,marginBottom:6}}>No drafts saved</div>
                <div style={{fontSize:12,color:C.gray,marginBottom:16}}>Start building an RFP and click "Save Draft" to pick up where you left off.</div>
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
                  return savedDate.toLocaleDateString();
                })();

                return (
                  <div key={draft.id} className="card" style={{marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:C.navy}}>{draft.name || "Untitled RFP"}</div>
                        <div style={{fontSize:11,color:C.gray,marginTop:3}}>
                          Step {draft.step} of 10 — {WIZ_STEP_GROUPS.flatMap(g=>g.steps).find(s=>s.id===draft.step)?.label}
                          <span style={{margin:"0 6px",color:C.grayli}}>·</span>
                          Last saved {ago}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{background:C.amberlt,color:C.amber,padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700}}>Draft</span>
                        <button className="btn btn-ghost btn-sm" style={{color:C.red,fontSize:11}} onClick={() => deleteDraft(draft.id)}>✕ Delete</button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:10,color:C.gray}}>Progress</span>
                        <span style={{fontSize:10,fontWeight:700,color:C.steel}}>{draft.pct}%</span>
                      </div>
                      <div style={{height:6,background:C.grayli,borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:6,background:C.sky,borderRadius:3,width:`${draft.pct}%`,transition:"width .4s"}}/>
                      </div>
                    </div>

                    {/* Step pills */}
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
                      {WIZ_STEP_GROUPS.flatMap(g=>g.steps).map(s => {
                        const done = (draft.completed||[]).includes(s.id);
                        const current = s.id === draft.step;
                        return (
                          <span key={s.id} style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,
                            background: done?C.greenlt : current?C.ice : C.offwhite,
                            color: done?C.green : current?C.steel : C.gray,
                            border: `1px solid ${done?C.green:current?C.sky:C.grayli}`}}>
                            {done?"✓ ":""}{s.label}
                          </span>
                        );
                      })}
                    </div>

                    <div style={{display:"flex",gap:8}}>
                      <button className="btn btn-primary btn-sm" onClick={() => setPage("new_rfp")}>
                        ✏️ Continue Building →
                      </button>
                      <span style={{fontSize:11,color:C.gray,alignSelf:"center"}}>
                        Saved {savedDate.toLocaleDateString()} at {savedDate.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
                      </span>
                    </div>
                  </div>
                );
              })}
        </div>
      )}

      {/* Active / Awarded / Closed tabs — real data from Supabase will populate these */}
      {tab !== "drafts" && (
        <div className="card" style={{textAlign:"center",padding:"48px 20px",border:`2px dashed ${C.grayli}`}}>
          <div style={{fontSize:32,marginBottom:10}}>{tab==="active"?"📋":tab==="awarded"?"🏆":"📦"}</div>
          <div style={{fontWeight:600,fontSize:14,color:C.navy,marginBottom:6}}>
            No {tab} RFPs yet
          </div>
          <div style={{fontSize:12,color:C.gray,marginBottom:16}}>
            {tab==="active"
              ? "Launch your first RFP to start inviting carriers and collecting rates."
              : tab==="awarded"
                ? "Awarded RFPs will appear here once you finalize carrier selections."
                : "Closed bids will archive here for reference."}
          </div>
          {tab==="active" && <button className="btn btn-primary" onClick={() => setPage("new_rfp")}>🚀 Build Your First RFP →</button>}
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
    background: r==='admin' ? C.navy : r==='shipper' ? C.green : C.amber,
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
          ? <div style={{padding:40,textAlign:'center',color:C.gray,fontSize:13}}>Loading users…</div>
          : filtered.length === 0
            ? <div style={{padding:40,textAlign:'center',color:C.gray,fontSize:13}}>
                No {filter === 'all' ? '' : filter} users yet.{' '}
                <span style={{color:C.steel,cursor:'pointer'}} onClick={() => setModal(true)}>Invite one →</span>
              </div>
            : <table>
                <thead><tr>
                  <th>Name</th><th>Email</th><th>Company</th><th>Role</th><th>Joined</th><th>Change Role</th>
                </tr></thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td style={{fontWeight:600}}>{u.full_name || '—'}</td>
                      <td style={{color:C.gray,fontSize:12}}>{u.email}</td>
                      <td>{u.company || '—'}</td>
                      <td><span style={rolePillStyle(u.role)}>{u.role}</span></td>
                      <td style={{color:C.gray,fontSize:11}}>{new Date(u.created_at).toLocaleDateString()}</td>
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
              {err && <div className="alert" style={{background:C.redlt,color:C.red,borderLeft:`3px solid ${C.red}`,marginBottom:12}}>{err}</div>}
              {sent && <div className="alert" style={{background:C.greenlt,color:C.green,borderLeft:`3px solid ${C.green}`,marginBottom:12}}>✓ Invite sent! They'll receive an email shortly.</div>}

              <div className="form-group">
                <label>Role</label>
                <div style={{display:'flex',gap:8,marginTop:4}}>
                  {[['shipper','🏢 Shipper'],['carrier','🚛 Carrier / Broker'],['admin','⚙️ Admin']].map(([v,l]) => (
                    <div key={v} onClick={() => setForm(f=>({...f,role:v}))}
                      style={{flex:1,padding:'9px 8px',border:`2px solid ${form.role===v?C.sky:C.grayli}`,
                        borderRadius:7,textAlign:'center',cursor:'pointer',fontSize:11,fontWeight:form.role===v?700:500,
                        background:form.role===v?C.ice:'white'}}>
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
              <div style={{background:C.offwhite,border:`1px solid ${C.grayli}`,borderRadius:8,padding:'10px 14px',fontSize:12,color:C.gray,marginTop:4}}>
                <strong style={{color:C.text}}>What happens next:</strong> They'll get an email to set their password. When they click the link, they land on the RFPlab login page with their role pre-set as <strong>{form.role}</strong>. They cannot self-upgrade to admin.
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
    background: r==='admin'?C.navy : r==='shipper'?C.green : C.amber, color:'white'
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
        <div style={{background:`linear-gradient(135deg,${C.navy},${C.slate})`,borderRadius:10,padding:"16px 18px",cursor:"pointer"}} onClick={()=>setPage("new_rfp")}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:36,height:36,background:"rgba(255,255,255,.1)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📋</div>
            <div><div style={{fontWeight:700,fontSize:13,color:"white"}}>Contracted RFP</div><div style={{fontSize:11,color:"rgba(255,255,255,.55)"}}>Multi-lane · Multi-carrier</div></div>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.6,marginBottom:10}}>Build and manage structured bids for shippers — lane files, carrier invites, award modeling.</div>
          <div style={{fontSize:12,fontWeight:600,color:C.sky}}>Launch RFP Wizard →</div>
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
          ? <div style={{padding:"20px 0",textAlign:"center",color:C.gray,fontSize:12}}>Loading…</div>
          : recentUsers.length === 0
            ? <div style={{padding:"20px 0",textAlign:"center",color:C.gray,fontSize:12}}>
                No users yet. <span style={{color:C.steel,cursor:"pointer"}} onClick={()=>setPage("users")}>Invite your first shipper →</span>
              </div>
            : recentUsers.map(u=>(
                <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.grayli}`}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>{u.full_name || u.email}</div>
                    <div style={{fontSize:11,color:C.gray}}>{u.company || u.email}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={rolePill(u.role)}>{u.role}</span>
                    <span style={{fontSize:11,color:C.gray}}>{new Date(u.created_at).toLocaleDateString()}</span>
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
          <div style={{background:`linear-gradient(135deg,${C.navy},${C.slate})`,borderRadius:10,padding:"18px 20px",cursor:"pointer"}} onClick={()=>setPage("new_rfp")}>
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
            <button className="btn btn-sm" style={{background:"rgba(255,255,255,.9)",color:C.purple,border:"none",fontWeight:700}} onClick={e=>{e.stopPropagation();setPage("spot");}}>⚡ Post a Load →</button>
          </div>
        </div>
        <div className="card" style={{textAlign:"center",padding:"36px 20px",border:`2px dashed ${C.grayli}`}}>
          <div style={{fontSize:32,marginBottom:12}}>📋</div>
          <div style={{fontWeight:600,fontSize:14,color:C.navy,marginBottom:6}}>No RFPs yet</div>
          <div style={{fontSize:12,color:C.gray,marginBottom:16}}>Create your first RFP to start inviting carriers and collecting rates.</div>
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
        <div style={{background:`linear-gradient(135deg,${C.navy},${C.slate})`,borderRadius:10,padding:"18px 20px",cursor:"pointer"}} onClick={()=>setPage("rfps")}>
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
            <button className="btn btn-sm" style={{background:"rgba(255,255,255,.9)",color:C.purple,border:"none",fontWeight:700}} onClick={e=>{e.stopPropagation();setPage("spot");}}>⚡ Post Load</button>
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
  const myLanes = LANES.filter(l=>l.bids.some(b=>b.carrier==="ROAR Logistics"));
  const r1 = myLanes.filter(l=>l.bids[0].carrier==="ROAR Logistics").length;
  return (
    <div>
      <div className="section-header"><div><div className="page-title">ROAR Logistics — Portal</div><div className="page-sub">Contracted RFP + Spot Load Board</div></div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        <div className="card-sm" style={{cursor:"pointer",borderLeft:`4px solid ${C.steel}`}} onClick={()=>setPage("event")}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>📋 Spindrift RFP — May–Aug 2026</div>
          <div style={{fontSize:11,color:C.gray,marginBottom:8}}>97 lanes · Deadline Apr 30, 2026</div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-sm btn-outline" onClick={e=>{e.stopPropagation();setPage("event");}}>View Bid Details</button>
            <button className="btn btn-sm btn-primary" onClick={e=>{e.stopPropagation();setPage("bid");}}>💲 Submit Rates</button>
          </div>
        </div>
        <div className="card-sm" style={{cursor:"pointer",borderLeft:`4px solid ${C.purple}`}} onClick={()=>setPage("spot")}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>⚡ Spot Load Board</div>
          <div style={{fontSize:11,color:C.gray,marginBottom:8}}><span className="live-dot" style={{display:"inline-block",marginRight:4}}/>2 loads live · Blind auction</div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-sm" style={{background:C.purplt,color:C.purple,border:`1px solid #C4B5FD`}} onClick={e=>{e.stopPropagation();setPage("spot");}}>View Spot Board →</button>
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
  const [bidSettings, setBidSettings] = useState({...DEFAULT_BID_SETTINGS});

  // Real users get empty activity log — data comes from Supabase
  // Demo mode (no dbUser) keeps the seed data for illustration
  const [activityLog, setActivityLog] = useState(dbUser ? [] : SEED_LOG);
  const nextId = useState(SEED_LOG.length + 1);

  const isLocked = dbProfile && dbProfile.role !== 'admin';
  const displayName = dbProfile?.company || dbProfile?.full_name ||
    (role === "carrier" ? "ROAR Logistics" : role === "shipper" ? "Spindrift Beverages" : "RFPlab Admin");

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
      if (page==="rfps")      return <MyRFPsPage setPage={setPage} role={role}/>;
      return <PlaceholderPage title={page}/>;
    }
    if (role==="shipper") {
      if (page==="dashboard") return <ShipperDashboard setPage={setPage} dbProfile={dbProfile}/>;
      if (page==="invite")    return <InvitePage dbProfile={dbProfile}/>;
      if (page==="results" || page==="awards") return <ResultsPage bidSettings={bidSettings} dbProfile={dbProfile}/>;
      if (page==="activity")  return <ActivityLogPage activityLog={activityLog} viewerRole="shipper" dbProfile={dbProfile}/>;
      if (page==="rfps")      return <MyRFPsPage setPage={setPage} role={role}/>;
      return <PlaceholderPage title={page}/>;
    }
    if (role==="carrier") {
      if (page==="event")     return <EventPage carrierName={displayName} addLog={addLog} activityLog={activityLog} setPage={setPage} dbProfile={dbProfile}/>;
      if (page==="bid")       return <BidPage bidSettings={bidSettings} carrierName={displayName} addLog={addLog} dbProfile={dbProfile}/>;
      if (page==="standing")  return <StandingPage bidSettings={bidSettings} carrierName={displayName} dbProfile={dbProfile}/>;
      if (page==="activity")  return <ActivityLogPage activityLog={activityLog} viewerRole="carrier" dbProfile={dbProfile}/>;
      if (page==="dashboard") return <CarrierDashboard setPage={setPage} bidSettings={bidSettings} dbProfile={dbProfile}/>;
      return <PlaceholderPage title={page}/>;
    }
  };

  const roleLabels = { admin:"Admin Console", shipper: displayName, carrier: displayName };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <Sidebar role={role} page={page} setPage={handleSetPage}/>
        <div className="main">
          <div className="topbar">
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <RFPLabLogo dark={false} size="sm"/>
              <div style={{width:"1px",height:28,background:C.grayli}}/>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span className={`role-pill ${role}`}>{role}</span>
                <span style={{fontSize:13,color:C.gray}}>{roleLabels[role]}</span>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {!isLocked && <RoleSwitcher role={role} setRole={handleSetRole} setPage={setPage}/>}
              {dbUser && (
                <button onClick={handleSignOut} style={{background:"none",border:`1px solid ${C.grayli}`,borderRadius:6,padding:"5px 12px",fontSize:11,color:C.gray,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
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
