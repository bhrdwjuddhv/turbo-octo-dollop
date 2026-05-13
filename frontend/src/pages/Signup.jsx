import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Code2, ArrowRight, Upload, Plus, X, ArrowLeft, Check } from 'lucide-react';

const TECH_OPTIONS = [
  { id: 'js', name: 'JavaScript', symbol: 'JS', color: '#F7DF1E' },
  { id: 'ts', name: 'TypeScript', symbol: 'TS', color: '#3178C6' },
  { id: 'py', name: 'Python', symbol: 'PY', color: '#3776AB' },
  { id: 'rs', name: 'Rust', symbol: 'RS', color: '#000000', bg: '#FFFFFF' },
  { id: 'go', name: 'Go', symbol: 'GO', color: '#00ADD8' },
  { id: 'react', name: 'React', symbol: 'RE', color: '#61DAFB' },
  { id: 'node', name: 'Node.js', symbol: 'NO', color: '#339933' },
  { id: 'next', name: 'Next.js', symbol: 'NX', color: '#000000', bg: '#FFFFFF' },
  { id: 'docker', name: 'Docker', symbol: 'DK', color: '#2496ED' },
  { id: 'aws', name: 'AWS', symbol: 'AW', color: '#FF9900' },
  { id: 'solidity', name: 'Solidity', symbol: 'SO', color: '#363636', bg: '#FFFFFF' },
  { id: 'figma', name: 'Figma', symbol: 'FI', color: '#F24E1E' },
];

const PREF_OPTIONS = [
  "Frontend Heavy", "Backend Architecture", "AI / ML Focus", "Web3 & Crypto", 
  "Winning Mentality", "Chill & Learn", "Design First", "Data Science"
];

