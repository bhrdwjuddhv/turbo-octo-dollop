import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FinalCta = () => {
  return (
    <section className="py-32 relative z-10 overflow-hidden">
      {/* Intense Glowing Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] mix-blend-screen"></div>
        <div className="absolute w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] mix-blend-screen ml-40"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight">
            Build Your Dream <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Hackathon Team</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Stop wasting time looking for teammates. Start matching with top developers and designers today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-background px-8 py-4 rounded-lg font-bold glow-blue-hover transition-all text-lg"
              >
                Start Matching
              </motion.button>
            </Link>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-panel text-white px-8 py-4 rounded-lg font-semibold hover:bg-secondary/80 transition-all text-lg border border-border-dark"
            >
              Join Community
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCta;
