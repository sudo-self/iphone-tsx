"use client";

import { useEffect, useRef, useState } from "react";
import { SkipBack, SkipForward } from "lucide-react";

interface Track {
  id: number;
  title: string;
  artist: string;
  videoId: string;
}

const sampleTracks: Track[] = [
  {
    id: 1,
    title: "You Only Live Once",
    artist: "The Strokes",
    videoId: "pT68FS3YbQ4",
  },
  {
    id: 2,
    title: "I was running through the six",
    artist: "Drake",
    videoId: "jqScSp5l-AQ",
  },
  {
    id: 3,
    title: "Undercover",
    artist: "Lane 8",
    videoId: "HSydHbGdIcY",
  },
  {
    id: 4,
    title: "King of Everything",
    artist: "Wiz Khalifa",
    videoId: "8d0cm_hcQes",
  },
];

export default function MusicApp() {
  const playerRef = useRef<HTMLDivElement>(null);
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = sampleTracks[currentIndex];

  // Load YouTube IFrame API
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    } else {
      onYouTubeIframeAPIReady();
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      onYouTubeIframeAPIReady();
    };
  }, []);

  const onYouTubeIframeAPIReady = () => {
    const player = new (window as any).YT.Player(playerRef.current, {
      height: "0",
      width: "0",
      videoId: currentTrack.videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
      },
      events: {
        onReady: () => {
          setIsReady(true);
          player.setVolume(volume);
          setDuration(player.getDuration());
        },
        onStateChange: (e: any) => {
          if (e.data === 0) playNext();
        },
      },
    });

    setYtPlayer(player);
  };

  // Track switching
  useEffect(() => {
    if (ytPlayer && isReady) {
      ytPlayer.loadVideoById(currentTrack.videoId);
      setIsPlaying(true);
    }
  }, [currentIndex]);

  // Play/pause logic
  useEffect(() => {
    if (!ytPlayer) return;
    isPlaying ? ytPlayer.playVideo() : ytPlayer.pauseVideo();
  }, [isPlaying]);

  // Volume control
  useEffect(() => {
    if (ytPlayer) ytPlayer.setVolume(volume);
  }, [volume]);

  // Progress update loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (ytPlayer && ytPlayer.getCurrentTime) {
        setProgress(ytPlayer.getCurrentTime());
        setDuration(ytPlayer.getDuration());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [ytPlayer]);

  const playPrev = () => {
    setCurrentIndex((i) => (i === 0 ? sampleTracks.length - 1 : i - 1));
  };

  const playNext = () => {
    setCurrentIndex((i) => (i === sampleTracks.length - 1 ? 0 : i + 1));
  };

  const seekTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setProgress(time);
    if (ytPlayer) ytPlayer.seekTo(time, true);
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
      <div ref={playerRef} />

      <div className="text-center">
        <h2 className="text-2xl font-bold">{currentTrack.title}</h2>
        <p className="text-gray-400">{currentTrack.artist}</p>
      </div>

      <input
        type="range"
        min={0}
        max={duration}
        value={progress}
        onChange={seekTo}
        className="w-full max-w-md"
      />

      <div className="flex items-center gap-8">
        <button onClick={playPrev}>
          <SkipBack className="w-8 h-8" />
        </button>
        <button
          onClick={() => setIsPlaying((prev) => !prev)}
          className="px-6 py-3 bg-white text-black rounded-full text-lg"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={playNext}>
          <SkipForward className="w-8 h-8" />
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="w-full max-w-md"
      />
    </div>
  );
}
