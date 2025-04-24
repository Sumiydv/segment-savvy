
export interface VideoInterval {
  start: number;
  end: number;
}

export interface VideoProgress {
  videoId: string;
  intervals: VideoInterval[];
  totalWatchedTime: number;
  totalDuration: number;
  percentWatched: number;
  lastPosition: number;
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  videoUrl: string;
}
