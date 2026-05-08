import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Users, MessageSquare, Target, Zap } from 'lucide-react';

const Features = () => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="py-24 relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter">
            System <span className="text-transparent text-stroke hover:text-primary transition-colors">Capabilities</span>
          </h2>
          <p className="text-gray-400 max-w-xl font-mono text-sm">Modules designed to optimize team formation and execution velocity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
          
          {/* Bento Box 1: Large Feature */}
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="md:col-span-2 md:row-span-2 bg-secondary border border-white/10 p-8 flex flex-col justify-between group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/40 transition-all duration-700"></div>
            <div>
              <div className="w-12 h-12 bg-white/5 flex items-center justify-center border border-white/10 mb-6 group-hover:rotate-12 transition-transform">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold uppercase tracking-tight mb-2">Algorithmic Matching</h3>
              <p className="text-gray-400 font-mono text-sm">Our neural network finds the exact missing piece of your team stack. No more praying in Discord channels.</p>
            </div>
            <div className="font-mono text-xs text-primary/50 uppercase tracking-widest mt-8">[ Core Module ]</div>
          </motion.div>

          {/* Bento Box 2 */}
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="md:col-span-2 bg-black border border-white/10 p-8 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#FF00E5_0%,transparent_50%)] opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="flex items-center gap-4">
              <BrainCircuit className="w-8 h-8 text-accent" />
              <h3 className="text-xl font-bold uppercase">AI Synergy Scores</h3>
            </div>
            <p className="text-gray-400 font-mono text-xs">Know exactly why you match. 98% overlap in React + Node.</p>
          </motion.div>

          {/* Bento Box 3 */}
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="bg-primary border border-primary p-8 flex flex-col justify-between text-black group"
          >
            <Users className="w-8 h-8 text-black group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-xl font-black uppercase mb-1">Squad Up</h3>
              <p className="text-black/70 font-mono text-xs">Instant role assignment.</p>
            </div>
          </motion.div>

          {/* Bento Box 4 */}
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="bg-[#111] border border-white/10 p-8 flex flex-col justify-between"
          >
            <MessageSquare className="w-8 h-8 text-white" />
            <div>
              <h3 className="text-lg font-bold uppercase mb-1">Comms Link</h3>
              <p className="text-gray-400 font-mono text-[10px]">Real-time P2P encrypted chat.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.section>
  );
};

export default Features;
