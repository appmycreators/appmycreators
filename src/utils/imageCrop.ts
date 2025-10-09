import { Crop, PixelCrop } from 'react-image-crop'

export type { Crop, PixelCrop }

/**
 * Convert percentage crop to pixel crop
 */
export function percentCropToPixelCrop(
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

/**
 * Crop an image using canvas based on pixel crop coordinates
 */
export async function cropImage(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string = 'cropped-image.jpg',
  maxSize: number = 2048
): Promise<File> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Não foi possível criar contexto do canvas')
  }

  // Calculate final dimensions respecting max size
  let { width: cropWidth, height: cropHeight } = crop
  
  if (cropWidth > maxSize || cropHeight > maxSize) {
    const scale = Math.min(maxSize / cropWidth, maxSize / cropHeight)
    cropWidth *= scale
    cropHeight *= scale
  }

  canvas.width = cropWidth
  canvas.height = cropHeight

  // Draw the cropped image
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    cropWidth,
    cropHeight
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha ao criar imagem'))
          return
        }

        const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg'
        const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg'
        
        const croppedFile = new File([blob], fileName, {
          type: mimeType,
          lastModified: Date.now(),
        })

        resolve(croppedFile)
      },
      fileName.includes('.png') ? 'image/png' : 'image/jpeg',
      0.92
    )
  })
}

/**
 * Load image from file and return HTMLImageElement
 */
export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Falha ao carregar imagem'))
    }

    img.src = url
  })
}

/**
 * Get image dimensions from a file
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const img = await loadImageFromFile(file)
  return { width: img.width, height: img.height }
}

/**
 * Legacy function for backward compatibility
 * Crops image from file using the old interface
 */
export async function cropImageFromFile(
  file: File,
  cropOptions: { aspectRatio: string; offsetX: number; offsetY: number },
  maxSize: number = 2048
): Promise<File> {
  const img = await loadImageFromFile(file)
  
  // Convert old crop options to pixel crop
  const aspectRatios: Record<string, number> = {
    '1:1': 1,
    '16:9': 16 / 9,
  }
  
  const targetRatio = aspectRatios[cropOptions.aspectRatio] || 1
  const imageRatio = img.width / img.height
  
  let cropWidth: number
  let cropHeight: number
  
  if (imageRatio > targetRatio) {
    cropHeight = img.height
    cropWidth = img.height * targetRatio
  } else {
    cropWidth = img.width
    cropHeight = img.width / targetRatio
  }
  
  const maxOffsetX = (img.width - cropWidth) / 2
  const maxOffsetY = (img.height - cropHeight) / 2
  
  const cropX = (img.width - cropWidth) / 2 - cropOptions.offsetX * maxOffsetX
  const cropY = (img.height - cropHeight) / 2 - cropOptions.offsetY * maxOffsetY
  
  const pixelCrop: PixelCrop = {
    unit: 'px',
    x: cropX,
    y: cropY,
    width: cropWidth,
    height: cropHeight,
  }
  
  return cropImage(img, pixelCrop, file.name, maxSize)
}
