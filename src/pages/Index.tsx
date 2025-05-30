
import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import VideoLibrary from '../components/VideoLibrary';
import { VideoData } from '../types/video';
import { sampleVideos } from '../data/sampleVideos';
import { useVideoProgressStore } from '../store/videoProgressStore';

const Index = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const { loadFromStorage } = useVideoProgressStore();
  
  // Load progress from storage on initial load
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);
  
  // Select the first video by default
  useEffect(() => {
    if (sampleVideos.length > 0 && !selectedVideo) {
      setSelectedVideo(sampleVideos[0]);
      setCurrentVideoIndex(0);
    }
  }, [selectedVideo]);
  
  const handleSelectVideo = (video: VideoData) => {
    const index = sampleVideos.findIndex(v => v.id === video.id);
    setSelectedVideo(video);
    setCurrentVideoIndex(index);
    // Scroll to top when selecting a new video
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < sampleVideos.length - 1) {
      const nextVideo = sampleVideos[currentVideoIndex + 1];
      setSelectedVideo(nextVideo);
      setCurrentVideoIndex(currentVideoIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      const previousVideo = sampleVideos[currentVideoIndex - 1];
      setSelectedVideo(previousVideo);
      setCurrentVideoIndex(currentVideoIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Smart Video Progress Tracker</h1>
          <p className="text-gray-600">Accurately track your learning progress</p>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        {selectedVideo ? (
          <div className="space-y-8">
            <div className="max-w-3xl mx-auto">
              <VideoPlayer 
                video={selectedVideo} 
                className="rounded-xl overflow-hidden shadow-xl"
                onNextVideo={handleNextVideo}
                onPreviousVideo={handlePreviousVideo}
                hasNextVideo={currentVideoIndex < sampleVideos.length - 1}
                hasPreviousVideo={currentVideoIndex > 0}
              />
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-semibold">{selectedVideo.title}</h2>
                  <span className="text-sm text-gray-500">
                    Lecture {currentVideoIndex + 1} of {sampleVideos.length}
                  </span>
                </div>
                <p className="text-gray-700">{selectedVideo.description}</p>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-200">
              <h3 className="text-xl font-medium mb-4">More lectures</h3>
              <VideoLibrary 
                videos={sampleVideos.filter(v => v.id !== selectedVideo.id)}
                onSelectVideo={handleSelectVideo}
              />
            </div>
          </div>
        ) : (
          <div className="py-6">
            <h2 className="text-xl font-medium mb-4">Available Lectures</h2>
            <VideoLibrary 
              videos={sampleVideos}
              onSelectVideo={handleSelectVideo}
            />
          </div>
        )}
      </main>
      
      <footer className="bg-gray-100 border-t border-gray-200 py-4 mt-10">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          Smart Video Progress Tracker &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
