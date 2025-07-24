"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import TetrisGame from "@/components/tetris-game"
import { useAuth } from "@/lib/hooks/useAuth"

export default function GamePage() {
  const router = useRouter()// dieu huong
  const { user } = useAuth()// su ly va lay thong tin

  // xu ly khi game ket thuc
  const handleGameOver = useCallback((score: number) => {
    // gui diem so cao toi server
  }, [])

  const returnToMenu = () => {// quay ve trang chu
    router.push('/')
  }

  //choi game khong co user

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/*hien thi dang nhap */}
      {user && (
        <div className="absolute top-6 right-6 z-50">
          <div className="flex items-center gap-2 bg-black/70 px-3 py-1 rounded">
            <span className="text-yellow-300 font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              Xin chào, {user.name}
            </span>
          </div>
        </div>
      )}

      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none"></div>

      {/* Game */}
      <TetrisGame onReturn={returnToMenu} onGameOver={handleGameOver} />
    </div>
  )
}
