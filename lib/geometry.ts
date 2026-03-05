import { Point, MeasurementResult, PanelList } from "lib/types"

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

// 利用可能なパネルサイズ一覧（面積降順でソート済み）
const AVAILABLE_PANELS = [
  { name: "910×455mm", widthMm: 910, heightMm: 455 },
  { name: "910×300mm", widthMm: 910, heightMm: 300 },
  { name: "455×455mm", widthMm: 455, heightMm: 455 },
  { name: "910×200mm", widthMm: 910, heightMm: 200 },
  { name: "455×300mm", widthMm: 455, heightMm: 300 },
  { name: "455×200mm", widthMm: 455, heightMm: 200 },
  { name: "300×300mm", widthMm: 300, heightMm: 300 },
  { name: "300×200mm", widthMm: 300, heightMm: 200 },
  { name: "200×200mm", widthMm: 200, heightMm: 200 },
].sort((a, b) => b.widthMm * b.heightMm - a.widthMm * a.heightMm)

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

// 壁の4点と scale から寸法・面積・パネル組み合わせを算出
// グリーディ法: 面積の大きいパネルから順に割り当て、余りを小さいパネルで埋める
export const calcDimensions = (
  wallPoints: Point[],
  scale: number
): MeasurementResult => {
  const { pixelWidth, pixelHeight } = avgEdges(wallPoints)

  const widthMm = Math.round(pixelWidth * scale)
  const heightMm = Math.round(pixelHeight * scale)
  const areaSqM = (widthMm * heightMm) / 1_000_000

  // 5% 余裕を含めた必要面積（mm²）
  let remainingMm2 = Math.ceil(widthMm * heightMm * 1.05)

  const panelList: PanelList = []

  for (const panel of AVAILABLE_PANELS) {
    const panelAreaMm2 = panel.widthMm * panel.heightMm
    const count = Math.floor(remainingMm2 / panelAreaMm2)
    if (count > 0) {
      panelList.push({ ...panel, count })
      remainingMm2 -= count * panelAreaMm2
    }
    if (remainingMm2 <= 0) break
  }

  // 最小パネルでも割り切れない余りがある場合は1枚追加
  if (remainingMm2 > 0) {
    const smallest = AVAILABLE_PANELS[AVAILABLE_PANELS.length - 1]
    const existing = panelList.find((p) => p.name === smallest.name)
    if (existing) {
      existing.count += 1
    } else {
      panelList.push({ ...smallest, count: 1 })
    }
  }

  return { widthMm, heightMm, areaSqM, panelList }
}
