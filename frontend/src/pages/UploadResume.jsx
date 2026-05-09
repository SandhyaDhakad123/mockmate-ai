import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume, getResume } from '../services/api';

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getResume().then(res => setExisting(res.data.data)).catch(() => {});
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') return setError('Please select a PDF file.');
    if (f.size === 0) return setError('The selected file is empty (0 KB). Please select a valid PDF.');
    if (f.size > 5 * 1024 * 1024) return setError('File is too large. Max 5MB allowed.');
    setFile(f);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a PDF file first.');
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await uploadResume(fd);
      setResult(res.data.data);
      setExisting(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-white dark:bg-[#050509] transition-colors duration-300">
      <div className="max-w-[700px] mx-auto animate-fade-up">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">📄 Resume Upload</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">
          Upload your PDF resume so AI can personalize interview questions based on your skills.
        </p>

        {/* Existing resume */}
        {existing && !result && (
          <div className="glass p-5 mb-8 flex items-center gap-4 border-black/5 dark:border-white/10 bg-slate-50 dark:bg-white/5 transition-all">
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-bold text-sm text-slate-800 dark:text-white">Resume already uploaded: {existing.fileName}</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                {existing.skills?.length} skills detected · <button onClick={() => navigate('/select-role')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold bg-transparent border-none p-0">
                  Start Interview →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drop zone */}
        <div className={`glass p-16 text-center cursor-pointer border-2 border-dashed transition-all duration-300 rounded-3xl ${dragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-indigo-300 dark:hover:border-white/20'}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('resume-file-input').click()}>
          <div className="text-5xl mb-6">
            {file ? '📄' : '☁️'}
          </div>
          <div className="font-bold text-slate-800 dark:text-white mb-2 text-lg">
            {file ? file.name : 'Drag & Drop your resume here'}
          </div>
          <div className="text-slate-500 dark:text-slate-500 text-sm">
            {file ? `${(file.size / 1024).toFixed(1)} KB · PDF` : 'or click to browse · PDF only · Max 5MB'}
          </div>
          <input id="resume-file-input" type="file" accept=".pdf" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>

        {error && (
          <div className="mt-4 text-red-500 font-bold text-sm flex items-center gap-2">
            <span>❌</span> {error}
          </div>
        )}

        <button id="upload-submit" className="btn-primary w-full !py-4 !text-lg mt-8 active:scale-95 transition-transform" onClick={handleUpload}
          disabled={!file || loading}>
          {loading ? '⏳ Analyzing Resume...' : '🔍 Upload & Analyze Resume'}
        </button>

        {/* Skills result */}
        {result && (
          <div className="glass p-8 mt-10 animate-fade-up border-emerald-500/20 dark:border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-500/5">
            <h3 className="font-black text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <span>✅</span> Resume Analyzed Successfully!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 font-medium">
              {result.skills?.length} skills detected from your resume:
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {result.skills?.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-black uppercase tracking-wider border border-indigo-500/20">{skill}</span>
              ))}
              {(!result.skills || result.skills.length === 0) && (
                <span className="text-slate-500 italic text-sm">No specific tech skills detected — generic questions will be used.</span>
              )}
            </div>
            <button id="proceed-to-role" className="btn-primary w-full !py-4 !text-lg shadow-lg shadow-indigo-500/20" onClick={() => navigate('/select-role')}>
              🎯 Choose Interview Role →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
