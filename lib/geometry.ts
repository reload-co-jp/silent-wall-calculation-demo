import { Point, MeasurementResult } from "lib/types"

const dist = (a: Point, b: Point): number => {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
}

// 4点（左上から時計回り）から辺の平均ピクセル長を取得
const avgEdges = (
  pts: Point[]
): { pixelWidth: number; pixelHeight: number } => {
  const pixelWidth = (dist(pts[0], pts[1]) + dist(pts[3], pts[2])) / 2
  const pixelHeight = (dist(pts[0], pts[3]) + dist(pts[1], pts[2])) / 2
  return { pixelWidth, pixelHeight }
}

// A4 の4点から mm/pixel スケール係数を算出
// A4 のサイズ: 210mm × 297mm（縦横は自動判定）
export const calcScale = (a4Points: Point[]): number => {
  const { pixelWidth, pixelHeight } = avgEdges(a4Points)

  // 縦横の向きを自動判定: ピクセル幅が長ければ横置き
  const [mmWidth, mmHeight] =
    pixelWidth >= pixelHeight ? [297, 210] : [210, 297]

  const scaleW = mmWidth / pixelWidth
  const scaleH = mmHeight / pixelHeight
  return (scaleW + scaleH) / 2
}

// 壁の4点と scale から寸法・面積・必要枚数を算出
export const calcDimensions = (
  wallPoints: Point[],
  scale: number
): MeasurementResult => {
  const { pixelWidth, pixelHeight } = avgEdges(wallPoints)

  const widthMm = Math.round(pixelWidth * scale)
  const heightMm = Math.round(pixelHeight * scale)
  const areaSqM = (widthMm * heightMm) / 1_000_000

  // 遮音材 1枚: 910mm × 455mm = 0.91 × 1.82 ㎡、5%余裕
  const panelAreaSqM = 0.91 * 0.455
  const panelCount = Math.ceil((areaSqM / panelAreaSqM) * 1.05)

  return { widthMm, heightMm, areaSqM, panelCount }
}
