/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Sports Video Player with Event Timeline & Clip Jumping
 * Crisp, modern bwin-inspired styling with timeline scrubber & event markers.
 */

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, AlertTriangle, Sparkles, Upload } from 'lucide-react';
import { GeminiVideoEvent } from '../types';

interface VideoPlayerProps {
  videoUrl?: string;
  events?: GeminiVideoEvent[];
  videoQuality?: { score_0_to_1: number; problems: string[] };
  selectedTimestamp?: number | null;
  onSelectTimestamp?: (time: number) => void;
  onUploadCustomVideo?: (file: File) => void;
  onAnalyzeTrigger?: () => void;
  isAnalyzing?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  events = [],
  videoQuality,
  selectedTimestamp,
  onSelectTimestamp,
  onUploadCustomVideo,
  onAnalyzeTrigger,
  isAnalyzing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(600); // default 10min
  const [isMuted, setIsMuted] = useState(true);

  // Jump to timestamp when prop changes
  useEffect(() => {
    if (selectedTimestamp !== null && selectedTimestamp !== undefined && videoRef.current) {
      videoRef.current.currentTime = selectedTimestamp;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [selectedTimestamp]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowQuality = videoQuality && videoQuality.score_0_to_1 < 0.4;

  return (
    <div className="bwin-card overflow-hidden flex flex-col bg-slate-900 border border-slate-800 shadow-md">
      {/* Video Viewport Container */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
        <video
          ref={videoRef}
          src={videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          muted={isMuted}
          playsInline
        />

        {/* Quality Warning Overlay if Score < 0.4 */}
        {isLowQuality && (
          <div className="absolute top-3 left-3 right-3 bg-amber-950/90 border border-amber-800/80 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-200 backdrop-blur-md z-20 shadow-md">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-100">Low Video Quality Score ({Math.round(videoQuality.score_0_to_1 * 100)}%):</strong>
              <p className="mt-0.5 text-amber-300">
                AI visibility is constrained ({videoQuality.problems.join(', ') || 'poor lighting/occlusion'}). Manual statistic entry mode is recommended.
              </p>
            </div>
          </div>
        )}

        {/* Big Center Play/Pause button on hover */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-16 h-16 rounded-full bg-white/95 text-blue-600 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </div>
        </button>

        {/* Time Overlay Badge */}
        <div className="absolute bottom-3 left-3 bg-slate-950/85 px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums text-white border border-white/10 pointer-events-none shadow-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Timeline Scrubber with Visual Event Markers */}
      <div className="px-5 pt-4 pb-3 bg-slate-900 border-t border-slate-800">
        <div className="relative flex items-center h-6">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-hidden"
          />

          {/* Event Marker Pins along the timeline bar */}
          {events.map((evt, idx) => {
            const pct = Math.min(Math.max((evt.timestamp_seconds / (duration || 600)) * 100, 0), 100);
            return (
              <button
                key={idx}
                onClick={() => onSelectTimestamp && onSelectTimestamp(evt.timestamp_seconds)}
                title={`${evt.type.toUpperCase()} by ${evt.player_ref} at ${formatTime(evt.timestamp_seconds)}: ${evt.note}`}
                style={{ left: `${pct}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-400 hover:bg-white hover:scale-150 transition-transform cursor-pointer border border-slate-900 shadow-xs"
              />
            );
          })}
        </div>

        {/* Player Controls Strip */}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
                }
              }}
              title="Replay 5s"
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">-5s</span>
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Custom file upload */}
            <label className="cursor-pointer px-3 py-1.5 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 font-medium border border-slate-700">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Video</span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && onUploadCustomVideo) onUploadCustomVideo(file);
                }}
              />
            </label>

            {onAnalyzeTrigger && (
              <button
                onClick={onAnalyzeTrigger}
                disabled={isAnalyzing}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#2954ea] hover:bg-blue-600 text-white transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAnalyzing ? 'Analyzing Clip...' : 'Run Gemini Analysis'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
