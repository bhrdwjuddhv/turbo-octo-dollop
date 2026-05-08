import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Code2, Search, Users, Rocket } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    { id: 1, title: "Create Profile", icon: <UserPlus className="w-5 h-5" /> },
    { id: 2, title: "Add Skills", icon: <Code2 className="w-5 h-5" /> },
    { id: 3, title: "Discover", icon: <Search className="w-5 h-5" /> },
    { id: 4, title: "Form Teams", icon: <Users className="w-5 h-5" /> },
    { id: 5, title: "Build Together", icon: <Rocket className="w-5 h-5" /> },
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
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How It <span className="gradient-text">Works</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">From setting up your profile to winning your next hackathon.</p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-border-dark -translate-y-1/2 hidden md:block">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-primary via-purple-500 to-accent"
            ></motion.div>
          </div>

          <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
            {steps.map((step, index) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 + 0.5, duration: 0.5 }}
                className="flex flex-col items-center flex-1 relative group"
              >
                <div className="w-14 h-14 rounded-full bg-background border-2 border-border-dark flex items-center justify-center text-gray-400 group-hover:border-primary group-hover:text-primary transition-colors duration-300 shadow-xl relative z-20 glow-blue-hover">
                  {step.icon}
                </div>
                <div className="mt-6 text-center">
                  <div className="text-xs text-primary font-mono mb-1">STEP 0{step.id}</div>
                  <h4 className="text-sm font-semibold text-text-main">{step.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;
