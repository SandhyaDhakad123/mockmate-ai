import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInterviewDetails, submitAnswer, finishInterview } from '../services/api';
import { toast } from 'react-hot-toast';
import { Send, ChevronRight, Mic, MicOff, Camera, CameraOff, AlertCircle, Info, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmotionTracker from '../components/Interview/EmotionTracker';
import InterviewRecorder from '../components/Interview/InterviewRecorder';

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Camera & Mic State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  
  // Emotion tracking
  const [emotions, setEmotions] = useState([]);
  
  // Speech recognition
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const mediaStreamRef = useRef(null);
  const answersEndRef = useRef(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question

  useEffect(() => {
    getInterviewDetails(id)
      .then(res => setInterview(res.data.data))
      .catch(err => {
        console.error("Failed to load interview:", err);
        toast.error("Failed to load interview details");
      });
      
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setAnswer((prev) => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please enable it in browser settings.");
        } else if (event.error === 'no-speech') {
          // Ignore no-speech errors as they are common
          return;
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
        isListeningRef.current = false;
      };
      
      recognitionRef.current.onend = () => {
        if (isListeningRef.current) {
          try {
            recognitionRef.current.start();
          } catch(e) {
            console.error("Failed to restart recognition:", e);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        isListeningRef.current = false;
        recognitionRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [id]);

  useEffect(() => {
    const handleCameraStream = async () => {
      if (isCameraActive) {
        try {
          // Check if mediaDevices is available (HTTPS check)
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Media devices not supported. Ensure you are using HTTPS.");
          }

          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 640 }, 
              height: { ideal: 480 },
              facingMode: "user"
            }, 
            audio: true 
          });
          
          mediaStreamRef.current = stream;
          setMediaStream(stream);
          toast.success("Camera and Microphone active");
        } catch (err) {
          console.error("Error accessing camera/mic:", err);
          let errorMsg = "Could not access camera or microphone.";
          
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMsg = "Permission denied. Please allow camera and microphone access in your browser.";
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMsg = "No camera or microphone found on this device.";
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            errorMsg = "Camera or microphone is already in use by another application.";
          }
          
          toast.error(errorMsg);
          setIsCameraActive(false);
        }
      } else {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
          setMediaStream(null);
        }
      }
    };
    handleCameraStream();
  }, [isCameraActive]);

  useEffect(() => {
    if (!interview) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIdx, interview]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      return toast.error("Voice recognition not supported in this browser. Try Chrome or Edge.");
    }

    if (isListening) {
      isListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        isListeningRef.current = true;
        recognitionRef.current.start();
        setIsListening(true);
        toast.success("Listening... Speak now");
      } catch (err) {
        console.error("Recognition start error:", err);
        isListeningRef.current = false;
        setIsListening(false);
      }
    }
  };

  const handleEmotionUpdate = (emotion) => {
    setEmotions(prev => [...prev, emotion]);
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return toast.error("Please provide an answer");
    setSubmitting(true);
    
    // Stop listening before submitting
    if (isListeningRef.current) {
      isListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    try {
      await submitAnswer({
        interviewId: id,
        questionIndex: currentIdx,
        answer,
        emotions
      });
      
      toast.success("Answer submitted!");
      setAnswer('');
      setEmotions([]);
      
      if (currentIdx < interview.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setTimeLeft(120); // Reset timer
        answersEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        handleFinish();
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    try {
      setIsCameraActive(false);
      await finishInterview(id);
      toast.success("Interview completed!");
      navigate(`/feedback/${id}`);
    } catch (err) {
      toast.error("Error finalizing interview");
    }
  };

  if (!interview) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const currentQuestion = interview.questions[currentIdx];
  const progress = ((currentIdx + 1) / interview.questions.length) * 100;

  return (
    <div className="min-h-screen pt-12 pb-20 px-6 bg-[#0f172a]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Interview Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">{interview.role} Interview</h1>
              <p className="text-sm text-slate-400">Question {currentIdx + 1} of {interview.questions.length}</p>
            </div>
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="glass p-8 relative overflow-hidden" ref={answersEndRef}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Activity className="text-indigo-400" size={20} />
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between items-start w-full">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {currentQuestion.question}
                      </h2>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold shrink-0 ${timeLeft < 30 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-300'}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center text-indigo-400 bg-indigo-500/10 w-fit px-3 py-1 rounded-full text-xs font-semibold">
                      <Info size={14} /> Tip: Be concise and use examples.
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="glass p-6">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-semibold text-slate-300">Your Answer</label>
              <button 
                onClick={toggleListening}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                {isListening ? <><MicOff size={16} /> Stop Listening</> : <><Mic size={16} /> Speak Answer</>}
              </button>
            </div>
            
            <textarea
              className="w-full h-48 bg-slate-900 border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-all resize-none mb-6"
              placeholder={isListening ? "Listening... Speak your answer now." : "Type your detailed answer here or use the microphone..."}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                {isListening && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>}
                {isListening ? 'Microphone is active...' : 'Microphone is off'}
              </div>
              <button 
                onClick={handleSubmit}
                disabled={submitting || !answer.trim()}
                className="btn-primary flex items-center gap-2"
              >
                {submitting ? 'Submitting...' : (currentIdx === interview.questions.length - 1 ? 'Finish Interview' : 'Next Question')}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Camera & Tracking Panel */}
        <div className="space-y-6">
          <div className="glass p-6 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Camera size={18} className="text-indigo-400" />
                Live Monitor
              </h3>
              <button 
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={`p-2 rounded-lg text-sm transition-all ${isCameraActive ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}
              >
                {isCameraActive ? <CameraOff size={16} /> : <Camera size={16} />}
              </button>
            </div>

            {isCameraActive && mediaStream ? (
              <div className="w-full">
                <EmotionTracker 
                  stream={mediaStream}
                  isRecording={isCameraActive} 
                  onEmotionUpdate={handleEmotionUpdate} 
                />
                <InterviewRecorder 
                  stream={mediaStream}
                  isRecording={isCameraActive} 
                  onRecordingComplete={() => {}} 
                />
              </div>
            ) : (
              <div className="w-full aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-slate-800 border-dashed">
                <CameraOff size={32} className="text-slate-600 mb-2" />
                <p className="text-xs text-slate-500 font-medium">Camera Disabled</p>
                <p className="text-[10px] text-slate-600 mt-1 text-center px-4">Enable camera for AI confidence & expression tracking</p>
              </div>
            )}
            
            <div className="w-full mt-6 space-y-3">
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">Eye Contact</span>
                <span className={`text-xs font-bold ${isCameraActive ? 'text-green-400' : 'text-slate-600'}`}>{isCameraActive ? 'Tracking' : 'Off'}</span>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">Posture Check</span>
                <span className={`text-xs font-bold ${isCameraActive ? 'text-green-400' : 'text-slate-600'}`}>{isCameraActive ? 'Tracking' : 'Off'}</span>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">Speaking Confidence</span>
                <span className={`text-xs font-bold ${isListening ? 'text-green-400' : 'text-slate-600'}`}>{isListening ? 'Tracking' : 'Off'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
