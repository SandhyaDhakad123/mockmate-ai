import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInterviewDetails, submitAnswer, finishInterview } from '../services/api';
import { toast } from 'react-hot-toast';
import { Send, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getInterviewDetails(id)
      .then(res => setInterview(res.data.data))
      .catch(err => toast.error("Failed to load interview"));
  }, [id]);

  const handleSubmit = async () => {
    if (!answer.trim()) return toast.error("Please provide an answer");
    setSubmitting(true);
    try {
      await submitAnswer({
        interviewId: id,
        questionIndex: currentIdx,
        answer
      });
      
      toast.success("Answer submitted!");
      setAnswer('');
      
      if (currentIdx < interview.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        handleFinish();
      }
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    try {
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">{interview.role} Interview</h1>
            <p className="text-sm text-slate-400">Step {currentIdx + 1} of {interview.questions.length}</p>
          </div>
          <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="glass p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">
                {currentQuestion.question}
              </h2>
              <div className="flex gap-2 items-center text-indigo-400 bg-indigo-500/10 w-fit px-3 py-1 rounded-full text-xs font-semibold">
                 <Info size={14} /> Tip: Be concise and use examples.
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="glass p-6">
          <textarea
            className="w-full h-48 bg-slate-900 border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-all resize-none mb-6"
            placeholder="Type your detailed answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          
          <div className="flex justify-end">
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
    </div>
  );
}
