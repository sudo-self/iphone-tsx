"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const GRID_SIZE = 20
const CANVAS_SIZE = 400
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_FOOD = { x: 15, y: 15 }
const INITIAL_DIRECTION = { x: 0, y: 0 }

type Position = {
  x: number
  y: number
}

type Direction = {
  x: number
  y: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const backgroundRef = useRef<HTMLCanvasElement>(null)
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>(INITIAL_FOOD)
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])

  // Generate random food position
  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      }
    } while (snakeBody.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  // Create particles for effects
  const createParticles = useCallback((x: number, y: number, count = 8) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x * GRID_SIZE + GRID_SIZE / 2,
        y: y * GRID_SIZE + GRID_SIZE / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30,
        maxLife: 30,
      })
    }
    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  // Check collision with walls or self
  const checkCollision = useCallback((head: Position, snakeBody: Position[]): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
      return true
    }
    // Self collision
    return snakeBody.some((segment) => segment.x === head.x && segment.y === head.y)
  }, [])

  // Game loop
  const moveSnake = useCallback(() => {
    if (!gameRunning || gameOver) return

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }

      // Move head in current direction
      head.x += direction.x
      head.y += direction.y

      // Check for collisions
      if (checkCollision(head, newSnake)) {
        setGameOver(true)
        setGameRunning(false)
        createParticles(head.x, head.y, 15) // Explosion effect
        return currentSnake
      }

      newSnake.unshift(head)

      // Check if food is eaten
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + 10)
        setFood(generateFood(newSnake))
        createParticles(food.x, food.y, 12) // Food eaten effect
      } else {
        newSnake.pop() // Remove tail if no food eaten
      }

      return newSnake
    })
  }, [direction, food, gameRunning, gameOver, checkCollision, generateFood, createParticles])

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!gameRunning) return

      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 0) setDirection({ x: 0, y: -1 })
          break
        case "ArrowDown":
          if (direction.y === 0) setDirection({ x: 0, y: 1 })
          break
        case "ArrowLeft":
          if (direction.x === 0) setDirection({ x: -1, y: 0 })
          break
        case "ArrowRight":
          if (direction.x === 0) setDirection({ x: 1, y: 0 })
          break
        case " ":
          e.preventDefault()
          setGameRunning(false)
          break
      }
    },
    [direction, gameRunning],
  )

  // Start new game
  const startGame = () => {
    setSnake(INITIAL_SNAKE)
    setFood(INITIAL_FOOD)
    setDirection({ x: 1, y: 0 }) // Start moving right
    setGameRunning(true)
    setGameOver(false)
    setScore(0)
    setParticles([])
  }

  // Reset game
  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setFood(INITIAL_FOOD)
    setDirection(INITIAL_DIRECTION)
    setGameRunning(false)
    setGameOver(false)
    setScore(0)
    setParticles([])
  }

  // Pause/Resume game
  const togglePause = () => {
    if (!gameOver) {
      setGameRunning(!gameRunning)
    }
  }

  // Update particles
  useEffect(() => {
    const updateParticles = () => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
            vx: particle.vx * 0.98,
            vy: particle.vy * 0.98,
          }))
          .filter((particle) => particle.life > 0),
      )
    }

    const particleInterval = setInterval(updateParticles, 16)
    return () => clearInterval(particleInterval)
  }, [])

  // Game loop effect
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150)
    return () => clearInterval(gameInterval)
  }, [moveSnake])

  // Keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
    }
  }, [score, highScore])

  // Background animation
  useEffect(() => {
    const canvas = backgroundRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Safe window access with fallbacks
    const canvasWidth = typeof window !== "undefined" ? window.innerWidth : 800
    const canvasHeight = typeof window !== "undefined" ? window.innerHeight : 600

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    let animationId: number
    const stars: Array<{ x: number; y: number; size: number; speed: number }> = []

    // Create stars
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
      })
    }

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      stars.forEach((star) => {
        star.y += star.speed
        if (star.y > canvasHeight) {
          star.y = 0
          star.x = Math.random() * canvasWidth
        }

        ctx.fillStyle = `rgba(0, 255, 255, ${star.size / 2})`
        ctx.fillRect(star.x, star.y, star.size, star.size)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw grid with glow
    ctx.strokeStyle = "rgba(0, 255, 255, 0.2)"
    ctx.lineWidth = 1
    ctx.shadowColor = "rgba(0, 255, 255, 0.5)"
    ctx.shadowBlur = 2
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, CANVAS_SIZE)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(CANVAS_SIZE, i)
      ctx.stroke()
    }

    // Draw snake with glow effect
    snake.forEach((segment, index) => {
      const isHead = index === 0
      ctx.shadowColor = isHead ? "rgba(0, 255, 0, 0.8)" : "rgba(0, 255, 0, 0.4)"
      ctx.shadowBlur = isHead ? 15 : 8

      const gradient = ctx.createLinearGradient(
        segment.x * GRID_SIZE,
        segment.y * GRID_SIZE,
        segment.x * GRID_SIZE + GRID_SIZE,
        segment.y * GRID_SIZE + GRID_SIZE,
      )

      if (isHead) {
        gradient.addColorStop(0, "#00ff00")
        gradient.addColorStop(1, "#00cc00")
      } else {
        gradient.addColorStop(0, "#00cc00")
        gradient.addColorStop(1, "#008800")
      }

      ctx.fillStyle = gradient
      ctx.fillRect(segment.x * GRID_SIZE + 2, segment.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4)
    })

    // Draw food with pulsing glow
    const time = Date.now() * 0.005
    const pulseIntensity = Math.sin(time) * 0.3 + 0.7
    ctx.shadowColor = `rgba(255, 0, 0, ${pulseIntensity})`
    ctx.shadowBlur = 20

    const foodGradient = ctx.createRadialGradient(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      0,
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2,
    )
    foodGradient.addColorStop(0, "#ff0000")
    foodGradient.addColorStop(1, "#cc0000")

    ctx.fillStyle = foodGradient
    ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4)

    // Draw particles
    particles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife
      ctx.shadowColor = `rgba(0, 255, 255, ${alpha})`
      ctx.shadowBlur = 5
      ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`
      ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2)
    })

    ctx.shadowBlur = 0
  }, [snake, food, particles])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <canvas
        ref={backgroundRef}
        className="absolute inset-0 opacity-30"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-md bg-black/80 border-cyan-500/30 backdrop-blur-sm shadow-2xl shadow-cyan-500/20 relative z-10">
        <CardHeader className="text-center border-b border-cyan-500/20">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            CYBER SNAKE
          </CardTitle>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-cyan-400 glow-text">SCORE: {score.toString().padStart(6, "0")}</span>
            <span className="text-purple-400 glow-text">HIGH: {highScore.toString().padStart(6, "0")}</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 p-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="border-2 border-cyan-500/50 rounded-lg shadow-lg shadow-cyan-500/30 bg-black/50"
            />
            {!gameRunning && !gameOver && score === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                <div className="text-center">
                  <div className="text-cyan-400 text-xl font-bold mb-2 animate-pulse">READY?</div>
                  <div className="text-gray-400 text-sm">Press START to begin</div>
                </div>
              </div>
            )}
            {!gameRunning && !gameOver && score > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                <div className="text-center">
                  <div className="text-yellow-400 text-xl font-bold mb-2 animate-pulse">PAUSED</div>
                  <div className="text-gray-400 text-sm">Press RESUME to continue</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {!gameRunning && !gameOver && (
              <Button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-black font-bold px-6 py-2 rounded-lg shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105 hover:shadow-green-500/50"
              >
                {score === 0 ? "START GAME" : "RESUME"}
              </Button>
            )}

            {gameRunning && (
              <Button
                onClick={togglePause}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-6 py-2 rounded-lg shadow-lg shadow-yellow-500/30 transition-all duration-300 hover:scale-105"
              >
                PAUSE
              </Button>
            )}

            {gameOver && (
              <Button
                onClick={startGame}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold px-6 py-2 rounded-lg shadow-lg shadow-red-500/30 transition-all duration-300 hover:scale-105 animate-pulse"
              >
                PLAY AGAIN
              </Button>
            )}

            <Button
              onClick={resetGame}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold px-6 py-2 rounded-lg shadow-lg shadow-gray-500/30 transition-all duration-300 hover:scale-105"
            >
              RESET
            </Button>
          </div>

          {gameOver && (
            <div className="text-center animate-bounce">
              <p className="text-red-400 font-bold text-xl mb-2 glow-text">GAME OVER</p>
              <p className="text-cyan-400 font-mono">FINAL SCORE: {score.toString().padStart(6, "0")}</p>
              {score === highScore && score > 0 && (
                <p className="text-yellow-400 font-bold text-sm mt-1 animate-pulse">NEW HIGH SCORE!</p>
              )}
            </div>
          )}

          <div className="text-center text-xs text-gray-400 space-y-1 font-mono border-t border-cyan-500/20 pt-4">
            <p className="text-cyan-300">↑↓←→ NAVIGATE • SPACE PAUSE</p>
            <p>CONSUME RED ENERGY CORES TO GROW</p>
            <p>AVOID WALLS AND SELF-COLLISION</p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .glow-text {
          text-shadow: 0 0 10px currentColor;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
