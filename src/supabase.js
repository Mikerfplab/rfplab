import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signUp(email, password, meta = {}) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: meta }
  })
  return { data, error }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

// ─── RFP helpers ──────────────────────────────────────────────────────────────
export async function getRFPs(shipperId) {
  const { data } = await supabase.from('rfps').select('*').eq('shipper_id', shipperId).order('created_at', { ascending: false })
  return data || []
}

export async function createRFP(rfp) {
  const { data, error } = await supabase.from('rfps').insert(rfp).select().single()
  return { data, error }
}

export async function getLanes(rfpId) {
  const { data } = await supabase.from('lanes').select('*').eq('rfp_id', rfpId)
  return data || []
}

export async function getBids(rfpId) {
  const { data } = await supabase.from('bids').select('*, profiles(full_name, company, carrier_type)').eq('rfp_id', rfpId)
  return data || []
}

export async function submitBid(bid) {
  const { data, error } = await supabase.from('bids').upsert(bid, { onConflict: 'lane_id,carrier_id' }).select().single()
  return { data, error }
}

export async function getInvites(rfpId) {
  const { data } = await supabase.from('rfp_invites').select('*').eq('rfp_id', rfpId)
  return data || []
}

export async function getMyInvites(email) {
  const { data } = await supabase.from('rfp_invites').select('*, rfps(*)').eq('carrier_email', email)
  return data || []
}

// ─── Spot load helpers ────────────────────────────────────────────────────────
export async function getSpotLoads(shipperId) {
  const { data } = await supabase.from('spot_loads').select('*, spot_quotes(*)').eq('shipper_id', shipperId).order('created_at', { ascending: false })
  return data || []
}

export async function getAllSpotLoads() {
  const { data } = await supabase.from('spot_loads').select('*, spot_quotes(*)').order('created_at', { ascending: false })
  return data || []
}

export async function createSpotLoad(load) {
  const { data, error } = await supabase.from('spot_loads').insert(load).select().single()
  return { data, error }
}

export async function submitSpotQuote(quote) {
  const { data, error } = await supabase.from('spot_quotes').upsert(quote, { onConflict: 'load_id,carrier_id' }).select().single()
  return { data, error }
}

export async function awardSpotLoad(loadId, carrierId, carrierName, rate) {
  const { error } = await supabase.from('spot_loads').update({
    status: 'awarded', awarded_to: carrierName, awarded_rate: rate
  }).eq('id', loadId)
  return { error }
}

// ─── Activity log ─────────────────────────────────────────────────────────────
export async function logActivity(entry) {
  await supabase.from('activity_log').insert(entry)
}

export async function getActivityLog(rfpId) {
  const { data } = await supabase.from('activity_log').select('*').eq('rfp_id', rfpId).order('created_at', { ascending: false })
  return data || []
}
