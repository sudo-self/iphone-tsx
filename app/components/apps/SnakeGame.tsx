'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, Pause, RotateCcw, Trophy, Home } from 'lucide-react'

interface Position {
  x: number
  y: number
}

interface GameState {
  snake: Position[]
  food: Position
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  isPlaying: boolean
  isPaused: boolean
  score: number
  gameOver: boolean
}

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const GAME_SPEED = 150

export default function SnakeGame({ onClose }: { onClose: () => void }) {
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: { x: 15, y: 15 },
    direction: 'RIGHT',
    isPlaying: false,
    isPaused: false,
    score: 0,
    gameOver: false,
  })

  const [highScore, setHighScore] = useState(0)
  const [touchStart, setTouchStart] = useState<Position | null>(null)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const gameAreaRef = useRef<HTMLDivElement>(null)

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('snakeHighScore')
    if (saved) {
      setHighScore(parseInt(saved))
    }
  }, [])

  // Save high score when it changes
  useEffect(() => {
    if (gameState.score > highScore) {
      setHighScore(gameState.score)
      localStorage.setItem('snakeHighScore', gameState.score.toString())
    }
  }, [gameState.score, highScore])

  const generateFood = useCallback((snake: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (!prevState.isPlaying || prevState.isPaused || prevState.gameOver) {
        return prevState
      }

      const newSnake = [...prevState.snake]
      const head = { ...newSnake[0] }

      // Move head based on direction
      switch (prevState.direction) {
        case 'UP':
          head.y -= 1
          break
        case 'DOWN':
          head.y += 1
          break
        case 'LEFT':
          head.x -= 1
          break
        case 'RIGHT':
          head.x += 1
          break
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return { ...prevState, gameOver: true, isPlaying: false }
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return { ...prevState, gameOver: true, isPlaying: false }
      }

      newSnake.unshift(head)

      // Check food collision
      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        return {
          ...prevState,
          snake: newSnake,
          food: generateFood(newSnake),
          score: prevState.score + 10,
        }
      } else {
        newSnake.pop()
        return {
          ...prevState,
          snake: newSnake,
        }
      }
    })
  }, [generateFood])

  // Game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && !gameState.gameOver) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED)
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.gameOver, moveSnake])

  const startGame = () => {
    setGameState({
      snake: INITIAL_SNAKE,
      food: generateFood(INITIAL_SNAKE),
      direction: 'RIGHT',
      isPlaying: true,
      isPaused: false,
      score: 0,
      gameOver: false,
    })
  }

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))
  }

  const resetGame = () => {
    setGameState({
      snake: INITIAL_SNAKE,
      food: { x: 15, y: 15 },
      direction: 'RIGHT',
      isPlaying: false,
      isPaused: false,
      score: 0,
      gameOver: false,
    })
  }

  const changeDirection = (newDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    setGameState(prev => {
      // Prevent reverse direction
      if (
        (newDirection === 'UP' && prev.direction === 'DOWN') ||
        (newDirection === 'DOWN' && prev.direction === 'UP') ||
        (newDirection === 'LEFT' && prev.direction === 'RIGHT') ||
        (newDirection === 'RIGHT' && prev.direction === 'LEFT')
      ) {
        return prev
      }
      return { ...prev, direction: newDirection }
    })
  }

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    const minSwipeDistance = 50

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        changeDirection(deltaX > 0 ? 'RIGHT' : 'LEFT')
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        changeDirection(deltaY > 0 ? 'DOWN' : 'UP')
      }
    }

    setTouchStart(null)
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          changeDirection('UP')
          break
        case 'ArrowDown':
          e.preventDefault()
          changeDirection('DOWN')
          break
        case 'ArrowLeft':
          e.preventDefault()
          changeDirection('LEFT')
          break
        case 'ArrowRight':
          e.preventDefault()
          changeDirection('RIGHT')
          break
        case ' ':
          e.preventDefault()
          if (gameState.isPlaying) {
            pauseGame()
          } else {
            startGame()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState.isPlaying])

  return (
    <div className="h-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <Home className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Snake Game</h1>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          <span className="font-bold">{highScore}</span>
        </div>
      </div>

      {/* Score */}
      <div className="text-center text-white mb-4">
        <div className="text-2xl font-bold">Score: {gameState.score}</div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/20">
          <div
            ref={gameAreaRef}
            className="relative bg-black rounded-lg overflow-hidden"
            style={{
              width: GRID_SIZE * 15,
              height: GRID_SIZE * 15,
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Snake */}
            {gameState.snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute transition-all duration-75 ${
                  index === 0 ? 'bg-green-400' : 'bg-green-300'
                } rounded-sm`}
                style={{
                  left: segment.x * 15,
                  top: segment.y * 15,
                  width: 14,
                  height: 14,
                }}
              />
            ))}

            {/* Food */}
            <div
              className="absolute bg-red-500 rounded-full animate-pulse"
              style={{
                left: gameState.food.x * 15,
                top: gameState.food.y * 15,
                width: 14,
                height: 14,
              }}
            />

            {/* Game Over Overlay */}
            {gameState.gameOver && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold mb-2">Game Over!</div>
                  <div className="text-lg mb-4">Score: {gameState.score}</div>
                  {gameState.score === highScore && gameState.score > 0 && (
                    <div className="text-yellow-400 mb-4 flex items-center justify-center gap-2">
                      <Trophy className="h-5 w-5" />
                      New High Score!
                    </div>
                  )}
                  <Button onClick={startGame} className="bg-green-500 hover:bg-green-600">
                    Play Again
                  </Button>
                </div>
              </div>
            )}

            {/* Pause Overlay */}
            {gameState.isPaused && !gameState.gameOver && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">Paused</div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        <div className="flex justify-center gap-4">
          {!gameState.isPlaying ? (
            <Button
              onClick={startGame}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Game
            </Button>
          ) : (
            <Button
              onClick={pauseGame}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              size="lg"
            >
              <Pause className="h-5 w-5 mr-2" />
              {gameState.isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
          <Button
            onClick={resetGame}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            size="lg"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
        </div>

        {/* Swipe Instructions */}
        <div className="text-center text-white/80 text-sm">
          <div>Swipe to change direction</div>
          <div>Collect red food to grow and score points</div>
        </div>
      </div>
    </div>
  )
}