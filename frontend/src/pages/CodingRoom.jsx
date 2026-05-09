import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getCodingSession, submitCode } from '../services/api';
import MotionPage from '../components/UI/MotionPage';
import { CardSkeleton } from '../components/UI/Skeleton';
import { Play, Send, Zap, ChevronLeft } from 'lucide-react';

export default function CodingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // description, testcases

  useEffect(() => {
    getCodingSession(id)
      .then(res => {
        setSession(res.data.data);
        setCode(res.data.data.submittedCode || (res.data.data.language === 'python' ? '# Write your solution here' : '// Write your solution here'));
        setLanguage(res.data.data.language);
      })
      .catch(() => setError('Session not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getAIHint = async () => {
    if (showHint) return;
    setHint('Thinking of a hint to help you along...');
    setShowHint(true);
    // Simulation of AI hint based on problem and code
    setTimeout(() => {
      setHint(session.difficulty === 'hard' 
        ? "Consider using a dynamic programming approach with a memoization table." 
        : "Try to think about how you can use a Hash Map to reduce the time complexity to O(n).");
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      const res = await submitCode({ interviewId: id, code });
      setResult(res.data.data);
    } catch (err) {
      setError('Failed to evaluate code');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}><CardSkeleton /></div>;
  if (error && !session) return <div style={{ padding: '40px', textAlign: 'center' }}>❌ {error}</div>;

  return (
    <MotionPage className="coding-room-container" style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '6px 10px' }}><ChevronLeft size={18} /></button>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{session.problemTitle}</h1>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>{session.difficulty}</span>
              <span style={{ color: timeLeft < 300 ? '#f87171' : '#94a3b8', fontSize: '13px', fontWeight: 700 }}>
                ⏳ Time Left: {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field" 
            style={{ padding: '8px 12px', width: '130px', fontSize: '13px' }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button onClick={getAIHint} disabled={showHint} className="btn-secondary" style={{ border: '1px solid #6366f1', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} /> AI Hint
          </button>
          <button onClick={handleSubmit} disabled={submitting || session.status === 'completed'} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} /> {submitting ? 'Analyzing...' : 'Submit Solution'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left: Problem Statement & Tabs */}
        <div className="w-full md:w-[35%] p-0 overflow-y-hidden border-b md:border-b-0 md:border-r border-white/10 bg-black/20 flex flex-col min-h-[300px] md:min-h-0">
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)' }}>
            <button 
              onClick={() => setActiveTab('description')}
              style={{ flex: 1, padding: '12px', border: 'none', background: activeTab === 'description' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'description' ? '#6366f1' : '#94a3b8', fontWeight: 600, borderBottom: activeTab === 'description' ? '2px solid #6366f1' : 'none', cursor: 'pointer' }}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('testcases')}
              style={{ flex: 1, padding: '12px', border: 'none', background: activeTab === 'testcases' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'testcases' ? '#6366f1' : '#94a3b8', fontWeight: 600, borderBottom: activeTab === 'testcases' ? '2px solid #6366f1' : 'none', cursor: 'pointer' }}
            >
              Test Cases
            </button>
          </div>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {activeTab === 'description' ? (
              <>
                <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '24px' }}>
                  {session.problemStatement}
                </p>

                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: '#94a3b8' }}>CONSTRAINTS</h4>
                <ul style={{ paddingLeft: '20px', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>
                  {session.constraints.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
                </ul>

                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: '#94a3b8' }}>EXAMPLES</h4>
                {session.examples.map((ex, i) => (
                  <div key={i} className="glass" style={{ padding: '12px', marginBottom: '12px', fontSize: '0.85rem' }}>
                    <div style={{ color: '#6366f1', fontWeight: 600, marginBottom: '4px' }}>Input: <span style={{ color: '#e2e8f0', fontWeight: 400 }}>{ex.input}</span></div>
                    <div style={{ color: '#10b981', fontWeight: 600 }}>Output: <span style={{ color: '#e2e8f0', fontWeight: 400 }}>{ex.output}</span></div>
                    {ex.explanation && <div style={{ marginTop: '4px', color: '#64748b' }}>{ex.explanation}</div>}
                  </div>
                ))}
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px' }}>Simulate code execution against predefined test cases.</div>
                {session.examples.map((ex, i) => (
                  <div key={i} className="glass" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>Test Case {i+1}</span>
                      <span className="badge badge-cyan" style={{ fontSize: '10px' }}>Example Case</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                      <div style={{ color: '#6366f1', marginBottom: '4px' }}>Input: {ex.input}</div>
                      <div style={{ color: '#94a3b8' }}>Expected: {ex.output}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={(val) => setCode(val)}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 20 },
                automaticLayout: true,
                fontFamily: "'Fira Code', monospace",
                lineNumbers: 'on',
                glyphMargin: true
              }}
            />

            {showHint && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass"
                style={{ position: 'absolute', top: '20px', right: '20px', width: '300px', padding: '20px', borderLeft: '4px solid #f59e0b', zIndex: 10 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#f59e0b' }}>💡 AI HINT</span>
                  <button onClick={() => setShowHint(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>×</button>
                </div>
                <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}>{hint}</p>
              </motion.div>
            )}
          </div>
          
          {/* Bottom Terminal-style Result */}
          {result && (
            <div className="animate-fade-up" style={{ height: '40%', borderTop: '2px solid #6366f1', background: '#0f0f1a', padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontWeight: 800, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} /> AI Code Analysis Result
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div className="badge badge-purple">Logic: {result.logicScore}/10</div>
                  <div className="badge badge-cyan">Complexity: {result.complexityScore}/10</div>
                  <div className="badge badge-green">Overall: {result.totalScore}/10</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Analysis</h4>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Time Complexity: </span>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>{result.timeComplexity}</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Space Complexity: </span>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>{result.spaceComplexity}</span>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{result.aiReview}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Bugs & Improvements</h4>
                  <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '12px' }}>{result.bugDetection}</p>
                  <ul style={{ color: '#cbd5e1', fontSize: '13px', paddingLeft: '20px' }}>
                    {result.suggestions.map((s, i) => <li key={i} style={{ marginBottom: '4px' }}>{s}</li>)}
                  </ul>
                </div>
              </div>
              <button onClick={() => navigate('/analytics')} className="btn-primary" style={{ marginTop: '24px', width: '100%' }}>Return to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </MotionPage>
  );
}
