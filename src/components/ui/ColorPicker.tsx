import { useState, useCallback, useRef, useEffect } from "react";
import customizeAddIcon from "@/assets/customize_add_icon.png";

/**
 * ColorPicker - Componente unificado para seleção de cores
 * 
 * Substitui as implementações duplicadas encontradas em:
 * - CustomizationModal.tsx (PRESET_COLORS + seletores)
 * - EditHeaderForm.tsx (AVATAR_BORDER_COLORS)
 * - AddFormModal.tsx (seletores inline)
 * - GalleryItemForm.tsx (seletores de cor)
 * 
 * Mantém exatamente o mesmo visual e comportamento do CustomizationModal atual
 * Inclui funcionalidade de cor personalizada igual ao EditHeaderForm
 */

interface ColorPickerProps {
  /** Valor da cor selecionada */
  value?: string;
  /** Callback quando cor é alterada */
  onChange: (color: string) => void;
  /** Array de cores pré-definidas */
  presetColors?: string[];
  /** Label do seletor */
  label?: string;
  /** Classe CSS adicional */
  className?: string;
  /** Permitir cor customizada (input de texto) */
  allowCustom?: boolean;
  /** Tamanho dos botões de cor */
  size?: 'sm' | 'md' | 'lg';
  /** Cor do anel de seleção */
  ringColor?: string;
}

// Cores padrão do CustomizationModal atual
const DEFAULT_PRESET_COLORS = [
  "#000000",
  "#282c34", 
  "#ffffff",
  "#2F80ED",
  "#7B61FF",
  "#10B981",
  "#FF3EB5",
  "#F3D01C",
  "#F59E0B",
  "#EF4444",
  "#FB7185",
];

const ColorPicker = ({
  value,
  onChange,
  presetColors = DEFAULT_PRESET_COLORS,
  label,
  className = "",
  allowCustom = true, // Habilitado por padrão
  size = 'md',
  ringColor = '#25a3b1'
}: ColorPickerProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(value || ""); // Cor temporária para preview
  const debounceRef = useRef<NodeJS.Timeout>();
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-7 h-7';
      case 'lg': return 'w-11 h-11';
      default: return 'w-9 h-9';
    }
  };

  // Verifica se a cor atual é uma cor personalizada (não está nos presets)
  const isCustomColor = value && !presetColors.includes(value);

  // Debounced onChange para evitar muitas requisições
  const debouncedOnChange = useCallback((color: string) => {
    // Limpa o timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Atualiza a cor temporária imediatamente (para preview)
    setTempColor(color);
    
    // Agenda o save para 500ms depois
    debounceRef.current = setTimeout(() => {
      onChange(color);
    }, 500);
  }, [onChange]);

  // Função para mudanças imediatas (cores pré-definidas)
  const handlePresetColorChange = (color: string) => {
    // Limpa qualquer debounce pendente
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setTempColor(color);
    onChange(color); // Salva imediatamente para cores pré-definidas
  };

  // Sincroniza cor temporária quando valor externo muda
  useEffect(() => {
    setTempColor(value || "");
  }, [value]);

  // Cleanup do debounce quando componente desmonta
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={className}>
      {label && (
        <div className="text-xs text-muted-foreground mb-2">{label}</div>
      )}
      
      <div className="flex flex-wrap gap-3">
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => handlePresetColorChange(color)}
            className={`${getSizeClasses()} rounded-full border transition-all duration-200 hover:scale-105 ${
              value === color 
                ? `ring-2 border-muted` 
                : "border-muted hover:border-muted-foreground"
            }`}
            style={{ 
              backgroundColor: color,
              ...(value === color && { '--tw-ring-color': ringColor } as any)
            }}
            aria-label={`Selecionar cor ${color}`}
            title={`Cor: ${color}`}
          />
        ))}
        
        {/* Botão para cor personalizada */}
        {allowCustom && (
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`${getSizeClasses()} rounded-full transition-all relative ${
              showColorPicker || isCustomColor 
                ? "ring-2 ring-[#25a3b1]" 
                : ""
            }`}
            style={{
              backgroundColor: isCustomColor ? (tempColor || value) : 'transparent'
            }}
            aria-label="Escolher cor personalizada"
          >
            <img 
              src={customizeAddIcon} 
              alt="Personalizar cor" 
              className={`${getSizeClasses()} rounded-full`}
            />
          </button>
        )}
      </div>

      {/* Container de cor personalizada */}
      {allowCustom && (showColorPicker || isCustomColor) && (
        <div className="mt-3 p-4 bg-muted/30 rounded-lg border">
          <div className="text-xs text-muted-foreground mb-3">Escolha uma cor personalizada:</div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={tempColor || value || "#000000"}
              onChange={(e) => debouncedOnChange(e.target.value)}
              className="w-12 h-8 rounded border border-muted cursor-pointer"
            />
            <div className="flex-1">
              <input
                type="text"
                value={tempColor || value || ""}
                onChange={(e) => debouncedOnChange(e.target.value)}
                placeholder="#ffffff"
                className="w-full px-3 py-1 text-sm border border-muted rounded focus:outline-none focus:ring-2 focus:ring-[#25a3b1]"
              />
            </div>
            <div 
              className="w-8 h-8 rounded border-2 border-muted"
              style={{ backgroundColor: tempColor || value || "#000000" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
export { DEFAULT_PRESET_COLORS };
export type { ColorPickerProps };
