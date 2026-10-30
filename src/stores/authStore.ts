import type { UserProfile } from '@/types/database'
import { api, neonAuth } from '@/lib/api'
import type { SupabaseAuthAdapterInstance } from '@neondatabase/neon-js'
import { create } from 'zustand'

type AuthStateChangeCallback = Parameters<SupabaseAuthAdapterInstance['onAuthStateChange']>[0]

interface AppUser {
  id: string
  email: string
  name?: string
  user_metadata?: Record<string, unknown>
}

interface PendingProfile {
  email: string
  fullName: string
  delegation: string
}

const PENDING_PROFILE_KEY = 'aeemci:pending-profile'

function readPendingProfile(email: string): PendingProfile | null {
  try {
    const raw = sessionStorage.getItem(PENDING_PROFILE_KEY)
    if (!raw) return null
    const pending = JSON.parse(raw) as PendingProfile
    return pending.email.toLowerCase() === email.toLowerCase() ? pending : null
  } catch {
    return null
  }
}

async function loadOrCreateProfile(user: AppUser, fullName?: string, delegation?: string) {
  const findProfile = async () => {
    const { data, error } = await api.from('user_profiles').select('*').eq('id', user.id).limit(1)
    if (error) throw error
    return Array.isArray(data) ? data[0] : null
  }

  const existing = await findProfile()
  if (existing) {
    if (fullName || delegation) {
      const { data: updated, error: updateError } = await api
        .from('user_profiles')
        .update({
          ...(fullName ? { nom_complet: fullName } : {}),
          ...(delegation ? { delegation } : {}),
        })
        .eq('id', user.id)
        .select('*')
        .single()
      if (updateError) throw updateError
      return updated as UserProfile
    }
    return existing as UserProfile
  }

  const { data: created, error } = await api.from('user_profiles').insert({
    id: user.id,
    nom_complet: fullName || user.name || user.email,
    delegation: delegation || String(user.user_metadata?.delegation || '') || null,
    role: 'user',
  }).select('*').single()
  if (error?.code === '23505') {
    const profileCreatedByAnotherAuthEvent = await findProfile()
    if (profileCreatedByAnotherAuthEvent) return profileCreatedByAnotherAuthEvent as UserProfile
  }
  if (error) throw error
  return created as UserProfile
}

async function loadProfileForUser(user: AppUser) {
  const pendingProfile = readPendingProfile(user.email)
  const profile = await loadOrCreateProfile(
    user,
    pendingProfile?.fullName,
    pendingProfile?.delegation,
  )
  if (pendingProfile) sessionStorage.removeItem(PENDING_PROFILE_KEY)
  return profile
}

interface AuthState {
  user: AppUser | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, delegation: string) => Promise<void>
  verifyEmail: (email: string, code: string) => Promise<void>
  resendVerificationCode: (email: string, fullName?: string, delegation?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await api.auth.getSession()
      if (!session?.user) {
        set({ user: null, profile: null, loading: false })
      } else {
        const user = session.user as AppUser
        const profile = await loadProfileForUser(user)
        set({ user, profile, loading: false })
      }

      const handleAuthStateChange: AuthStateChangeCallback = async (_event, nextSession) => {
        if (!nextSession?.user) {
          set({ user: null, profile: null, loading: false })
          return
        }
        try {
          const nextUser = nextSession.user as AppUser
          const nextProfile = await loadProfileForUser(nextUser)
          set({ user: nextUser, profile: nextProfile, loading: false })
        } catch (error) {
          console.error('Error loading authenticated user profile:', error)
          set({ user: nextSession.user as AppUser, profile: null, loading: false })
        }
      }
      api.auth.onAuthStateChange(handleAuthStateChange)
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ user: null, profile: null, loading: false })
    }
  },

  signUp: async (email, password, fullName, delegation) => {
    const { error } = await neonAuth.signUp.email({ email, password, name: fullName })
    if (error) throw error

    // Keep only non-secret profile fields until a verified account can sign in.
    sessionStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({
      email,
      fullName,
      delegation,
    } satisfies PendingProfile))

    const { data: { session } } = await api.auth.getSession()
    if (session?.user) {
      try {
        await loadOrCreateProfile(session.user as AppUser, fullName, delegation)
        sessionStorage.removeItem(PENDING_PROFILE_KEY)
      } catch (profileError) {
        // The account has been created; preserve the profile details for sign-in.
        console.error('Account created, but the profile could not be saved yet:', profileError)
      }
    }
  },

  verifyEmail: async (email, code) => {
    const { error } = await neonAuth.emailOtp.verifyEmail({ email, otp: code })
    if (error) throw error

    const { data: { session } } = await api.auth.getSession()
    if (!session?.user) {
      throw new Error('Email vérifié, mais la session n’a pas été ouverte. Connecte-toi avec ton adresse et ton mot de passe.')
    }

    const user = session.user as AppUser
    const profile = await loadProfileForUser(user)
    set({ user, profile, loading: false })
  },

  resendVerificationCode: async (email, fullName, delegation) => {
    const { error } = await neonAuth.emailOtp.sendVerificationOtp({
      email,
      type: 'email-verification',
    })
    if (error) throw error
    if (fullName && delegation) {
      sessionStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({ email, fullName, delegation } satisfies PendingProfile))
    }
  },

  signIn: async (email, password) => {
    const { error } = await api.auth.signInWithPassword({ email, password })
    if (error) throw error
    const { data: { session } } = await api.auth.getSession()
    const user = session?.user
    if (!user) throw new Error('La connexion a réussi, mais aucune session n’a été renvoyée.')
    const profile = await loadProfileForUser(user as AppUser)
    set({ user: user as AppUser, profile, loading: false })
  },

  signOut: async () => {
    const { error } = await api.auth.signOut()
    if (error) throw error
    set({ user: null, profile: null })
  },
}))
