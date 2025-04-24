
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { formatTime } from '@/lib/formatTime';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress?: { percentWatched: number };
  onPlayPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  progress,
  onPlayPause,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {hasPrevious && (
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onPrevious}
          >
            <SkipBack size={18} />
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onPlayPause}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </Button>
        
        {hasNext && (
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onNext}
          >
            <SkipForward size={18} />
          </Button>
        )}
        
        <div className="text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      
      <div className="text-sm font-medium">
        {progress ? Math.round(progress.percentWatched) : 0}% watched
      </div>
    </div>
  );
};

export default VideoControls;
