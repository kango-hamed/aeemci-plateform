/**
 * Template Editor V2 - Main Page
 * "Trace & Place" editor with asset import and canvas
 */

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { uploadAssets } from '@/lib/supabaseStorage'
import type { Asset, EditorState } from '@/types/templateV2'
import { ArrowLeft, Save } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AssetLibrary } from './AssetLibrary'
import { AssetUpload } from './AssetUpload'

export default function TemplateEditorV2() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [editorState, setEditorState] = useState<EditorState>({
    template: {
      name: '',
      type: '',
      reference: {
        url: '',
        dimensions: { width: 1080, height: 1080 },
        opacity: 0.5
      },
      layers: [],
      fields: [],
      metadata: {
        method: 'trace-and-place',
        assetsCount: 0,
        autoPlacedCount: 0,
        manualPlacedCount: 0
      },
      width: 1080,
      height: 1080,
      format: 'square',
      active: false
    },
    assets: [],
    selectedLayerId: null,
    referenceOpacity: 0.5,
    isDirty: false,
    history: [],
    historyIndex: -1
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleAssetsAdded = async (newAssets: Omit<Asset, 'id' | 'url'>[]) => {
    try {
      // Generate temporary template ID if new
      const templateId = id || `temp-${Date.now()}`

      // Upload assets to Supabase Storage
      const uploaded = await uploadAssets(
        newAssets.map(a => a.file),
        templateId
      )

      // Create Asset objects with IDs and URLs
      const assetsWithUrls: Asset[] = uploaded.map((upload, index) => ({
        ...newAssets[index],
        id: `asset-${Date.now()}-${index}`,
        url: upload.url
      }))

      setEditorState(prev => ({
        ...prev,
        assets: [...prev.assets, ...assetsWithUrls],
        isDirty: true,
        template: {
          ...prev.template,
          metadata: {
            ...prev.template.metadata,
            assetsCount: prev.assets.length + assetsWithUrls.length
          }
        }
      }))
    } catch (error) {
      console.error('Error uploading assets:', error)
      alert('Erreur lors de l\'upload des assets')
    }
  }

  const handleRemoveAsset = (assetId: string) => {
    setEditorState(prev => ({
      ...prev,
      assets: prev.assets.filter(a => a.id !== assetId),
      isDirty: true,
      template: {
        ...prev.template,
        metadata: {
          ...prev.template.metadata,
          assetsCount: prev.assets.length - 1
        }
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement save to database
      console.log('Saving template:', editorState.template)
      alert('Sauvegarde non encore implémentée')
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const canProceedToCanvas = editorState.assets.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/templates')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Éditer le Template' : 'Nouveau Template V2'}
                </h1>
                <p className="text-sm text-gray-500">Mode "Trace & Place"</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving || !editorState.isDirty}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Asset Management */}
          <div className="col-span-3 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">📤 Import Assets</h2>
              <AssetUpload onAssetsAdded={handleAssetsAdded} />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                🖼️ Assets Importés ({editorState.assets.length})
              </h2>
              <AssetLibrary
                assets={editorState.assets}
                onRemoveAsset={handleRemoveAsset}
              />
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="col-span-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">🎨 Canvas</h2>
              
              {!canProceedToCanvas ? (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-medium">Importez des assets pour commencer</p>
                    <p className="text-sm mt-2">Glissez vos fichiers dans la zone d'upload</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-medium">Canvas - En développement</p>
                    <p className="text-sm mt-2">Phase 2: Drag & drop et positionnement</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Configuration */}
          <div className="col-span-3 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">⚙️ Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du template
                  </label>
                  <Input
                    value={editorState.template.name}
                    onChange={(e) => setEditorState(prev => ({
                      ...prev,
                      template: { ...prev.template, name: e.target.value },
                      isDirty: true
                    }))}
                    placeholder="Ex: Hadith du Jour"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={editorState.template.width}
                      onChange={(e) => setEditorState(prev => ({
                        ...prev,
                        template: { ...prev.template, width: parseInt(e.target.value) },
                        isDirty: true
                      }))}
                      placeholder="Largeur"
                    />
                    <Input
                      type="number"
                      value={editorState.template.height}
                      onChange={(e) => setEditorState(prev => ({
                        ...prev,
                        template: { ...prev.template, height: parseInt(e.target.value) },
                        isDirty: true
                      }))}
                      placeholder="Hauteur"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">📊 Statistiques</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Assets: {editorState.template.metadata.assetsCount}</p>
                    <p>Layers: {editorState.template.layers.length}</p>
                    <p>Champs: {editorState.template.fields.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium">💡 Phase 1 Complète</p>
              <p className="text-xs text-blue-700 mt-1">
                Import et gestion des assets fonctionnels. Phase 2 (Canvas) en cours de développement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
