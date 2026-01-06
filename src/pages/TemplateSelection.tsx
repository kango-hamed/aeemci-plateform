import Navbar from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import type { ContentType, Template } from '@/types/database'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function TemplateSelection() {
  const { typeId } = useParams<{ typeId: string }>()
  const navigate = useNavigate()
  const [contentType, setContentType] = useState<ContentType | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeId) {
      fetchData()
    }
  }, [typeId])

  const fetchData = async () => {
    if (!typeId) return
    
    try {
      const { data: typeData, error: typeError } = await supabase
        .from('types_contenus')
        .select('*')
        .eq('id', typeId)
        .single()

      if (typeError) throw typeError
      setContentType(typeData)

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('templates')
        .select('*')
        .eq('type_contenu_id', typeId)
        .eq('actif', true)
        .order('ordre')

      if (templatesError) throw templatesError
      setTemplates(templatesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = (templateId: string) => {
    navigate(`/create/${templateId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          {contentType && (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {contentType.nom}
              </h1>
              <p className="text-lg text-gray-600">
                Choisissez un template pour votre {contentType.nom.toLowerCase()}
              </p>
            </>
          )}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                variant="hover"
                onClick={() => handleSelectTemplate(template.id)}
                className="overflow-hidden"
              >
                {/* Preview Image */}
                <div className="h-64 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  {template.preview_url ? (
                    <img
                      src={template.preview_url}
                      alt={template.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">Aperçu non disponible</p>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {template.nom}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{template.largeur}x{template.hauteur}px</span>
                    <span className="capitalize">{template.format}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Aucun template disponible pour ce type de contenu.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
