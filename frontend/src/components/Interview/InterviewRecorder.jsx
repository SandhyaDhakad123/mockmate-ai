import { useState, useRef, useEffect } from 'react';
import { Video, Square, Play, Download } from 'lucide-react';

export default function InterviewRecorder({ stream, isRecording, onRecordingComplete }) {
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording && stream) {
      startRecording();
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopRecording();
    };
  }, [isRecording, stream]);

  const startRecording = () => {
    if (!stream) return;
    
    try {
      setRecordedChunks([]); // Clear previous chunks
      
      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') 
        ? 'video/webm;codecs=vp8,opus' 
        : 'video/webm';
        
      const recorder = new MediaRecorder(stream, { mimeType });
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          setRecordedChunks(prev => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        // Optional: process recording here if needed
        if (onRecordingComplete) onRecordingComplete();
      };

      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        toast.error("Recording error occurred.");
      };

      recorder.start(1000); // Collect data in 1s chunks
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error("Recording failed to start:", err);
      toast.error("Failed to start session recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("Error stopping recorder:", err);
      }
      mediaRecorderRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) {
      return toast.error("No recording data available.");
    }
    
    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `MockMate-Interview-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to download recording.");
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 glass border-white/10 mt-4 justify-between rounded-xl">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
           <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
           {isRecording && <div className="absolute w-5 h-5 rounded-full border border-red-500/50 animate-ping" />}
        </div>
        <div>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Recording</div>
          <div className="text-lg font-mono font-bold text-white leading-none">{formatTime(recordingDuration)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        {recordedChunks.length > 0 && !isRecording && (
          <button 
            onClick={downloadRecording}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            <Download size={14} /> Save Recording
          </button>
        )}
      </div>
    </div>
  );
}
