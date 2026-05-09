import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

export const useEmotionDetection = (videoRef) => {
  const [emotion, setEmotion] = useState('Initializing...');
  const [confidence, setConfidence] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const detectionInterval = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      // For simplicity in this demo, we use models from a CDN-ready URL or public path
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        console.log('Face-API Models Loaded');
      } catch (err) {
        console.error('Error loading face-api models:', err);
      }
    };
    loadModels();
  }, []);

  const startDetection = () => {
    if (!modelsLoaded || !videoRef.current) return;

    detectionInterval.current = setInterval(async () => {
      const detections = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceExpressions();

      if (detections) {
        const expressions = detections.expressions;
        const topEmotion = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );
        
        setEmotion(topEmotion);
        
        // Map common emotions to Confidence %
        // happy, neutral -> High confidence
        // fearful, sad, disgusted -> Low confidence (anxiety)
        // surprised, angry -> Medium
        let confScore = 50;
        if (topEmotion === 'happy') confScore = 95;
        else if (topEmotion === 'neutral') confScore = 80;
        else if (topEmotion === 'surprised') confScore = 60;
        else if (['sad', 'fearful', 'disgusted'].includes(topEmotion)) confScore = 30;
        else if (topEmotion === 'angry') confScore = 40;

        setConfidence(confScore);
      } else {
        setEmotion('Face not detected');
        setConfidence(0);
      }
    }, 1000); // Detect every second
  };

  useEffect(() => {
    if (modelsLoaded) startDetection();
    return () => {
      if (detectionInterval.current) clearInterval(detectionInterval.current);
    };
  }, [modelsLoaded, videoRef]);

  return { emotion, confidence, modelsLoaded };
};
