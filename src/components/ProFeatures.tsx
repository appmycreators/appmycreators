import { Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface ProFeaturesProps {
  backgroundColor?: string;
}

// Função para determinar se a cor é clara ou escura
const isLightColor = (color: string): boolean => {
  if (!color) return false;
  
  // Remover # se existir
  const hex = color.replace('#', '');
  
  // Converter para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calcular luminosidade (fórmula padrão)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
};

const ProFeatures = ({ backgroundColor }: ProFeaturesProps) => {
  const isLight = isLightColor(backgroundColor || '');
  const textColor = isLight ? 'text-black' : 'text-white';
  const textColorMuted = isLight ? 'text-black/70' : 'text-white/70';
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-purple-500" />,
      title: "Remover propagandas",
      description: "",
      logo: "MyCreators",
      enabled: true,
    }
  ];

  return (
    <div className="space-y-4">
      {features.map((feature, index) => (
        <Card key={index} className="p-4 bg-dark-button border-0 shadow-card rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {feature.icon}
              <div>
                <h4 className="text-white font-medium">{feature.title}</h4>
                {feature.description && (
                  <p className="text-white/70 text-sm mt-1">{feature.description}</p>
                )}
                {feature.logo && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                    <span className="text-white/70 text-sm">{feature.logo}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Switch 
              checked={feature.enabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </Card>
      ))}

      <div className="text-center pt-2">
        <Button 
          variant="link" 
          className={`${textColorMuted} hover:${textColor} text-sm underline`}
        >
          Veja todas as funcionalidades do PRO
        </Button>
      </div>
    </div>
  );
};

export default ProFeatures;