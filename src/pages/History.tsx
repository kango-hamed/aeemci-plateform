import Navbar from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { GeneratedVisual } from '@/types/database'
import { format } from 'date-fns'
import { Download, FileImage } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function History() {
  const { user } = useAuthStore()
  const [visuals, setVisuals] = useState<GeneratedVisual[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchHistory()
    }
  }, [user])

  const fetchHistory = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('visuels_generes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setVisuals(data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Historique
          </h1>
          <p className="text-lg text-gray-600">
            Retrouvez tous vos visuels générés
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : visuals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visuals.map((visual) => (
              <Card key={visual.id} className="overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <FileImage className="w-16 h-16 text-primary-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {visual.contenu_json.titre || 'Sans titre'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(visual.created_at), 'PPP à HH:mm')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{visual.largeur}x{visual.hauteur}px</span>
                    <span className="uppercase">{visual.format_export}</span>
                  </div>

                  <button
                    className="w-full flex items-center justify-center px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger à nouveau
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Vous n'avez pas encore créé de visuels.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
