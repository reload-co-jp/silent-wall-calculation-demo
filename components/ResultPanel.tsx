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
  const { widthMm, heightMm, areaSqM, panelList } = result
  const totalPanels = panelList.reduce((sum, p) => sum + p.count, 0)

  return (
    <div>
      <h2 style={{ color: "#4a9eff", fontSize: "1rem", marginBottom: 16 }}>
        計測結果
      </h2>

      {/* 寸法・面積 */}
      <div
        style={{
          backgroundColor: "#2a2a2a",
          borderRadius: 8,
          padding: "0 16px",
          marginBottom: 16,
        }}
      >
        <Row label="幅" value={`${widthMm.toLocaleString()} mm`} />
        <Row label="高さ" value={`${heightMm.toLocaleString()} mm`} />
        <Row label="面積" value={`${areaSqM.toFixed(2)} ㎡`} />
      </div>

      {/* パネル組み合わせ */}
      <h3
        style={{
          color: "#aaa",
          fontSize: "0.85rem",
          marginBottom: 8,
          fontWeight: "normal",
        }}
      >
        遮音材 必要枚数（合計{" "}
        <span style={{ color: "white", fontWeight: "bold" }}>
          {totalPanels} 枚
        </span>
        ）
      </h3>
      <div
        style={{
          backgroundColor: "#2a2a2a",
          borderRadius: 8,
          padding: "0 16px",
          marginBottom: 24,
        }}
      >
        {panelList.map((p) => (
          <Row key={p.name} label={p.name} value={`${p.count} 枚`} />
        ))}
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
