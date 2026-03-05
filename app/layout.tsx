import { Title } from "components/elements/layout"
import "./reset.css"

export const metadata = {
  title: "壁面計測デモ",
  description: "写真1枚から壁の実寸と遮音材必要枚数を算出するデモアプリ",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body>
        <header
          style={{
            backgroundColor: "#333",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: ".5rem 1rem",
            position: "relative",
          }}
        >
          <Title style={{ color: "white" }}>壁面計測デモ</Title>
        </header>
        <main
          style={{
            background: "#222",
            minHeight: "calc(100dvh - 5.625rem)",
            padding: "1rem",
          }}
        >
          {children}
        </main>
        <footer
          style={{
            backgroundColor: "#333",
            boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)",
            fontSize: ".75rem",
            padding: "1rem",
          }}
        >
          <p>&copy; Reload, Inc.</p>
        </footer>
      </body>
    </html>
  )
}
export default RootLayout
