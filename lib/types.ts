export type Point = { x: number; y: number }

export type Step = "upload" | "a4" | "wall" | "result"

export type PanelItem = {
  name: string
  widthMm: number
  heightMm: number
  count: number
}

export type PanelList = PanelItem[]

export type MeasurementResult = {
  widthMm: number
  heightMm: number
  areaSqM: number
  panelList: PanelList
}
