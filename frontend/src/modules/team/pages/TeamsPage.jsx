import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, ArrowRight, Search, Plus, Code2 } from 'lucide-react';
import Navbar from '../../../components/Navbar';

const TeamsPage = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState('');
  const [status, setStatus] = useState('');
  const [hackathonName, setHackathonName] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (skill) params.set('skill', skill);
      if (status) params.set('status', status);
      if (hackathonName) params.set('hackathonName', hackathonName);

      const response = await fetch(`/api/v1/teams/discover?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTeams(data.data || []);
      } else {
        setTeams([]);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTeams();
  };

  // Joining is now request + approval: open the team's dashboard, where the
  // "Request to join" dialog (with a note to the owner) lives.
  const handleJoin = (teamId) => {
    navigate(`/teams/${teamId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-block px-3 py-1 mb-4 border border-primary/50 text-primary text-[10px] font-mono uppercase tracking-widest bg-primary/5">
              [ Network: Active Teams ]
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Discover Teams.</h1>
          </div>
          <Link to="/teams/create">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-primary text-black px-6 py-4 font-bold uppercase tracking-wider text-sm flex items-center gap-3 border border-primary shadow-[4px_4px_0_#FF00E5] hover:shadow-[6px_6px_0_#FF00E5] transition-all"
            >
              <Plus className="w-4 h-4" /> Create Team
            </motion.button>
          </Link>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-12">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Filter by skill (e.g. react)"
              className="w-full bg-black border border-white/10 pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/20"
            />
          </div>
          <input
            type="text"
            value={hackathonName}
            onChange={(e) => setHackathonName(e.target.value)}
            placeholder="Hackathon"
            className="flex-1 min-w-[160px] bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/20"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border appearance-none cursor-pointer"
          >
            <option value="">Any Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <button type="submit" className="bg-white/5 border border-white/10 hover:border-primary text-white px-6 py-3 text-xs font-mono uppercase tracking-widest transition-colors">
            Search
          </button>
        </form>

        {loading ? (
          <div className="text-primary font-mono text-xs uppercase animate-pulse text-center py-20">Scanning Network...</div>
        ) : teams.length === 0 ? (
          <div className="text-center space-y-4 py-20">
            <div className="w-16 h-16 border border-white/20 mx-auto flex items-center justify-center bg-white/5">
              <Code2 className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-500">No Teams Found.</h2>
            <p className="text-xs font-mono text-gray-600">Try adjusting your filters, or start your own.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {teams.map((team, index) => (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="bg-black/60 border border-white/10 p-6 brutal-border hover:border-primary/50 transition-colors group flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Link to={`/teams/${team._id}`} className="text-xl font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">
                      {team.name}
                    </Link>
                    {team.hackathonName && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-mono">
                        <Calendar className="w-3 h-3" /> {team.hackathonName}
                      </div>
                    )}
                  </div>
                  <div className="bg-white/5 px-3 py-1 border border-white/10 flex items-center gap-2 text-xs font-mono">
                    <Users className="w-3 h-3 text-primary" />
                    {team.members?.length || 0}/{team.maxMembers}
                  </div>
                </div>

                {team.requiredSkills?.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {team.requiredSkills.slice(0, 6).map((s) => (
                      <span key={s} className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 text-gray-400 font-mono uppercase">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 font-mono mb-6 line-clamp-2 flex-1">{team.description || 'No description provided.'}</p>

                <div className="flex gap-3 mt-auto">
                  <Link to={`/teams/${team._id}`} className="flex-1">
                    <button className="w-full border border-white/10 hover:border-white/30 text-white py-2 text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                      View <ArrowRight className="w-3 h-3" />
                    </button>
                  </Link>
                  {team.status === 'open' && (team.members?.length || 0) < team.maxMembers && (
                    <button
                      onClick={() => handleJoin(team._id)}
                      className="flex-1 bg-primary/10 border border-primary text-primary py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                    >
                      Request to Join
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TeamsPage;