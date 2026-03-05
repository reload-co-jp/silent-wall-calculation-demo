"use client"
import { FC, useState } from "react"
import { Step, Point, MeasurementResult } from "lib/types"
import { calcScale, calcDimensions } from "lib/geometry"
import { ImageUploader } from "components/ImageUploader"
import { CanvasEditor } from "components/CanvasEditor"
import { ResultPanel } from "components/ResultPanel"

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  backgroundColor: disabled ? "#444" : "#4a9eff",
  color: disabled ? "#777" : "white",
  border: "none",
  borderRadius: 4,
  padding: "10px 28px",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: "0.95rem",
})

const backBtnStyle: React.CSSProperties = {
  backgroundColor: "transparent",
  color: "#888",
  border: "none",
  padding: "0",
  cursor: "pointer",
  fontSize: "0.85rem",
  marginBottom: 12,
}

const Page: FC = () => {
  const [step, setStep] = useState<Step>("upload")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [a4Points, setA4Points] = useState<Point[]>([])
  const [wallPoints, setWallPoints] = useState<Point[]>([])
  const [scale, setScale] = useState<number | null>(null)
  const [result, setResult] = useState<MeasurementResult | null>(null)

  const handleUpload = (url: string) => {
    setImageUrl(url)
    setA4Points([])
    setWallPoints([])
    setScale(null)
    setResult(null)
    setStep("a4")
  }

  const handleA4Next = () => {
    setScale(calcScale(a4Points))
    setStep("wall")
  }

  const handleMeasure = () => {
    if (!scale) return
    setResult(calcDimensions(wallPoints, scale))
    setStep("result")
  }

  const handleReset = () => {
    setStep("upload")
    setImageUrl(null)
    setA4Points([])
    setWallPoints([])
    setScale(null)
    setResult(null)
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Step indicator */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          fontSize: "0.75rem",
          color: "#666",
        }}
      >
        {(["upload", "a4", "wall", "result"] as Step[]).map((s, i) => {
          const labels = ["画像", "A4指定", "壁指定", "結果"]
          const active = s === step
          return (
            <span
              key={s}
              style={{ color: active ? "#4a9eff" : "#555", fontWeight: active ? "bold" : "normal" }}
            >
              {i > 0 && <span style={{ marginRight: 8, color: "#444" }}>›</span>}
              {labels[i]}
            </span>
          )
        })}
      </div>

      {/* Step: upload */}
      {step === "upload" && <ImageUploader onUpload={handleUpload} />}

      {/* Step: a4 */}
      {step === "a4" && imageUrl && (
        <div>
          <button style={backBtnStyle} onClick={() => setStep("upload")}>
            ← 画像を変更
          </button>
          <p style={{ color: "#ccc", marginBottom: 8, fontSize: "0.9rem" }}>
            A4用紙の四隅を<strong>左上から時計回り</strong>にクリックしてください
            &nbsp;
            <span style={{ color: "#4a9eff" }}>({a4Points.length} / 4)</span>
          </p>
          {a4Points.length > 0 && (
            <button
              style={{ ...backBtnStyle, marginBottom: 8 }}
              onClick={() => setA4Points([])}
            >
              点をリセット
            </button>
          )}
          <CanvasEditor
            imageUrl={imageUrl}
            points={a4Points}
            maxPoints={4}
            onPointsChange={setA4Points}
            pointColor="#4a9eff"
          />
          <div style={{ marginTop: 16 }}>
            <button
              disabled={a4Points.length < 4}
              onClick={handleA4Next}
              style={btnStyle(a4Points.length < 4)}
            >
              次へ →
            </button>
          </div>
        </div>
      )}

      {/* Step: wall */}
      {step === "wall" && imageUrl && (
        <div>
          <button style={backBtnStyle} onClick={() => setStep("a4")}>
            ← A4を再指定
          </button>
          <p style={{ color: "#ccc", marginBottom: 8, fontSize: "0.9rem" }}>
            壁の四隅を<strong>左上から時計回り</strong>にクリックしてください
            &nbsp;
            <span style={{ color: "#e05252" }}>({wallPoints.length} / 4)</span>
          </p>
          {wallPoints.length > 0 && (
            <button
              style={{ ...backBtnStyle, marginBottom: 8 }}
              onClick={() => setWallPoints([])}
            >
              点をリセット
            </button>
          )}
          <CanvasEditor
            imageUrl={imageUrl}
            points={wallPoints}
            maxPoints={4}
            onPointsChange={setWallPoints}
            pointColor="#e05252"
          />
          <div style={{ marginTop: 16 }}>
            <button
              disabled={wallPoints.length < 4}
              onClick={handleMeasure}
              style={btnStyle(wallPoints.length < 4)}
            >
              計測する
            </button>
          </div>
        </div>
      )}

      {/* Step: result */}
      {step === "result" && result && (
        <ResultPanel result={result} onReset={handleReset} />
      )}
    </div>
  )
}

export default Page
