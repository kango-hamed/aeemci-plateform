// Helper function to bypass Supabase strict typing issues
// This is a temporary workaround until Supabase types are fixed
export function supabaseUpdate<T>(data: T): any {
  return data as any
}
