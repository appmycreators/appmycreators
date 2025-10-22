import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useTemplatePreview } from '@/hooks/useTemplatePreview';
import { TemplatePreviewRenderer } from './TemplatePreviewRenderer';
import iPhoneMockup from '@/assets/mockup/iPhone15.webp';

interface TemplatePreviewMockupProps {
  templateId?: string | null;
  previewImageUrl?: string | null;
  templateName: string;
  isLoading?: boolean;
  /** 
   * Se true, prioriza preview_image_url (mais leve). 
   * Se preview_image_url não existir, carrega dados do banco como fallback.
   * Se false, sempre carrega preview real do banco.
   */
  useLightweightPreview?: boolean;
}

export const TemplatePreviewMockup: React.FC<TemplatePreviewMockupProps> = ({
  templateId,
  previewImageUrl,
  templateName,
  isLoading = false,
  useLightweightPreview = true, // Por padrão usa preview leve
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Intersection Observer para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Desconectar após carregar
        }
      },
      {
        rootMargin: '100px', // Começa a carregar 100px antes de entrar na viewport
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);
  
  // Carregar dados do template para preview real
  // Se useLightweightPreview=true E tem preview_image_url, não carrega dados
  // Se useLightweightPreview=true MAS NÃO tem preview_image_url, carrega dados como fallback
  const shouldLoadFullData = isInView && (
    !useLightweightPreview || !previewImageUrl
  );
  const { data: templateData, isLoading: loadingTemplate } = useTemplatePreview(
    shouldLoadFullData ? (templateId || null) : null
  );

  useEffect(() => {
    setImageLoaded(false);
  }, [previewImageUrl]);

  return (
    <div ref={containerRef} className="relative w-full max-w-[320px] mx-auto">
      {/* iPhone Mockup Frame */}
      <div className="relative">
        <img
          src={iPhoneMockup}
          alt="iPhone Mockup"
          className="w-full h-auto relative z-10 pointer-events-none"
        />
        
        {/* Content Area (scrollable) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{
            top: '3.0%',
            bottom: '3.0%',
            left: '7.5%',
            right: '7.5%',
            borderRadius: '18px',
          }}
        >
          <div 
            className="w-full h-full overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style>
              {`
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .template-preview-container {
                  zoom: 0.6;
                  -moz-transform: scale(0.6);
                  -moz-transform-origin: top center;
                }
              `}
            </style>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : !isInView ? (
              // Placeholder enquanto não está visível
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-slate-300 text-xs">Carregando...</div>
              </div>
            ) : loadingTemplate ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : previewImageUrl ? (
              // Preview com imagem est\u00e1tica (MAIS LEVE)
              <>
                {!imageLoaded && (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                )}
                <img
                  src={previewImageUrl}
                  alt={`Preview de ${templateName}`}
                  className={`w-full h-auto object-cover ${imageLoaded ? 'block' : 'hidden'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                />
              </>
            ) : templateData ? (
              // Preview REAL do template usando dados do banco (zoom 60%)
              <div className="template-preview-container">
                <TemplatePreviewRenderer templateData={templateData} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-br from-slate-100 to-slate-200">
                <div className="bg-white rounded-2xl p-8 shadow-lg max-w-[240px]">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-sm text-slate-800 font-semibold mb-2">{templateName}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-4">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Clique em "Usar este template" para criar sua página e personalizá-la
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
