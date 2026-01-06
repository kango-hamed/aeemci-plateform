/**
 * AssetUpload Component
 * Handles multi-file upload with drag-and-drop and automatic categorization
 */

import { categorizeAssets, filterValidImages } from '@/lib/assetDetection'
import type { Asset } from '@/types/templateV2'
import { Upload } from 'lucide-react'
import { useCallback, useState } from 'react'

interface AssetUploadProps {
  onAssetsAdded: (assets: Omit<Asset, 'id' | 'url'>[]) => void
  maxFiles?: number
}

export function AssetUpload({ onAssetsAdded, maxFiles = 20 }: AssetUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsProcessing(true)
    try {
      const fileArray = Array.from(files)
      const validFiles = filterValidImages(fileArray)

      if (validFiles.length === 0) {
        alert('Aucun fichier image valide détecté. Formats acceptés: JPG, PNG, SVG, WebP')
        return
      }

      if (validFiles.length > maxFiles) {
        alert(`Vous ne pouvez uploader que ${maxFiles} fichiers maximum`)
        return
      }

      const categorized = await categorizeAssets(validFiles)
      onAssetsAdded(categorized)
    } catch (error) {
      console.error('Error processing files:', error)
      alert('Erreur lors du traitement des fichiers')
    } finally {
      setIsProcessing(false)
    }
  }, [onAssetsAdded, maxFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }, [handleFiles])

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/svg+xml,image/webp"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-primary-100' : 'bg-gray-200'}
          `}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-primary-600' : 'text-gray-500'}`} />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">
              {isProcessing ? 'Traitement en cours...' : 'Glissez vos fichiers ici'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ou cliquez pour sélectionner (max {maxFiles} fichiers)
            </p>
          </div>

          <div className="text-xs text-gray-400">
            Formats acceptés: JPG, PNG, SVG, WebP
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="font-medium text-blue-900">📦 Détection automatique</p>
          <p className="text-blue-700 text-xs mt-1">
            Les assets seront catégorisés automatiquement
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="font-medium text-green-900">🎯 Organisation intelligente</p>
          <p className="text-green-700 text-xs mt-1">
            Background, logo, icônes, décorations
          </p>
        </div>
      </div>
    </div>
  )
}
