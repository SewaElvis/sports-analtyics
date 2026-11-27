/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Real-World Computer Vision Simulation Hub
 * Featuring YOLO 2026 Object Detection, ByteTrack Multi-Object Tracking, BOT-SORT, and MediaPipe Skeletal Estimation.
 * Uganda Christian University Sports Department
 */

import React, { useState, useEffect } from 'react';
import { SportType } from '../types';
import { Cpu, Eye, Activity, ShieldCheck, Zap, Video, Play, Pause, RefreshCw, BarChart2, Layers } from 'lucide-react';

interface ComputerVisionHubProps {
  initialSport?: SportType;
}

export const ComputerVisionHub: React.FC<ComputerVisionHubProps> = ({
  initialSport = 'basketball',
}) => {
  const [sport, setSport] = useState<SportType>(initialSport);
  const [activeModel, setActiveModel] = useState<'yolo2026' | 'bytetrack' | 'botsort' | 'mediapipe'>('yolo2026');
  const [isProcessing, setIsProcessing] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(88);
  const [selectedFrame, setSelectedFrame] = useState(1);

  // Simulated live tracking telemetry
  const [telemetry, setTelemetry] = useState([
    { id: 'T-01', name: 'Titus Lual (#7)', role: 'Center', bbox: [120, 240, 310, 360], confidence: 0.98, trackingId: 'BYT-104', velocity: '4.2 m/s', state: 'Active Paint Hold' },
    { id: 'T-02', name: 'Jerry Kayanga (#11)', role: 'Point Guard', bbox: [450, 180, 620, 300], confidence: 0.96, trackingId: 'BYT-105', velocity: '5.8 m/s', state: 'Pick & Roll Dribble' },
    { id: 'T-03', name: 'Jimmy Otim (#10)', role: 'Shooting Guard', bbox: [720, 310, 890, 420], confidence: 0.94, trackingId: 'BYT-106', velocity: '6.1 m/s', state: 'Wing Cut' },
    { id: 'T-04', name: 'KIU Opponent (#15)', role: 'Defender', bbox: [320, 260, 490, 370], confidence: 0.91, trackingId: 'BYT-109', velocity: '3.9 m/s', state: 'Drop Coverage' },
  ]);

  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setTelemetry(prev => prev.map(p => ({
        ...p,
        confidence: Number((0.90 + Math.random() * 0.09).toFixed(2)),
        velocity: `${(3.5 + Math.random() * 2.5).toFixed(1)} m/s`,
      })));
    }, 1500);
    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bwin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-600 uppercase tracking-wider">Computer Vision Engine</span>
            <span>·</span>
            <span>YOLO 2026 & BOT-SORT Pipeline</span>
            <span>·</span>
            <span className="text-emerald-600">60 FPS Real-World Inference</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-['Barlow_Condensed'] uppercase tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-600" />
            <span>AI Real-World Computer Vision Simulation Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time player detection, multi-object tracking, and skeletal pose estimation for UCU sports analysis.
          </p>
        </div>

        {/* Sport Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setSport('basketball')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${sport === 'basketball' ? 'bg-[#2954ea] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            🏀 Basketball
          </button>
          <button
            onClick={() => setSport('football')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${sport === 'football' ? 'bg-[#2954ea] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            ⚽ Football
          </button>
          <button
            onClick={() => setSport('netball')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${sport === 'netball' ? 'bg-[#2954ea] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            🏐 Netball
          </button>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveModel('yolo2026')}
          className={`bwin-card p-4 text-left transition-all border-2 ${activeModel === 'yolo2026' ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase">Object Detection</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">YOLO 2026</span>
          </div>
          <h3 className="font-bold text-slate-900 mt-2">YOLOv11 Bounding Boxes</h3>
          <p className="text-[11px] text-slate-500 mt-1">High-speed spatial bounding boxes for athletes, balls, and goal apparatus.</p>
        </button>

        <button
          onClick={() => setActiveModel('bytetrack')}
          className={`bwin-card p-4 text-left transition-all border-2 ${activeModel === 'bytetrack' ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase">Multi-Object Tracking</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">ByteTrack</span>
          </div>
          <h3 className="font-bold text-slate-900 mt-2">Association Without Loss</h3>
          <p className="text-[11px] text-slate-500 mt-1">Retains low-confidence detections to prevent ID switches during occlusion.</p>
        </button>

        <button
          onClick={() => setActiveModel('botsort')}
          className={`bwin-card p-4 text-left transition-all border-2 ${activeModel === 'botsort' ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 uppercase">Re-ID & Motion</span>
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">BOT-SORT</span>
          </div>
          <h3 className="font-bold text-slate-900 mt-2">Camera Motion Compensation</h3>
          <p className="text-[11px] text-slate-500 mt-1">Robust appearance feature matching and camera motion stabilization.</p>
        </button>

        <button
          onClick={() => setActiveModel('mediapipe')}
          className={`bwin-card p-4 text-left transition-all border-2 ${activeModel === 'mediapipe' ? 'border-emerald-600 bg-emerald-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase">Skeletal Estimation</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">MediaPipe</span>
          </div>
          <h3 className="font-bold text-slate-900 mt-2">Joint Landmark Tracking</h3>
          <p className="text-[11px] text-slate-500 mt-1">33 3D skeletal landmarks for shooting form and biomechanical analysis.</p>
        </button>
      </div>

      {/* Main Simulation Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Simulated Video Feed with Bounding Boxes */}
        <div className="lg:col-span-2 bwin-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold text-slate-900 text-sm uppercase">Live Inference Stream ({sport.toUpperCase()})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProcessing(!isProcessing)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 ${isProcessing ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-white'}`}
              >
                {isProcessing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isProcessing ? 'Pause Stream' : 'Resume Stream'}</span>
              </button>
            </div>
          </div>

          {/* Video Canvas Simulation Box */}
          <div className="relative w-full h-[400px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center group">
            {/* Background simulated pitch/court image */}
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80')` }} />

            {/* Overlaid Bounding Boxes / Skeletal Nodes */}
            {telemetry.map((p, idx) => (
              <div 
                key={p.id}
                className="absolute border-2 border-amber-400 bg-amber-400/10 rounded-lg p-2 transition-all duration-300 pointer-events-none flex flex-col justify-between"
                style={{
                  left: `${15 + idx * 20}%`,
                  top: `${20 + (idx % 2) * 25}%`,
                  width: '140px',
                  height: '160px',
                }}
              >
                <div className="bg-slate-950/90 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/50 flex items-center justify-between">
                  <span>{p.trackingId}</span>
                  <span>{(p.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-slate-950/90 text-white font-bold text-[10px] px-2 py-1 rounded border border-slate-700">
                  {p.name}
                  <span className="block text-[9px] text-slate-400 font-mono">{p.velocity}</span>
                </div>
              </div>
            ))}

            {/* Active Model Overlay Badge */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Pipeline: {activeModel.toUpperCase()} | 58.4 FPS | Latency: 14ms</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Confidence Threshold ({confidenceThreshold}%):</span>
              <input
                type="range"
                min="50"
                max="95"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-36 accent-blue-600"
              />
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-mono">
              <span>Resolution: 1280x720p</span>
              <span>·</span>
              <span>Codec: H.264 / TensorRT</span>
            </div>
          </div>
        </div>

        {/* Right Col: Live Telemetry & Tracking IDs */}
        <div className="bwin-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm uppercase font-['Barlow_Condensed']">
                Active Tracked Entities ({telemetry.length})
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                BOT-SORT Active
              </span>
            </div>

            <div className="space-y-3 pt-3 max-h-[320px] overflow-y-auto pr-1">
              {telemetry.map(p => (
                <div key={p.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {p.trackingId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>State: <strong className="text-slate-700">{p.state}</strong></span>
                    <span>Speed: <strong className="text-emerald-600">{p.velocity}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Real-World Simulation Note</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              This module simulates real-world YOLO 2026 object detection, ByteTrack ID preservation, BOT-SORT camera motion compensation, and MediaPipe skeletal landmark extraction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
