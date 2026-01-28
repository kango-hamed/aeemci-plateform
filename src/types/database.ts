export interface Database {
  public: {
    Tables: {
      types_contenus: {
        Row: {
          id: string
          nom: string
          description: string | null
          icone: string | null
          ordre: number
          actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['types_contenus']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['types_contenus']['Row'], 'id' | 'created_at' | 'updated_at'>> | Record<string, any>
      }
      templates: {
        Row: {
          id: string
          type_contenu_id: string
          nom: string
          description: string | null
          html_structure: string
          css_styles: string
          champs_config: FieldConfig[]
          preview_url: string | null
          largeur: number
          hauteur: number
          format: string
          actif: boolean
          ordre: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['templates']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['templates']['Row'], 'id' | 'created_at' | 'updated_at'>> | Record<string, any>
      }
      visuels_generes: {
        Row: {
          id: string
          template_id: string | null
          user_id: string | null
          contenu_json: Record<string, any>
          image_url: string | null
          format_export: string
          largeur: number | null
          hauteur: number | null
          taille_fichier: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['visuels_generes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['visuels_generes']['Insert']>
      }
      user_profiles: {
        Row: {
          id: string
          nom_complet: string | null
          delegation: string | null
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
    }
  }
}

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'time' | 'number' | 'select'
  required: boolean
  maxLength?: number
  placeholder?: string
  options?: string[]
  formula?: string // Expression like "(f1 / f2) * 100"
  defaultValue?: string | number
  readOnly?: boolean
}


export type ContentType = Database['public']['Tables']['types_contenus']['Row']
export type Template = Database['public']['Tables']['templates']['Row']
export type GeneratedVisual = Database['public']['Tables']['visuels_generes']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

// Helper types for Supabase operations
export type TemplateInsert = Database['public']['Tables']['templates']['Insert']
export type TemplateUpdate = Database['public']['Tables']['templates']['Update']
export type ContentTypeUpdate = Database['public']['Tables']['types_contenus']['Update']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
