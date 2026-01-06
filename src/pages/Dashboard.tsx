import Navbar from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import type { ContentType } from '@/types/database'
import {
    Bell,
    BookOpen,
    FileText,
    GraduationCap,
    Megaphone,
    Scroll
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ICON_MAP: Record<string, any> = {
  megaphone: Megaphone,
  document: FileText,
  bell: Bell,
  book: BookOpen,
  scroll: Scroll,
  'graduation-cap': GraduationCap,
}

export default function Dashboard() {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchContentTypes()
  }, [])

  const fetchContentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('types_contenus')
        .select('*')
        .eq('actif', true)
        .order('ordre')

      if (error) throw error
      setContentTypes(data || [])
    } catch (error) {
      console.error('Error fetching content types:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectType = (typeId: string) => {
    navigate(`/templates/${typeId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Créez votre affiche
          </h1>
          <p className="text-lg text-gray-600">
            Choisissez le type de contenu que vous souhaitez créer
          </p>
        </div>

        {/* Content Types Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentTypes.map((type) => {
              const Icon = ICON_MAP[type.icone || 'document']
              
              return (
                <Card
                  key={type.id}
                  variant="hover"
                  onClick={() => handleSelectType(type.id)}
                  className="p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {type.nom}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {!loading && contentTypes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Aucun type de contenu disponible pour le moment.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
