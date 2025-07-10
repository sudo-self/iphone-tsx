"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

interface YouTubePlayerProps {
  videoId: string
}

export default function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const [player, setPlayer] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      }

      window.onYouTubeIframeAPIReady = initPlayer
    } else {
      initPlayer()
    }

    function initPlayer() {
      if (!playerRef.current) return

      const newPlayer = new window.YT.Player(playerRef.current, {
        height: "360",
        width: "640",
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
        },
        events: {
          onReady: () => setIsReady(true),
        },
      })

      setPlayer(newPlayer)
    }

    return () => {
      player?.destroy()
    }
  }, [videoId])

  const handlePlay = () => player?.playVideo()
  const handlePause = () => player?.pauseVideo()

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={playerRef} className="w-full max-w-2xl aspect-video rounded-lg overflow-hidden shadow-lg" />

      {isReady && (
        <div className="flex gap-4">
          <button onClick={handlePlay} className="px-4 py-2 bg-green-500 text-white rounded">Play</button>
          <button onClick={handlePause} className="px-4 py-2 bg-red-500 text-white rounded">Pause</button>
        </div>
      )}
    </div>
  )
}
