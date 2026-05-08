import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      text: "Found my hackathon team in minutes and won our first AI hackathon. The AI matchmaking is scarily accurate.",
      name: "Jordan Lee",
      role: "AI Engineer @ Stealth",
      avatar: "https://i.pravatar.cc/100?img=15"
    },
    {
      text: "I used to spend days on Discord looking for a UI designer. On HackMatch, I found Sarah in 10 minutes and we shipped a product over the weekend.",
      name: "Marcus Dubois",
      role: "Fullstack Developer",
      avatar: "https://i.pravatar.cc/100?img=33"
    },
    {
      text: "The compatibility score works. It matched us based on our complementary skills (Frontend + Backend) and we instantly clicked.",
      name: "Elena Rostova",
      role: "Frontend Architect",
      avatar: "https://i.pravatar.cc/100?img=44"
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="py-24 relative z-10 bg-secondary/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by <span className="gradient-text">Hackers</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">See what builders are saying about their HackMatch experience.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="glass-panel p-8 rounded-2xl relative"
            >
              <Quote className="w-8 h-8 text-border-dark absolute top-6 right-6 opacity-50" />
              <p className="text-gray-300 text-sm leading-relaxed mb-8 relative z-10">"{test.text}"</p>
              
              <div className="flex items-center gap-4">
                <img src={test.avatar} alt={test.name} className="w-12 h-12 rounded-full border border-border-dark" />
                <div>
                  <h4 className="text-sm font-bold text-text-main">{test.name}</h4>
                  <p className="text-xs text-gray-500">{test.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Testimonials;
