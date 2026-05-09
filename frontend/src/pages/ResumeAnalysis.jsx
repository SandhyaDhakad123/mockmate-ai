import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResume, getATSScore } from '../services/api';
import MotionPage from '../components/UI/MotionPage';
import { CardSkeleton } from '../components/UI/Skeleton';
import { CheckCircle, AlertCircle, Award, Briefcase, GraduationCap, Code2 } from 'lucide-react';

export default function ResumeAnalysis() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [atsRole, setAtsRole] = useState('');
  const [atsData, setAtsData] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getResume()
      .then(res => setResume(res.data.data))
      .catch(() => navigate('/upload-resume'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleATSCheck = async () => {
    if (!atsRole) return;
    setAtsLoading(true);
    try {
      const res = await getATSScore(atsRole);
      setAtsData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAtsLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}><CardSkeleton /></div>;

  return (
    <MotionPage className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Resume Intelligence</h1>
          <p style={{ color: '#94a3b8' }}>Advanced AI parsing and ATS optimization for {resume.fileName}</p>
        </div>
        <button onClick={() => navigate('/select-role')} className="btn-primary">Proceed to Interview</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        {/* Left: Structured Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Projects */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 700 }}>
              <Code2 size={22} className="text-purple-400" /> Key Projects
            </h3>
            {resume.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '20px', borderLeft: '2px solid #6366f1', paddingLeft: '16px' }}>
                <h4 style={{ fontWeight: 600, color: '#e2e8f0' }}>{proj.title}</h4>
                <div style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
                  {proj.technologies.map((t, ti) => <span key={ti} className="badge badge-cyan" style={{ fontSize: '10px' }}>{t}</span>)}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{proj.description}</p>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 700 }}>
              <Briefcase size={22} className="text-purple-400" /> Work Experience
            </h3>
            {resume.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 600 }}>{exp.role} @ {exp.company}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{exp.duration}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>{exp.description}</p>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 700 }}>
              <GraduationCap size={22} className="text-purple-400" /> Education
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {resume.education.map((edu, i) => (
                <div key={i} className="glass" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontWeight: 600 }}>{edu.degree}</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{edu.institution}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem' }}>
                    <span>Year: {edu.year}</span>
                    <span className="text-green-400">CGPA: {edu.cgpa}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: ATS & Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* ATS Checker */}
          <div className="glass" style={{ padding: '24px', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>ATS Optimizer</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>TARGET JOB ROLE</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Frontend Engineer" 
                value={atsRole}
                onChange={(e) => setAtsRole(e.target.value)}
              />
            </div>
            <button 
              onClick={handleATSCheck} 
              disabled={atsLoading || !atsRole} 
              className="btn-primary" 
              style={{ width: '100%' }}
            >
              {atsLoading ? 'Analyzing...' : 'Calculate ATS Match'}
            </button>

            {(atsData || resume.atsScore > 0) && (
              <div className="animate-fade-up" style={{ marginTop: '24px', textAlign: 'center' }}>
                <div style={{ position: 'relative', height: '120px', width: '120px', margin: '0 auto 16px' }}>
                  <svg style={{ transform: 'rotate(-90deg)', width: '120px', height: '120px' }}>
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    <circle 
                      cx="60" cy="60" r="54" fill="none" stroke="#6366f1" strokeWidth="12" 
                      strokeDasharray={339} strokeDashoffset={339 * (1 - (atsData?.atsScore || resume.atsScore) / 100)}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.8rem', fontWeight: 900 }}>
                    {atsData?.atsScore || resume.atsScore}%
                  </div>
                </div>
                <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Match Score</h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  {atsData?.atsFeedback || resume.atsFeedback}
                </p>
              </div>
            )}

            {atsData?.missingSkills?.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} /> Missing Keywords
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {atsData.missingSkills.map((s, i) => <span key={i} className="badge" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>{s}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Skills List */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Detected Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {resume.skills.map((s, i) => (
                <span key={i} className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={12} /> {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MotionPage>
  );
}
