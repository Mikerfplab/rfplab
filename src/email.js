// ─── RFPlab Email Client ──────────────────────────────────────────────────────
// Calls the Vercel serverless function at /api/send-email
// RESEND_API_KEY lives only on the server — never exposed here

const APP_URL = typeof window !== "undefined" ? window.location.origin : "https://rfplab.com";

async function sendEmail(type, to, data) {
  try {
    const res = await fetch(`${APP_URL}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, to, data }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Send failed");
    return { success: true, id: result.id };
  } catch (err) {
    console.error(`Email failed [${type}]:`, err.message);
    return { success: false, error: err.message };
  }
}

// ─── RFP emails ───────────────────────────────────────────────────────────────

export async function sendRFPInvite({ carrierEmail, carrierName, shipperName, rfpName, lanes, deadline }) {
  return sendEmail("rfp_invite", carrierEmail, {
    carrierName, shipperName, rfpName, lanes, deadline,
    bidUrl: `${APP_URL}`,
  });
}

export async function sendRFPReminder({ carrierEmail, carrierName, rfpName, shipperName, deadline, lanesSubmitted, totalLanes }) {
  return sendEmail("rfp_reminder", carrierEmail, {
    carrierName, rfpName, shipperName, deadline, lanesSubmitted, totalLanes,
    bidUrl: `${APP_URL}`,
  });
}

export async function sendRFPAwarded({ carrierEmail, carrierName, shipperName, rfpName, awardedLanes, totalRate, effectiveDate }) {
  return sendEmail("rfp_awarded", carrierEmail, {
    carrierName, shipperName, rfpName, awardedLanes, totalRate, effectiveDate,
    awardUrl: `${APP_URL}`,
  });
}

export async function sendRFPNotAwarded({ carrierEmail, carrierName, shipperName, rfpName, feedbackType, feedbackValue }) {
  return sendEmail("rfp_not_awarded", carrierEmail, {
    carrierName, shipperName, rfpName, feedbackType, feedbackValue,
  });
}

// ─── Spot load emails ─────────────────────────────────────────────────────────

export async function sendSpotLoadInvite({ carrierEmail, carrierName, shipperName, load }) {
  return sendEmail("spot_invite", carrierEmail, {
    carrierName, shipperName,
    origCity:  load.origin?.city  || load.orig_city,
    origState: load.origin?.state || load.orig_state,
    destCity:  load.dest?.city    || load.dest_city,
    destState: load.dest?.state   || load.dest_state,
    mode:      load.mode,
    pickup:    load.pickup        || load.pickup_date,
    windowEnds:load.windowEnds    || load.window_ends,
    loadUrl:   `${APP_URL}`,
  });
}

export async function sendSpotAwarded({ carrierEmail, carrierName, shipperName, shipperContact, load, rate }) {
  return sendEmail("spot_awarded", carrierEmail, {
    carrierName, shipperName, rate,
    origCity:  load.origin?.city  || load.orig_city,
    origState: load.origin?.state || load.orig_state,
    destCity:  load.dest?.city    || load.dest_city,
    destState: load.dest?.state   || load.dest_state,
    mode:      load.mode,
    pickup:    load.pickup        || load.pickup_date,
    contactName:  shipperContact?.name,
    contactEmail: shipperContact?.email,
    loadUrl:   `${APP_URL}`,
  });
}

// ─── Risk / Insurance ─────────────────────────────────────────────────────────

export async function sendInsuranceExpiryAlert({ shipperEmail, shipperName, carrierName, policyType, expiryDate, daysLeft }) {
  return sendEmail("insurance_expiry", shipperEmail, {
    shipperName, carrierName, policyType, expiryDate, daysLeft,
  });
}

// ─── Admin user invite ────────────────────────────────────────────────────────

export async function sendUserInviteEmail({ email, inviteeName, role, company, inviteUrl }) {
  return sendEmail("user_invite", email, {
    inviteeName, role, company, inviteUrl,
  });
}

// ─── Bulk send helpers ────────────────────────────────────────────────────────

export async function sendRFPInvitesToAll(carriers, rfpDetails) {
  const results = await Promise.allSettled(
    carriers.map(c => sendRFPInvite({
      carrierEmail: c.email || c.carrier_email,
      carrierName:  c.name  || c.carrier_name,
      ...rfpDetails,
    }))
  );
  const sent = results.filter(r => r.status === "fulfilled" && r.value?.success).length;
  return { sent, failed: results.length - sent, total: results.length };
}

export async function sendSpotInvitesToAll(carriers, shipperName, load) {
  const results = await Promise.allSettled(
    carriers.map(c => sendSpotLoadInvite({
      carrierEmail: c.email || c.carrier_email,
      carrierName:  c.name  || c.carrier_name,
      shipperName,
      load,
    }))
  );
  const sent = results.filter(r => r.status === "fulfilled" && r.value?.success).length;
  return { sent, failed: results.length - sent, total: results.length };
}
