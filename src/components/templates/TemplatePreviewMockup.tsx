import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useTemplatePreview } from '@/hooks/useTemplatePreview';
import { TemplatePreviewRenderer } from './TemplatePreviewRenderer';
import iPhoneMockup from '@/assets/mockup/iPhone15.webp';

interface TemplatePreviewMockupProps {
  templateId?: string | null;
  previewImageUrl?: string | null;
  templateName: string;
  isLoading?: boolean;
}

export const TemplatePreviewMockup: React.FC<TemplatePreviewMockupProps> = ({
  templateId,
  previewImageUrl,
  templateName,
  isLoading = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Carregar dados do template para preview real
  const { data: templateData, isLoading: loadingTemplate } = useTemplatePreview(templateId || null);

  useEffect(() => {
    setImageLoaded(false);
  }, [previewImageUrl]);

  return (
    <div className="relative w-full max-w-[320px] mx-auto">
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
            
            {isLoading || loadingTemplate ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : templateData ? (
              // Preview REAL do template usando dados do banco (zoom 60%)
              <div className="template-preview-container">
                <TemplatePreviewRenderer templateData={templateData} />
              </div>
            ) : previewImageUrl ? (
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
