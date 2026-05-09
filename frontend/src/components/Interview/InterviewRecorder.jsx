import { useState, useRef, useEffect } from 'react';
import { Video, Square, Play, Download } from 'lucide-react';

export default function InterviewRecorder({ isRecording, onRecordingComplete }) {
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      stopRecording();
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]);
      };

      recorder.onstop = () => {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecordingDuration(0);
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-session-${new Date().getTime()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-4 p-4 glass border-white/10 mt-4 justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
        <div>
          <div className="text-xs font-bold text-white/50 uppercase tracking-tighter">Session Recording</div>
          <div className="text-lg font-mono font-bold">{formatTime(recordingDuration)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        {recordedChunks.length > 0 && !isRecording && (
          <button 
            onClick={downloadRecording}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-bold transition-all border border-indigo-500/20"
          >
            <Download size={16} /> Download
          </button>
        )}
      </div>
    </div>
  );
}
