import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import type { ContentType, Template, TemplateUpdate } from '@/types/database'
import { Edit, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (templatesError) throw templatesError

      // Fetch content types
      const { data: typesData, error: typesError } = await supabase
        .from('types_contenus')
        .select('*')
        .order('ordre')

      if (typesError) throw typesError

      setTemplates((templatesData as Template[]) || [])
      setContentTypes((typesData as ContentType[]) || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTemplateStatus = async (id: string, currentStatus: boolean) => {
    try {
      const updateData: TemplateUpdate = { actif: !currentStatus }
      const { error } = await supabase
        .from('templates')
        .update(updateData as any)
        .eq('id', id)

      if (error) throw error
      
      fetchData()
    } catch (error) {
      console.error('Error toggling template status:', error)
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      fetchData()
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const filteredTemplates = filter === 'all'
    ? templates
    : templates.filter(t => t.type_contenu_id === filter)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600 mt-2">Gérer les templates d'affiches</p>
        </div>
        <Link to="/admin/templates/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Template
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Tous ({templates.length})
        </button>
        {contentTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setFilter(type.id)}
            className={`px-4 py-2 rounded-lg ${
              filter === type.id
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            {type.nom} ({templates.filter(t => t.type_contenu_id === type.id).length})
          </button>
        ))}
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Aucun template trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => {
            const contentType = contentTypes.find(t => t.id === template.type_contenu_id)
            
            return (
              <div
                key={template.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Preview */}
                <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  {template.preview_url ? (
                    <img
                      src={template.preview_url}
                      alt={template.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      <p className="text-sm">Pas d'aperçu</p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{template.nom}</h3>
                      <p className="text-sm text-gray-500">{contentType?.nom}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        template.actif
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {template.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {template.description || 'Aucune description'}
                  </p>

                  <div className="text-xs text-gray-500 mb-4">
                    {template.largeur} × {template.hauteur}px • {template.format}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/templates/${template.id}/edit`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-1" />
                        Éditer
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTemplateStatus(template.id, template.actif)}
                    >
                      {template.actif ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
