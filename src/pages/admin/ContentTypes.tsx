import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import type { ContentType, ContentTypeUpdate } from '@/types/database'
import { GripVertical, Save } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ContentTypes() {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchContentTypes()
  }, [])

  const fetchContentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('types_contenus')
        .select('*')
        .order('ordre')

      if (error) throw error
      setContentTypes((data as ContentType[]) || [])
    } catch (error) {
      console.error('Error fetching content types:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateContentType = (id: string, field: keyof ContentType, value: any) => {
    setContentTypes(types =>
      types.map(type =>
        type.id === id ? { ...type, [field]: value } : type
      )
    )
  }

  const saveChanges = async () => {
    setSaving(true)
    try {
      for (const type of contentTypes) {
        const updateData: ContentTypeUpdate = {
          nom: type.nom,
          description: type.description,
          actif: type.actif,
          ordre: type.ordre,
        }
        const { error } = await supabase
          .from('types_contenus')
          .update(updateData as any)
          .eq('id', type.id)

        if (error) throw error
      }

      alert('Modifications sauvegardées avec succès')
    } catch (error) {
      console.error('Error saving changes:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Types de Contenus</h1>
          <p className="text-gray-600 mt-2">Gérer les catégories d'affiches</p>
        </div>
        <Button onClick={saveChanges} isLoading={saving}>
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="divide-y divide-gray-200">
            {contentTypes.map((type) => (
              <div key={type.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 text-gray-400 cursor-move">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Nom"
                      value={type.nom}
                      onChange={(e) => updateContentType(type.id, 'nom', e.target.value)}
                    />

                    <Input
                      label="Description"
                      value={type.description || ''}
                      onChange={(e) => updateContentType(type.id, 'description', e.target.value)}
                    />

                    <Input
                      label="Icône"
                      value={type.icone || ''}
                      onChange={(e) => updateContentType(type.id, 'icone', e.target.value)}
                      placeholder="megaphone, document, etc."
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Input
                      label="Ordre"
                      type="number"
                      value={type.ordre}
                      onChange={(e) => updateContentType(type.id, 'ordre', parseInt(e.target.value))}
                      className="w-20"
                    />

                    <label className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        checked={type.actif}
                        onChange={(e) => updateContentType(type.id, 'actif', e.target.checked)}
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Actif</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Astuce:</strong> Modifiez l'ordre pour changer l'affichage sur le dashboard utilisateur.
          Désactivez un type pour le masquer temporairement.
        </p>
      </div>
    </div>
  )
}
