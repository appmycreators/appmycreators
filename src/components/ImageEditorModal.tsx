import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cropImage } from '@/utils/imageCrop'
import 'react-image-crop/dist/ReactCrop.css'

export type ImageAspectRatio = '1:1' | '16:9'

// Interface estendida para incluir o arquivo cropado
export interface ImageCropOptions {
  aspectRatio: ImageAspectRatio
  offsetX: number // -1 a 1 (percentual da área extra)
  offsetY: number // -1 a 1 (percentual da área extra)
  croppedFile?: File // Arquivo já cropado (novo)
}

interface ImageEditorModalProps {
  open: boolean
  file: File
  onCancel: () => void
  onConfirm: (opts: ImageCropOptions) => void
  initialRatio?: ImageAspectRatio
}

const aspectRatios: Record<ImageAspectRatio, number> = {
  '1:1': 1,
  '16:9': 16 / 9,
}

const ratios: ImageAspectRatio[] = ['1:1', '16:9']

// Função helper para converter crop percentual para pixels
function percentCropToPixelCrop(
  percentCrop: Crop,
  imageWidth: number,
  imageHeight: number
): PixelCrop {
  return {
    unit: 'px',
    x: (percentCrop.x / 100) * imageWidth,
    y: (percentCrop.y / 100) * imageHeight,
    width: (percentCrop.width / 100) * imageWidth,
    height: (percentCrop.height / 100) * imageHeight,
  }
}

export default function ImageEditorModal({ 
  open, 
  file, 
  onCancel, 
  onConfirm, 
  initialRatio = '1:1' 
}: ImageEditorModalProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [selectedRatio, setSelectedRatio] = useState<ImageAspectRatio>(initialRatio)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number}>()
  const imgRef = useRef<HTMLImageElement>(null)

  const url = useMemo(() => URL.createObjectURL(file), [file])

  // Cleanup URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [url])

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget
    
    // Armazenar dimensões reais da imagem
    setImageDimensions({ width, height })
    
    const aspectRatio = aspectRatios[selectedRatio]
    
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
    
    // Calcular e definir o crop em pixels também
    if (newCrop.unit === '%') {
      const pixelCrop = percentCropToPixelCrop(newCrop, width, height)
      setCompletedCrop(pixelCrop)
    }
  }, [selectedRatio])

  const handleRatioChange = (newRatio: ImageAspectRatio) => {
    setSelectedRatio(newRatio)
    
    if (imgRef.current && imageDimensions) {
      const { width, height } = imageDimensions
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
      
      // Atualizar completed crop em pixels
      if (newCrop.unit === '%') {
        const pixelCrop = percentCropToPixelCrop(newCrop, width, height)
        setCompletedCrop(pixelCrop)
      }
    }
  }

  const handleCropChange = useCallback((crop: Crop, percentCrop: Crop) => {
    setCrop(percentCrop)
    // Não convertemos aqui, deixamos para o onComplete
  }, [])

  const handleCropComplete = useCallback((c: PixelCrop) => {
    // O react-image-crop já nos dá o crop em pixels baseado na imagem exibida
    // Precisamos converter para as coordenadas da imagem original
    if (imgRef.current && imageDimensions) {
      const displayedImg = imgRef.current
      const { naturalWidth, naturalHeight } = displayedImg
      const { width: displayWidth, height: displayHeight } = displayedImg.getBoundingClientRect()
      
      // Calcular a escala entre imagem exibida e original
      const scaleX = naturalWidth / displayWidth
      const scaleY = naturalHeight / displayHeight
      
      // Converter coordenadas para imagem original
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
  }, [imageDimensions])

  const handleConfirm = async () => {
    if (!completedCrop) {
      // Fallback para interface legada
      onConfirm({ aspectRatio: selectedRatio, offsetX: 0, offsetY: 0 })
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Criar elemento de imagem com as dimensões originais
      const originalImg = new Image()
      originalImg.src = url
      
      await new Promise<void>((resolve, reject) => {
        originalImg.onload = () => resolve()
        originalImg.onerror = reject
      })
      
      // Aplicar o crop (completedCrop já está nas coordenadas da imagem original)
      const croppedFile = await cropImage(
        originalImg,
        completedCrop,
        file.name,
        2048
      )
      
      // Enviar o arquivo cropado
      onConfirm({ 
        aspectRatio: selectedRatio, 
        offsetX: 0, 
        offsetY: 0,
        croppedFile
      })
    } catch (error) {
      console.error('Erro ao aplicar crop:', error)
      // Fallback em caso de erro
      onConfirm({ aspectRatio: selectedRatio, offsetX: 0, offsetY: 0 })
    } finally {
      setIsProcessing(false)
    }
  }

  // Calcular dimensões máximas para exibição
  const getMaxDimensions = () => {
    const maxWidth = window.innerWidth * 0.8 // 80% da largura da tela
    const maxHeight = window.innerHeight * 0.6 // 60% da altura da tela
    return { maxWidth: Math.min(maxWidth, 800), maxHeight: Math.min(maxHeight, 600) }
  }

  const { maxWidth, maxHeight } = getMaxDimensions()

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Editar Imagem</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Seletor de proporção */}
          <div className="flex gap-2 flex-wrap">
            {ratios.map((ratio) => (
              <Button
                key={ratio}
                variant={selectedRatio === ratio ? "default" : "outline"}
                size="sm"
                onClick={() => handleRatioChange(ratio)}
                disabled={isProcessing}
              >
                {ratio}
              </Button>
            ))}
          </div>

          {/* Área de crop */}
          <div className="flex justify-center overflow-auto" style={{ maxHeight: `${maxHeight}px` }}>
            <ReactCrop
              crop={crop}
              onChange={handleCropChange}
              onComplete={handleCropComplete}
              aspect={aspectRatios[selectedRatio]}
              className="max-w-full"
              keepSelection
              ruleOfThirds
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={url}
                onLoad={onImageLoad}
                style={{
                  maxWidth: `${maxWidth}px`,
                  maxHeight: `${maxHeight}px`,
                  width: 'auto',
                  height: 'auto',
                }}
              />
            </ReactCrop>
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
            <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!completedCrop || isProcessing}>
              {isProcessing ? 'Processando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}