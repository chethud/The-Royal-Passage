import {
  FACE_BOX_EXPAND,
  PASSPORT_PHOTO_EXPORT,
  PASSPORT_PHOTO_FILTERS,
  PORTRAIT_ASPECT,
  type CropRect,
  type FaceBox,
  type ProcessPassportPhotoResult,
  type PassportPhotoProcessingOptions,
} from "@/lib/passport-photo/types";

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the selected image."));
    };
    img.src = url;
  });
}

export function pickLargestFaceBox(faces: Array<{ box: FaceBox }>): FaceBox | null {
  if (faces.length === 0) return null;
  return faces.reduce((largest, face) => {
    const [, , w, h] = face.box;
    const [, , lw, lh] = largest.box;
    return w * h > lw * lh ? face : largest;
  }).box;
}

export function expandFaceBox(box: FaceBox): CropRect {
  const [x, y, w, h] = box;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const width = w * FACE_BOX_EXPAND.width;
  const height = h * FACE_BOX_EXPAND.height;
  return {
    x: cx - width / 2,
    y: cy - height / 2,
    width,
    height,
  };
}

export function centerCropRect(imgWidth: number, imgHeight: number): CropRect {
  const imgAspect = imgWidth / imgHeight;
  let width: number;
  let height: number;

  if (imgAspect > PORTRAIT_ASPECT) {
    height = imgHeight;
    width = height * PORTRAIT_ASPECT;
  } else {
    width = imgWidth;
    height = width / PORTRAIT_ASPECT;
  }

  return {
    x: (imgWidth - width) / 2,
    y: (imgHeight - height) / 2,
    width,
    height,
  };
}

/** Fit expanded face region to 3:4, centering the face vertically in frame. */
export function fitPortraitCrop(
  seed: CropRect,
  imgWidth: number,
  imgHeight: number,
  faceCenterY?: number,
): CropRect {
  const cx = seed.x + seed.width / 2;
  const cy = faceCenterY ?? seed.y + seed.height / 2;

  let width = seed.width;
  let height = seed.height;
  const currentAspect = width / height;

  if (currentAspect > PORTRAIT_ASPECT) {
    height = width / PORTRAIT_ASPECT;
  } else {
    width = height * PORTRAIT_ASPECT;
  }

  let x = cx - width / 2;
  let y = cy - height / 2;

  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x + width > imgWidth) x = Math.max(0, imgWidth - width);
  if (y + height > imgHeight) y = Math.max(0, imgHeight - height);

  width = Math.min(width, imgWidth);
  height = Math.min(height, imgHeight);

  return { x, y, width, height };
}

export function clampCropToImage(crop: CropRect, imgWidth: number, imgHeight: number): CropRect {
  const width = Math.min(crop.width, imgWidth);
  const height = Math.min(crop.height, imgHeight);
  const x = Math.max(0, Math.min(crop.x, imgWidth - width));
  const y = Math.max(0, Math.min(crop.y, imgHeight - height));
  return { x, y, width, height };
}

function applyPaperTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const noise = document.createElement("canvas");
  noise.width = width;
  noise.height = height;
  const noiseCtx = noise.getContext("2d");
  if (!noiseCtx) return;

  const imageData = noiseCtx.createImageData(width, height);
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const grain = 228 + Math.floor(Math.random() * 28);
    data[i] = grain;
    data[i + 1] = grain - 6;
    data[i + 2] = grain - 18;
    data[i + 3] = 22;
  }
  noiseCtx.putImageData(imageData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.18;
  ctx.drawImage(noise, 0, 0, width, height);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#f4e8c8";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function applyVignette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height * 0.42,
    width * 0.18,
    width / 2,
    height / 2,
    width * 0.72,
  );
  gradient.addColorStop(0, "rgba(20, 10, 4, 0)");
  gradient.addColorStop(1, "rgba(28, 14, 6, 0.42)");
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function drawPassportPortrait(
  image: CanvasImageSource,
  crop: CropRect,
  options: PassportPhotoProcessingOptions = {},
): HTMLCanvasElement {
  const outputWidth = options.outputWidth ?? PASSPORT_PHOTO_EXPORT.width;
  const outputHeight = options.outputHeight ?? PASSPORT_PHOTO_EXPORT.height;
  const { sepia, contrast, brightness } = PASSPORT_PHOTO_FILTERS;

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not available in this browser.");
  }

  ctx.filter = `sepia(${sepia}) contrast(${contrast}) brightness(${brightness})`;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );
  ctx.filter = "none";

  applyVignette(ctx, outputWidth, outputHeight);
  applyPaperTexture(ctx, outputWidth, outputHeight);

  return canvas;
}

export function canvasToJpegBlob(canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode passport photo."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

export async function processPassportPhoto(
  file: File,
  faceBox: FaceBox | null,
): Promise<ProcessPassportPhotoResult> {
  const image = await loadImageFromFile(file);
  const imgWidth = image.naturalWidth || image.width;
  const imgHeight = image.naturalHeight || image.height;

  let crop: CropRect;
  let faceDetected = false;

  if (faceBox) {
    faceDetected = true;
    const expanded = expandFaceBox(faceBox);
    const faceCenterY = faceBox[1] + faceBox[3] / 2;
    crop = fitPortraitCrop(expanded, imgWidth, imgHeight, faceCenterY);
  } else {
    crop = centerCropRect(imgWidth, imgHeight);
  }

  crop = clampCropToImage(crop, imgWidth, imgHeight);

  const canvas = drawPassportPortrait(image, crop);
  const blob = await canvasToJpegBlob(canvas);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

  return {
    blob,
    dataUrl,
    faceDetected,
    previewUrl: dataUrl,
  };
}
