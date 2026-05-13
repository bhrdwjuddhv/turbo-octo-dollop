import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative min-h-[90vh] pt-32 pb-20 flex flex-col justify-center overflow-hidden">
      {/* Massive Background Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-0 select-none overflow-hidden">
        <h1 className="text-[20vw] font-black tracking-tighter text-stroke leading-none absolute whitespace-nowrap">HACKMATCH</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full mt-10"
        >
          <div className="inline-block px-4 py-1.5 mb-8 border border-primary text-primary text-xs font-mono uppercase tracking-widest bg-primary/10">
            [ System Initiated: Find Your Team ]
          </div>
          
          <h2 className="text-6xl md:text-[7rem] font-bold mb-6 tracking-tighter uppercase leading-[0.85]">
            Assemble <br/>
            <span className="text-primary italic font-serif lowercase pr-4">the</span> Future.
          </h2>
          
          <p className="text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-10 font-mono">
            Connect with builders, designers, and AI engineers. Smart matchmaking for high-velocity hackathons. No fluff.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/signup">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-black px-10 py-5 font-bold uppercase tracking-wider text-sm flex items-center gap-3 border border-primary shadow-[6px_6px_0_#FF00E5] hover:shadow-[8px_8px_0_#FF00E5] hover:-translate-y-1 transition-all"
              >
                Initialize Match <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <motion.a 
              href="#"
              whileHover={{ x: 5 }}
              className="text-white font-mono text-sm underline decoration-accent underline-offset-8 hover:text-accent transition-colors py-4"
            >
              Explore the network_
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
