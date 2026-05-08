import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Network, Zap } from 'lucide-react';

const AiMatchSystem = () => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="py-24 relative z-10 overflow-hidden"
    >
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Powered by <span className="text-purple-400">AI Compatibility</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">We analyze thousands of data points to ensure your team has the perfect synergy.</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-purple-500/20 relative">
          
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            
            {/* Left Col: Insights */}
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-background/50 border border-border-dark flex gap-4">
                <div className="mt-1"><Activity className="w-5 h-5 text-purple-400" /></div>
                <div>
                  <h4 className="text-sm font-bold text-text-main">Skill Gap Analysis</h4>
                  <p className="text-xs text-gray-400 mt-1">Your team needs a UI Designer to complete the core requirements.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-border-dark flex gap-4">
                <div className="mt-1"><Network className="w-5 h-5 text-primary" /></div>
                <div>
                  <h4 className="text-sm font-bold text-text-main">Tech Stack Synergy</h4>
                  <p className="text-xs text-gray-400 mt-1">95% overlap in preferred technologies (React, Node.js).</p>
                </div>
              </div>
            </div>

            {/* Center Col: Main Dial */}
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-64 h-64 rounded-full border border-dashed border-purple-500/50 flex items-center justify-center relative z-10"
              >
                <div className="w-56 h-56 rounded-full border-4 border-t-purple-500 border-r-primary border-b-border-dark border-l-border-dark flex items-center justify-center bg-secondary/80 backdrop-blur-md">
                  <div className="text-center transform rotate-[-360deg]">
                    <span className="text-5xl font-extrabold text-white">98<span className="text-2xl text-purple-400">%</span></span>
                    <p className="text-xs text-purple-300 font-medium tracking-widest uppercase mt-1">Match Score</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Col: Recommended */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> AI Recommendations
              </h4>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-border-dark bg-background hover:border-purple-500/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img src={`https://i.pravatar.cc/100?img=${i+40}`} alt="User" className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="text-sm font-bold text-gray-200">User_{i}9X</div>
                        <div className="text-[10px] text-gray-500">UI/UX Designer</div>
                      </div>
                    </div>
                    <div className="text-xs text-purple-400 font-bold bg-purple-400/10 px-2 py-1 rounded">
                      +9{i}% Synergy
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </motion.section>
  );
};

export default AiMatchSystem;
