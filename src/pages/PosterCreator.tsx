import Navbar from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Template } from '@/types/database'
import html2canvas from 'html2canvas'
import { ArrowLeft, Download, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function PosterCreator() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [template, setTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (templateId) {
      fetchTemplate()
    }
  }, [templateId])

  // Calculate formulas
  useEffect(() => {
    if (!template) return

    const derivedUpdates: Record<string, any> = {}
    let hasUpdates = false

    template.champs_config.forEach((field: any) => {
      if (field.formula) {
        try {
          // Build list of valid field names
          const validFields = template.champs_config.map((f: any) => f.name)

          const expression = field.formula.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (match: string) => {
             // Only replace if it's a known field
             if (validFields.includes(match)) {
                 const val = formData[match]
                 return val ? parseFloat(val) : 0
             }
             // Otherwise return match as is (e.g. "toFixed", "Math", etc)
             return match
          })

          // Safe eval using Function
          // Allow numbers, math ops, parens, whitespace, dot, and method names (letters)
          if (/^[0-9+\-*/().\sa-zA-Z_,]+$/.test(expression)) {
              // eslint-disable-next-line no-new-func
              const rawResult = new Function(`return ${expression}`)()
              
              let resultStr = ''

              if (typeof rawResult === 'number') {
                  if (isNaN(rawResult) || !isFinite(rawResult)) return
                  resultStr = Number.isInteger(rawResult) ? rawResult.toString() : rawResult.toFixed(2)
              } else if (typeof rawResult === 'string') {
                  // If formula returned a string (e.g. from toFixed), use it if it looks like a number
                  if (rawResult.trim() === '' || isNaN(parseFloat(rawResult))) return
                  resultStr = rawResult
              }

              if (resultStr !== '' && formData[field.name] !== resultStr) {
                  derivedUpdates[field.name] = resultStr
                  hasUpdates = true
              }
          }
        } catch (e) {
           // ignore eval errors
        }
      }
    })

    if (hasUpdates) {
       setFormData(prev => ({ ...prev, ...derivedUpdates }))
    }
  }, [formData, template])

  const fetchTemplate = async () => {
    if (!templateId) return
    
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) throw error
      setTemplate(data as Template)

      // Initialize form data
      const initialData: Record<string, any> = {}
      ;(data as Template).champs_config.forEach((field: any) => {
        initialData[field.name] = field.defaultValue !== undefined ? field.defaultValue : ''
      })
      setFormData(initialData)
    } catch (error) {
      console.error('Error fetching template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Workflow step state
  const [step, setStep] = useState<'edit' | 'preview'>('edit')

  // Dimensions state (defaults to template, but can be overridden by CSS or image)
  const [effectiveDimensions, setEffectiveDimensions] = useState<{width: number, height: number} | null>(null)

  // Utility function to extract dimensions from CSS
  const extractDimensionsFromCSS = (css: string): {width: number, height: number} | null => {
    // Try multiple possible container class names
    const possibleClasses = ['poster-container', 'temp-container', 'template-container', 'canvas-container'];
    
    for (const className of possibleClasses) {
      const containerMatch = css.match(new RegExp(`\\.${className}\\s*\\{[^}]*\\}`, 's'));
      if (containerMatch) {
        const containerCSS = containerMatch[0];
        const widthMatch = containerCSS.match(/width:\s*(\d+)px/);
        const heightMatch = containerCSS.match(/height:\s*(\d+)px/);
        
        if (widthMatch && heightMatch) {
          console.log(`[Init] Found dimensions in .${className}:`, {
            width: parseInt(widthMatch[1]),
            height: parseInt(heightMatch[1])
          });
          return {
            width: parseInt(widthMatch[1]),
            height: parseInt(heightMatch[1])
          };
        }
      }
    }
    
    console.log('[Init] No container dimensions found in CSS');
    return null;
  };

  // Initialize dimensions when template loads (prefer CSS dimensions over DB)
  useEffect(() => {
    if (template) {
       // Try to extract from CSS first
       const cssDimensions = extractDimensionsFromCSS(template.css_styles || '');
       if (cssDimensions) {
         console.log('[Init] Using CSS dimensions:', cssDimensions);
         setEffectiveDimensions(cssDimensions);
       } else {
         console.log('[Init] Using DB dimensions:', { width: template.largeur, height: template.hauteur });
         setEffectiveDimensions({ width: template.largeur, height: template.hauteur });
       }
    }
  }, [template])

  // Auto-detect dimensions from referenced image (only in preview mode)
  useEffect(() => {
      if (!template || step !== 'preview') {
          console.log('[AutoDim] Skipping - not in preview mode or no template');
          return;
      }
      
      const checkDimensions = () => {
          const previewDiv = document.getElementById('poster-preview');
          if (!previewDiv) {
              console.warn('[AutoDim] Preview div not found - DOM may not be ready yet');
              return;
          }

          // Look for image with data-auto-dimension attribute
          const autoImg = previewDiv.querySelector('img[data-auto-dimension]') as HTMLImageElement;
          if (autoImg) {
              console.log('[AutoDim] Auto-dimension image found:', autoImg.src);
              
              const updateSize = () => {
                  console.log('[AutoDim] Image loaded. Natural size:', autoImg.naturalWidth, 'x', autoImg.naturalHeight);
                  if (autoImg.naturalWidth > 0 && autoImg.naturalHeight > 0) {
                      setEffectiveDimensions(prev => {
                          if (prev?.width === autoImg.naturalWidth && prev?.height === autoImg.naturalHeight) {
                              console.log('[AutoDim] Dimensions unchanged, skipping update');
                              return prev;
                          }
                          console.log('[AutoDim] Updating effective dimensions to:', autoImg.naturalWidth, 'x', autoImg.naturalHeight);
                          return {
                              width: autoImg.naturalWidth,
                              height: autoImg.naturalHeight
                          };
                      });
                  } else {
                      console.warn('[AutoDim] Image has 0 dimensions');
                  }
              };

              if (autoImg.complete) {
                  updateSize();
              } else {
                  console.log('[AutoDim] Waiting for image load...');
                  autoImg.onload = updateSize;
              }
          } else {
              console.log('[AutoDim] No image with data-auto-dimension attribute found.');
          }
      };

      // Check after a short delay to ensure DOM render
      const timer = setTimeout(checkDimensions, 500);
      return () => clearTimeout(timer);
  }, [formData, template, step]); // Re-run if content changes or step changes

  const handleGenerate = async () => {
    if (!template || !user) {
        console.error('[Generate] Missing template or user');
        return;
    }
    
    // Use current effective dimensions or fallback
    const dims = effectiveDimensions || { width: template.largeur, height: template.hauteur };
    console.log('[Generate] Starting generation with dimensions:', dims);

    setGenerating(true)
    try {
      const element = document.getElementById('poster-preview')
      if (!element) {
          console.error('[Generate] Preview element not found');
          return;
      }

      console.log('[Generate] calling html2canvas...');
      const canvas = await html2canvas(element, {
        scale: 2, // Resolution multiplier (2 = 2x dimensions)
        width: dims.width,
        height: dims.height,
        windowWidth: dims.width, // Ensure virtual window is large enough
        windowHeight: dims.height, // Ensure virtual window is large enough
        backgroundColor: '#ffffff',
        logging: true, // Enable html2canvas internal logging
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
            console.log('[Generate] onclone triggered');
            const clonedElement = clonedDoc.getElementById('poster-preview')
            if (clonedElement) {
                clonedElement.style.transform = 'none'
                clonedElement.style.margin = '0'
                clonedElement.style.padding = '0'
                clonedElement.style.border = 'none'
                clonedElement.style.position = 'absolute'
                clonedElement.style.top = '0'
                clonedElement.style.left = '0'
                
                // Force explicit size on clone to be sure
                clonedElement.style.width = `${dims.width}px`
                clonedElement.style.height = `${dims.height}px`
                
                // Also force first child to fill
                const firstChild = clonedElement.firstElementChild as HTMLElement;
                if (firstChild) {
                    firstChild.style.width = '100%'
                    firstChild.style.height = '100%'
                    firstChild.style.margin = '0'
                    firstChild.style.boxSizing = 'border-box'
                }
                
                console.log('[Generate] Cloned element styles reset. Width/Height forced to:', dims.width, dims.height);
            }
        }
      })
      console.log('[Generate] html2canvas completed. Canvas size:', canvas.width, 'x', canvas.height);

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
            console.error('[Generate] Blob creation failed');
            return;
        }
        console.log('[Generate] Blob created, size:', blob.size);

        // Save to database
        await supabase.from('visuels_generes').insert({
          template_id: template.id,
          user_id: user.id,
          contenu_json: formData,
          format_export: 'png',
          largeur: dims.width,
          hauteur: dims.height,
          taille_fichier: blob.size,
        } as any)

        // Download
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `aeemci-${template.nom.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
        link.click()
        URL.revokeObjectURL(url)

        setGenerating(false)
      }, 'image/png')
    } catch (error) {
      console.error('Error generating poster:', error)
      setGenerating(false)
    }
  }

  const renderPreview = () => {
    if (!template) {
      console.warn('[Preview] No template available');
      return null;
    }

    // Validate template has required content
    if (!template.html_structure || !template.css_styles) {
      console.error('[Preview] Template missing HTML or CSS', {
        hasHTML: !!template.html_structure,
        hasCSS: !!template.css_styles
      });
      return (
        <div className="flex items-center justify-center h-64 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-2">Template invalide</p>
            <p className="text-red-500 text-sm">Le template ne contient pas de structure HTML ou CSS.</p>
          </div>
        </div>
      );
    }

    // Use effective dimensions or fallback to template defaults
    const width = effectiveDimensions?.width || template.largeur;
    const height = effectiveDimensions?.height || template.hauteur;

    // Safety check: ensure dimensions are valid numbers
    if (!width || !height || width <= 0 || height <= 0) {
      console.error('[Preview] Invalid dimensions:', { width, height, effectiveDimensions });
      return (
        <div className="flex items-center justify-center h-64 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <div className="text-center">
            <p className="text-yellow-600 font-semibold mb-2">Dimensions invalides</p>
            <p className="text-yellow-500 text-sm">Les dimensions du template ne sont pas valides.</p>
          </div>
        </div>
      );
    }

    console.log('[Preview] Rendering with dimensions:', { width, height, effectiveDimensions, template: { w: template.largeur, h: template.hauteur } });

    // Replace template variables with form data
    let htmlContent = template.html_structure;
    Object.entries(formData).forEach(([key, value]) => {
        const replaced = htmlContent.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value || '');
        if (replaced !== htmlContent) {
          console.log(`[Preview] Replaced {{${key}}} with:`, value);
        }
        htmlContent = replaced;
    });
    
    // Prepare CSS - let template define its own container dimensions
    const cssContent = template.css_styles || '';
    const styleTag = `
      <style>
        ${cssContent}
        
        /* Ensure specific container classes fill the calculated canvas area */
        .poster-container, .temp-container, .template-container, .canvas-container {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            box-sizing: border-box !important;
        }

        /* HARD FIX: Force the first div inside poster-preview to fill it */
        #poster-preview > div {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            box-sizing: border-box !important;
        }
      </style>
    `;

    console.log('[Preview] HTML length:', htmlContent.length, 'CSS length:', cssContent.length);

    // Use effective dimensions (already extracted from CSS or auto-detected)
    const actualWidth = width;
    const actualHeight = height;

    const scale = 0.5; // Scale factor for preview display
    const scaledWidth = actualWidth * scale;
    const scaledHeight = actualHeight * scale;

    console.log('[Preview] Using dimensions:', { 
      actualWidth, 
      actualHeight, 
      scaledWidth, 
      scaledHeight, 
      scale 
    });

    return (
      <div
        id="poster-preview"
        style={{
          width: `${actualWidth}px`,
          height: `${actualHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'relative',
        }}
        className="bg-white shadow-2xl"
      >
        <div dangerouslySetInnerHTML={{ __html: styleTag + htmlContent }} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Template non trouvé</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
            <Button
            variant="ghost"
            onClick={() => {
                if (step === 'preview') {
                    setStep('edit')
                } else {
                    navigate(-1)
                }
            }}
            >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 'preview' ? 'Retour à la modification' : 'Retour'}
            </Button>
            
            {step === 'edit' && (
                 <h2 className="text-2xl font-bold text-gray-900">
                    {template.nom} (Édition)
                </h2>
            )}
             {step === 'preview' && (
                 <h2 className="text-2xl font-bold text-gray-900">
                    Prévisualisation
                </h2>
            )}
             <div /> {/* Spacer */}
        </div>

        {step === 'edit' && (
             <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                {template.champs_config.map((field: any) => {
                    const isReadOnly = !!field.formula || field.readOnly;
                    
                    if (field.type === 'textarea') {
                    return (
                        <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                            {isReadOnly && <span className="text-xs text-blue-500 ml-2">{field.formula ? '(Calculé)' : '(Lecture seule)'}</span>}
                        </label>
                        <textarea
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            maxLength={field.maxLength}
                            readOnly={isReadOnly}
                            rows={4}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${isReadOnly ? 'bg-gray-100 text-gray-500' : ''}`}
                        />
                         {field.maxLength && (
                            <p className="text-xs text-gray-500 mt-1">
                            {(formData[field.name] || '').length} / {field.maxLength}
                            </p>
                        )}
                        </div>
                    )
                    }

                    return (
                    <Input
                        key={field.name}
                        type={field.type}
                        label={
                            <span>
                                {field.label}
                                {isReadOnly && <span className="text-xs text-blue-500 ml-2">{field.formula ? '(Calculé)' : '(Lecture seule)'}</span>}
                            </span> as any
                        }
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        readOnly={isReadOnly}
                        className={isReadOnly ? 'bg-gray-100 text-gray-500' : ''}
                        helperText={
                        field.maxLength
                            ? `${(formData[field.name] || '').length} / ${field.maxLength}`
                            : undefined
                        }
                    />
                    )
                })}
                
                <div className="pt-6 border-t border-gray-200 flex justify-end">
                     <Button
                        onClick={() => setStep('preview')}
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualiser l'affiche
                    </Button>
                </div>
                </div>
            </div>
        )}

        {step === 'preview' && (
             <div className="space-y-6">
                <div className="flex justify-center gap-4">
                     <Button
                        variant="outline"
                        onClick={() => setStep('edit')}
                        size="lg"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Modifier les informations
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        size="lg"
                    >
                        {generating ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Génération...
                        </>
                        ) : (
                        <>
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger l'affiche
                        </>
                        )}
                    </Button>
                </div>

                {/* Dimension Info */}
                {template && (
                    <div className="text-center text-sm text-gray-600">
                        <p>
                            Dimensions du canvas: {effectiveDimensions?.width || template.largeur} × {effectiveDimensions?.height || template.hauteur} px
                            {effectiveDimensions && (effectiveDimensions.width !== template.largeur || effectiveDimensions.height !== template.hauteur) && (
                                <span className="ml-2 text-blue-600">(auto-détecté)</span>
                            )}
                        </p>
                    </div>
                )}

                <div className="border border-gray-200 rounded-lg bg-gray-100 p-8 overflow-auto flex justify-center min-h-[600px]">
                    {renderPreview()}
                </div>
            </div>
        )}
      </main>
    </div>
  )
}