const Signup = () => {
  const [step, setStep] = useState(1);
  const [previews, setPreviews] = useState({ avatar: null, coverImage: null });
  const [formData, setFormData] = useState({
    username: '', email: '', password: '',
    avatar: null, coverImage: null, team_role: '', location: '',
    techStack: [],
    experience: [''],
    preferences: [],
    projects: [''],
    socialLinks: { github: '', linkedin: '' }
  });

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      updateForm(field, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArrayInput = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    updateForm(field, newArray);
  };

  const addArrayItem = (field) => {
    updateForm(field, [...formData[field], '']);
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    updateForm(field, newArray);
  };

  const toggleTech = (techId) => {
    const current = formData.techStack;
    if (current.includes(techId)) {
      updateForm('techStack', current.filter(id => id !== techId));
    } else {
      updateForm('techStack', [...current, techId]);
    }
  };

  const togglePref = (pref) => {
    const current = formData.preferences;
    if (current.includes(pref)) {
      updateForm('preferences', current.filter(p => p !== pref));
    } else {
      updateForm('preferences', [...current, pref]);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.username || !formData.email || !formData.password)) {
      alert("System access requires all credentials.");
      return;
    }
    if (step === 2 && (!formData.socialLinks.github || !formData.socialLinks.linkedin)) {
      alert("GitHub and LinkedIn are mandatory protocols for Hacker Identity.");
      return;
    }
    setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('team_role', formData.team_role);
      data.append('location', formData.location);
      data.append('socialLinks', JSON.stringify(formData.socialLinks));
      
      if (formData.avatar) data.append('avatar', formData.avatar);
      if (formData.coverImage) data.append('coverImage', formData.coverImage);
      
      data.append('techStack', JSON.stringify(formData.techStack));
      data.append('experience', JSON.stringify(formData.experience.filter(e => e.trim() !== '')));
      data.append('preferences', JSON.stringify(formData.preferences));
      data.append('projects', JSON.stringify(formData.projects.filter(p => p.trim() !== '')));

      const response = await fetch('/api/v1/users/register', {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      if (response.ok) {
        alert('Registration successful!');
        window.location.href = '/login';
      } else {
        alert(`Error: ${result.message || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('An error occurred during registration.');
    }
  };

  const slideVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.4 } },
    exit: { x: -50, opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-20">
      
      {/* Background Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 z-0 select-none overflow-hidden">
        <h1 className="text-[25vw] font-black tracking-tighter text-stroke leading-none absolute whitespace-nowrap">JOIN</h1>
      </div>

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group z-50">
        <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
          <Code2 className="w-5 h-5 text-black" />
        </div>
        <span className="font-bold text-xl tracking-tight uppercase group-hover:text-primary transition-colors">HackMatch</span>
      </Link>

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-2 flex-1 brutal-border transition-colors duration-500 ${step >= i ? 'bg-accent' : 'bg-black'}`}></div>
          ))}
        </div>

        <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-8 shadow-2xl brutal-border overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: System Access */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <div className="inline-block px-3 py-1 mb-4 border border-accent/50 text-accent text-[10px] font-mono uppercase tracking-widest bg-accent/5">
                    [ Step 01: System Access ]
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Initialize Account.</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Username</label>
                    <input type="text" value={formData.username} onChange={e => updateForm('username', e.target.value)} placeholder="0xHacker" className="w-full bg-black border border-white/10 px-4 py-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors brutal-border" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Email</label>
                    <input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} placeholder="user@network.com" className="w-full bg-black border border-white/10 px-4 py-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors brutal-border" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Password</label>
                    <input type="password" value={formData.password} onChange={e => updateForm('password', e.target.value)} placeholder="••••••••" className="w-full bg-black border border-white/10 px-4 py-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors brutal-border" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Hacker Identity */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <div className="inline-block px-3 py-1 mb-4 border border-primary/50 text-primary text-[10px] font-mono uppercase tracking-widest bg-primary/5">
                    [ Step 02: Hacker Identity ]
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Build Profile.</h2>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {/* Image Uploads */}
                  <div className="space-y-4">
                    <label className="relative border border-dashed border-white/20 hover:border-primary transition-colors h-32 flex flex-col items-center justify-center cursor-pointer bg-white/5 overflow-hidden group">
                      {previews.avatar ? (
                        <img src={previews.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-500 mb-2 group-hover:text-primary transition-colors" />
                          <span className="text-xs font-mono text-gray-500 group-hover:text-primary transition-colors">Upload Avatar</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                    </label>

                    <label className="relative border border-dashed border-white/20 hover:border-primary transition-colors h-20 flex flex-col items-center justify-center cursor-pointer bg-white/5 overflow-hidden group">
                      {previews.coverImage ? (
                        <img src={previews.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-500 mb-1 group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-mono text-gray-500 group-hover:text-primary transition-colors">Upload Cover</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'coverImage')} />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Team Role</label>
                      <select value={formData.team_role} onChange={e => updateForm('team_role', e.target.value)} className="w-full bg-black border border-white/10 px-4 py-3 text-white focus:border-primary outline-none transition-colors brutal-border appearance-none cursor-pointer">
                        <option value="" disabled>Select Role...</option>
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                        <option value="fullstack">Fullstack</option>
                        <option value="ai">AI / ML</option>
                        <option value="design">UI/UX Design</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Location / Timezone</label>
                      <input type="text" value={formData.location} onChange={e => updateForm('location', e.target.value)} placeholder="e.g. UTC-8 or SF, CA" className="w-full bg-black border border-white/10 px-4 py-3 text-white focus:border-primary outline-none transition-colors brutal-border" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">GitHub URL*</label>
                      <input type="text" value={formData.socialLinks.github} onChange={e => updateForm('socialLinks', {...formData.socialLinks, github: e.target.value})} placeholder="https://github.com/..." className="w-full bg-black border border-white/10 px-4 py-3 text-white focus:border-primary outline-none transition-colors brutal-border" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">LinkedIn URL*</label>
                      <input type="text" value={formData.socialLinks.linkedin} onChange={e => updateForm('socialLinks', {...formData.socialLinks, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." className="w-full bg-black border border-white/10 px-4 py-3 text-white focus:border-primary outline-none transition-colors brutal-border" />
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-4">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Additional_Nodes_</label>
                      {(formData.socialLinks.others || []).map((link, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Platform URL (e.g. Portfolio, Twitter)"
                            value={link.url}
                            onChange={(e) => {
                              const newOthers = [...formData.socialLinks.others];
                              newOthers[idx].url = e.target.value;
                              newOthers[idx].platform = e.target.value.includes('twitter') ? 'Twitter' : 
                                                     e.target.value.includes('leetcode') ? 'LeetCode' : 'Portal';
                              updateForm('socialLinks', {...formData.socialLinks, others: newOthers});
                            }}
                            className="flex-1 bg-black border border-white/10 px-4 py-3 text-white focus:border-primary outline-none brutal-border"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const newOthers = formData.socialLinks.others.filter((_, i) => i !== idx);
                              updateForm('socialLinks', {...formData.socialLinks, others: newOthers});
                            }}
                            className="p-3 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={() => {
                          const currentOthers = formData.socialLinks.others || [];
                          const newOthers = [...currentOthers, { platform: 'Portal', url: '' }];
                          updateForm('socialLinks', {...formData.socialLinks, others: newOthers});
                        }}
                        className="w-full py-2 border border-dashed border-white/10 text-[10px] font-mono text-gray-500 hover:text-primary transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={12} /> Add_Another_Platform_
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Neural Link */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <div className="inline-block px-3 py-1 mb-4 border border-[#00FFFF]/50 text-[#00FFFF] text-[10px] font-mono uppercase tracking-widest bg-[#00FFFF]/5">
                    [ Step 03: Neural Link ]
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Tech Stack & Experience.</h2>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Select Core Stack</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {TECH_OPTIONS.map(tech => {
                      const isSelected = formData.techStack.includes(tech.id);
                      return (
                        <button
                          key={tech.id}
                          onClick={() => toggleTech(tech.id)}
                          className={`aspect-square flex flex-col items-center justify-center gap-1 border transition-all ${isSelected ? 'border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.3)] bg-[#00FFFF]/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                        >
                          <div 
                            className="w-8 h-8 rounded-sm flex items-center justify-center font-bold text-xs"
                            style={{ color: tech.color, backgroundColor: tech.bg || 'transparent', border: tech.bg ? `1px solid ${tech.color}` : 'none' }}
                          >
                            {tech.symbol}
                          </div>
                          <span className="text-[9px] font-mono uppercase truncate w-full text-center px-1 text-gray-400">{tech.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Experience</label>
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="flex gap-2">
                      <input type="text" value={exp} onChange={e => handleArrayInput('experience', index, e.target.value)} placeholder="e.g. Built a React app at HackMIT 2024" className="flex-1 bg-black border border-white/10 px-4 py-2 text-sm text-white focus:border-[#00FFFF] outline-none brutal-border" />
                      <button onClick={() => removeArrayItem('experience', index)} className="p-2 border border-white/10 hover:border-red-500 hover:text-red-500 text-gray-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addArrayItem('experience')} className="text-xs font-mono text-[#00FFFF] flex items-center gap-1 hover:underline mt-2">
                    <Plus className="w-3 h-3" /> Add Experience
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Network Goals */}
            {step === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <div className="inline-block px-3 py-1 mb-4 border border-[#FF00E5]/50 text-[#FF00E5] text-[10px] font-mono uppercase tracking-widest bg-[#FF00E5]/5">
                    [ Step 04: Network Goals ]
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Finalize Vector.</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Hackathon Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {PREF_OPTIONS.map(pref => {
                      const isSelected = formData.preferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          onClick={() => togglePref(pref)}
                          className={`px-3 py-1.5 text-xs font-mono border transition-all ${isSelected ? 'border-[#FF00E5] text-[#FF00E5] bg-[#FF00E5]/10' : 'border-white/10 text-gray-400 hover:border-white/30 bg-white/5'}`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1 mb-0.5" />}
                          {pref}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Past Projects (URLs)</label>
                  {formData.projects.map((proj, index) => (
                    <div key={index} className="flex gap-2">
                      <input type="text" value={proj} onChange={e => handleArrayInput('projects', index, e.target.value)} placeholder="https://github.com/your-project" className="flex-1 bg-black border border-white/10 px-4 py-2 text-sm text-white focus:border-[#FF00E5] outline-none brutal-border" />
                      <button onClick={() => removeArrayItem('projects', index)} className="p-2 border border-white/10 hover:border-red-500 hover:text-red-500 text-gray-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addArrayItem('projects')} className="text-xs font-mono text-[#FF00E5] flex items-center gap-1 hover:underline mt-2">
                    <Plus className="w-3 h-3" /> Add Project
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/10">
            {step > 1 ? (
              <button onClick={prevStep} className="flex items-center gap-2 text-xs font-mono uppercase text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button onClick={nextStep} className="bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} className="bg-accent text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:shadow-[4px_4px_0_#CCFF00] transition-all brutal-border border-accent flex items-center gap-2">
                Submit Data <Code2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;
