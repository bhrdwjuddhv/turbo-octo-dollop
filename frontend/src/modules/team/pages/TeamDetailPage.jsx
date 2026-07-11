import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Calendar, MapPin, Zap, Send, LogOut, Trash2, Crown, Code2, Sparkles, ChevronDown, Trophy } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../auth/context/AuthContext';

const RESULT_LABELS = {
  not_specified: 'Not Specified',
  participated: 'Participated',
  finalist: 'Finalist',
  winner: 'Winner 🏆',
};

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [sentInvites, setSentInvites] = useState(new Set());
  const [expandedCandidateId, setExpandedCandidateId] = useState(null);
  const [savingResult, setSavingResult] = useState(false);

  const isLeader = team && user && team.leader?._id === user._id;
  const isMember = team && user && team.members?.some((m) => m._id === user._id);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/teams/${teamId}`);
      if (response.ok) {
        const data = await response.json();
        setTeam(data.data);
      } else {
        setTeam(null);
      }
    } catch (error) {
      console.error('Failed to fetch team:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    setCandidatesLoading(true);
    try {
      const response = await fetch(`/api/v1/matching/teams/${teamId}/candidates?limit=12`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.data?.matches || []);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setCandidatesLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  useEffect(() => {
    if (isLeader) fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeader]);

  const handleJoin = async () => {
    setActionId('join');
    try {
      const response = await fetch(`/api/v1/teams/${teamId}/join`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) fetchTeam();
      else alert(`Error: ${data.message || 'Could not join team'}`);
    } finally {
      setActionId(null);
    }
  };

  const handleLeave = async () => {
    setActionId('leave');
    try {
      const response = await fetch(`/api/v1/teams/${teamId}/leave`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) fetchTeam();
      else alert(`Error: ${data.message || 'Could not leave team'}`);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async () => {
    const password = window.prompt('Confirm deletion by entering your password:');
    if (!password) return;
    setActionId('delete');
    try {
      const response = await fetch(`/api/v1/teams/${teamId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (response.ok) navigate('/teams');
      else alert(`Error: ${data.message || 'Could not delete team'}`);
    } finally {
      setActionId(null);
    }
  };

  const handleInvite = async (receiverId) => {
    setActionId(receiverId);
    try {
      const response = await fetch('/api/v1/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, teamId }),
      });
      const data = await response.json();
      if (response.ok) {
        setSentInvites((prev) => new Set(prev).add(receiverId));
      } else {
        alert(`Error: ${data.message || 'Could not send invite'}`);
      }
    } finally {
      setActionId(null);
    }
  };

  // Phase 6: leader records the outcome once a hackathon wraps up - this
  // is what powers hackathonsWon / hackathonsParticipated for every
  // member of this team in the reputation system. No new backend route
  // needed - the existing generic team-update endpoint already accepts
  // any field in its $set.
  const handleResultChange = async (newResult) => {
    setSavingResult(true);
    try {
      const response = await fetch(`/api/v1/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: newResult }),
      });
      const data = await response.json();
      if (response.ok) {
        setTeam((prev) => ({ ...prev, result: newResult }));
      } else {
        alert(`Error: ${data.message || 'Could not update result'}`);
      }
    } finally {
      setSavingResult(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary font-mono text-xs uppercase animate-pulse">Loading Team Data...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-500">Team Not Found.</h2>
          <Link to="/teams" className="text-primary text-xs font-mono hover:underline">&larr; Back to teams</Link>
        </div>
      </div>
    );
  }

  const isFull = (team.members?.length || 0) >= team.maxMembers;

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10 space-y-10">

        {/* Header Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/80 border border-white/10 brutal-border overflow-hidden">
          <div className="relative h-40 bg-white/5">
            {team.bannerImage && <img src={team.bannerImage} alt="banner" className="w-full h-full object-cover opacity-50" />}
            <div className="absolute -bottom-8 left-8 w-16 h-16 bg-black border-2 border-primary overflow-hidden">
              {team.teamAvatar ? (
                <img src={team.teamAvatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl uppercase">{team.name.charAt(0)}</div>
              )}
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {team.result && team.result !== 'not_specified' && (
                <div className="bg-primary/10 border border-primary px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <Trophy className="w-3 h-3" /> {RESULT_LABELS[team.result]}
                </div>
              )}
              <div className="bg-black/60 border border-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-widest">
                {team.status}
              </div>
            </div>
          </div>
          <div className="pt-12 p-8 space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">{team.name}</h1>
                {team.hackathonName && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-mono">
                    <Calendar className="w-3 h-3" /> {team.hackathonName}
                  </div>
                )}
              </div>
              <div className="bg-white/5 px-3 py-1.5 border border-white/10 flex items-center gap-2 text-xs font-mono">
                <Users className="w-3 h-3 text-primary" /> {team.members?.length || 0}/{team.maxMembers}
              </div>
            </div>

            {team.description && <p className="text-sm text-gray-400 font-mono">{team.description}</p>}
            {team.projectIdea && (
              <div className="border-l-2 border-accent pl-4">
                <p className="text-[10px] font-mono text-accent uppercase tracking-widest mb-1">Project Idea</p>
                <p className="text-sm text-gray-300">{team.projectIdea}</p>
              </div>
            )}

            {team.requiredSkills?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {team.requiredSkills.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 text-gray-400 font-mono uppercase">{s}</span>
                ))}
              </div>
            )}

            {/* Members */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Members</label>
              <div className="flex flex-wrap gap-3">
                {team.members?.map((m) => (
                  <div key={m._id} className="flex items-center gap-2 bg-white/5 border border-white/10 pl-1 pr-3 py-1">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-black border border-white/10">
                      {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : null}
                    </div>
                    <span className="text-xs font-mono">{m.username}</span>
                    {team.leader?._id === m._id && <Crown className="w-3 h-3 text-primary" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Leader-only: record hackathon outcome (Phase 6 data source) */}
            {isLeader && (
              <div className="space-y-2 pt-4 border-t border-white/10">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Hackathon Result (feeds team reputation)</label>
                <select
                  value={team.result || 'not_specified'}
                  onChange={(e) => handleResultChange(e.target.value)}
                  disabled={savingResult}
                  className="bg-black border border-white/10 px-4 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-primary brutal-border appearance-none cursor-pointer disabled:opacity-50"
                >
                  {Object.entries(RESULT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
              {!isLeader && !isMember && team.status === 'open' && !isFull && (
                <button onClick={handleJoin} disabled={actionId === 'join'} className="bg-primary/10 border border-primary text-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all disabled:opacity-50">
                  {actionId === 'join' ? 'Joining...' : 'Request to Join'}
                </button>
              )}
              {isMember && !isLeader && (
                <button onClick={handleLeave} disabled={actionId === 'leave'} className="border border-red-500/50 text-red-400 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center gap-2 disabled:opacity-50">
                  <LogOut className="w-4 h-4" /> {actionId === 'leave' ? 'Leaving...' : 'Leave Team'}
                </button>
              )}
              {isLeader && (
                <button onClick={handleDelete} disabled={actionId === 'delete'} className="border border-red-500/50 text-red-400 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center gap-2 disabled:opacity-50">
                  <Trash2 className="w-4 h-4" /> {actionId === 'delete' ? 'Deleting...' : 'Delete Team'}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Leader-only: AI recommended candidates */}
        {isLeader && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-black uppercase tracking-tighter">AI Recommended Candidates</h2>
            </div>

            {candidatesLoading ? (
              <div className="text-primary font-mono text-xs uppercase animate-pulse py-10 text-center">Analyzing Network...</div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-xs font-mono">No candidates found right now.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {candidates.map(({ user: candidate, matchScore, matchExplanation }) => {
                  const alreadyInvited = sentInvites.has(candidate._id);
                  const isExpanded = expandedCandidateId === candidate._id;
                  return (
                    <div key={candidate._id} className="bg-black/60 border border-white/10 p-5 brutal-border">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                            {candidate.avatar ? <img src={candidate.avatar} className="w-full h-full object-cover" /> : null}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white truncate">{candidate.username}</div>
                            <div className="text-[10px] text-gray-500 font-mono uppercase truncate">{candidate.team_role || 'Developer'}</div>
                            {candidate.location && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-600 font-mono mt-0.5">
                                <MapPin className="w-2.5 h-2.5" /> {candidate.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-1">{matchScore}%</span>
                          <button
                            onClick={() => handleInvite(candidate._id)}
                            disabled={alreadyInvited || actionId === candidate._id}
                            className="text-[10px] font-mono uppercase tracking-widest border border-white/10 hover:border-primary hover:text-primary px-3 py-2 transition-colors disabled:opacity-40 flex items-center gap-2"
                          >
                            <Send className="w-3 h-3" /> {alreadyInvited ? 'Invited' : actionId === candidate._id ? 'Sending...' : 'Invite'}
                          </button>
                        </div>
                      </div>

                      {matchExplanation?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <button
                            onClick={() => setExpandedCandidateId(isExpanded ? null : candidate._id)}
                            className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 hover:text-primary uppercase tracking-widest transition-colors"
                          >
                            <Sparkles className="w-3 h-3" /> Why this match
                            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.ul
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 space-y-1 overflow-hidden"
                              >
                                {matchExplanation.map((line, i) => (
                                  <li key={i} className="text-[11px] font-mono text-gray-400 flex gap-2">
                                    <span className="text-primary">›</span>
                                    <span>{line}</span>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default TeamDetailPage;