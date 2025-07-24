"use client"

import { motion } from "framer-motion"


export default function TetrisLogo() {
  const pixelSize = 12

  //Cac chu cai 
  const T = [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ]
  const E = [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
  ]
  const R = [
    [1, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 0],
    [1, 0, 1, 0],
    [1, 0, 0, 1],
  ]
  const I = [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ]
  const S = [
    [0, 1, 1, 1],
    [1, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 1],
    [1, 1, 1, 0],
  ]

  //Mau cau vong
  const rainbow = ["#FF4D6D", "#FFD600", "#57CC99", "#4EA8DE", "#A06CD5", "#FF7B00"]

  const letterData = [ // Du lieu cac chu cai
    { letter: T, color: rainbow[0] },
    { letter: E, color: rainbow[1] },
    { letter: T, color: rainbow[2] },
    { letter: R, color: rainbow[3] },
    { letter: I, color: rainbow[4] },
    { letter: S, color: rainbow[5] },
  ]

  return (
    <div className="relative select-none" style={{ userSelect: "none" }}> 
      <div className="flex items-center space-x-2 relative z-10"> 
        {letterData.map((item, letterIndex) => ( // Lap qua tung chu cai
          <motion.div // Animation 
            key={letterIndex} 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ // Thoi gian va kieu animation
              delay: 0.1 * letterIndex,
              duration: 0.3,
              type: "spring",
              stiffness: 200,
            }}
            className="flex flex-col"
          >
            {item.letter.map((row, rowIndex) => ( // Lap qua tung chu cai
              <div key={rowIndex} className="flex">
                {row.map((pixel, pixelIndex) => (
                  <motion.div // Animation cho tung pixel
                    key={pixelIndex}
                    initial={{ scale: 0 }}
                    animate={{ scale: pixel ? 1 : 0 }}
                    transition={{
                      delay: 0.1 * letterIndex + 0.01 * (rowIndex + pixelIndex), 
                      type: "spring",
                      stiffness: 300,
                      damping: 15, 
                    }}
                    style={{
                      width: pixelSize,
                      height: pixelSize,
                      backgroundColor: pixel ? item.color : "transparent",
                    }}
                    className={pixel ? "shadow-sm" : ""}
                  />
                ))}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
}