# 壁面計測デモアプリ 実装仕様書

## 1. 概要

写真1枚から壁の実寸（幅・高さ・面積）を算出し、遮音材の必要枚数を自動計算するデモアプリ。

---

## 2. 技術スタック

| 項目                 | 採用技術                         |
| -------------------- | -------------------------------- |
| フレームワーク       | Next.js 16 (App Router)          |
| 言語                 | TypeScript                       |
| 描画                 | Canvas API                       |
| 画像処理             | OpenCV.js (CDN読み込み)          |
| スタイリング         | インラインスタイル / CSS Modules |
| パッケージマネージャ | pnpm                             |

OpenCV.js はブラウザ完結のため CDN から動的ロードする。

---

## 3. ディレクトリ構成

```
app/
  layout.tsx          # 既存
  page.tsx            # メインページ（状態管理・ステップ制御）
  reset.css           # 既存
components/
  elements/
    layout.tsx        # 既存（Title コンポーネント）
  ImageUploader.tsx   # 画像アップロード UI
  CanvasEditor.tsx    # Canvas 描画・点操作
  ResultPanel.tsx     # 計測結果表示
lib/
  opencv.ts           # OpenCV.js ロード・透視変換ユーティリティ
  geometry.ts         # スケール計算・寸法算出・枚数計算
  types.ts            # 共通型定義
```

---

## 4. 型定義 (`lib/types.ts`)

```ts
// 2D座標点
type Point = { x: number; y: number }

// アプリのステップ状態
type Step = "upload" | "a4" | "wall" | "result"

// 計測結果
type MeasurementResult = {
  widthMm: number
  heightMm: number
  areaSqM: number
  panelCount: number
}
```

---

## 5. ステップフロー

```
[upload] → [a4] → [wall] → [result]
```

| ステップ | 説明                                    |
| -------- | --------------------------------------- |
| `upload` | 画像をアップロードする                  |
| `a4`     | A4用紙の4点を指定してスケール係数を算出 |
| `wall`   | 壁の4点を指定して台形補正する           |
| `result` | 寸法・面積・必要枚数を表示              |

---

## 6. 状態管理 (`app/page.tsx`)

ページコンポーネントで以下の状態を `useState` で保持する。

| 状態変数     | 型                          | 説明                         |
| ------------ | --------------------------- | ---------------------------- |
| `step`       | `Step`                      | 現在のステップ               |
| `imageUrl`   | `string \| null`            | アップロード画像の ObjectURL |
| `a4Points`   | `Point[]`                   | A4指定点（最大4点）          |
| `wallPoints` | `Point[]`                   | 壁指定点（最大4点）          |
| `scale`      | `number \| null`            | mm/pixel スケール係数        |
| `result`     | `MeasurementResult \| null` | 計測結果                     |

---

## 7. 各コンポーネント仕様

### 7.1 ImageUploader (`components/ImageUploader.tsx`)

**役割**: 画像ファイルの入力受付

**Props**:

```ts
type Props = {
  onUpload: (url: string) => void
}
```

**実装要件**:

- `<input type="file" accept="image/jpeg,image/png">` を使用
- ファイル選択時に `URL.createObjectURL()` で ObjectURL を生成し `onUpload` に渡す
- ドラッグ&ドロップも対応（`onDrop` イベント）

---

### 7.2 CanvasEditor (`components/CanvasEditor.tsx`)

**役割**: 画像上に点を打ち、ドラッグで調整できる Canvas UI

**Props**:

```ts
type Props = {
  imageUrl: string
  points: Point[]
  maxPoints: number // 4固定
  onPointsChange: (points: Point[]) => void
  pointColor?: string // a4="blue" / wall="red"
  label?: string // モード名表示用
}
```

**実装要件**:

1. **描画**
   - `<canvas>` 要素に画像を描画
   - 指定済みの点を色付き円（半径8px）で描画
   - 点を順番に線で結ぶ（4点揃ったら閉じた四角形）
   - 各点に番号ラベル表示

2. **点の追加** (`onClick`)
   - `points.length < maxPoints` の場合、クリック座標を追加

3. **点のドラッグ** (`onMouseDown` / `onMouseMove` / `onMouseUp` / タッチイベント)
   - クリック座標から半径16px以内の点を選択
   - ドラッグ中は選択点の座標を更新し再描画

4. **レスポンシブ対応**
   - Canvas のサイズを画像のアスペクト比に合わせ、コンテナ幅に収める
   - Canvas 内座標と画像座標のスケール変換を考慮

---

### 7.3 ResultPanel (`components/ResultPanel.tsx`)

**役割**: 計測結果の表示

**Props**:

