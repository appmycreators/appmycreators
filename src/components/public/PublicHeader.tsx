import { BadgeCheck, MoreVertical } from "lucide-react";
import { useState, lazy, Suspense } from "react";
import LottieAnimation from "./LottieAnimation";
import ResponsiveImage from "@/components/ResponsiveImage";
import profileImage from "@/assets/avatar.png";

const ShareModal = lazy(() => import("./ShareModal"));

/**
 * PublicHeader - Cabeçalho da página pública
 * Responsabilidade única: Renderizar avatar, nome, bio e animação de fundo
 */

interface PublicHeaderProps {
  profileImageUrl?: string;
  name: string;
  bio?: string;
  isVerified?: boolean;
  backgroundAnimation?: string;
  headerNameColor?: string;
  headerBioColor?: string;
  headerMediaUrl?: string;
  headerMediaType?: string;
  avatarBorderColor?: string;
  nitroAnimationUrl?: string;
  pageSlug?: string;
}

const PublicHeader = ({
  profileImageUrl,
  name,
  bio,
  isVerified,
  backgroundAnimation,
  headerNameColor,
  headerBioColor,
  headerMediaUrl,
  headerMediaType,
  avatarBorderColor,
  nitroAnimationUrl,
  pageSlug,
}: PublicHeaderProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Construir URL completa da página
  const pageUrl = pageSlug 
    ? `${window.location.origin}/${pageSlug}`
    : window.location.href;

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  return (
    <>
      {headerMediaUrl && (
        <div className="-mx-4 sm:-mx-6 -mt-4">
          <div className="relative rounded-3xl overflow-hidden w-full">
            {headerMediaType === 'video' ? (
              <video
                src={headerMediaUrl}
                className="w-full h-auto block"
                style={{
                  maskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 15%, black 30%)',
                  WebkitMaskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 15%, black 30%)'
                }}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <ResponsiveImage
                src={headerMediaUrl}
                alt="Header"
                className="w-full h-auto block"
                widths={[480, 720, 960, 1440]}
                sizes="(min-width: 640px) 672px, 100vw"
                loading="eager"
                style={{
                  maskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 15%, black 30%)',
                  WebkitMaskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 15%, black 30%)'
                }}
              />
            )}

            <div className="absolute left-0 right-0 bottom-6 z-10 flex flex-col items-center text-center px-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div 
                  className="rounded-full overflow-hidden border-2 bg-white shadow-md relative z-0 w-[100px] h-[100px]"
                  style={{ borderColor: avatarBorderColor || '#ffffff' }}
                >
                  <img 
                    src={profileImageUrl || profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                {nitroAnimationUrl && (
                  <img 
                    src={nitroAnimationUrl} 
                    alt="Nitro Animation" 
                    className="absolute inset-0 w-32 h-32 pointer-events-none z-10"
                  />
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <h1 
                  className="text-xl sm:text-2xl font-extrabold"
                  style={{ color: headerNameColor || undefined }}
                >
                  {name}
                </h1>
                {isVerified && <BadgeCheck className="w-5 h-5 text-sky-500" />}
              </div>
              <p 
                className="mt-1 text-[13px] sm:text-sm whitespace-pre-line max-w-xl"
                style={{ color: headerBioColor || undefined }}
              >
                {bio || 'Criador de conteúdo'}
              </p>
            </div>

            <a href="https://mycreators.me" target="_blank" rel="noopener noreferrer" className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center z-10 overflow-hidden">
              <img src="/images/icon-512x512.png" alt="MyCreators" className="w-full h-full object-cover" />
            </a>

            <button 
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white z-10 hover:bg-black/70 transition-colors"
              onClick={handleShareClick}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {!headerMediaUrl && (
        <div className="relative">
          {/* Background Animation */}
          {backgroundAnimation && (
            <div className="absolute inset-0 -z-10 opacity-20">
              <LottieAnimation 
                animationName={backgroundAnimation}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}
          
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div 
                className="rounded-full overflow-hidden border-2 bg-white shadow-md relative z-0 w-[100px] h-[100px]"
                style={{ borderColor: avatarBorderColor || '#ffffff' }}
              >
                <img
                  src={profileImageUrl || profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              {nitroAnimationUrl && (
                <img 
                  src={nitroAnimationUrl} 
                  alt="Nitro Animation" 
                  className="absolute inset-0 w-32 h-32 pointer-events-none z-10"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <h1 
                className="text-2xl font-extrabold"
                style={{ color: headerNameColor || undefined }}
              >
                {name}
              </h1>
              {isVerified && <BadgeCheck className="w-5 h-5 text-sky-500" />}
            </div>
            {bio && (
              <p 
                className="text-sm whitespace-pre-line max-w-xl"
                style={{ color: headerBioColor || undefined }}
              >
                {bio}
              </p>
            )}
          </div>

          <a href="https://mycreators.me" target="_blank" rel="noopener noreferrer" className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center z-10 overflow-hidden">
            <img src="/images/icon-512x512.png" alt="MyCreators" className="w-full h-full object-cover" />
          </a>

          <button 
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white z-10 hover:bg-black/70 transition-colors"
            onClick={handleShareClick}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modal de Compartilhamento - Lazy Loaded */}
      {isShareModalOpen && (
        <Suspense fallback={null}>
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            profileImageUrl={profileImageUrl}
            profileName={name}
            pageUrl={pageUrl}
          />
        </Suspense>
      )}
    </>
  );
};

export default PublicHeader;
