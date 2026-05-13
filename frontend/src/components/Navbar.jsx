import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navItems = ['Explore', 'Teams', 'Hackathons'];

  return (
    <nav className="fixed w-full z-50 top-6 transition-all duration-300 pointer-events-none px-6 sm:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between h-16 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-8 pointer-events-auto shadow-2xl">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
              <Code2 className="h-4 w-4 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase">
              HackMatch
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-gray-400 hover:text-primary text-xs uppercase tracking-widest font-mono transition-colors"
                >
                  {item}
                </a>
              ))}
              {user && (
                <Link to="/dashboard" className="text-gray-400 hover:text-primary text-xs uppercase tracking-widest font-mono transition-colors">
                  Match
                </Link>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 overflow-hidden group-hover:border-primary transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt="me" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">{user.username.charAt(0)}</div>
                  )}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                  Terminal_
                </span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs uppercase tracking-widest font-mono text-gray-400 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/signup">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors"
                  >
                    Start
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 text-white"
            >
              {isOpen ? <X className="block h-5 w-5" /> : <Menu className="block h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
