import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/database'
import type { User } from '@supabase/supabase-js'
import { create } from 'zustand'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, delegation: string) => Promise<void>
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
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({ user: session.user, profile: profile as UserProfile | null, loading: false })
      } else {
        set({ user: null, profile: null, loading: false })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({ user: session.user, profile: profile as UserProfile | null })
        } else {
          set({ user: null, profile: null })
        }
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ loading: false })
    }
  },

  signUp: async (email, password, fullName, delegation) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          delegation,
        },
      },
    })

    if (error) throw error

    if (data.user) {
      // Create user profile
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        nom_complet: fullName,
        delegation,
        role: 'user',
      } as any)
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, profile: null })
  },
}))
