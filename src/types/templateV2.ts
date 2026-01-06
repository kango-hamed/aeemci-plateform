/**
 * Types for Template Editor V2 - "Trace & Place" functionality
 */

export type AssetType = 'background' | 'logo' | 'icon' | 'decoration'
export type LayerType = 'image' | 'text'
export type FieldType = 'text' | 'textarea' | 'date' | 'time' | 'number' | 'select'

/**
 * Uploaded asset with categorization
 */
export interface Asset {
  id: string
  file: File
  url: string
  name: string
  type: AssetType
  width: number
  height: number
  size: number
  autoDetected: boolean
  priority: number
}

/**
 * Layer in the template canvas
 */
export interface Layer {
  id: string
  type: LayerType
  asset?: string // Asset ID for image layers
  dynamic?: boolean // True for text fields that will be filled by users
  fieldName?: string // Reference to field config
  position: { x: number; y: number }
  size: { width: number; height: number }
  style?: TextStyle
  locked?: boolean
  autoPlaced?: boolean
  confidence?: number // Confidence score for auto-placement (0-1)
  zIndex: number
}

/**
 * Text styling options
 */
export interface TextStyle {
  fontFamily: string
  fontSize: number
  color: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: number
  fontWeight?: number
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through'
}

/**
 * Field configuration for dynamic content
 */
export interface FieldConfigV2 {
  name: string
  label: string
  type: FieldType
  required: boolean
  maxLength?: number
  placeholder?: string
  options?: string[]
  layerId: string // Reference to the layer this field controls
}

/**
 * Detected text zone from OCR
 */
export interface DetectedZone {
  text: string
  bbox: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
  suggestedType: FieldType
  suggestedName?: string
}

/**
 * Reference image for "Trace & Place"
 */
export interface ReferenceImage {
  url: string
  dimensions: {
    width: number
    height: number
  }
  opacity: number // 0-1 for overlay transparency
}

/**
 * Complete Template V2 structure
 */
export interface TemplateV2 {
  id?: string
  name: string
  description?: string
  type: string // Content type ID
  reference: ReferenceImage
  layers: Layer[]
  fields: FieldConfigV2[]
  metadata: {
    createdBy?: string
    createdAt?: string
    updatedAt?: string
    method: 'trace-and-place' | 'manual'
    totalTime?: string
    assetsCount: number
    autoPlacedCount: number
    manualPlacedCount: number
  }
  // Legacy fields for compatibility with existing database
  width: number
  height: number
  format: string
  active: boolean
}

/**
 * Editor state
 */
export interface EditorState {
  template: TemplateV2
  assets: Asset[]
  selectedLayerId: string | null
  referenceOpacity: number
  isDirty: boolean
  history: TemplateV2[]
  historyIndex: number
}

/**
 * Snap suggestion for magnetic positioning
 */
export interface SnapSuggestion {
  position: { x: number; y: number }
  confidence: number
  reason: 'edge' | 'center' | 'grid' | 'similar-shape'
}
