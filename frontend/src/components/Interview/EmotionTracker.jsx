import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { toast } from 'react-hot-toast';

export default function EmotionTracker({ stream, onEmotionUpdate, isRecording }) {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('Neutral');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadModels = async () => {
      // Using a more reliable CDN for face-api models
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        if (isMounted) setModelsLoaded(true);
      } catch (err) {
        console.error("Error loading face-api models:", err);
        // Fallback to local models or another URL if possible, but for now just inform
        if (isMounted) toast.error("Emotion analysis models failed to load. Basic monitoring will continue.");
      }
    };
    loadModels();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let interval;
    let isMounted = true;

    if (modelsLoaded && isRecording && videoRef.current && stream && !isPaused) {
      interval = setInterval(async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
        
        try {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks().withFaceExpressions();

          if (isMounted && detections && detections.length > 0) {
            const expressions = detections[0].expressions;
            const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
            const dominant = sorted[0][0];
            
            const emotionMap = {
              happy: 'Confident',
              neutral: 'Neutral',
              surprised: 'Engaged',
              sad: 'Serious',
              angry: 'Stressed',
              fearful: 'Anxious',
              disgusted: 'Uncomfortable'
            };

            const emotion = emotionMap[dominant] || 'Neutral';
            setCurrentEmotion(emotion);
            if (onEmotionUpdate) onEmotionUpdate(emotion);
          }
        } catch (err) {
          console.warn("Face detection error:", err);
        }
      }, 1000);
    }
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [modelsLoaded, isRecording, stream, onEmotionUpdate, isPaused]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(e => console.error("Video play failed:", e));
      };
    }
  }, [stream]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-black border border-white/10 aspect-video group shadow-2xl">
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        playsInline 
        className="w-full h-full object-cover mirror"
        onPause={() => setIsPaused(true)}
        onPlay={() => setIsPaused(false)}
      />
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">
              {isRecording ? 'AI Tracking Active' : 'Sensor Standby'}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="badge backdrop-blur-md bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] font-bold px-2 py-1 rounded">
              Emotion: {currentEmotion}
            </div>
            {!modelsLoaded && (
              <div className="text-[8px] text-yellow-500/70 font-bold uppercase">Loading AI Models...</div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-end">
           <div className="text-[10px] text-white/20 font-mono">ID: MM-AI-HUD-BETA</div>
           <div className="text-[10px] text-white/40 font-mono opacity-0 group-hover:opacity-100 transition-opacity">FACE-API_ENGINE_V1.1</div>
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
