import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface WhatsAppAudioPlayerProps {
  src: string;
  caption?: string;
}

export function WhatsAppAudioPlayer({ src, caption }: WhatsAppAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryWithoutCors, setRetryWithoutCors] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasLoadedRef = useRef(false);
  
  // Gerar alturas fixas para as barras do waveform (apenas uma vez)
  const waveformHeights = useRef<number[]>(
    Array.from({ length: 20 }, () => Math.random() * 16 + 8)
  );

  // Validar URL - versão mais permissiva
  const isValidAudioUrl = (url: string): boolean => {
    if (!url) return false;
    
    try {
      new URL(url);
      // Aceitar qualquer URL válida por enquanto para debug
      return true;
    } catch {
      return false;
    }
  };

  // Se URL inválida, mostrar erro imediatamente
  if (!isValidAudioUrl(src)) {
    return (
      <div className="max-w-xs">
        <div className="flex items-center gap-3 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">⚠️</span>
          </div>
          <div className="flex-1">
            <div className="text-sm text-yellow-700 font-medium">URL inválida</div>
            <div className="text-xs text-yellow-600 break-all">{src || 'URL não fornecida'}</div>
          </div>
        </div>
        {caption && (
          <p className="text-sm mt-2 text-gray-700">{caption}</p>
        )}
      </div>
    );
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset estados quando src muda
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    hasLoadedRef.current = false;

    const markAsLoaded = (source: string) => {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        setDuration(audio.duration || 0);
        setIsLoading(false);
      }
    };

    const handleLoadedMetadata = () => {
      markAsLoaded('loadedmetadata');
    };

    const handleCanPlay = () => {
      markAsLoaded('canplay');
    };

    const handleCanPlayThrough = () => {
      markAsLoaded('canplaythrough');
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      // Se ainda não tentou sem CORS, tentar novamente
      if (!retryWithoutCors) {
        setRetryWithoutCors(true);
        return;
      }

      // Se já tentou sem CORS, mostrar erro final
      setIsLoading(false);
      setHasError(true);
      const errorMsg = `Erro ao carregar áudio: ${src}`;
      setErrorMessage(errorMsg);
    };

    // Event handlers
    const handleLoadStart = () => {};
    const handleLoadedData = () => {
      markAsLoaded('loadeddata');
    };
    const handleProgress = () => {};
    const handleSuspend = () => {};
    const handleStalled = () => {};
    const handleWaiting = () => {};

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('suspend', handleSuspend);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Forçar carregamento do áudio
    try {
      audio.load();
    } catch (error) {
      console.error('Erro no audio.load():', error);
    }

    // Timeout para detectar carregamento lento - reduzido para 5 segundos
    const loadTimeout = setTimeout(() => {
      if (!hasLoadedRef.current) {
        setHasError(true);
        setErrorMessage('Timeout: Áudio não carregou em 5 segundos');
        setIsLoading(false);
      }
    }, 5000); // 5 segundos

    return () => {
      clearTimeout(loadTimeout);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('suspend', handleSuspend);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [src, retryWithoutCors]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-xs">
      {/* Audio element SEMPRE renderizado */}
      <audio 
        ref={audioRef} 
        src={src} 
        preload="auto"
        {...(!retryWithoutCors && { crossOrigin: "anonymous" })}
      />

      {/* Estado de erro */}
      {hasError && (
        <>
          <div className="flex items-center gap-3 p-3 bg-red-100 rounded-lg border border-red-200">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">❌</span>
            </div>
            <div className="flex-1">
              <div className="text-sm text-red-700 font-medium">Erro ao carregar áudio</div>
              <div className="text-xs text-red-600">Verifique a URL ou tente novamente</div>
            </div>
          </div>
          
          {caption && (
            <p className="text-sm mt-2 text-gray-700">{caption}</p>
          )}
        </>
      )}

      {/* Estado de carregamento - Shimmer limpo */}
      {isLoading && !hasError && (
        <>
          <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded animate-pulse mb-1" />
              <div className="h-3 bg-gray-300 rounded animate-pulse w-16" />
            </div>
          </div>
          
          {caption && (
            <p className="text-sm mt-2 text-gray-700">{caption}</p>
          )}
        </>
      )}

      {/* Estado de sucesso - player funcionando */}
      {!isLoading && !hasError && (
        <>
          <div className="flex items-center gap-3 p-3 bg-green-100 rounded-lg">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>

            {/* Waveform and Progress */}
            <div className="flex-1">
              {/* Fake waveform bars */}
              <div className="flex items-center gap-0.5 mb-1 h-6">
                {waveformHeights.current.map((height, i) => {
                  const barProgress = (i / 20) * 100;
                  const isActive = barProgress <= progress;
                  
                  return (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-colors ${
                        isActive ? 'bg-green-600' : 'bg-gray-400'
                      }`}
                      style={{ height: `${height}px` }}
                    />
                  );
                })}
              </div>

              {/* Time */}
              <div className="text-xs text-gray-600">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          {/* Caption */}
          {caption && (
            <p className="text-sm mt-2 text-gray-700">{caption}</p>
          )}
        </>
      )}
    </div>
  );
}
