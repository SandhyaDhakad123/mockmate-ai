import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInterviewDetails } from '../services/api';
import MotionPage from '../components/UI/MotionPage';
import { CardSkeleton } from '../components/UI/Skeleton';
import { Download, CheckCircle2, XCircle, Lightbulb, Trophy, FileText, Zap } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Feedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInterviewDetails(id)
      .then(res => setInterview(res.data.data))
      .catch(() => navigate('/analytics'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const primaryColor = [99, 102, 241]; // #6366f1
    
    // Header
    doc.setFillColor(15, 15, 26);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Interview Performance Report', 20, 25);
    doc.setFontSize(10);
    doc.text(`Session ID: ${interview._id} | Role: ${interview.role}`, 20, 32);

    // Summary Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Performance Summary', 20, 55);
    doc.setFontSize(10);
    doc.text(`Overall Score: ${interview.totalScore}/${interview.maxScore} (${Math.round((interview.totalScore/interview.maxScore)*100)}%)`, 20, 65);
    
    // Strengths & Weaknesses
    doc.text('Strengths:', 20, 80);
    interview.strengths.forEach((s, i) => doc.text(`• ${s}`, 25, 87 + (i * 6)));
    
    doc.text('Weaknesses:', 110, 80);
    interview.weaknesses.forEach((w, i) => doc.text(`• ${w}`, 115, 87 + (i * 6)));

    // Q&A Table
    const tableData = interview.questions.map((q, i) => [
      `Q${i+1}: ${q.question}`,
      q.answer || 'No answer provided',
      `${q.score || 0}/10`
    ]);

    autoTable(doc, {
      startY: 120,
      head: [['Question', 'Your Answer', 'Score']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor }
    });

    doc.save(`MockMate_Report_${interview.role}_${new Date().toLocaleDateString()}.pdf`);
  };

  if (loading) return <div style={{ padding: '60px' }}><CardSkeleton /></div>;

  const percentage = Math.round((interview.totalScore / interview.maxScore) * 100);

  return (
    <MotionPage className="container" style={{ padding: '40px 20px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Interview Feedback</h1>
          <p style={{ color: '#94a3b8' }}>Session for {interview.role} ({interview.difficulty}) completed.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={downloadPDF} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Export PDF
          </button>
          <button onClick={() => navigate('/analytics')} className="btn-primary">Back to Dashboard</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px', marginBottom: '40px' }}>
        {/* Score Card */}
        <div className="glass" style={{ padding: '32px', textAlign: 'center', height: 'fit-content' }}>
          <div style={{ position: 'relative', height: '160px', width: '160px', margin: '0 auto 24px' }}>
            <svg style={{ transform: 'rotate(-90deg)', width: '160px', height: '160px' }}>
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="15" />
              <circle 
                cx="80" cy="80" r="70" fill="none" stroke="#6366f1" strokeWidth="15" 
                strokeDasharray={440} strokeDashoffset={440 * (1 - percentage / 100)}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 2s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{percentage}%</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Expert Rating</div>
            </div>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>{percentage >= 70 ? 'Excellent Match!' : 'Good Effort'}</h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '24px' }}>
            {interview.overallFeedback}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{interview.communicationScore || 0}/10</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Communication</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a855f7' }}>{interview.confidenceScore || 0}/10</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Confidence</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{interview.technicalScore || 0}/10</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Technical</div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="glass" style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '16px' }}><CheckCircle2 size={20} /> Key Strengths</h4>
              <ul style={{ color: '#cbd5e1', fontSize: '0.9rem', paddingLeft: '20px' }}>
                {interview.strengths.map((s, i) => <li key={i} style={{ marginBottom: '8px' }}>{s}</li>)}
              </ul>
            </div>
            <div className="glass" style={{ padding: '24px', borderLeft: '4px solid #f87171' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', marginBottom: '16px' }}><XCircle size={20} /> Area for Improvement</h4>
              <ul style={{ color: '#cbd5e1', fontSize: '0.9rem', paddingLeft: '20px' }}>
                {interview.weaknesses.map((w, i) => <li key={i} style={{ marginBottom: '8px' }}>{w}</li>)}
              </ul>
            </div>
          </div>

          <div className="glass" style={{ padding: '24px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', marginBottom: '20px' }}><Lightbulb size={20} /> Learning Recommendations</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {interview.recommendations.map((r, i) => (
                <div key={i} style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)', fontSize: '0.85rem', color: '#94a3b8' }}>
                  {r}
                </div>
              ))}
            </div>
          </div>
          
          {interview.behavioralAnalysis && (
            <div className="glass" style={{ padding: '24px', borderLeft: '4px solid #8b5cf6' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', marginBottom: '16px' }}>Behavioral Analysis</h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>{interview.behavioralAnalysis}</p>
            </div>
          )}
        </div>
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Zap className="text-yellow-400" /> Question-wise AI Evaluation
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {interview.questions.map((q, i) => (
          <div key={i} className="glass" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span className="badge badge-cyan">Question {i+1}</span>
              <span className="badge badge-purple" style={{ fontWeight: 800 }}>Score: {q.score || 0}/10</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>{q.question}</p>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '16px' }}>
              <label style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Answer</label>
              <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginTop: '4px' }}>{q.answer || 'Not answered'}</p>
            </div>
            {q.feedback && (
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                <span className="text-purple-400" style={{ fontWeight: 600 }}>AI Analysis: </span> {q.feedback}
              </div>
            )}
          </div>
        ))}
      </div>
    </MotionPage>
  );
}
