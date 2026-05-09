import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Code2, X, Heart, MapPin, Terminal, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TECH_COLORS = {
  'JS': '#F7DF1E', 'TS': '#3178C6', 'PY': '#3776AB', 'RS': '#FFFFFF',
  'GO': '#00ADD8', 'RE': '#61DAFB', 'NO': '#339933', 'NX': '#FFFFFF',
  'DK': '#2496ED', 'AW': '#FF9900', 'SO': '#FFFFFF', 'FI': '#F24E1E'
};

const Discovery = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/v1/users/discover');
      if (response.ok) {
        const data = await response.json();
        setMatches(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAction = (direction) => {
    // If direction is 'right' (Connect) or 'left' (Skip), advance index
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary font-mono text-xs uppercase animate-pulse">Scanning Network...</div>
      </div>
    );
  }

  const currentMatch = matches[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

      {/* Header */}
      <header className="w-full max-w-lg p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          <span className="font-black text-xl uppercase tracking-tighter">HackMatch</span>
        </div>
        <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg flex flex-col items-center justify-center p-4 relative z-10 pb-20">
        <AnimatePresence mode="popLayout">
          {currentMatch ? (
            <motion.div
              key={currentMatch._id}
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full bg-black/80 backdrop-blur-xl border border-white/20 brutal-border shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Cover & Avatar */}
              <div className="relative h-40 bg-white/5 border-b border-white/10">
                {currentMatch.coverImage && (
                  <img src={currentMatch.coverImage} alt="cover" className="w-full h-full object-cover opacity-50" />
                )}
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 bg-black border-2 border-primary brutal-border overflow-hidden">
                    {currentMatch.avatar ? (
                      <img src={currentMatch.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl uppercase">
                        {currentMatch.username.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-primary/10 border border-primary px-3 py-1">
                  <span className="text-[10px] font-mono text-primary uppercase tracking-widest">{currentMatch.team_role || 'Developer'}</span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="pt-14 p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    {currentMatch.username}
                  </h2>
                  <div className="flex items-center gap-1 mt-1 text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[10px] font-mono uppercase">{currentMatch.location || 'Unknown Node'}</span>
                  </div>
                </div>

                {/* Tech Stack */}
                {currentMatch.techStack && currentMatch.techStack.length > 0 && (
                  <div>
                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-2">Tech Stack</label>
                    <div className="flex flex-wrap gap-2">
                      {currentMatch.techStack.map(tech => (
                        <div key={tech} className="px-2 py-1 bg-white/5 border border-white/10 text-xs font-mono uppercase">
                          {tech}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {currentMatch.experience && currentMatch.experience.length > 0 && (
                  <div>
                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-2">Terminal Logs (Exp)</label>
                    <div className="space-y-2">
                      {currentMatch.experience.map((exp, i) => (
                        <div key={i} className="flex gap-2 items-start text-xs font-mono text-gray-300">
                          <Terminal className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          <span>{exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 border border-white/20 mx-auto flex items-center justify-center bg-white/5">
                <Code2 className="w-8 h-8 text-gray-500" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-500">Network Empty.</h2>
              <p className="text-xs font-mono text-gray-600">No more compatible nodes found.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {currentMatch && (
          <div className="flex gap-4 mt-8">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('left')}
              className="w-16 h-16 rounded-full border border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <X className="w-8 h-8" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('right')}
              className="w-16 h-16 rounded-full border border-primary flex items-center justify-center text-primary hover:bg-primary/10 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.2)]"
            >
              <Heart className="w-7 h-7" />
            </motion.button>
          </div>
        )}
      </main>

    </div>
  );
};

export default Discovery;
