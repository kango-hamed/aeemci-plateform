/**
 * AssetLibrary Component
 * Displays uploaded assets organized by category
 */

import type { Asset, AssetType } from '@/types/templateV2'
import { FileImage, Image, Palette, Sparkles, X } from 'lucide-react'

interface AssetLibraryProps {
  assets: Asset[]
  onRemoveAsset: (assetId: string) => void
  onDragStart?: (asset: Asset) => void
}

const ASSET_TYPE_CONFIG: Record<AssetType, { label: string; icon: typeof Image; color: string }> = {
  background: {
    label: 'Background',
    icon: Image,
    color: 'bg-purple-100 text-purple-700 border-purple-300'
  },
  logo: {
    label: 'Logo',
    icon: Sparkles,
    color: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  icon: {
    label: 'Icônes',
    icon: FileImage,
    color: 'bg-green-100 text-green-700 border-green-300'
  },
  decoration: {
    label: 'Décorations',
    icon: Palette,
    color: 'bg-orange-100 text-orange-700 border-orange-300'
  }
}

export function AssetLibrary({ assets, onRemoveAsset, onDragStart }: AssetLibraryProps) {
  // Group assets by type
  const groupedAssets = assets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = []
    }
    acc[asset.type].push(asset)
    return acc
  }, {} as Record<AssetType, Asset[]>)

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('application/json', JSON.stringify(asset))
    onDragStart?.(asset)
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aucun asset importé</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {(Object.keys(ASSET_TYPE_CONFIG) as AssetType[]).map(type => {
        const assetsOfType = groupedAssets[type] || []
        if (assetsOfType.length === 0) return null

        const config = ASSET_TYPE_CONFIG[type]
        const Icon = config.icon

        return (
          <div key={type} className="space-y-2">
            {/* Category Header */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.color}`}>
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{config.label}</span>
              <span className="ml-auto text-xs opacity-75">
                {assetsOfType.length}
              </span>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-2 gap-2">
              {assetsOfType.map(asset => (
                <div
                  key={asset.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, asset)}
                  className="group relative bg-white border border-gray-200 rounded-lg p-2 hover:border-primary-400 hover:shadow-md transition-all cursor-move"
                >
                  {/* Preview */}
                  <div className="aspect-square bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-2">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="text-xs">
                    <p className="font-medium text-gray-900 truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <p className="text-gray-500">
                      {asset.width} × {asset.height}
                    </p>
                  </div>

                  {/* Auto-detected badge */}
                  {asset.autoDetected && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Auto
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveAsset(asset.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Supprimer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
