/** Pixel bounding box [x, y, width, height]. */
export type FaceBox = [number, number, number, number];

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PassportPhotoDimensions = {
  width: number;
  height: number;
};

export const PASSPORT_PHOTO_FRAME: PassportPhotoDimensions = {
  width: 180,
  height: 240,
};

/** 2× export for sharper display on retina screens. */
export const PASSPORT_PHOTO_EXPORT: PassportPhotoDimensions = {
  width: PASSPORT_PHOTO_FRAME.width * 2,
  height: PASSPORT_PHOTO_FRAME.height * 2,
};

export const PORTRAIT_ASPECT = 3 / 4;

export const FACE_BOX_EXPAND = {
  width: 1.6,
  height: 2.2,
} as const;

export type PassportPhotoFilters = {
  sepia: number;
  contrast: number;
  brightness: number;
};

export const PASSPORT_PHOTO_FILTERS: PassportPhotoFilters = {
  sepia: 0.75,
  contrast: 1.15,
  brightness: 0.95,
};

export type FaceDetectionResult = {
  box: FaceBox;
  score: number;
};

export type ProcessPassportPhotoResult = {
  blob: Blob;
  dataUrl: string;
  faceDetected: boolean;
  previewUrl: string;
};

export type PassportPhotoProcessingOptions = {
  faceBox?: FaceBox | null;
  outputWidth?: number;
  outputHeight?: number;
};
