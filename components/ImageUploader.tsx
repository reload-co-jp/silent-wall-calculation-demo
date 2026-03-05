"use client"
import { FC, useRef, useState } from "react"

export const ImageUploader: FC<{
  onUpload: (url: string) => void
}> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    onUpload(URL.createObjectURL(file))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div
      aria-hidden="true"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragOver ? "#4a9eff" : "#555"}`,
        borderRadius: 8,
        padding: "64px 24px",
        textAlign: "center",
        cursor: "pointer",
        backgroundColor: isDragOver ? "#1a2a3a" : "#2a2a2a",
        color: "#ccc",
        transition: "all 0.2s",
        userSelect: "none",
      }}
    >
      <p style={{ marginBottom: 8, fontSize: "1.1rem" }}>
        画像をドラッグ&ドロップ
      </p>
      <p style={{ marginBottom: 16, color: "#666", fontSize: "0.85rem" }}>
        または
      </p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          inputRef.current?.click()
        }}
        style={{
          backgroundColor: "#4a9eff",
          color: "white",
          border: "none",
          borderRadius: 4,
          padding: "8px 24px",
          cursor: "pointer",
          fontSize: "0.9rem",
        }}
      >
        ファイルを選択
      </button>
      <p style={{ marginTop: 12, fontSize: "0.75rem", color: "#555" }}>
        JPG / PNG
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </div>
  )
}
