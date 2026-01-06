import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import type { ContentType, Template, TemplateInsert, TemplateUpdate } from '@/types/database'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = id !== 'new'

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    type_contenu_id: '',
    html_structure: '',
    css_styles: '',
    champs_config: '[]',
    largeur: 1080,
    hauteur: 1080,
    format: 'square' as const,
    actif: true,
  })

  useEffect(() => {
    fetchContentTypes()
    if (isEditing) {
      fetchTemplate()
    }
  }, [id])

  const fetchContentTypes = async () => {
    const { data } = await supabase
      .from('types_contenus')
      .select('*')
      .order('ordre')
    
    setContentTypes((data as ContentType[]) || [])
  }

  const fetchTemplate = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      const template = data as Template
      setFormData({
        nom: template.nom,
        description: template.description || '',
        type_contenu_id: template.type_contenu_id,
        html_structure: template.html_structure,
        css_styles: template.css_styles,
        champs_config: JSON.stringify(template.champs_config, null, 2),
        largeur: template.largeur,
        hauteur: template.hauteur,
        format: template.format as any,
        actif: template.actif,
      })
    } catch (error) {
      console.error('Error fetching template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Parse and validate JSON
      let champsConfig
      try {
        champsConfig = JSON.parse(formData.champs_config)
      } catch {
        alert('Configuration des champs invalide (JSON)')
        setSaving(false)
        return
      }

      const templateData: TemplateInsert = {
        type_contenu_id: formData.type_contenu_id,
        nom: formData.nom,
        description: formData.description,
        html_structure: formData.html_structure,
        css_styles: formData.css_styles,
        champs_config: champsConfig,
        largeur: formData.largeur,
        hauteur: formData.hauteur,
        format: formData.format,
        actif: formData.actif,
        ordre: 0,
        preview_url: null,
        created_by: null,
      }

      if (isEditing && id) {
        const updateData: TemplateUpdate = {
          nom: formData.nom,
          description: formData.description,
          type_contenu_id: formData.type_contenu_id,
          html_structure: formData.html_structure,
          css_styles: formData.css_styles,
          champs_config: champsConfig,
          largeur: formData.largeur,
          hauteur: formData.hauteur,
          format: formData.format,
          actif: formData.actif,
        }
        const { error } = await supabase
          .from('templates')
          .update(updateData as any)
          .eq('id', id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('templates')
          .insert(templateData as any)

        if (error) throw error
      }

      navigate('/admin/templates')
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/templates')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux templates
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Éditer le Template' : 'Nouveau Template'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de base</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom du template"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              placeholder="Ex: Annonce Moderne"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de contenu <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type_contenu_id}
                onChange={(e) => setFormData({ ...formData, type_contenu_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sélectionner un type</option>
                {contentTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.nom}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du template"
              />
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dimensions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Largeur (px)"
              type="number"
              value={formData.largeur}
              onChange={(e) => setFormData({ ...formData, largeur: parseInt(e.target.value) })}
              required
            />

            <Input
              label="Hauteur (px)"
              type="number"
              value={formData.hauteur}
              onChange={(e) => setFormData({ ...formData, hauteur: parseInt(e.target.value) })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="square">Carré</option>
                <option value="story">Story</option>
                <option value="landscape">Paysage</option>
              </select>
            </div>
          </div>
        </div>

        {/* HTML Structure */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Structure HTML</h2>
          <textarea
            value={formData.html_structure}
            onChange={(e) => setFormData({ ...formData, html_structure: e.target.value })}
            required
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="<div>...</div>"
          />
          <p className="text-sm text-gray-500 mt-2">
            Utilisez {'{{'} et {'}}'}  pour les variables dynamiques (ex: {'{{'} titre {'}}'})
          </p>
        </div>

        {/* CSS Styles */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Styles CSS</h2>
          <textarea
            value={formData.css_styles}
            onChange={(e) => setFormData({ ...formData, css_styles: e.target.value })}
            required
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder=".class { ... }"
          />
        </div>

        {/* Fields Configuration */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration des champs (JSON)</h2>
          <textarea
            value={formData.champs_config}
            onChange={(e) => setFormData({ ...formData, champs_config: e.target.value })}
            required
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder='[{"name": "titre", "label": "Titre", "type": "text", "required": true}]'
          />
          <p className="text-sm text-gray-500 mt-2">
            Format: tableau JSON avec name, label, type, required, maxLength, placeholder
          </p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.actif}
              onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
              className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-gray-900 font-medium">Template actif</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" isLoading={saving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Mettre à jour' : 'Créer le template'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/templates')}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
