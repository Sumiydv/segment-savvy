
import React, { useRef, useState, useEffect } from 'react';
import { VideoData } from '../types/video';
import { useVideoProgressStore } from '../store/videoProgressStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  video: VideoData;
  className?: string;
}

const UPDATE_INTERVAL = 1000; // Update progress every second

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Track current playback segment
  const [segmentStart, setSegmentStart] = useState<number | null>(null);
  
  // Video progress tracking
  const { 
    initializeVideo, 
    addInterval, 
    setLastPosition, 
    getProgress,
    loadFromStorage
  } = useVideoProgressStore();
  
  // Initialize video and handle metadata loading
  useEffect(() => {
    loadFromStorage();
    
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    // Load metadata to get actual duration
    const handleMetadataLoaded = () => {
      const actualDuration = videoElement.duration;
      // Initialize with actual video duration from metadata
      initializeVideo(video.id, actualDuration);
      setDuration(actualDuration);
    };
    
    videoElement.addEventListener('loadedmetadata', handleMetadataLoaded);
    
    // Load saved progress
    const savedProgress = getProgress(video.id);
    if (savedProgress && videoElement) {
      // Resume from last position
      videoElement.currentTime = savedProgress.lastPosition;
    }
    
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleMetadataLoaded);
    };
  }, [video.id, initializeVideo, loadFromStorage, getProgress]);
  
  // Set up interval for tracking playback
  useEffect(() => {
    const trackPlayback = () => {
      if (!videoRef.current) return;
      
      const currentVideoTime = videoRef.current.currentTime;
      setCurrentTime(currentVideoTime);
      
      // Update buffered amount
      if (videoRef.current.buffered.length > 0) {
        setBuffered(videoRef.current.buffered.end(0) / duration * 100);
      }
      
      // Only track segments when actually playing
      if (isPlaying) {
        // If we don't have a segment start yet, set it
        if (segmentStart === null) {
          setSegmentStart(currentVideoTime);
        }
      }
    };
    
    const intervalId = setInterval(trackPlayback, UPDATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [isPlaying, segmentStart, duration]);
  
  // When playback state changes, record the segment
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    // When video is paused, finalize the current segment
    const handlePause = () => {
      if (segmentStart !== null) {
        addInterval(video.id, segmentStart, videoElement.currentTime);
        setSegmentStart(null);
      }
    };
    
    // When seeking, finalize the current segment and start a new one
    const handleSeeking = () => {
      if (segmentStart !== null) {
        addInterval(video.id, segmentStart, videoElement.currentTime);
        setSegmentStart(null);
      }
    };
    
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('seeking', handleSeeking);
    
    return () => {
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('seeking', handleSeeking);
    };
  }, [video.id, segmentStart, addInterval]);
  
  // Update last position when component unmounts or video changes
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        setLastPosition(video.id, videoRef.current.currentTime);
      }
    };
  }, [video.id, setLastPosition]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  };
  
  // Handle seeking (clicking on the progress bar)
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const progressBar = progressBarRef.current;
    const videoElement = videoRef.current;
    
    if (!progressBar || !videoElement) return;
    
    // If we have an active segment, finalize it
    if (segmentStart !== null) {
      addInterval(video.id, segmentStart, videoElement.currentTime);
      setSegmentStart(null);
    }
    
    // Calculate new position
    const rect = progressBar.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const newTime = position * duration;
    
    // Set new time
    videoElement.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Get video progress data
  const progress = getProgress(video.id);
  
  // Render watched segments as markers on progress bar
  const renderWatchedSegments = () => {
    if (!progress || !progress.intervals.length || !duration) return null;
    
    return progress.intervals.map((interval, index) => {
      const startPercent = (interval.start / duration) * 100;
      const width = ((interval.end - interval.start) / duration) * 100;
      
      return (
        <div 
          key={index}
          className="segment-indicator"
          style={{
            left: `${startPercent}%`,
            width: `${width}%`
          }}
        />
      );
    });
  };
  
  return (
    <div className={cn("relative rounded-md overflow-hidden shadow-xl", className)}>
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-auto"
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setIsPlaying(false);
          if (segmentStart !== null) {
            addInterval(video.id, segmentStart, duration);
            setSegmentStart(null);
          }
        }}
      />
      
      {/* Video controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 px-4 text-white">
        {/* Progress bar */}
        <div 
          ref={progressBarRef}
          className="video-progress-bar relative mb-2 h-1 bg-gray-600 cursor-pointer"
          onClick={handleProgressClick}
        >
          {/* Buffered indicator */}
          <div 
            className="absolute h-full bg-gray-400 opacity-50"
            style={{ width: `${buffered}%` }}
          />
          
          {/* Watched segments indicators */}
          {renderWatchedSegments()}
          
          {/* Current progress indicator */}
          <div 
            className="video-progress-fill absolute h-full bg-blue-500"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Play/Pause button */}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            
            {/* Time display */}
            <div className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          {/* Right side - progress percentage */}
          <div className="text-sm font-medium">
            {progress ? Math.round(progress.percentWatched) : 0}% watched
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to format time in MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default VideoPlayer;
