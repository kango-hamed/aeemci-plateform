/**
 * Asset Detection and Categorization
 * Automatically categorizes uploaded assets based on their properties
 */

import type { Asset, AssetType } from '@/types/templateV2';

/**
 * Analyze an image file and return its dimensions
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * Check if a ratio is near one of the target ratios
 */
function isRatioNear(ratio: number, targets: number[], tolerance = 0.2): boolean {
  return targets.some(target => Math.abs(ratio - target) <= tolerance)
}

/**
 * Categorize an asset based on its properties
 */
export async function categorizeAsset(file: File): Promise<Omit<Asset, 'id' | 'url'>> {
  const { width, height } = await getImageDimensions(file)
  const size = file.size
  const ratio = width / height
  const isSVG = file.type === 'image/svg+xml'
  
  let type: AssetType
  let priority: number
  
  // Background: large image (>= 1000x1000)
  if (width >= 1000 && height >= 1000) {
    type = 'background'
    priority = 1
  }
  // Logo: ratio close to 1:1 or 2:1, medium size
  else if (isRatioNear(ratio, [1, 2]) && size < 500000) {
    type = 'logo'
    priority = 2
  }
  // Icon: small image or SVG
  else if ((width < 100 || isSVG) && size < 50000) {
    type = 'icon'
    priority = 4
  }
  // Decoration: everything else
  else {
    type = 'decoration'
    priority = 3
  }
  
  return {
    file,
    name: file.name,
    type,
    width,
    height,
    size,
    autoDetected: true,
    priority
  }
}

/**
 * Categorize multiple assets and sort by priority
 */
export async function categorizeAssets(files: File[]): Promise<Omit<Asset, 'id' | 'url'>[]> {
  const categorized = await Promise.all(files.map(categorizeAsset))
  return categorized.sort((a, b) => a.priority - b.priority)
}

/**
 * Validate if a file is a valid image
 */
export function isValidImage(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * Filter and validate image files
 */
export function filterValidImages(files: File[]): File[] {
  return files.filter(isValidImage)
}
