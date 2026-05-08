import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = ['Explore', 'Teams', 'Hackathons'];

  return (
    <nav className="fixed w-full z-50 top-6 transition-all duration-300 pointer-events-none px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between h-14 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-6 pointer-events-auto">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
              <Code2 className="h-4 w-4 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase">
              HackMatch
            </span>
          </div>

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
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-xs uppercase tracking-widest font-mono text-gray-400 hover:text-white transition-colors">
              Log in
            </button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors"
            >
              Start
            </motion.button>
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
