import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star } from 'lucide-react';

const MatchmakingPreview = () => {
  const [cards, setCards] = useState([
    {
      id: 1,
      name: "Alex Rivera",
      role: "Fullstack Engineer",
      skills: ["React", "Node.js", "GraphQL"],
      availability: "Weekends & Evenings",
      score: 98,
      avatar: "https://i.pravatar.cc/300?img=11"
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "UI/UX Designer",
      skills: ["Figma", "Framer", "CSS"],
      availability: "Full Time (Hackathon)",
      score: 94,
      avatar: "https://i.pravatar.cc/300?img=5"
    },
    {
      id: 3,
      name: "David Kim",
      role: "AI/ML Engineer",
      skills: ["Python", "PyTorch", "LLMs"],
      availability: "Part Time",
      score: 89,
      avatar: "https://i.pravatar.cc/300?img=12"
    }
  ]);

  const handleSwipe = (direction, id) => {
    setCards(prev => prev.filter(card => card.id !== id));
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="py-24 relative z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-primary/5 blur-[150px] rounded-full w-1/2 h-1/2 top-1/4 left-1/4 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Find the perfect match with a <span className="gradient-text">swipe.</span></h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Stop endlessly scrolling through Discord channels. Our Tinder-style matchmaking UI lets you quickly evaluate potential teammates based on verified skills, availability, and AI-driven compatibility scores.
            </p>
            <ul className="space-y-4 mb-8">
              {['Smart Compatibility Scoring', 'Verified Tech Stacks', 'Instant Team Invites'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative h-[500px] w-full flex items-center justify-center">
            <AnimatePresence>
              {cards.map((card, index) => {
                const isTop = index === cards.length - 1;
                return (
                  <motion.div
                    key={card.id}
                    className="absolute w-80 glass-panel border border-border-dark rounded-3xl p-6 cursor-grab active:cursor-grabbing shadow-2xl bg-secondary/80 backdrop-blur-xl"
                    initial={{ scale: 0.95, y: 20, opacity: 0 }}
                    animate={{ 
                      scale: isTop ? 1 : 1 - (cards.length - 1 - index) * 0.05, 
                      y: isTop ? 0 : (cards.length - 1 - index) * -15,
                      opacity: isTop ? 1 : 0.6,
                      zIndex: index
                    }}
                    exit={{ x: 300, opacity: 0, rotate: 15 }}
                    drag={isTop ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = Math.abs(offset.x) * velocity.x;
                      if (swipe < -1000) {
                        handleSwipe("left", card.id);
                      } else if (swipe > 1000) {
                        handleSwipe("right", card.id);
                      }
                    }}
                  >
                    <div className="relative">
                      <img src={card.avatar} alt={card.name} className="w-full h-48 object-cover rounded-xl mb-4" />
                      <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-border-dark flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-bold">{card.score}%</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-text-main">{card.name}</h3>
                    <p className="text-primary text-sm font-medium mb-4">{card.role}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {card.skills.map((skill, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-background rounded-md text-gray-300 border border-border-dark">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-gray-500 mb-6">
                      <span className="font-semibold text-gray-400">Availability:</span> {card.availability}
                    </div>

                    <div className="flex justify-between gap-4">
                      <button 
                        onClick={() => handleSwipe("left", card.id)}
                        className="flex-1 h-12 rounded-xl bg-background border border-border-dark flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-400 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => handleSwipe("right", card.id)}
                        className="flex-1 h-12 rounded-xl bg-primary/10 border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-background glow-blue-hover transition-all"
                      >
                        Invite
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {cards.length === 0 && (
              <div className="text-center text-gray-500">
                <p>No more matches nearby!</p>
                <button onClick={() => setCards([{id: 1, name: "Alex Rivera", role: "Fullstack Engineer", skills: ["React", "Node.js"], availability: "Weekends", score: 98, avatar: "https://i.pravatar.cc/300?img=11"}])} className="mt-4 text-primary text-sm hover:underline">Reload</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default MatchmakingPreview;
