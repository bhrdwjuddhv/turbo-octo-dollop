import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, ArrowRight } from 'lucide-react';

const TeamDiscovery = () => {
  const teams = [
    {
      name: "Neural Ninjas",
      hackathon: "Global AI Hackathon",
      size: "2/4",
      roles: ["Frontend UI", "Data Engineer"],
      stack: ["React", "Python", "TensorFlow"],
      glow: "glow-blue"
    },
    {
      name: "Web3 Builders",
      hackathon: "ETH Global",
      size: "3/5",
      roles: ["Smart Contract Dev", "Designer"],
      stack: ["Solidity", "Next.js", "Figma"],
      glow: "glow-green"
    },
    {
      name: "FinTech Disruptors",
      hackathon: "Stripe Build-a-thon",
      size: "1/3",
      roles: ["Backend Dev", "Fullstack"],
      stack: ["Node.js", "PostgreSQL", "Stripe API"],
      glow: "glow-purple"
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="py-24 relative z-10 bg-secondary/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Discover Active <span className="gradient-text">Teams</span></h2>
            <p className="text-gray-400 text-lg max-w-xl">Find teams that are already forming and looking for your specific skill set.</p>
          </div>
          <button className="text-primary hover:text-white transition-colors mt-4 md:mt-0 flex items-center gap-2 text-sm font-semibold">
            View All Teams <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {teams.map((team, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className={`glass-panel p-6 rounded-2xl relative group overflow-hidden ${team.glow} transition-all duration-300`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-text-main">{team.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Calendar className="w-3 h-3" /> {team.hackathon}
                  </div>
                </div>
                <div className="bg-secondary px-3 py-1 rounded-full border border-border-dark flex items-center gap-2 text-xs font-medium">
                  <Users className="w-3 h-3 text-primary" />
                  {team.size}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-3">Looking For</h4>
                <div className="flex flex-col gap-2">
                  {team.roles.map((role, i) => (
                    <div key={i} className="px-3 py-2 bg-background border border-border-dark rounded-lg text-sm text-gray-300 font-medium">
                      {role}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {team.stack.map((tech, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 bg-secondary rounded text-gray-400 border border-border-dark">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full bg-primary/10 border border-primary text-primary py-2 rounded-lg font-semibold hover:bg-primary hover:text-background transition-all glow-blue-hover">
                Request to Join
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default TeamDiscovery;
