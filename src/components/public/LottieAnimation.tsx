import { lazy, Suspense, useEffect, useState } from "react";

/**
 * LottieAnimation - Componente para animações Lottie com lazy loading
 * Responsabilidade única: Carregar e renderizar animações Lottie
 */

// Lazy load do Lottie apenas quando necessário
const Lottie = lazy(() => import("lottie-react"));

// Lazy load de animações Lottie individualmente (suporta nome interno ou URL absoluta)
const loadLottieAnimation = async (animationName: string) => {
  try {
    // URL externa (Supabase Storage ou CDN)
    if (/^https?:\/\//.test(animationName) || animationName.startsWith('/')) {
      const res = await fetch(animationName, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }

    // Asset local (src/assets/lotties)
    const module = await import(`@/assets/lotties/${animationName}.json`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load animation: ${animationName}`, error);
    return null;
  }
};

interface LottieAnimationProps {
  animationName: string;
  className?: string;
  style?: React.CSSProperties;
}

const LottieAnimation = ({ animationName, className, style }: LottieAnimationProps) => {
  const [animationData, setAnimationData] = useState(null);
  
  useEffect(() => {
    loadLottieAnimation(animationName).then(setAnimationData);
  }, [animationName]);
  
  if (!animationData) return null;
  
  return (
    <Suspense fallback={null}>
      <div className={className} style={style}>
        <Lottie 
          animationData={animationData} 
          loop={true} 
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </Suspense>
  );
};

export default LottieAnimation;
