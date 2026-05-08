import React from 'react';
import { Code2, GitBranch, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-12">
          
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg tracking-tight text-text-main">
                HackMatch
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs text-center md:text-left">
              The premier platform for developers, designers, and AI engineers to find their perfect hackathon team.
            </p>
          </div>

          <div className="flex gap-16">
            <div className="flex flex-col gap-3 text-center md:text-left">
              <h4 className="text-white font-semibold text-sm mb-2">Product</h4>
              <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Features</a>
              <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Hackathons</a>
              <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Pricing</a>
            </div>
            <div className="flex flex-col gap-3 text-center md:text-left">
              <h4 className="text-white font-semibold text-sm mb-2">Legal</h4>
              <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Contact</a>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-border-dark flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} HackMatch. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <GitBranch className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-[#5865F2] transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
