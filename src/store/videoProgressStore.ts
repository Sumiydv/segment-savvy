import { create } from 'zustand';
import { VideoInterval, VideoProgress } from '../types/video';

interface VideoProgressState {
  // Map of videoId -> VideoProgress
  progressMap: Map<string, VideoProgress>;
  
  // Current active video
  currentVideoId: string | null;
  
  // Actions
  initializeVideo: (videoId: string, totalDuration: number) => void;
  addInterval: (videoId: string, start: number, end: number) => void;
  setLastPosition: (videoId: string, position: number) => void;
  getProgress: (videoId: string) => VideoProgress | undefined;
  
  // Save & load from localStorage
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

// Helper to merge intervals and avoid counting repeated segments
const mergeIntervals = (intervals: VideoInterval[]): VideoInterval[] => {
  if (!intervals.length) return [];
  
  // Sort intervals by start time
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  
  const result: VideoInterval[] = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = result[result.length - 1];
    
    // If current interval overlaps with last, merge them
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      // Otherwise, add the interval to the result
      result.push(current);
    }
  }
  
  return result;
};

// Calculate total watched time from intervals
const calculateWatchedTime = (intervals: VideoInterval[]): number => {
  return intervals.reduce((total, interval) => {
    return total + (interval.end - interval.start);
  }, 0);
};

export const useVideoProgressStore = create<VideoProgressState>((set, get) => ({
  progressMap: new Map(),
  currentVideoId: null,
  
  initializeVideo: (videoId, totalDuration) => {
    set((state) => {
      // Don't override existing progress
      if (state.progressMap.has(videoId)) {
        return { currentVideoId: videoId };
      }
      
      const newMap = new Map(state.progressMap);
      newMap.set(videoId, {
        videoId,
        intervals: [],
        totalWatchedTime: 0,
        totalDuration,
        percentWatched: 0,
        lastPosition: 0
      });
      
      return { 
        progressMap: newMap,
        currentVideoId: videoId
      };
    });
  },
  
  addInterval: (videoId, start, end) => {
    if (start >= end) return; // Invalid interval
    
    set((state) => {
      const videoProgress = state.progressMap.get(videoId);
      if (!videoProgress) return state; // No existing progress
      
      // Add new interval
      const newIntervals = mergeIntervals([
        ...videoProgress.intervals, 
        { start, end }
      ]);
      
      const totalWatchedTime = calculateWatchedTime(newIntervals);
      const percentWatched = (totalWatchedTime / videoProgress.totalDuration) * 100;
      
      const newMap = new Map(state.progressMap);
      newMap.set(videoId, {
        ...videoProgress,
        intervals: newIntervals,
        totalWatchedTime,
        percentWatched: Math.min(100, percentWatched)
      });
      
      return { progressMap: newMap };
    });
    
    // Save to localStorage after updating
    get().saveToStorage();
  },
  
  setLastPosition: (videoId, position) => {
    set((state) => {
      const videoProgress = state.progressMap.get(videoId);
      if (!videoProgress) return state;
      
      const newMap = new Map(state.progressMap);
      newMap.set(videoId, {
        ...videoProgress,
        lastPosition: position
      });
      
      return { progressMap: newMap };
    });
    
    // Save to localStorage after updating
    get().saveToStorage();
  },
  
  getProgress: (videoId) => {
    return get().progressMap.get(videoId);
  },
  
  saveToStorage: () => {
    try {
      const { progressMap } = get();
      const serialized = JSON.stringify(Array.from(progressMap.entries()));
      localStorage.setItem('videoProgress', serialized);
    } catch (error) {
      console.error('Error saving progress to localStorage:', error);
    }
  },
  
  loadFromStorage: () => {
    try {
      const serialized = localStorage.getItem('videoProgress');
      if (serialized) {
        const entries = JSON.parse(serialized);
        const loadedMap = new Map(entries);
        set({ progressMap: loadedMap });
      }
    } catch (error) {
      console.error('Error loading progress from localStorage:', error);
    }
  }
}));
