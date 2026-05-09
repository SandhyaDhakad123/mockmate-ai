import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function EmotionTracker({ onEmotionUpdate, isRecording }) {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('Neutral');

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Error loading face-api models:", err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    let interval;
    if (modelsLoaded && isRecording && videoRef.current) {
      interval = setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions();

        if (detections && detections.length > 0) {
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
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [modelsLoaded, isRecording, onEmotionUpdate]);

  useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(err => console.error("Camera access denied:", err));
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isRecording]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-black border border-white/10 aspect-video group">
      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">
              {isRecording ? 'AI Tracking Active' : 'Sensor Standby'}
            </span>
          </div>
          <div className="badge badge-purple backdrop-blur-md bg-indigo-500/20 text-[10px]">
            Emotion: {currentEmotion}
          </div>
        </div>

        <div className="flex justify-center items-end opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="text-[10px] text-white/40 font-mono">FACE-API_ENGINE_V1.0</div>
        </div>
      </div>
    </div>
  );
}
