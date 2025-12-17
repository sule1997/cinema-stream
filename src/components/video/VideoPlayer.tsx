import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  onReady?: (player: Player) => void;
}

const VideoPlayer = ({ src, poster, className = '', onReady }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Create video element
    const videoElement = document.createElement('video-js');
    videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-dark');
    videoRef.current.appendChild(videoElement);

    // Initialize player
    const player = videojs(videoElement, {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      playbackRates: [0.5, 1, 1.5, 2],
      poster: poster,
      sources: [{
        src: src,
        type: src.includes('.mkv') ? 'video/x-matroska' : 'video/mp4'
      }],
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'playbackRateMenuButton',
          'pictureInPictureToggle',
          'fullscreenToggle'
        ]
      }
    });

    playerRef.current = player;

    // Custom styling
    player.addClass('vjs-custom-theme');

    if (onReady) {
      player.ready(() => onReady(player));
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster, onReady]);

  // Update source when src changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.src({
        src: src,
        type: src.includes('.mkv') ? 'video/x-matroska' : 'video/mp4'
      });
      if (poster) {
        playerRef.current.poster(poster);
      }
    }
  }, [src, poster]);

  return (
    <div className={`video-player-container ${className}`}>
      <div ref={videoRef} className="w-full" />
      <style>{`
        .video-player-container .video-js {
          background-color: hsl(var(--background));
          border-radius: 0.75rem;
          overflow: hidden;
        }
        .video-player-container .vjs-control-bar {
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
        }
        .video-player-container .vjs-big-play-button {
          background-color: hsl(var(--primary));
          border: none;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          line-height: 80px;
          font-size: 40px;
          transition: transform 0.2s, background-color 0.2s;
        }
        .video-player-container .vjs-big-play-button:hover {
          background-color: hsl(var(--primary) / 0.9);
          transform: scale(1.1);
        }
        .video-player-container .vjs-play-progress,
        .video-player-container .vjs-volume-level {
          background-color: hsl(var(--primary));
        }
        .video-player-container .vjs-slider {
          background-color: rgba(255,255,255,0.2);
        }
        .video-player-container .vjs-load-progress {
          background-color: rgba(255,255,255,0.3);
        }
        .video-player-container .vjs-time-control {
          display: flex !important;
          align-items: center;
        }
        .video-player-container .vjs-remaining-time {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
