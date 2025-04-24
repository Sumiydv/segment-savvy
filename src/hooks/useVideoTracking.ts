
import { useState, useEffect, RefObject } from 'react';
import { useVideoProgressStore } from '@/store/videoProgressStore';
import { VideoData } from '@/types/video';

const UPDATE_INTERVAL = 1000;

export const useVideoTracking = (
  videoRef: RefObject<HTMLVideoElement>,
  video: VideoData
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  const [segmentStart, setSegmentStart] = useState<number | null>(null);

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
    
    const handleMetadataLoaded = () => {
      const actualDuration = videoElement.duration;
      initializeVideo(video.id, actualDuration);
      setDuration(actualDuration);
    };
    
    videoElement.addEventListener('loadedmetadata', handleMetadataLoaded);
    
    const savedProgress = getProgress(video.id);
    if (savedProgress && videoElement) {
      videoElement.currentTime = savedProgress.lastPosition;
    }
    
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleMetadataLoaded);
    };
  }, [video.id, initializeVideo, loadFromStorage, getProgress, videoRef]);

  // Track playback
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const trackPlayback = () => {
      setCurrentTime(videoElement.currentTime);
      
      if (videoElement.buffered.length > 0) {
        setBuffered(videoElement.buffered.end(0) / duration * 100);
      }
      
      if (isPlaying && segmentStart === null) {
        setSegmentStart(videoElement.currentTime);
      }
    };
    
    const intervalId = setInterval(trackPlayback, UPDATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [isPlaying, segmentStart, duration, videoRef]);

  // Handle playback state changes
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handlePause = () => {
      if (segmentStart !== null) {
        addInterval(video.id, segmentStart, videoElement.currentTime);
        setSegmentStart(null);
      }
    };
    
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
  }, [video.id, segmentStart, addInterval, videoRef]);

  // Save position on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        setLastPosition(video.id, videoRef.current.currentTime);
      }
    };
  }, [video.id, setLastPosition, videoRef]);

  return {
    isPlaying,
    setIsPlaying,
    currentTime,
    buffered,
    duration,
    progress: getProgress(video.id)
  };
};
