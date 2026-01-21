import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoplay?: boolean;
  onReady?: (player: Player) => void;
}

// Helper to detect YouTube URLs
const isYouTubeUrl = (url: string): boolean => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
};

// Helper to get video type based on URL/extension
const getVideoType = (url: string): string => {
  if (isYouTubeUrl(url)) {
    return 'video/youtube';
  }
  
  const extension = url.split('.').pop()?.toLowerCase().split('?')[0] || '';
  
  const typeMap: Record<string, string> = {
    // Standard formats
    'mp4': 'video/mp4',
    'm4v': 'video/mp4',
    'webm': 'video/webm',
    'ogv': 'video/ogg',
    'ogg': 'video/ogg',
    
    // Matroska
    'mkv': 'video/x-matroska',
    
    // AVI
    'avi': 'video/x-msvideo',
    
    // Windows Media
    'wmv': 'video/x-ms-wmv',
    'asf': 'video/x-ms-asf',
    
    // Flash (legacy)
    'flv': 'video/x-flv',
    'f4v': 'video/x-f4v',
    
    // MPEG
    'mpeg': 'video/mpeg',
    'mpg': 'video/mpeg',
    'mpe': 'video/mpeg',
    'mpv': 'video/mpeg',
    'm2v': 'video/mpeg',
    
    // 3GP (mobile)
    '3gp': 'video/3gpp',
    '3g2': 'video/3gpp2',
    
    // QuickTime
    'mov': 'video/quicktime',
    'qt': 'video/quicktime',
    
    // Transport Stream
    'ts': 'video/mp2t',
    'm2ts': 'video/mp2t',
    'mts': 'video/mp2t',
    
    // HLS
    'm3u8': 'application/x-mpegURL',
    
    // DASH
    'mpd': 'application/dash+xml',
  };
  
  return typeMap[extension] || 'video/mp4';
};

const VideoPlayer = ({ src, poster, className = '', autoplay = false, onReady }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Create video element
    const videoElement = document.createElement('video-js');
    videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-dark');
    videoRef.current.appendChild(videoElement);

    const videoType = getVideoType(src);
    const isYouTube = isYouTubeUrl(src);

    // Initialize player with appropriate config
    const playerOptions: Record<string, unknown> = {
      autoplay: autoplay,
      controls: true,
      responsive: true,
      fluid: true,
      playbackRates: [0.5, 1, 1.5, 2],
      poster: isYouTube ? undefined : poster,
      sources: [{
        src: src,
        type: videoType
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
    };

    // Add YouTube-specific options
    if (isYouTube) {
      playerOptions.techOrder = ['youtube'];
      playerOptions.youtube = {
        ytControls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3
      };
    }

    const player = videojs(videoElement, playerOptions);

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
  }, [src, poster, autoplay, onReady]);

  // Update source when src changes
  useEffect(() => {
    if (playerRef.current) {
      const videoType = getVideoType(src);
      playerRef.current.src({
        src: src,
        type: videoType
      });
      if (poster && !isYouTubeUrl(src)) {
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
        .video-player-container .vjs-youtube iframe {
          border-radius: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
