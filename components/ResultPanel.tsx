import { FC } from "react"
import { MeasurementResult } from "lib/types"

const Row: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      padding: "12px 0",
      borderBottom: "1px solid #3a3a3a",
    }}
  >
    <span style={{ color: "#aaa", fontSize: "0.9rem" }}>{label}</span>
    <span style={{ color: "white", fontSize: "1.2rem", fontWeight: "bold" }}>
      {value}
    </span>
  </div>
)

export const ResultPanel: FC<{
  result: MeasurementResult
  onReset: () => void
}> = ({ result, onReset }) => {
  const { widthMm, heightMm, areaSqM, panelCount } = result

  return (
    <div>
      <h2 style={{ color: "#4a9eff", fontSize: "1rem", marginBottom: 16 }}>
        計測結果
      </h2>
      <div
        style={{
          backgroundColor: "#2a2a2a",
          borderRadius: 8,
          padding: "0 16px",
          marginBottom: 24,
        }}
      >
        <Row label="幅" value={`${widthMm.toLocaleString()} mm`} />
        <Row label="高さ" value={`${heightMm.toLocaleString()} mm`} />
        <Row label="面積" value={`${areaSqM.toFixed(2)} ㎡`} />
        <Row label="遮音材 必要枚数（910×455mm）" value={`${panelCount} 枚`} />
      </div>
      <button
        onClick={onReset}
        style={{
          backgroundColor: "#333",
          color: "#ccc",
          border: "1px solid #555",
          borderRadius: 4,
          padding: "8px 24px",
          cursor: "pointer",
          fontSize: "0.9rem",
        }}
      >
        やり直す
      </button>
    </div>
  )
}
