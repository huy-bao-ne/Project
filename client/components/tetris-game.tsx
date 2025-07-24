"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import GameOverScreen from "./game-over-screen"
import KeyGuide from "./key-guide"

const BOARD_WIDTH = 10 // 10 cot
const BOARD_HEIGHT = 20 // 20 hang
const BLOCK_SIZE = 30
const LEVEL_SPEED = [800, 650, 500, 400, 300, 250, 200, 150, 100, 80, 50] // toc do roi theo level
const LINE_CLEAR_SOUND_URL = "/sounds/collect point.mp3"

const TETRIMINO_KEYS = ['I', 'O', 'T', 'J', 'L', 'S', 'Z'] as const // danh sach cac khoi
type TetriminoKey = typeof TETRIMINO_KEYS[number] // loai khoi

const TETRIMINOS: Record<TetriminoKey, { shape: number[][]; color: string }> = { // cac khoi va hinh dang
  I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: "#4EA8DE" },
  O: { shape: [[1,1],[1,1]], color: "#FFC857" },
  T: { shape: [[0,1,0],[1,1,1],[0,0,0]], color: "#A06CD5" },
  J: { shape: [[1,0,0],[1,1,1],[0,0,0]], color: "#57CC99" },
  L: { shape: [[0,0,1],[1,1,1],[0,0,0]], color: "#FF7B00" },
  S: { shape: [[0,1,1],[1,1,0],[0,0,0]], color: "#FF8FA3" },
  Z: { shape: [[1,1,0],[0,1,1],[0,0,0]], color: "#FF4D6D" },
}

type Tetrimino = {
  shape: number[][];
  color: string;
  type: TetriminoKey;
};

type BoardCell = 0 | Tetrimino; // rong  hoac mot khoi

const createEmptyBoard = (): BoardCell[][] => //bang rong 
  Array.from({ length: BOARD_HEIGHT }, () => Array.from({ length: BOARD_WIDTH }, () => 0))

const getRandomTetrimino = () => {
  const type = TETRIMINO_KEYS[Math.floor(Math.random() * TETRIMINO_KEYS.length)]
  return { ...TETRIMINOS[type], type }
}

// khoi moi bat dau o giua
const initialPosition = { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 }

type TetrisGameProps = {
  onReturn: () => void
  onGameOver?: (score: number) => void // gui diem so khi game over
}

