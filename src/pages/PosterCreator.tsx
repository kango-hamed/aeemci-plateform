import Navbar from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Template } from '@/types/database'
import html2canvas from 'html2canvas'
import { ArrowLeft, Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function PosterCreator() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [template, setTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (templateId) {
      fetchTemplate()
    }
  }, [templateId])

  const fetchTemplate = async () => {
    if (!templateId) return
    
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) throw error
      setTemplate(data as Template)

      // Initialize form data
      const initialData: Record<string, any> = {}
      ;(data as Template).champs_config.forEach((field: any) => {
        initialData[field.name] = ''
      })
      setFormData(initialData)
    } catch (error) {
      console.error('Error fetching template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleGenerate = async () => {
    if (!template || !user) return

    setGenerating(true)
    try {
      const element = document.getElementById('poster-preview')
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      })

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return

        // Save to database
        await supabase.from('visuels_generes').insert({
          template_id: template.id,
          user_id: user.id,
          contenu_json: formData,
          format_export: 'png',
          largeur: template.largeur,
          hauteur: template.hauteur,
          taille_fichier: blob.size,
        } as any)

        // Download
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `aeemci-${template.nom.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
        link.click()
        URL.revokeObjectURL(url)

        setGenerating(false)
      }, 'image/png')
    } catch (error) {
      console.error('Error generating poster:', error)
      setGenerating(false)
    }
  }

  const renderPreview = () => {
    if (!template) return null

    // Simple preview - will be replaced with actual template rendering
    return (
      <div
        id="poster-preview"
        style={{
          width: `${template.largeur}px`,
          height: `${template.hauteur}px`,
          transform: 'scale(0.5)',
          transformOrigin: 'top left',
        }}
        className="bg-white shadow-2xl"
      >
        <div className="w-full h-full p-12 flex flex-col items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
          <h1 className="text-6xl font-bold text-primary-600 mb-8 text-center">
            {formData.titre || 'Votre titre ici'}
          </h1>
          <div className="space-y-4 text-2xl text-gray-700">
            {Object.entries(formData).map(([key, value]) => (
              key !== 'titre' && value && (
                <p key={key}>
                  <strong className="capitalize">{key}:</strong> {value}
                </p>
              )
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Template non trouvé</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {template.nom}
            </h2>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              {template.champs_config.map((field: any) => {
                if (field.type === 'textarea') {
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        maxLength={field.maxLength}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {field.maxLength && (
                        <p className="text-xs text-gray-500 mt-1">
                          {(formData[field.name] || '').length} / {field.maxLength}
                        </p>
                      )}
                    </div>
                  )
                }

                return (
                  <Input
                    key={field.name}
                    type={field.type}
                    label={field.label}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    helperText={
                      field.maxLength
                        ? `${(formData[field.name] || '').length} / ${field.maxLength}`
                        : undefined
                    }
                  />
                )
              })}

              <Button
                onClick={handleGenerate}
                className="w-full"
                size="lg"
                isLoading={generating}
              >
                <Download className="w-5 h-5 mr-2" />
                Générer et Télécharger
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Aperçu
            </h3>
            <div className="bg-gray-100 rounded-lg p-8 overflow-auto">
              {renderPreview()}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
