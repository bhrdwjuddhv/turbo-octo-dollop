import React, { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  MapPin, 
  User, 
  ExternalLink, 
  Plus, 
  Zap, 
  Layers, 
  Trash2, 
  Briefcase, 
  Award, 
  Clock, 
  Globe, 
  Shield, 
  Check, 
  Trophy,
  Heart,
  Code2, 
  Share2,
  Server,
  Database,
  Box,
  Cloud,
  Terminal,
  Palette,
  Cpu,
  Atom
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, login } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStep, setEditStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    location: user?.location || '',
    bio: user?.bio || '',
    team_role: user?.team_role || '',
    socialLinks: {
      github: user?.socialLinks?.github || '',
      linkedin: user?.socialLinks?.linkedin || '',
      others: user?.socialLinks?.others || []
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        location: user.location || '',
        bio: user.bio || '',
        team_role: user.team_role || '',
        socialLinks: {
          github: user.socialLinks?.github || '',
          linkedin: user.socialLinks?.linkedin || '',
          others: user.socialLinks?.others || []
        }
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      const res = await axios.put('http://localhost:5000/api/users/update-account', formData, {
        withCredentials: true
      });
      if (res.data.user) {
        login(res.data.user);
        setIsEditModalOpen(false);
        setEditStep(1);
      }
    } catch (err) {
      console.error(err);
      alert('Sync Failed: Check parameters.');
    } finally {
      setIsSaving(false);
    }
  };

  const LeetCodeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );

  const getTechIcon = (skill) => {
    const s = skill.toLowerCase();
    if (s.includes('react') || s.includes('next')) return <Atom size={18} />;
    if (s.includes('node') || s.includes('server')) return <Server size={18} />;
    if (s.includes('db') || s.includes('sql') || s.includes('redis') || s.includes('mongo') || s.includes('postgre')) return <Database size={18} />;
    if (s.includes('docker') || s.includes('kube') || s.includes('container')) return <Box size={18} />;
    if (s.includes('aws') || s.includes('cloud') || s.includes('azure')) return <Cloud size={18} />;
    if (s.includes('go') || s.includes('rust') || s.includes('python') || s.includes('terminal')) return <Terminal size={18} />;
    if (s.includes('design') || s.includes('ui') || s.includes('figma') || s.includes('palette') || s.includes('tailwind')) return <Palette size={18} />;
    if (s.includes('cpu') || s.includes('hardware') || s.includes('ai') || s.includes('ml')) return <Cpu size={18} />;
    if (s.includes('framer') || s.includes('motion') || s.includes('layer')) return <Layers size={18} />;
    return <Zap size={18} />; 
  };

  const profileData = {
    fullName: user?.fullName || "Aria Nightshade",
    username: user?.username || "aria_shades",
    role: user?.team_role || "Senior Cloud Architect",
    location: user?.location || "Berlin, DE",
    tagline: user?.bio || "Architecting high-availability neural networks and distributed systems for the next frontier.",
    avatar: user?.avatar || null,
    stats: {
      hackathons: "12",
      wins: "04",
      rating: "98%",
      matchRate: "92%"
    },
    socials: [
      { name: 'GitHub', icon: <Code2 size={16} />, url: user?.socialLinks?.github || '#' },
      { name: 'LinkedIn', icon: <Briefcase size={16} />, url: user?.socialLinks?.linkedin || '#' },
      ...(user?.socialLinks?.others || []).map(link => ({
        name: link.platform || 'Platform',
        icon: link.platform?.toLowerCase() === 'leetcode' ? <LeetCodeIcon /> : <Globe size={16} />,
        url: link.url
      }))
    ],
    skills: (user?.techStack && user.techStack.length > 0) 
      ? {
          core: user.techStack.slice(0, 4),
          extended: user.techStack.slice(4, 8),
          tools: user.techStack.slice(8, 12)
        }
      : {
          frontend: ['React', 'Next.js', 'Tailwind', 'Framer'],
          backend: ['Node.js', 'Go', 'PostgreSQL', 'Redis'],
          devops: ['Docker', 'AWS', 'Kubernetes', 'CI/CD']
        }
    };

  const activity = [
    { type: 'win', content: 'Secured 1st Place at Global AI Hack 2024', date: '2 DAYS AGO' },
    { type: 'commit', content: 'Deployed NeuralSync v4.0.1 to Mainnet', date: '5 HOURS AGO' },
    { type: 'team', content: 'Joined Elite Squad "Cyber_Ghost"', date: '1 WEEK AGO' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 font-sans selection:bg-[#97ce23] selection:text-black">
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto pt-32 pb-20 px-6 sm:px-10">
        
        {/* STATS HEADER ROW */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-6 mb-12 p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem]"
        >
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 p-1 flex items-center justify-center relative group">
                <div className="w-full h-full rounded-full overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-[#97ce23] bg-slate-900">
                      {user?.username?.[0] || "A"}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#97ce23] rounded-full border-4 border-[#0B0F1A] flex items-center justify-center shadow-lg">
                  <Check size={12} className="text-black font-bold" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  {user?.username || "Aria_Shades"}
                  <span className="text-[10px] bg-[#4F46E5]/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 font-bold tracking-widest uppercase">Verified Protocol</span>
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">{user?.team_role || "Full_Stack_Architect"}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-16 pr-8">
            {[
              { label: 'Hackathons', val: profileData.stats.hackathons, icon: <Trophy size={14} /> },
              { label: 'Wins', val: profileData.stats.wins, icon: <Award size={14} /> },
              { label: 'Team Rating', val: profileData.stats.rating, icon: <Heart size={14} /> }
            ].map(stat => (
              <div key={stat.label} className="text-center group">
                <div className="flex items-center gap-2 justify-center text-slate-500 mb-1 group-hover:text-[#97ce23] transition-colors">
                  {stat.icon}
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold">{stat.label}</span>
                </div>
                <div className="text-3xl font-black text-white tracking-tighter">{stat.val}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 12-COLUMN MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* SIDEBAR: IDENTITY (3 COLS) */}
          <aside className="lg:col-span-3 space-y-8 sticky top-32">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[2.5rem] p-10 space-y-10 shadow-2xl"
            >
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#97ce23]"></div> Coordinates_
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-slate-400 hover:text-white transition-colors cursor-default">
                    <div className="p-2 bg-slate-800 rounded-lg"><MapPin size={14} className="text-[#97ce23]" /></div>
                    <span>{user?.location || "SF_Sector_01"}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400 hover:text-white transition-colors cursor-default">
                    <div className="p-2 bg-slate-800 rounded-lg"><Globe size={14} className="text-[#4F46E5]" /></div>
                    <span>{user?.username}.dev</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]"></div> Neural_Links_
                </h3>
                <div className="flex flex-col gap-3">
                  {profileData.socials.map(s => (
                    <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/30 rounded-2xl hover:border-[#97ce23]/50 hover:bg-slate-800 transition-all group">
                      <div className="flex items-center gap-4 text-slate-500 group-hover:text-white transition-colors">
                        {s.icon}
                        <span className="text-[11px] font-bold uppercase tracking-widest">{s.name}</span>
                      </div>
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-5 bg-[#4F46E5] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#5D55F0] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-3"
              >
                Request_Synchronization_ <Plus size={14} />
              </button>
            </motion.div>

            {/* STATUS CARD */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#97ce23]/10 to-transparent backdrop-blur-xl border border-[#97ce23]/20 rounded-[2.5rem] p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-[#97ce23] uppercase tracking-widest">Protocol_Status_</h3>
                <div className="w-2 h-2 rounded-full bg-[#97ce23] animate-pulse"></div>
              </div>
              <p className="text-sm font-black text-white uppercase tracking-tighter mb-2">Available for Hack_</p>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Actively seeking high-performance teams in AI/ML or Web3 sectors.</p>
            </motion.div>
          </aside>

          {/* MAIN CONTENT (9 COLS) */}
          <div className="lg:col-span-9 space-y-12">
            
            {/* ARSENAL SECTION */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
                  <div className="w-8 h-px bg-[#97ce23]/50"></div>
                  Technical_Arsenal_
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(profileData.skills).flatMap(([cat, items]) => items.slice(0, 4)).map((skill, idx) => (
                  <div key={skill} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[1.5rem] hover:bg-slate-800 transition-all group relative overflow-hidden">
                    <div className={`absolute bottom-0 left-0 w-full h-[2px] ${idx % 2 === 0 ? 'bg-[#97ce23]' : 'bg-[#4F46E5]'} shadow-[0_0_15px_currentColor] opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg bg-slate-800/50 ${idx % 2 === 0 ? 'text-[#97ce23]' : 'text-[#4F46E5]'} group-hover:scale-110 transition-transform`}>
                          {getTechIcon(skill)}
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 uppercase">LVL_0{Math.floor(Math.random() * 9) + 1}</span>
                      </div>
                      <span className="text-[11px] font-black uppercase text-slate-400 group-hover:text-white transition-colors tracking-widest">{skill}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* RECENT DEPLOYMENTS */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
                  <div className="w-8 h-px bg-[#4F46E5]/50"></div>
                  Neural_Deployments_
                </h3>
                <button className="text-[10px] font-black text-[#4F46E5] hover:text-white transition-colors uppercase tracking-widest border-b border-[#4F46E5]/30">Archive_View_</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map(i => (
                  <div key={i} className="group bg-slate-900/40 border border-slate-800 rounded-[3rem] overflow-hidden hover:border-[#4F46E5]/30 transition-all shadow-xl">
                    <div className="h-52 bg-slate-800/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                      <div className="absolute bottom-8 left-8 flex gap-3">
                        <span className="px-4 py-1.5 bg-[#97ce23]/10 border border-[#97ce23]/20 rounded-xl text-[10px] font-black text-[#97ce23] uppercase tracking-widest backdrop-blur-md">AI_ML</span>
                        <span className="px-4 py-1.5 bg-[#4F46E5]/10 border border-[#4F46E5]/20 rounded-xl text-[10px] font-black text-[#4F46E5] uppercase tracking-widest backdrop-blur-md">Node_JS</span>
                      </div>
                    </div>
                    <div className="p-10 space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black text-white group-hover:text-[#4F46E5] transition-colors uppercase tracking-tighter">Project_Aether_{i}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">Distributive neural computing interface for high-performance squad synchronization and matching.</p>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-3">
                            {[1, 2, 3].map(u => (
                              <div key={u} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0B0F1A] flex items-center justify-center text-[10px] font-black text-slate-500">U</div>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 uppercase ml-2">+4 Members</span>
                        </div>
                        <button className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#4F46E5] transition-all">
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* EMPTY STATE */}
                <button className="border-2 border-dashed border-slate-800/50 rounded-[3rem] p-16 flex flex-col items-center justify-center gap-6 hover:border-[#97ce23]/30 group transition-all bg-slate-900/20">
                  <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 group-hover:text-[#97ce23] group-hover:scale-110 group-hover:rotate-12 transition-all">
                    <Plus size={32} />
                  </div>
                  <div className="text-center space-y-2">
                    <span className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Initialize_Deployment_</span>
                    <span className="block text-[9px] text-slate-700 uppercase font-mono tracking-widest">Awaiting_Project_Input_</span>
                  </div>
                </button>
              </div>
            </motion.section>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-[1400px] mx-auto px-10 py-20 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-12 text-slate-500">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <Code2 className="w-8 h-8 text-[#97ce23]" />
            <span className="text-2xl font-black uppercase tracking-tighter text-white">HackMatch</span>
          </div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase max-w-xs leading-relaxed opacity-50">
            The next generation of hacker synchronization and squad discovery.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-16 text-[10px] font-black uppercase tracking-[0.3em]">
          <div className="space-y-4">
            <h5 className="text-white">Network_</h5>
            <div className="flex flex-col gap-2 opacity-50"><a href="#" className="hover:opacity-100 transition-opacity">Discover</a><a href="#" className="hover:opacity-100 transition-opacity">Squads</a></div>
          </div>
          <div className="space-y-4">
            <h5 className="text-white">Terminal_</h5>
            <div className="flex flex-col gap-2 opacity-50"><a href="#" className="hover:opacity-100 transition-opacity">Security</a><a href="#" className="hover:opacity-100 transition-opacity">API</a></div>
          </div>
          <div className="space-y-4">
            <h5 className="text-white">Legal_</h5>
            <div className="flex flex-col gap-2 opacity-50"><a href="#" className="hover:opacity-100 transition-opacity">Privacy</a><a href="#" className="hover:opacity-100 transition-opacity">Terms</a></div>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-mono tracking-widest">
            NODE_STABLE_4.0.1
          </div>
          <div className="text-[9px] font-mono opacity-30">© 2026 HACKMATCH_OS</div>
        </div>
      </footer>

      {/* MULTI-STEP EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isSaving) setIsEditModalOpen(false); }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(151,206,35,0.1)]"
            >
              <div className="p-10">
                {/* STEP 1: CURRENT DATA AUDIT */}
                {editStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Data_Audit_</h2>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Reviewing current profile parameters...</p>
                    </div>
                    
                    <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-slate-800 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-300"><span className="text-slate-500">NAME:</span> <span>{user?.fullName}</span></div>
                      <div className="flex justify-between text-slate-300"><span className="text-slate-500">ROLE:</span> <span>{user?.team_role || "Not Set"}</span></div>
                      <div className="flex justify-between text-slate-300"><span className="text-slate-500">LOC:</span> <span>{user?.location || "Remote"}</span></div>
                      <div className="flex justify-between items-start gap-4 text-slate-300">
                        <span className="text-slate-500">BIO:</span> 
                        <span className="text-right line-clamp-2">{user?.bio || "No data"}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setEditStep(2)}
                      className="w-full py-4 bg-[#97ce23] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_#97ce23] transition-all"
                    >
                      Initialize Patch_
                    </button>
                  </motion.div>
                )}

                {/* STEP 2: PATCH INPUT */}
                {editStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Input_Patch_</h2>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Modifying identity parameters...</p>
                    </div>

                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-slate-500 uppercase">Full_Name</label>
                          <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-[#97ce23] outline-none text-white" placeholder="Aria Nightshade" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-slate-500 uppercase">Location</label>
                          <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-[#97ce23] outline-none text-white" placeholder="Berlin, DE" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-slate-500 uppercase">Bio / Tagline</label>
                        <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={2} className="w-full bg-black border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:border-[#97ce23] outline-none resize-none text-white" placeholder="System architect..."></textarea>
                      </div>

                      {/* Dynamic Social Links */}
                      <div className="space-y-4 pt-4 border-t border-slate-800">
                        <p className="text-[10px] font-mono text-[#97ce23] uppercase">Networking_Links (Required*)</p>
                        
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#97ce23]"><Code2 size={16} /></div>
                          <input 
                            type="text" 
                            placeholder="GitHub Profile URL*"
                            required
                            value={formData.socialLinks.github}
                            onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, github: e.target.value}})}
                            className="w-full bg-black border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#97ce23] outline-none text-white"
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#97ce23]"><Briefcase size={16} /></div>
                          <input 
                            type="text" 
                            placeholder="LinkedIn Profile URL*"
                            required
                            value={formData.socialLinks.linkedin}
                            onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, linkedin: e.target.value}})}
                            className="w-full bg-black border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#97ce23] outline-none text-white"
                          />
                        </div>

                        <p className="text-[10px] font-mono text-slate-500 uppercase mt-4">Additional_Nodes_</p>
                        
                        {(formData.socialLinks.others || []).map((link, idx) => (
                          <div key={idx} className="space-y-2 p-4 bg-black/20 rounded-2xl border border-slate-800">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Platform (e.g. Twitter, LeetCode)"
                                value={link.platform}
                                onChange={(e) => {
                                  const newOthers = [...formData.socialLinks.others];
                                  newOthers[idx].platform = e.target.value;
                                  setFormData({...formData, socialLinks: {...formData.socialLinks, others: newOthers}});
                                }}
                                className="w-1/3 bg-black border border-slate-800 rounded-xl px-4 py-2 text-xs focus:border-[#97ce23] outline-none text-white"
                              />
                              <input 
                                type="text" 
                                placeholder="URL (e.g. https://...)"
                                value={link.url}
                                onChange={(e) => {
                                  const newOthers = [...formData.socialLinks.others];
                                  newOthers[idx].url = e.target.value;
                                  setFormData({...formData, socialLinks: {...formData.socialLinks, others: newOthers}});
                                }}
                                className="flex-1 bg-black border border-slate-800 rounded-xl px-4 py-2 text-xs focus:border-[#97ce23] outline-none text-white"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newOthers = formData.socialLinks.others.filter((_, i) => i !== idx);
                                  setFormData({...formData, socialLinks: {...formData.socialLinks, others: newOthers}});
                                }}
                                className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}

                        <button 
                          type="button"
                          onClick={() => {
                            if (formData.socialLinks.others.length >= 15) {
                              alert("Maximum platform threshold reached.");
                              return;
                            }
                            setFormData({...formData, socialLinks: {...formData.socialLinks, others: [...formData.socialLinks.others, { platform: '', url: '' }]}});
                          }}
                          className="w-full py-3 border border-dashed border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 uppercase hover:border-[#97ce23] hover:text-[#97ce23] transition-all"
                        >
                          + Add Another Platform_
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => setEditStep(3)}
                      className="w-full py-4 bg-[#97ce23] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Verify Changes_
                    </button>
                  </motion.div>
                )}

                {/* STEP 3: CONFIRMATION */}
                {editStep === 3 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
                    <div className="w-20 h-20 bg-[#97ce23]/10 border border-[#97ce23] rounded-full flex items-center justify-center mx-auto">
                      <Shield size={32} className="text-[#97ce23]" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-white">System_Verify_</h2>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Are you sure you want to commit these changes?</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setEditStep(2)} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                      <button onClick={handleUpdate} disabled={isSaving} className="flex-1 py-4 bg-[#97ce23] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest">
                        {isSaving ? "Syncing..." : "Commit Patch_"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
