
import React from 'react';
import { VideoData } from '../types/video';
import { useVideoProgressStore } from '../store/videoProgressStore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface VideoLibraryProps {
  videos: VideoData[];
  onSelectVideo: (video: VideoData) => void;
  className?: string;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ 
  videos, 
  onSelectVideo,
  className
}) => {
  const { getProgress, loadFromStorage } = useVideoProgressStore();
  
  // Load progress from storage when component mounts
  React.useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);
  
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {videos.map((video) => {
        const progress = getProgress(video.id);
        const percentWatched = progress ? progress.percentWatched : 0;
        
        return (
          <Card 
            key={video.id} 
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectVideo(video)}
          >
            <div className="relative aspect-video">
              <img 
                src={video.thumbnailUrl} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
              {percentWatched > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                  <div 
                    className="h-full bg-blue-600"
                    style={{ width: `${percentWatched}%` }}
                  />
                </div>
              )}
            </div>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">{video.title}</CardTitle>
            </CardHeader>
            <CardFooter className="pt-0 pb-4 flex justify-between text-sm text-muted-foreground">
              <span>{formatDuration(video.duration)}</span>
              <span>{Math.round(percentWatched)}% completed</span>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

// Helper to format duration in MM:SS
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default VideoLibrary;
