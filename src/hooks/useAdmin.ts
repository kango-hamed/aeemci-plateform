import { useAuthStore } from '@/stores/authStore'

export function useAdmin() {
  const { user, profile, loading } = useAuthStore()
  
  const isAdmin = profile?.role === 'admin'
  
  return {
    isAdmin,
    user,
    profile,
    loading,
  }
}
