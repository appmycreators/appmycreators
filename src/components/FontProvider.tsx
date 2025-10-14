import { useEffect } from 'react';

interface FontProviderProps {
  fontFamily?: string | null;
  children: React.ReactNode;
}

// Mapeamento das fontes para classes CSS
const FONT_CLASS_MAP: Record<string, string> = {
  'Inter': 'font-inter',
  'Roboto': 'font-roboto', 
  'Open Sans': 'font-opensans',
  'Poppins': 'font-sans', // Padrão do Tailwind
  'Montserrat': 'font-montserrat',
};

// Mapeamento das fontes para CSS inline (fallback)
const FONT_FAMILY_MAP: Record<string, string> = {
  'Inter': 'Inter, sans-serif',
  'Roboto': 'Roboto, sans-serif',
  'Open Sans': "'Open Sans', sans-serif", 
  'Poppins': 'Poppins, sans-serif',
  'Montserrat': 'Montserrat, sans-serif',
};

/**
 * FontProvider - Aplica a fonte selecionada pelo usuário na página pública
 * 
 * Funciona de três formas:
 * 1. Adiciona classe CSS no body
 * 2. Injeta CSS global para forçar a fonte em todos os elementos
 * 3. Aplica CSS inline como fallback
 */
const FontProvider = ({ fontFamily, children }: FontProviderProps) => {
  useEffect(() => {
    const body = document.body;
    let styleElement: HTMLStyleElement | null = null;
    
    // Remove todas as classes de fonte anteriores
    Object.values(FONT_CLASS_MAP).forEach(className => {
      body.classList.remove(className);
    });
    
    // Remove estilo inline anterior
    body.style.removeProperty('font-family');
    
    // Remove style element anterior se existir
    const existingStyle = document.getElementById('dynamic-font-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    if (fontFamily && FONT_FAMILY_MAP[fontFamily]) {
      const fontFamilyCSS = FONT_FAMILY_MAP[fontFamily];
      
      // Método 1: Adiciona classe CSS no body
      if (FONT_CLASS_MAP[fontFamily]) {
        body.classList.add(FONT_CLASS_MAP[fontFamily]);
      }
      
      // Método 2: Injeta CSS global para forçar a fonte (mais efetivo)
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-font-style';
      styleElement.textContent = `
        /* Força a fonte em todos os elementos de texto */
        body, body * {
          font-family: ${fontFamilyCSS} !important;
        }
        
        /* Mantém ícones e elementos especiais */
        [class*="lucide"], 
        [class*="icon"], 
        svg,
        .icon {
          font-family: inherit !important;
        }
      `;
      document.head.appendChild(styleElement);
      
      // Método 3: CSS inline como fallback adicional
      body.style.fontFamily = fontFamilyCSS;
    } else {
      // Fonte padrão
      body.classList.add('font-sans');
    }
    
    // Cleanup quando componente desmonta
    return () => {
      Object.values(FONT_CLASS_MAP).forEach(className => {
        body.classList.remove(className);
      });
      body.style.removeProperty('font-family');
      
      // Remove style element
      if (styleElement) {
        styleElement.remove();
      }
      
      const existingStyle = document.getElementById('dynamic-font-style');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      body.classList.add('font-sans'); // Volta para padrão
    };
  }, [fontFamily]);

  return <>{children}</>;
};

export default FontProvider;
