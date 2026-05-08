import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Code2, ArrowRight } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      
      {/* Background Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 z-0 select-none overflow-hidden">
        <h1 className="text-[25vw] font-black tracking-tighter text-stroke leading-none absolute whitespace-nowrap">INIT</h1>
      </div>

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group z-50">
        <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
          <Code2 className="w-5 h-5 text-black" />
        </div>
        <span className="font-bold text-xl tracking-tight uppercase group-hover:text-primary transition-colors">HackMatch</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 bg-black/80 backdrop-blur-xl border border-white/10 p-8 shadow-2xl brutal-border"
      >
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 border border-primary/50 text-primary text-[10px] font-mono uppercase tracking-widest bg-primary/5">
            [ Authentication Protocol ]
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Welcome Back.</h2>
          <p className="text-gray-400 font-mono text-xs">Access your terminal to find your next team.</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-widest block">Developer Email</label>
            <input 
              type="email" 
              placeholder="user@network.com"
              className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors brutal-border placeholder:text-white/20"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-end">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-widest block">Access Key</label>
              <a href="#" className="text-[10px] font-mono text-primary hover:underline">Reset key?</a>
            </div>
            <input 
              type="password" 
              placeholder="••••••••••••"
              className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors brutal-border placeholder:text-white/20"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary text-black py-4 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3 border border-primary shadow-[4px_4px_0_#FF00E5] hover:shadow-[6px_6px_0_#FF00E5] transition-all mt-6"
          >
            Initialize Session <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Or authenticate via</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 bg-secondary border border-white/10 py-3 flex justify-center items-center gap-2 hover:bg-white/5 transition-colors group">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors">GitHub</span>
          </button>
          <button className="flex-1 bg-secondary border border-white/10 py-3 flex justify-center items-center gap-2 hover:bg-white/5 transition-colors group">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors">Google</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs font-mono text-gray-500">
            Unregistered entity?{' '}
            <Link to="/signup" className="text-accent hover:underline decoration-accent underline-offset-4">
              Create an identity_
            </Link>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
