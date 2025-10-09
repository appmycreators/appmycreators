import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import type { GifOptions } from '@/utils/videoToGif'
import 'react-image-crop/dist/ReactCrop.css'

export type VideoAspectRatio = '1:1' | '16:9'

interface VideoEditorModalProps {
  open: boolean
  file: File
  duration: number
  onCancel: () => void
  onConfirm: (opts: GifOptions) => void
}

const aspectRatios: Record<VideoAspectRatio, number> = {
  '1:1': 1,
  '16:9': 16 / 9,
}

const ratios: VideoAspectRatio[] = ['1:1', '16:9']

export default function VideoEditorModal({ open, file, duration, onCancel, onConfirm }: VideoEditorModalProps) {
  const [ratio, setRatio] = useState<VideoAspectRatio>('1:1')
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(Math.min(8, duration))
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [videoDimensions, setVideoDimensions] = useState<{width: number, height: number}>()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // reset when file/duration changes
    setStartTime(0)
    setEndTime(Math.min(8, duration))
    setRatio('1:1')
  }, [file, duration])

  const url = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [url])

  const clipDuration = endTime - startTime

  const onVideoLoad = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const { videoWidth: width, videoHeight: height } = e.currentTarget
    
    // Armazenar dimensões reais do vídeo
    setVideoDimensions({ width, height })
    
    const aspectRatio = aspectRatios[ratio]
    
    // Criar crop inicial centralizado
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    )
    
    setCrop(newCrop)
  }, [ratio])

  const handleRatioChange = (newRatio: VideoAspectRatio) => {
    setRatio(newRatio)
    
    if (videoRef.current && videoDimensions) {
      const { width, height } = videoDimensions
      const aspectRatio = aspectRatios[newRatio]
      
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspectRatio,
          width,
          height
        ),
        width,
        height
      )
      
      setCrop(newCrop)
    }
  }

  const handleCropChange = useCallback((crop: Crop, percentCrop: Crop) => {
    setCrop(percentCrop)
  }, [])

  const handleCropComplete = useCallback((c: PixelCrop) => {
    // Converter coordenadas para vídeo original se necessário
    if (videoRef.current && videoDimensions) {
      const displayedVideo = videoRef.current
      const { videoWidth, videoHeight } = displayedVideo
      const { width: displayWidth, height: displayHeight } = displayedVideo.getBoundingClientRect()
      
      // Calcular a escala entre vídeo exibido e original
      const scaleX = videoWidth / displayWidth
      const scaleY = videoHeight / displayHeight
      
      // Converter coordenadas para vídeo original
      const originalCrop: PixelCrop = {
        unit: 'px',
        x: c.x * scaleX,
        y: c.y * scaleY,
        width: c.width * scaleX,
        height: c.height * scaleY,
      }
      
      setCompletedCrop(originalCrop)
    } else {
      setCompletedCrop(c)
    }
  }, [videoDimensions])

  const handleStartChange = (value: number[]) => {
    const newStart = value[0] ?? 0
    setStartTime(newStart)
    // Se a duração ultrapassar 8s, ajustar o fim
    if (endTime - newStart > 8) {
      setEndTime(newStart + 8)
    }
  }

  const handleEndChange = (value: number[]) => {
    const newEnd = value[0] ?? duration
    // Garantir que a duração não ultrapasse 8s
    if (newEnd - startTime > 8) {
      setEndTime(startTime + 8)
    } else {
      setEndTime(newEnd)
    }
  }

  const handleConfirm = () => {
    const opts: GifOptions = { 
      start: startTime, 
      duration: Math.min(8, clipDuration), 
      aspectRatio: ratio as any,
      crop: completedCrop ? {
        x: Math.round(completedCrop.x),
        y: Math.round(completedCrop.y),
        width: Math.round(completedCrop.width),
        height: Math.round(completedCrop.height)
      } : undefined
    }
    onConfirm(opts)
  }

  function fmt(t: number) {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Editar Vídeo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Seletor de proporção */}
          <div className="flex gap-2 flex-wrap">
            {ratios.map((r) => (
              <Button
                key={r}
                variant={ratio === r ? "default" : "outline"}
                size="sm"
                onClick={() => handleRatioChange(r)}
              >
                {r}
              </Button>
            ))}
          </div>

          {/* Área de crop */}
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={handleCropChange}
              onComplete={handleCropComplete}
              aspect={aspectRatios[ratio]}
              className="max-w-full max-h-[50vh]"
              keepSelection
              ruleOfThirds
            >
              <video
                ref={videoRef}
                src={url}
                onLoadedMetadata={onVideoLoad}
                className="max-w-full max-h-[50vh] object-contain"
                muted
                controls
              />
            </ReactCrop>
          </div>

          {/* Controles de tempo */}
          <div className="space-y-4 bg-muted/30 rounded-lg p-4">
            <div>
              <div className="text-sm font-medium text-foreground mb-2">Tempo inicial ({fmt(startTime)})</div>
              <Slider 
                value={[startTime]} 
                onValueChange={handleStartChange} 
                min={0} 
                max={Math.max(0, duration - 0.1)} 
                step={0.1} 
              />
            </div>

            <div>
              <div className="text-sm font-medium text-foreground mb-2">Tempo final ({fmt(endTime)})</div>
              <Slider 
                value={[endTime]} 
                onValueChange={handleEndChange} 
                min={startTime + 0.1} 
                max={duration} 
                step={0.1}
              />
              <div className="text-sm text-muted-foreground mt-1">
                Duração: {fmt(clipDuration)} {clipDuration > 8 ? '(máx. 8s)' : ''}
              </div>
            </div>
          </div>

          {/* Informações de debug (remover em produção) */}
          {completedCrop && (
            <div className="text-xs text-muted-foreground">
              Crop: {Math.round(completedCrop.width)}x{Math.round(completedCrop.height)} 
              {' '}(posição: {Math.round(completedCrop.x)}, {Math.round(completedCrop.y)})
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!completedCrop}>
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