```ts
type Props = {
  result: MeasurementResult
  onReset: () => void
}
```

**表示項目**:

| 項目     | 単位 | 表示例    |
| -------- | ---- | --------- |
| 幅       | mm   | `2450 mm` |
| 高さ     | mm   | `2400 mm` |
| 面積     | ㎡   | `5.88 ㎡` |
| 必要枚数 | 枚   | `4 枚`    |

---

## 8. ユーティリティ仕様

### 8.1 スケール計算 (`lib/geometry.ts`)

```ts
// A4の4点から mm/pixel スケールを算出
function calcScale(a4Points: Point[]): number
```

**処理**:

1. 4点から矩形の幅・高さをピクセルで計算
   - 幅 = `(|p0→p1| + |p3→p2|) / 2`（上辺・下辺の平均）
   - 高さ = `(|p0→p3| + |p1→p2|) / 2`（左辺・右辺の平均）
2. スケール算出
   ```
   scaleW = 210 / pixelWidth   // A4横: 210mm
   scaleH = 297 / pixelHeight  // A4縦: 297mm
   scale  = (scaleW + scaleH) / 2
   ```

---

### 8.2 寸法算出 (`lib/geometry.ts`)

```ts
function calcDimensions(
  wallPoints: Point[],
  scale: number
): { widthMm: number; heightMm: number; areaSqM: number; panelCount: number }
```

**処理**:

1. 壁4点のピクセル幅・高さを計算（A4スケール計算と同様の平均方式）
2. 実寸計算
   ```
   widthMm  = pixelWidth  × scale
   heightMm = pixelHeight × scale
   areaSqM  = widthMm × heightMm / 1,000,000
   ```
3. 遮音材枚数計算
   ```
   panelAreaSqM = 0.91 × 1.82        // 910mm × 1820mm
   panelCount   = ceil(areaSqM / panelAreaSqM × 1.05)
   ```

---

### 8.3 透視変換 (`lib/opencv.ts`)

```ts
// OpenCV.js を動的ロードして cv オブジェクトを返す
const loadOpenCV: () => Promise<typeof cv>

// 台形→矩形に透視変換した後の幅・高さ（ピクセル）を返す
const getPerspectiveSize: (points: Point[]) => { width: number; height: number }
```

**処理概要**:

- `getPerspectiveTransform()` で変換行列を生成
- `warpPerspective()` で変換後画像を生成
- 変換後のピクセルサイズを寸法計算に使用

> **注意**: 透視変換は精度向上のために使用するが、平面撮影に近い場合はスキップして直接ピクセル距離の平均値を使っても許容範囲内。デモ段階では透視変換なしのシンプル実装を優先してよい。

---

## 9. 画面フロー詳細

### Step 1: upload

- `ImageUploader` を表示
- アップロード完了で `step = "a4"` へ

### Step 2: a4

- CanvasEditor を `pointColor="blue"` で表示
- 説明文: 「A4用紙の四隅を左上から時計回りにクリックしてください」
- 4点完了 → 「次へ」ボタンを活性化
- 「次へ」押下でスケール計算 → `step = "wall"` へ

### Step 3: wall

- CanvasEditor を `pointColor="red"` で表示
- 説明文: 「壁の四隅を左上から時計回りにクリックしてください」
- 4点完了 → 「計測する」ボタンを活性化
- 「計測する」押下で寸法計算 → `step = "result"` へ

### Step 4: result

- `ResultPanel` で結果を表示
- 「やり直す」ボタンで `step = "upload"` にリセット

---

## 10. 非機能要件

| 項目           | 要件                                       |
| -------------- | ------------------------------------------ |
| 通信           | なし（ブラウザ完結）                       |
| モバイル対応   | タッチイベント対応、viewport meta 設定済み |
| リアルタイム性 | 点をドラッグするたびに Canvas を再描画     |
| 精度目標       | ±1〜2cm 程度                               |
| 完了時間       | 3分以内で計測完了                          |

---

## 11. 実装優先度

| 優先度 | コンポーネント / 機能                 |
| ------ | ------------------------------------- |
| 高     | `lib/types.ts`, `lib/geometry.ts`     |
| 高     | `components/CanvasEditor.tsx`         |
| 高     | `app/page.tsx`（ステップ制御）        |
| 中     | `components/ImageUploader.tsx`        |
| 中     | `components/ResultPanel.tsx`          |
| 低     | `lib/opencv.ts`（透視変換・後回し可） |

---

## 12. スコープ外（デモ段階）

- 点群データ処理
- 3Dモデリング / BIM連携 / LiDAR統合
- 自動エッジ検出・AI壁面認識
- 見積PDF出力・クラウド保存
