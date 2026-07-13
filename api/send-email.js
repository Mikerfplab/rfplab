// ─── RFPlab Email API — Vercel Serverless Function ───────────────────────────
// Route: POST /api/send-email
// RESEND_API_KEY lives server-side only. Never exposed to the browser.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_INVITES   = "RFPlab <invites@rfplab.com>";
const FROM_NOTIFY    = "RFPlab <notifications@rfplab.com>";

function shell(body) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>RFPlab</title>
<style>
body,html{margin:0;padding:0;background:#F5F0E8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1E1E1E;}
.shell{max-width:600px;margin:0 auto;}
.hdr{background:#111111;padding:28px 36px 22px;}
.logo{font-family:'Arial Black',Arial,sans-serif;font-weight:900;font-size:30px;letter-spacing:8px;color:#F5F0E8;}
.lab{font-family:'Arial Black',Arial,sans-serif;font-weight:900;font-size:13px;letter-spacing:3px;color:#F5F0E8;margin-left:8px;vertical-align:middle;}
.tag{color:rgba(245,240,232,.35);font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:6px;}
.bdy{background:#FDFCF9;padding:36px;}
.h1{font-size:22px;font-weight:800;color:#111111;letter-spacing:-.5px;margin:0 0 8px;}
.sub{font-size:13px;color:#8C8070;margin:0 0 22px;line-height:1.6;}
.box{background:#EDE8DF;border-radius:6px;padding:16px 18px;margin:16px 0;}
.dr{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #D4C9B8;font-size:12px;}
.dr:last-child{border-bottom:none;}
.dk{color:#8C8070;}.dv{font-weight:700;color:#111111;text-align:right;max-width:60%;}
.cta{display:inline-block;background:#111111;color:#F5F0E8 !important;text-decoration:none;font-weight:800;font-size:12px;letter-spacing:.5px;text-transform:uppercase;padding:13px 28px;border-radius:4px;margin:18px 0 4px;}
.cta-gold{background:#C9A84C;color:#111111 !important;}
.p{font-size:13px;color:#5A534A;line-height:1.8;margin:0 0 14px;}
.alert{padding:11px 16px;border-radius:4px;font-size:12px;margin:14px 0;border-left:3px solid;}
.info{background:#F5EDD4;border-color:#C9A84C;color:#7A5A10;}
.warn{background:#F5E6E0;border-color:#9B3A1E;color:#9B3A1E;}
.ok{background:#EBF0DC;border-color:#5C6B2E;color:#5C6B2E;}
.route{font-size:16px;font-weight:800;color:#111111;margin:4px 0 16px;}
.dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#C9A84C;margin:0 8px;vertical-align:middle;}
hr{border:none;border-top:1px solid #D4C9B8;margin:20px 0;}
.ftr{padding:18px 36px 28px;text-align:center;}
.ft{font-size:10px;color:#8C8070;line-height:1.8;}
.ft a{color:#C9A84C;text-decoration:none;}
</style></head>
<body><div class="shell">
  <div class="hdr">
    <span class="logo">R F P</span><span class="lab">LAB</span>
    <div class="tag">Freight Intelligence Platform</div>
  </div>
  <div class="bdy">${body}</div>
  <div class="ftr"><p class="ft">
    <a href="https://rfplab.com">rfplab.com</a> &nbsp;·&nbsp;
    <a href="https://rfplab.com/unsubscribe">Unsubscribe</a>
  </p></div>
</div></body></html>`;
}

function rows(pairs) {
  return pairs.map(([k,v]) =>
    `<div class="dr"><span class="dk">${k}</span><span class="dv">${v}</span></div>`
  ).join("");
}

const templates = {

  rfp_invite: ({ carrierName, shipperName, rfpName, lanes, deadline, bidUrl }) => ({
    from: FROM_INVITES,
    subject: `You're invited to bid — ${rfpName}`,
    html: shell(`
      <p class="h1">Bid Invitation</p>
      <p class="sub">${shipperName} has invited <strong>${carrierName}</strong> to participate in a freight RFP.</p>
      <div class="box">${rows([["RFP Name",rfpName],["Shipper",shipperName],["Lanes Available",`${lanes} lanes`],["Bid Deadline",deadline]])}</div>
      <p class="p">Log in to view lane details, download documents, confirm intent, and submit rates before the deadline.</p>
      <div class="alert info">📌 Your rates and identity are never shared with other participants. All bids are blind until awards are finalized.</div>
      <a href="${bidUrl||'https://rfplab.com'}" class="cta">View Bid Details &amp; Submit Rates →</a>
    `),
  }),

  rfp_reminder: ({ carrierName, rfpName, shipperName, deadline, lanesSubmitted, totalLanes, bidUrl }) => {
    const rem = totalLanes - lanesSubmitted;
    return {
      from: FROM_NOTIFY,
      subject: `Reminder: Bid deadline approaching — ${rfpName}`,
      html: shell(`
        <p class="h1">Bid Deadline Reminder</p>
        <p class="sub">The rate submission window for <strong>${rfpName}</strong> closes soon.</p>
        <div class="box">${rows([["RFP",rfpName],["Shipper",shipperName],["Deadline",deadline],["Progress",`${lanesSubmitted} of ${totalLanes} lanes submitted`]])}</div>
        ${rem > 0
          ? `<div class="alert warn">⚠ ${rem} lane${rem!==1?"s":""} without a rate will not be considered for award.</div>`
          : `<div class="alert ok">✓ All ${totalLanes} lanes submitted. No further action needed.</div>`}
        <a href="${bidUrl||'https://rfplab.com'}" class="cta">Go to Bid Portal →</a>
      `),
    };
  },

  rfp_awarded: ({ carrierName, shipperName, rfpName, awardedLanes, totalRate, effectiveDate, awardUrl }) => ({
    from: FROM_NOTIFY,
    subject: `You've been awarded lanes — ${rfpName}`,
    html: shell(`
      <div class="alert ok" style="margin-bottom:20px;">✓ Congratulations — lanes awarded</div>
      <p class="h1">Award Notification</p>
      <p class="sub">${shipperName} has awarded <strong>${carrierName}</strong> lanes in ${rfpName}.</p>
      <div class="box">${rows([["RFP",rfpName],["Shipper",shipperName],["Lanes Awarded",String(awardedLanes)],["Effective Date",effectiveDate],...(totalRate?[["Estimated Annual Value","$"+Number(totalRate).toLocaleString()]]:[])])}</div>
      <p class="p">Log in to view awarded lanes, rate confirmations, and operational requirements. A routing guide will follow from the shipper prior to the effective date.</p>
      <a href="${awardUrl||'https://rfplab.com'}" class="cta cta-gold">View Award Details →</a>
    `),
  }),

  rfp_not_awarded: ({ carrierName, shipperName, rfpName, feedbackType, feedbackValue }) => ({
    from: FROM_NOTIFY,
    subject: `Bid results available — ${rfpName}`,
    html: shell(`
      <p class="h1">Bid Results</p>
      <p class="sub">The award process for <strong>${rfpName}</strong> has been finalized by ${shipperName}.</p>
      <p class="p">Thank you for participating. After reviewing all submissions, ${shipperName} has completed carrier selections for this bid cycle. ${carrierName} was not awarded lanes in this round.</p>
      ${feedbackType && feedbackValue ? `<div class="box">${rows([["Shipper feedback",feedbackValue]])}</div>` : ""}
      <p class="p">New RFP opportunities and spot loads are posted regularly. Your participation record is on file for future bids.</p>
      <a href="https://rfplab.com" class="cta">View Your Portal →</a>
    `),
  }),

  spot_invite: ({ carrierName, shipperName, origCity, origState, destCity, destState, mode, pickup, windowEnds, loadUrl }) => {
    const wDate = new Date(windowEnds).toLocaleDateString("en-US",{month:"short",day:"numeric"});
    const wTime = new Date(windowEnds).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
    return {
      from: FROM_INVITES,
      subject: `Spot load available — ${origCity}, ${origState} → ${destCity}, ${destState}`,
      html: shell(`
        <p class="h1">Spot Load Available</p>
        <p class="sub">${shipperName} has posted a load and invited <strong>${carrierName}</strong> to quote.</p>
        <div class="route">${origCity}, ${origState} <span class="dot"></span> ${destCity}, ${destState}</div>
        <div class="box">${rows([["Mode",mode],["Pickup Date",pickup],["Quote Window Closes",`${wDate} at ${wTime}`],["Shipper",shipperName],["Quoting","Blind — rates not visible to other carriers"]])}</div>
        <div class="alert warn">⏱ This window closes <strong>${wDate} at ${wTime}</strong>. Late quotes are not accepted.</div>
        <a href="${loadUrl||'https://rfplab.com'}" class="cta">View Load &amp; Submit Quote →</a>
      `),
    };
  },

  spot_awarded: ({ carrierName, shipperName, origCity, origState, destCity, destState, mode, pickup, rate, contactName, contactEmail, loadUrl }) => ({
    from: FROM_NOTIFY,
    subject: `Load awarded to you — ${origCity}, ${origState} → ${destCity}, ${destState}`,
    html: shell(`
      <div class="alert ok" style="margin-bottom:20px;">✓ You've been awarded this load</div>
      <p class="h1">Spot Load Award</p>
      <p class="sub">${shipperName} has selected <strong>${carrierName}</strong> for this shipment.</p>
      <div class="route">${origCity}, ${origState} <span class="dot"></span> ${destCity}, ${destState}</div>
      <div class="box">${rows([["Mode",mode],["Pickup Date",pickup],["Awarded Rate","$"+Number(rate).toLocaleString()],["Shipper",shipperName],...(contactName?[["Shipper Contact",contactName]]:[]),...(contactEmail?[["Contact Email",contactEmail]]:[])  ])}</div>
      <p class="p">Please confirm acceptance and coordinate pickup with the shipper. A rate confirmation and BOL instructions will follow.</p>
      <a href="${loadUrl||'https://rfplab.com'}" class="cta cta-gold">View Load Details →</a>
    `),
  }),

  insurance_expiry: ({ shipperName, carrierName, policyType, expiryDate, daysLeft }) => {
    const urgent = daysLeft < 30;
    return {
      from: FROM_NOTIFY,
      subject: `COI expiring${urgent?" — action required":""}: ${carrierName} ${policyType}`,
      html: shell(`
        <div class="alert ${urgent?"warn":"info"}" style="margin-bottom:20px;">${urgent?"⚠ Urgent — ":"📅 "}Expiring in <strong>${daysLeft} days</strong></div>
        <p class="h1">COI Expiration Alert</p>
        <p class="sub">A certificate of insurance for one of your carrier partners expires soon.</p>
        <div class="box">${rows([["Carrier",carrierName],["Policy Type",policyType],["Expiration Date",expiryDate],["Days Remaining",String(daysLeft)],["Action Required","Request updated COI from carrier"]])}</div>
        <p class="p">${urgent?`This policy expires in ${daysLeft} days. Loads awarded to ${carrierName} may not be covered after ${expiryDate}. Request an updated COI immediately.`:`Request an updated COI from ${carrierName} before ${expiryDate} to maintain continuous coverage.`}</p>
        <a href="https://rfplab.com" class="cta ${urgent?"cta-gold":""}">View Insurance Tracker →</a>
      `),
    };
  },

  user_invite: ({ inviteeName, role, company, inviteUrl }) => {
    const label = role==="shipper"?"Shipper":role==="carrier"?"Carrier / Broker":"Admin";
    return {
      from: FROM_INVITES,
      subject: "You've been invited to RFPlab",
      html: shell(`
        <p class="h1">Welcome to RFPlab</p>
        <p class="sub">You've been invited to join the RFPlab freight intelligence platform.</p>
        <div class="box">${rows([["Your Name",inviteeName||"—"],["Company",company||"—"],["Account Type",label],["Platform","rfplab.com"]])}</div>
        <p class="p">Click below to set your password and access your ${label} portal. This link expires in 24 hours.</p>
        <a href="${inviteUrl||'https://rfplab.com'}" class="cta">Set Password &amp; Sign In →</a>
        <hr/>
        <p class="p" style="font-size:11px;color:#8C8070;">Didn't expect this? Ignore this email or contact <a href="mailto:support@rfplab.com" style="color:#C9A84C;">support@rfplab.com</a>.</p>
      `),
    };
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error:"Method not allowed" });
  if (!RESEND_API_KEY)       return res.status(500).json({ error:"RESEND_API_KEY not configured" });
  const { type, to, data } = req.body || {};
  if (!type || !to) return res.status(400).json({ error:"Missing: type, to" });
  const tmpl = templates[type];
  if (!tmpl) return res.status(400).json({ error:`Unknown type: ${type}` });
  let email;
  try { email = tmpl(data || {}); }
  catch(e) { return res.status(400).json({ error:"Template error: "+e.message }); }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method:"POST",
      headers:{ "Authorization":`Bearer ${RESEND_API_KEY}`, "Content-Type":"application/json" },
      body: JSON.stringify({ from:email.from, to:Array.isArray(to)?to:[to], subject:email.subject, html:email.html }),
    });
    const result = await r.json();
    if (!r.ok) return res.status(r.status).json({ error:result.message||"Resend error" });
    return res.status(200).json({ success:true, id:result.id });
  } catch(e) {
    return res.status(500).json({ error:e.message });
  }
}