export default function TetrisGame({ onReturn, onGameOver }: TetrisGameProps) { 
  const [board, setBoard] = useState(createEmptyBoard())
  const [currentPiece, setCurrentPiece] = useState(getRandomTetrimino())
  const [nextPiece, setNextPiece] = useState(getRandomTetrimino())
  const [position, setPosition] = useState({ ...initialPosition })
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const lineClearSoundRef = useRef<HTMLAudioElement | null>(null)
  const dropIntervalRef = useRef<NodeJS.Timeout | null>(null) // Thoi gian giua cac lan roi

  useEffect(() => { // am thanh xoa dong
    lineClearSoundRef.current = new Audio(LINE_CLEAR_SOUND_URL)
    return () => { if (lineClearSoundRef.current) lineClearSoundRef.current = null }
  }, [])

  const playLineClearSound = useCallback(() => { // phat am thanh xoa dong
    if (lineClearSoundRef.current) {
      lineClearSoundRef.current.currentTime = 0
      lineClearSoundRef.current.play().catch(() => {})
    }
  }, [])

  const checkCollision = useCallback( // kiem tra va cham
    (piece: { shape: string | any[] }, pos: { x: number; y: number }) => {
      for (let y = 0; y < piece.shape.length; y++)
        for (let x = 0; x < piece.shape[y].length; x++)
          if (
            piece.shape[y][x] &&
            (pos.x + x < 0 ||
              pos.x + x >= BOARD_WIDTH ||
              pos.y + y >= BOARD_HEIGHT ||
              (pos.y + y >= 0 && board[pos.y + y][pos.x + x]))
          )
            return true
      return false
    },
    [board],
  )

  const updateBoard = useCallback(() => { // cap nhat bang khi khoi roi xuong
    const newBoard = board.map((row) => [...row]) // sao chep bang hien tai
    for (let y = 0; y < currentPiece.shape.length; y++) 
      for (let x = 0; x < currentPiece.shape[y].length; x++)
        if (currentPiece.shape[y][x]) {
          const by = position.y + y
          const bx = position.x + x
          if (by >= 0 && by < BOARD_HEIGHT && bx >= 0 && bx < BOARD_WIDTH)
            newBoard[by][bx] = currentPiece // dat lai khoi vao bang
        }
    const completed: number[] = [] 
    for (let y = 0; y < BOARD_HEIGHT; y++) // kiem tra cac dong da day
      if (newBoard[y].every((cell) => cell !== 0)) completed.push(y) 
    if (completed.length) { // neu dong day
      playLineClearSound()
      const linePoints = [40, 100, 300, 1200] //tang diem so cho dong da xoa
      setScore((s) => s + linePoints[completed.length - 1] * level) // tang diem so
      setLines((l) => { // cap nhat so dong da xoa
        const nl = l + completed.length
        setLevel(Math.floor(nl / 10) + 1) // tang level moi 10 dong
        return nl
      })
      const filtered = newBoard.filter((_, i) => !completed.includes(i)) // loai bo dong da xoa
      const newRows: BoardCell[][] = Array.from({ length: completed.length }, () => // tao dong moi
        Array.from({ length: BOARD_WIDTH }, () => 0 as BoardCell) 
      )
      setBoard([...newRows, ...filtered]) // them dong moi vao dau bang
    } else setBoard(newBoard)
    if (position.y <= 0) { // neu khoi o tren cung
      setGameOver(true)
      if (dropIntervalRef.current) clearInterval(dropIntervalRef.current) // dung thoi gian roi
      return // dung game
    } 
    setPosition({ ...initialPosition }) // dat lai vi tri khoi moi
    setCurrentPiece(nextPiece) // dat khoi moi
    setNextPiece(getRandomTetrimino()) // lay khoi tiep theo ngau nhien
  }, [board, currentPiece, nextPiece, position, level, playLineClearSound])

  const rotate = useCallback( // xoay khoi
      (piece: Tetrimino) => ({ // tra ve khoi da xoay
        ...piece,
        shape: piece.shape[0].map((_, i) => piece.shape.map((row) => row[i]).reverse()), // xoay 90 do
      }),
      [],
    )

  const tryRotate = useCallback(() => { // kiem tra xoay khoi
    const rotated = rotate(currentPiece) 
    if (!checkCollision(rotated, position)) setCurrentPiece(rotated) 
  }, [currentPiece, position, rotate, checkCollision]) // neu khong va cham xoay khoi hien tai 

  const moveHorizontal = useCallback( // di chuyen ngang 
    (dir: number) => {
      if (gameOver || isPaused) return
      const newPos = { ...position, x: position.x + dir }
      if (!checkCollision(currentPiece, newPos)) setPosition(newPos)
    },
    [currentPiece, position, checkCollision, gameOver, isPaused],
  )

  const moveDown = useCallback(() => { // di chuyen xuong
    if (gameOver || isPaused) return // neu khong roi duoc nua
    const newPos = { ...position, y: position.y + 1 }
    if (!checkCollision(currentPiece, newPos)) setPosition(newPos)
    else updateBoard() // co dinh khoi
  }, [currentPiece, position, checkCollision, gameOver, isPaused, updateBoard])

  const hardDrop = useCallback(() => {// roi nhanh
    if (gameOver || isPaused) return
    let newY = position.y
    while (!checkCollision(currentPiece, { x: position.x, y: newY + 1 }) && newY < BOARD_HEIGHT) newY++
    setPosition({ x: position.x, y: newY })
  }, [currentPiece, position, checkCollision, gameOver, isPaused])

  useEffect(() => {// Kiem tra va cham khi khoi roi xuong
    if (!gameOver && !isPaused && position.y > 0) { 
      if (checkCollision(currentPiece, { x: position.x, y: position.y + 1 })) {
        const lockTimeout = setTimeout(updateBoard, 50)
        return () => clearTimeout(lockTimeout)
      }
    }
  }, [position.x, position.y, currentPiece, checkCollision, updateBoard, gameOver, isPaused])

  useEffect(() => { // Xu ly khi nhan phim
    const handleKeyDown = (e: { key: string }) => {
      if (gameOver) return
      if (e.key === "ArrowLeft") moveHorizontal(-1)
      else if (e.key === "ArrowRight") moveHorizontal(1)
      else if (e.key === "ArrowDown") moveDown()
      else if (e.key === "ArrowUp") tryRotate()
      else if (e.key === " ") hardDrop() 
      else if (e.key === "p" || e.key === "P") setIsPaused((p) => !p)
    }
    window.addEventListener("keydown", handleKeyDown) 
    return () => window.removeEventListener("keydown", handleKeyDown) 
  }, [moveHorizontal, moveDown, tryRotate, hardDrop, gameOver])

  const restartGame = useCallback(() => { // Khoi dong lai game
    setBoard(createEmptyBoard()) // Tao bang moi
    setCurrentPiece(getRandomTetrimino()) // Khoi moi ngau nhien
    setNextPiece(getRandomTetrimino()) // Khoi tiep theo ngau nhien
    setPosition({ ...initialPosition }) // Dat lai vi tri khoi
    setGameOver(false) // Dat trang thai game lai tu dau
    setScore(0) // Dat lai diem so
    setLevel(1) // Dat lai level
    setLines(0) // Dat lai so dong da xoa
    setIsPaused(false) // Dat trang thai pause ve false
  }, [])

  useEffect(() => { // thoi gian roi theo level
    if (!gameOver && !isPaused) { 
      if (dropIntervalRef.current) clearInterval(dropIntervalRef.current) 
      const dropSpeed = LEVEL_SPEED[Math.min(level - 1, LEVEL_SPEED.length - 1)] // doi toc do roi theo level
      dropIntervalRef.current = setInterval(moveDown, dropSpeed) // thiet lap thoi gian roi
    } else if (dropIntervalRef.current) clearInterval(dropIntervalRef.current) 
    return () => { if (dropIntervalRef.current) clearInterval(dropIntervalRef.current) }
  }, [level, moveDown, gameOver, isPaused])

  useEffect(() => { //pop up game over
    if (gameOver && typeof onGameOver === "function") {
      onGameOver(score)
    }
  }, [gameOver, score, onGameOver])

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center py-8">
      {gameOver ? (
        <GameOverScreen score={score} onRestart={restartGame} onMainMenu={onReturn} />
      ) : (
        <div className="flex flex-col md:flex-row items-start justify-center gap-6">
          {/*Bang game*/}
          <div className="relative w-fit h-fit border-4 border-black bg-black">
            <div className="grid grid-cols-10 grid-rows-20">
              {board.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`cell-${y}-${x}`}
                    className="border"
                    style={{
                      borderColor: "#444",
                      width: BLOCK_SIZE,
                      height: BLOCK_SIZE,
                      backgroundColor: typeof cell === "object" && cell !== null && "color" in cell ? cell.color : "transparent",
                    }}
                  />
                )),
              )}
            </div>
            {/*Khoi*/}
            {currentPiece.shape.map((row: any[], y: number) =>
              row.map((cell, x) => {
                const bx = position.x + x
                const by = position.y + y
                return cell && by >= 0 && by < BOARD_HEIGHT && bx >= 0 && bx < BOARD_WIDTH ? (
                  <div
                    key={`piece-${by}-${bx}`}
                    className="absolute border-2 border-black"
                    style={{
                      width: BLOCK_SIZE,
                      height: BLOCK_SIZE,
                      backgroundColor: currentPiece.color,
                      left: bx * BLOCK_SIZE,
                      top: by * BLOCK_SIZE,
                    }}
                  />
                ) : null
              }),
            )}
            {isPaused && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-white text-3xl font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  PAUSED
                </div>
              </div>
            )}
          </div>
          {/*bang thong tin*/}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-black p-4 border-4 border-black w-48">
              <div className="text-center mb-4">
                <h3 className="font-bold uppercase tracking-wide mb-2 text-white" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  NEXT
                </h3>
                <div className="flex justify-center items-center">
                  <div className="relative w-24 h-24 bg-black border-[3px] border-white">
                    <div className="absolute inset-2 border-[3px] border-white">
                      <div className="relative w-full h-full">
                        {nextPiece.shape.map((row: any[], y: number) =>
                          row.map((cell: any, x: number) =>
                            cell ? (
                              <div
                                key={`next-${y}-${x}`}
                                className="absolute border-2 border-black"
                                style={{
                                  width: 18,
                                  height: 18,
                                  backgroundColor: nextPiece.color,
                                  left: x * 18 + 9,
                                  top: y * 18 + 9,
                                }}
                              />
                            ) : null,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/*Bang diem*/}
              <div className="space-y-4">
                <div className="bg-black p-3">
                  <h3 className="font-bold uppercase tracking-wide text-white mb-1 text-xs" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    SCORE
                  </h3>
                  <p className="font-mono text-lg text-[#00ff00] leading-none">{score.toString().padStart(6, "0")}</p>
                </div>
                <div className="bg-black p-3">
                  <h3 className="font-bold uppercase tracking-wide text-white mb-1 text-xs" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    LEVEL
                  </h3>
                  <p className="font-mono text-lg text-[#00ff00] leading-none">{level.toString().padStart(2, "0")}</p>
                </div>
                <div className="bg-black p-3">
                  <h3 className="font-bold uppercase tracking-wide text-white mb-1 text-xs" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    LINES
                  </h3>
                  <p className="font-mono text-lg text-[#00ff00] leading-none">{lines.toString().padStart(4, "0")}</p>
                </div>
              </div>
            </div>
            {/*Nut*/}
            <div className="space-y-3 w-48">
              <button onClick={() => setIsPaused((p) => !p)} className="w-full py-3 bg-blue-400 text-white font-bold border-4 border-black">
                {isPaused ? "RESUME" : "PAUSE"}
              </button>
              <button onClick={restartGame} className="w-full py-3 bg-pink-400 text-white font-bold border-4 border-black">
                RESTART
              </button>
              <button onClick={onReturn} className="w-full py-3 bg-yellow-300 text-black font-bold border-4 border-black">
                MENU
              </button>
            </div>
          </div>
        </div>
      )}
      <KeyGuide />
    </div>
  )
}