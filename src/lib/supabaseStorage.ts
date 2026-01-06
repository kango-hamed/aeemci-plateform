/**
 * Supabase Storage helpers for template assets
 */

import { supabase } from './supabase';

const BUCKET_NAME = 'template-assets'

/**
 * Upload an asset file to Supabase Storage
 */
export async function uploadAsset(
  file: File,
  path: string
): Promise<{ url: string; path: string }> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Failed to upload asset: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path
  }
}

/**
 * Upload multiple assets
 */
export async function uploadAssets(
  files: File[],
  templateId: string
): Promise<Array<{ file: File; url: string; path: string }>> {
  const uploads = files.map(async (file, index) => {
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const path = `${templateId}/${timestamp}-${index}.${extension}`
    
    const result = await uploadAsset(file, path)
    
    return {
      file,
      ...result
    }
  })

  return Promise.all(uploads)
}

/**
 * Delete an asset from storage
 */
export async function deleteAsset(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path])

  if (error) {
    throw new Error(`Failed to delete asset: ${error.message}`)
  }
}

/**
 * Delete multiple assets
 */
export async function deleteAssets(paths: string[]): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(paths)

  if (error) {
    throw new Error(`Failed to delete assets: ${error.message}`)
  }
}

/**
 * Get public URL for an asset
 */
export function getAssetUrl(path: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * List all assets for a template
 */
export async function listTemplateAssets(templateId: string): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(templateId)

  if (error) {
    throw new Error(`Failed to list assets: ${error.message}`)
  }

  return data.map(file => `${templateId}/${file.name}`)
}
