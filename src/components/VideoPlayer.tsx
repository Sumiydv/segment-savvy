
import React, { useRef } from 'react';
import { VideoData } from '../types/video';
import { cn } from '@/lib/utils';
import VideoControls from './video/VideoControls';
import VideoProgressBar from './video/VideoProgressBar';
import { useVideoTracking } from '@/hooks/useVideoTracking';

interface VideoPlayerProps {
  video: VideoData;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    buffered,
    duration,
    progress
  } = useVideoTracking(videoRef, video);
  
  const togglePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const progressBar = progressBarRef.current;
    const videoElement = videoRef.current;
    
    if (!progressBar || !videoElement) return;
    
    const rect = progressBar.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const newTime = position * duration;
    
    videoElement.currentTime = newTime;
  };
  
  return (
    <div className={cn("relative rounded-md overflow-hidden shadow-xl", className)}>
      <video
        ref={videoRef}
        className="w-full h-auto"
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 px-4 text-white">
        <div ref={progressBarRef}>
          <VideoProgressBar
            currentTime={currentTime}
            duration={duration}
            buffered={buffered}
            intervals={progress?.intervals}
            onSeek={handleProgressClick}
          />
        </div>
        
        <VideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          progress={progress}
          onPlayPause={togglePlayPause}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
