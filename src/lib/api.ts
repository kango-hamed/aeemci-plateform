import {
  createClient,
  defaultDeriveNeonUrls,
  SupabaseAuthAdapter,
  type SupabaseAuthAdapterInstance,
} from '@neondatabase/neon-js'
import { createAuthClient } from '@neondatabase/neon-js/auth'

const neonUrl = import.meta.env.VITE_NEON_URL

if (!neonUrl) {
  throw new Error('VITE_NEON_URL est manquant. Configure l’URL HTTPS Neon Data API dans ton fichier .env.')
}

// Neon Auth + Data API client. SupabaseAuthAdapter keeps the V1 auth calls compatible.
// In neon-js 0.9.0-beta, createClient's overload types this adapter as its
// instance even though its runtime expects the builder returned by the factory.
type SupabaseCompatibleClient = ReturnType<typeof createClient> & {
  auth: SupabaseAuthAdapterInstance
}
const createSupabaseCompatibleClient = createClient as unknown as (
  baseUrl: string,
  options: { auth: { adapter: ReturnType<typeof SupabaseAuthAdapter> } },
) => SupabaseCompatibleClient

// This URL is a public HTTPS endpoint; it is not a PostgreSQL password/connection string.
export const api = createSupabaseCompatibleClient(neonUrl, {
  auth: { adapter: SupabaseAuthAdapter() },
})

// The Supabase compatibility adapter treats sign-up without an immediate
// session as an error. Managed Neon Auth can require email verification, in
// which case account creation succeeds before a session exists. Use the
// native Better Auth client for sign-up so that flow remains successful.
export const neonAuth = createAuthClient(defaultDeriveNeonUrls(neonUrl).auth)
