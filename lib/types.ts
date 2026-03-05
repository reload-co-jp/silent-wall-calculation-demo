export type Point = { x: number; y: number }

export type Step = "upload" | "a4" | "wall" | "result"

export type MeasurementResult = {
  widthMm: number
  heightMm: number
  areaSqM: number
  panelCount: number
}
