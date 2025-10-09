import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export type AspectRatio = '1:1' | '16:9'

export interface GifOptions {
  start: number // seconds
  duration: number // seconds, will be capped to 8s
  aspectRatio: AspectRatio
  width?: number // target width, defaults based on ratio
  fps?: number // defaults 12
  crop?: {
    x: number
    y: number
    width: number
    height: number
  } // coordenadas do crop em pixels
}

const ffmpegRef: { current: FFmpeg | null } = { current: null }

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegRef.current) return ffmpegRef.current
  const ffmpeg = new FFmpeg()
  // Load from jsdelivr CDN with better CORS support
  const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm'
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })
  ffmpegRef.current = ffmpeg
  return ffmpeg
}

function arToNumber(ar: AspectRatio): number {
  switch (ar) {
    case '1:1':
      return 1
    case '16:9':
      return 16 / 9
    default:
      return 16 / 9
  }
}

function even(n: number): number {
  return Math.max(2, Math.floor(n / 2) * 2)
}

/**
 * Convert a video file (MP4/MOV) to an optimized GIF, trimming and center-cropping
 * to the chosen aspect ratio. Tries multiple passes to keep size <= maxBytes.
 */
export async function videoToGif(
  file: File,
  options: GifOptions,
  maxBytes: number = 4 * 1024 * 1024
): Promise<File> {
  const ffmpeg = await getFFmpeg()

  const inputExt = (file.name.split('.').pop() || 'mp4').toLowerCase()
  const inputName = `input.${inputExt}`
  const outputName = 'output.gif'

  // Write source
  await ffmpeg.writeFile(inputName, await fetchFile(file))

  let width = options.width ?? 540 // good default for most ratios
  let fps = options.fps ?? 12
  const ar = arToNumber(options.aspectRatio)
  const duration = Math.max(0.1, Math.min(8, options.duration || 8))
  const start = Math.max(0, options.start || 0)

  // Crop filter - use specific coordinates if provided, otherwise center crop
  const cropFilter = options.crop
    ? `crop=${options.crop.width}:${options.crop.height}:${options.crop.x}:${options.crop.y}`
    : `crop='if(gte(iw/ih,${ar}),ih*${ar},iw)':'if(gte(iw/ih,${ar}),ih,iw/${ar})':(iw-ow)/2:(ih-oh)/2`

  async function transcodeOnce(targetW: number, targetFps: number): Promise<Blob> {
    const w = even(targetW)
    // Remove any previous output file
    try {
      await ffmpeg.deleteFile(outputName)
    } catch {}

    await ffmpeg.exec([
      '-ss', String(start),
      '-t', String(duration),
      '-i', inputName,
      '-vf', `fps=${targetFps},${cropFilter},scale=${w}:-2:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=full[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
      '-loop', '0',
      outputName,
    ])

    const data = await ffmpeg.readFile(outputName)
    return new Blob([data as Uint8Array], { type: 'image/gif' })
  }

  // Try a few passes reducing width/fps until we are under maxBytes
  const attempts: Array<{ w: number; f: number }> = []
  let w = width
  let f = fps
  for (let i = 0; i < 6; i++) {
    attempts.push({ w, f })
    if (w > 400) {
      w = Math.round(w * 0.85)
    } else if (f > 8) {
      f = f - 2
    } else {
      // Last resort, keep reducing a bit more
      w = Math.max(240, Math.round(w * 0.9))
    }
  }

  let finalBlob: Blob | null = null
  for (const a of attempts) {
    const blob = await transcodeOnce(a.w, a.f)
    if (blob.size <= maxBytes) {
      finalBlob = blob
      break
    }
    finalBlob = blob // keep last attempt anyway
  }

  // Cleanup
  try { await ffmpeg.deleteFile(inputName) } catch {}
  try { await ffmpeg.deleteFile(outputName) } catch {}

  if (!finalBlob) {
    throw new Error('Falha ao gerar GIF')
  }

  return new File([finalBlob], 'header.gif', { type: 'image/gif', lastModified: Date.now() })
}

/**
 * Read video duration (in seconds) from a File using a temporary HTMLVideoElement.
 */
export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = url
    const cleanup = () => {
      URL.revokeObjectURL(url)
    }
    video.onloadedmetadata = () => {
      const d = video.duration
      cleanup()
      resolve(isFinite(d) ? d : 0)
    }
    video.onerror = () => {
      cleanup()
      reject(new Error('Não foi possível ler a duração do vídeo'))
    }
  })
}
