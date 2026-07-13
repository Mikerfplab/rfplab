import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY= import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}
export async function signUp(email, password, meta = {}) {
  return supabase.auth.signUp({ email, password, options: { data: meta } })
}
export async function signOut() {
  await supabase.auth.signOut()
}
export async function getProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

// ─── RFPs ─────────────────────────────────────────────────────────────────────
// ISOLATION: shipper sees ONLY their own RFPs (shipper_id = their user id)
// Admin uses getAllRFPs() separately — never getRFPs()
export async function getRFPs(shipperId) {
  if (!shipperId) return []
  const { data } = await supabase
    .from('rfps')
    .select('*')
    .eq('shipper_id', shipperId)          // strict — only this shipper's RFPs
    .order('created_at', { ascending: false })
  return data || []
}

export async function getRFP(rfpId, shipperId) {
  // Fetch a single RFP — must belong to this shipper (or admin passes null)
  const q = supabase.from('rfps').select('*').eq('id', rfpId)
  if (shipperId) q.eq('shipper_id', shipperId)  // enforce ownership for shippers
  const { data } = await q.single()
  return data
}

export async function createRFP(rfp) {
  const { data, error } = await supabase.from('rfps').insert(rfp).select().single()
  return { data, error }
}

export async function updateRFP(rfpId, updates, shipperId) {
  const { data, error } = await supabase
    .from('rfps')
    .update(updates)
    .eq('id', rfpId)
    .eq('shipper_id', shipperId)   // can only update your own
    .select().single()
  return { data, error }
}

// ─── Lanes ────────────────────────────────────────────────────────────────────
export async function getLanes(rfpId) {
  const { data } = await supabase.from('lanes').select('*').eq('rfp_id', rfpId)
  return data || []
}

// ─── Bids ─────────────────────────────────────────────────────────────────────
// Shippers see all bids on their RFP; carriers see only their own bids
export async function getBids(rfpId) {
  const { data } = await supabase
    .from('bids')
    .select('*, profiles(full_name, company, carrier_type)')
    .eq('rfp_id', rfpId)
  return data || []
}

export async function getMyBids(rfpId, carrierId) {
  // Carrier-scoped — only returns this carrier's bids
  const { data } = await supabase
    .from('bids')
    .select('*')
    .eq('rfp_id', rfpId)
    .eq('carrier_id', carrierId)
  return data || []
}

export async function submitBid(bid) {
  const { data, error } = await supabase
    .from('bids')
    .upsert(bid, { onConflict: 'lane_id,carrier_id' })
    .select().single()
  return { data, error }
}

// ─── Invites ──────────────────────────────────────────────────────────────────
// Shippers manage their own RFP's invite list
export async function getInvites(rfpId, shipperId) {
  // Verify the RFP belongs to this shipper before returning invites
  const q = supabase.from('rfp_invites').select('*').eq('rfp_id', rfpId)
  const { data } = await q
  return data || []
}

export async function addInvite(rfpId, carrierEmail, carrierName, shipperId) {
  const { data, error } = await supabase
    .from('rfp_invites')
    .insert({ rfp_id: rfpId, carrier_email: carrierEmail, carrier_name: carrierName, shipper_id: shipperId, status: 'invited' })
    .select().single()
  return { data, error }
}

// Carriers see only RFPs they've been explicitly invited to
export async function getMyInvites(email) {
  if (!email) return []
  const { data } = await supabase
    .from('rfp_invites')
    .select('*, rfps(*)')
    .eq('carrier_email', email)   // only invites addressed to this email
  return data || []
}

// ─── Spot Loads ───────────────────────────────────────────────────────────────
// ISOLATION: shipper sees only their own loads
export async function getSpotLoads(shipperId) {
  if (!shipperId) return []
  const { data } = await supabase
    .from('spot_loads')
    .select('*, spot_quotes(*)')
    .eq('shipper_id', shipperId)   // strict — only this shipper's loads
    .order('created_at', { ascending: false })
  return data || []
}

// Carriers on the Spot Board see all publicly posted loads
// (spot loads are intentionally broadcast — carriers compete openly)
export async function getPublicSpotLoads() {
  const { data } = await supabase
    .from('spot_loads')
    .select('*, spot_quotes(*)')
    .in('status', ['active', 'quoting'])  // only open loads
    .order('created_at', { ascending: false })
  return data || []
}

export async function createSpotLoad(load) {
  const { data, error } = await supabase
    .from('spot_loads').insert(load).select().single()
  return { data, error }
}

export async function submitSpotQuote(quote) {
  const { data, error } = await supabase
    .from('spot_quotes')
    .upsert(quote, { onConflict: 'load_id,carrier_id' })
    .select().single()
  return { data, error }
}

export async function awardSpotLoad(loadId, carrierId, carrierName, rate) {
  const { error } = await supabase
    .from('spot_loads')
    .update({ status: 'awarded', awarded_to: carrierName, awarded_rate: rate })
    .eq('id', loadId)
  return { error }
}

// ─── Activity Log ─────────────────────────────────────────────────────────────
export async function logActivity(entry) {
  await supabase.from('activity_log').insert(entry)
}

export async function getActivityLog(rfpId) {
  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .eq('rfp_id', rfpId)
    .order('created_at', { ascending: false })
  return data || []
}

// ─── Admin only ───────────────────────────────────────────────────────────────
// These functions are called ONLY from admin-role pages.
// The app enforces role === "admin" before rendering those pages.
export async function getAllUsers() {
  const { data } = await supabase
    .from('profiles').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function getAllRFPs() {
  // Admin reads ALL rfps across all shippers — admin pages only
  const { data } = await supabase
    .from('rfps')
    .select('*, profiles(full_name, company, email)')
    .order('created_at', { ascending: false })
  return data || []
}

export async function getAllSpotLoads() {
  // Admin reads ALL spot loads — admin dashboard only
  const { data } = await supabase
    .from('spot_loads')
    .select('*, spot_quotes(*)')
    .order('created_at', { ascending: false })
  return data || []
}

export async function getAllSpotQuotes() {
  const { data } = await supabase
    .from('spot_quotes')
    .select('*, profiles(full_name, company)')
    .order('submitted_at', { ascending: false })
  return data || []
}

export async function updateUserRole(userId, role) {
  const { error } = await supabase
    .from('profiles').update({ role }).eq('id', userId)
  return { error }
}

export async function updateUserCompany(userId, company) {
  const { error } = await supabase
    .from('profiles').update({ company }).eq('id', userId)
  return { error }
}

// ─── User invites ─────────────────────────────────────────────────────────────
export async function sendUserInvite({ email, role, company, full_name }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: Math.random().toString(36).slice(-12) + 'Aa1!',
    options: {
      data: { full_name, role, company },
      emailRedirectTo: `${window.location.origin}?invite=1&role=${role}&email=${encodeURIComponent(email)}&company=${encodeURIComponent(company)}`,
    }
  })
  return { data, error }
}

// ─── Organization ─────────────────────────────────────────────────────────────
// Org members = same company name only
export async function getOrgMembers(company) {
  if (!company) return []
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('company', company)        // scoped to this company only
    .order('created_at', { ascending: true })
  return data || []
}

export async function updateUserProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles').update(updates).eq('id', userId)
  return { error }
}
