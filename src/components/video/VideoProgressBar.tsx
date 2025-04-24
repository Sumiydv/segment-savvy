
import React from 'react';
import { VideoInterval } from '@/types/video';

interface VideoProgressBarProps {
  currentTime: number;
  duration: number;
  buffered: number;
  intervals?: VideoInterval[];
  onSeek: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const VideoProgressBar: React.FC<VideoProgressBarProps> = ({
  currentTime,
  duration,
  buffered,
  intervals = [],
  onSeek,
}) => {
  return (
    <div 
      className="video-progress-bar relative mb-2 h-1 bg-gray-600 cursor-pointer"
      onClick={onSeek}
    >
      {/* Buffered indicator */}
      <div 
        className="absolute h-full bg-gray-400 opacity-50"
        style={{ width: `${buffered}%` }}
      />
      
      {/* Watched segments indicators */}
      {intervals.map((interval, index) => {
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
      })}
      
      {/* Current progress indicator */}
      <div 
        className="video-progress-fill absolute h-full bg-blue-500"
        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
      />
    </div>
  );
};

export default VideoProgressBar;
