"use client"
import { FC, useRef, useEffect, useState, useCallback } from "react"
import { Point } from "lib/types"

const POINT_RADIUS = 18
const HIT_RADIUS = 24

export const CanvasEditor: FC<{
  imageUrl: string
  points: Point[]
  maxPoints: number
  onPointsChange: (points: Point[]) => void
  pointColor?: string
}> = ({
  imageUrl,
  points,
  maxPoints,
  onPointsChange,
  pointColor = "#4a9eff",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const draggingIndexRef = useRef<number | null>(null)
  const pointsRef = useRef(points)
  const [isDragging, setIsDragging] = useState(false)
  const [imageSize, setImageSize] = useState<{
    w: number
    h: number
  } | null>(null)

  // pointsRef を最新に保つ
  useEffect(() => {
    pointsRef.current = points
  }, [points])

  // 画像ロード
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      setImageSize({ w: img.naturalWidth, h: img.naturalHeight })
    }
    img.src = imageUrl
  }, [imageUrl])

  // 描画
  useEffect(() => {
    if (!imageSize) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = imageRef.current
    if (!img) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // 辺を描画
    if (points.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = pointColor
      ctx.lineWidth = 5
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      if (points.length === 4) ctx.closePath()
      ctx.stroke()
    }

    // 点を描画
    points.forEach((p, i) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, POINT_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = pointColor
      ctx.fill()
      ctx.strokeStyle = "white"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = "white"
      ctx.font = `bold ${Math.round(POINT_RADIUS * 1.3)}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(String(i + 1), p.x, p.y)
    })
  }, [points, pointColor, imageSize])

  const toCanvasPoint = useCallback(
    (clientX: number, clientY: number): Point => {
      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height),
      }
    },
    []
  )

  const findHitPoint = useCallback((p: Point): number => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const hitRadius = HIT_RADIUS * (canvas.width / rect.width)
    const pts = pointsRef.current
    for (let i = 0; i < pts.length; i++) {
      const dx = pts[i].x - p.x
      const dy = pts[i].y - p.y
      if (Math.sqrt(dx * dx + dy * dy) < hitRadius) return i
    }
    return -1
  }, [])

  // マウスイベント
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const p = toCanvasPoint(e.clientX, e.clientY)
      const idx = findHitPoint(p)
      if (idx >= 0) {
        draggingIndexRef.current = idx
        setIsDragging(true)
      } else if (pointsRef.current.length < maxPoints) {
        onPointsChange([...pointsRef.current, p])
      }
    },
    [toCanvasPoint, findHitPoint, maxPoints, onPointsChange]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingIndexRef.current === null) return
      const p = toCanvasPoint(e.clientX, e.clientY)
      const newPoints = [...pointsRef.current]
      newPoints[draggingIndexRef.current] = p
      onPointsChange(newPoints)
    },
    [toCanvasPoint, onPointsChange]
  )

  const handleMouseUp = useCallback(() => {
    draggingIndexRef.current = null
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (draggingIndexRef.current !== null) {
      draggingIndexRef.current = null
      setIsDragging(false)
    }
  }, [])

  // タッチイベント
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      const p = toCanvasPoint(touch.clientX, touch.clientY)
      const idx = findHitPoint(p)
      if (idx >= 0) {
        draggingIndexRef.current = idx
        setIsDragging(true)
      } else if (pointsRef.current.length < maxPoints) {
        onPointsChange([...pointsRef.current, p])
      }
    },
    [toCanvasPoint, findHitPoint, maxPoints, onPointsChange]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (draggingIndexRef.current === null) return
      const touch = e.touches[0]
      const p = toCanvasPoint(touch.clientX, touch.clientY)
      const newPoints = [...pointsRef.current]
      newPoints[draggingIndexRef.current] = p
      onPointsChange(newPoints)
    },
    [toCanvasPoint, onPointsChange]
  )

  const handleTouchEnd = useCallback(() => {
    draggingIndexRef.current = null
    setIsDragging(false)
  }, [])

  return (
    <div>
      {!imageSize && (
        <div style={{ color: "#888", padding: 20, textAlign: "center" }}>
          読み込み中...
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={imageSize?.w ?? 1}
        height={imageSize?.h ?? 1}
        style={{
          width: "100%",
          height: "auto",
          display: imageSize ? "block" : "none",
          cursor: isDragging ? "grabbing" : "crosshair",
          touchAction: "none",
          borderRadius: 4,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  )
}
