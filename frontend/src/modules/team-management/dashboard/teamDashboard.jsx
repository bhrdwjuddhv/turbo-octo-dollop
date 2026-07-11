import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Pencil,
    Trash2,
    LogOut,
    Globe,
    Lock,
    LayoutDashboard,
    MessageSquare,
    Calendar,
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import TeamChatPanel from './chat/teamChatPanel.jsx';
import MeetingWidget from './meetingWidget.jsx';
import MembersPanel from './membersPanel.jsx';
import JoinRequestsPanel from './joinRequestsPanel.jsx';
import CandidatesPanel from './candidatesPanel.jsx';
import TeamEditModal from './teamEditModal.jsx';
import JoinRequestDialog from './joinRequestDialog.jsx';

/**
 * Team dashboard — the team page. Everyone sees the banner/logo/name, members,
 * and quick links (task board, calendar, + placeholders). The owner
 * additionally gets edit, member management, settings, and the join-requests
 * panel. Owner-only controls are gated by `isOwner` from the backend, which also
 * enforces every owner action server-side.
 */
export default function TeamDashboard() {
    const { teamId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [action, setAction] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/v1/teams/${teamId}/dashboard`);
            const json = await res.json();
            if (res.ok) setData(json.data);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="animate-pulse font-mono text-xs uppercase text-primary">
                    Loading team…
                </div>
            </div>
        );
    }

    if (!data?.team) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <div className="space-y-4 text-center">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-500">
                        Team not found.
                    </h2>
                    <Link to="/teams" className="font-mono text-xs text-primary hover:underline">
                        &larr; Back to teams
                    </Link>
                </div>
            </div>
        );
    }

    const { team, isOwner, isMember, pendingRequests } = data;
    const canRequest = !isOwner && !isMember;

    // --- owner + member actions --------------------------------------------
    const respondRequest = async (requestId, act) => {
        setBusyId(requestId);
        try {
            const res = await fetch(
                `/api/v1/teams/${teamId}/requests/${requestId}/respond`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: act }),
                },
            );
            const json = await res.json();
            if (res.ok) load();
            else alert(`Error: ${json.message || 'Could not respond'}`);
        } finally {
            setBusyId(null);
        }
    };

    const removeMember = async (userId) => {
        if (!window.confirm('Remove this member?')) return;
        setBusyId(userId);
        try {
            const res = await fetch(`/api/v1/teams/${teamId}/members/${userId}`, {
                method: 'DELETE',
            });
            const json = await res.json();
            if (res.ok) load();
            else alert(`Error: ${json.message || 'Could not remove member'}`);
        } finally {
            setBusyId(null);
        }
    };

    const saveEdit = async (formData) => {
        setAction('edit');
        try {
            const res = await fetch(`/api/v1/teams/${teamId}`, {
                method: 'PATCH',
                body: formData,
            });
            const json = await res.json();
            if (res.ok) {
                setEditOpen(false);
                load();
            } else alert(`Error: ${json.message || 'Could not save'}`);
        } finally {
            setAction(null);
        }
    };

    const setVisibility = async (visibility) => {
        setAction('visibility');
        try {
            const form = new FormData();
            form.append('visibility', visibility);
            const res = await fetch(`/api/v1/teams/${teamId}`, { method: 'PATCH', body: form });
            if (res.ok) load();
        } finally {
            setAction(null);
        }
    };

    const submitJoin = async (note) => {
        setAction('join');
        try {
            const res = await fetch(`/api/v1/teams/${teamId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note }),
            });
            const json = await res.json();
            if (res.ok) {
                setJoinOpen(false);
                alert('Request sent — the owner will review it.');
            } else alert(`Error: ${json.message || 'Could not send request'}`);
        } finally {
            setAction(null);
        }
    };

    const leaveTeam = async () => {
        setAction('leave');
        try {
            const res = await fetch(`/api/v1/teams/${teamId}/leave`, { method: 'POST' });
            if (res.ok) load();
        } finally {
            setAction(null);
        }
    };

    const deleteTeam = async () => {
        const password = window.prompt('Confirm deletion by entering your password:');
        if (!password) return;
        setAction('delete');
        try {
            const res = await fetch(`/api/v1/teams/${teamId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const json = await res.json();
            if (res.ok) navigate('/teams');
            else alert(`Error: ${json.message || 'Could not delete team'}`);
        } finally {
            setAction(null);
        }
    };

    const linkCard = (icon, label, to, disabled, onClick) => {
        const Icon = icon;
        const body = (
            <div
                className={[
                    'flex items-center gap-3 border p-4 transition-colors',
                    disabled
                        ? 'cursor-not-allowed border-white/5 text-gray-600'
                        : 'border-white/10 text-gray-300 hover:border-primary hover:text-primary',
                ].join(' ')}
            >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
                {disabled && (
                    <span className="ml-auto text-[9px] font-mono uppercase text-gray-600">
                        Soon
                    </span>
                )}
            </div>
        );
        if (disabled) return body;
        if (onClick) {
            return (
                <button type="button" onClick={onClick} className="w-full text-left">
                    {body}
                </button>
            );
        }
        return <Link to={to}>{body}</Link>;
    };

    return (
        <div className="relative min-h-screen bg-black text-white">
            <Navbar />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />

            <main className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden border border-white/10"
                >
                    <div className="relative h-40 bg-white/5">
                        {team.bannerImage && (
                            <img src={team.bannerImage} alt="banner" className="h-full w-full object-cover opacity-50" />
                        )}
                        <div className="absolute -bottom-8 left-8 h-16 w-16 overflow-hidden border-2 border-primary bg-black">
                            {team.teamAvatar ? (
                                <img src={team.teamAvatar} alt="logo" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xl font-bold uppercase text-primary">
                                    {team.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="absolute right-4 top-4 flex items-center gap-2">
                            <span className="flex items-center gap-1 border border-white/10 bg-black/60 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-gray-400">
                                {team.visibility === 'private' ? (
                                    <><Lock className="h-2.5 w-2.5" /> Private</>
                                ) : (
                                    <><Globe className="h-2.5 w-2.5" /> Public</>
                                )}
                            </span>
                            {isOwner && (
                                <button
                                    onClick={() => setEditOpen(true)}
                                    className="flex items-center gap-1 border border-primary/40 bg-black/60 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-primary hover:bg-primary hover:text-background"
                                >
                                    <Pencil className="h-2.5 w-2.5" /> Edit
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 p-8 pt-12">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter">{team.name}</h1>
                                {team.hackathonName && (
                                    <p className="mt-1 flex items-center gap-2 font-mono text-xs text-gray-500">
                                        <Calendar className="h-3 w-3" /> {team.hackathonName}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs">
                                <Users className="h-3 w-3 text-primary" /> {team.members?.length || 0}/{team.maxMembers}
                            </div>
                        </div>

                        {team.description && <p className="font-mono text-sm text-gray-400">{team.description}</p>}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
                            {canRequest && (
                                <button
                                    onClick={() => setJoinOpen(true)}
                                    className="border border-primary bg-primary/10 px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-background"
                                >
                                    Request to join
                                </button>
                            )}
                            {isMember && !isOwner && (
                                <button
                                    onClick={leaveTeam}
                                    disabled={action === 'leave'}
                                    className="flex items-center gap-2 border border-red-500/50 px-6 py-3 text-xs font-bold uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-50"
                                >
                                    <LogOut className="h-4 w-4" /> {action === 'leave' ? 'Leaving…' : 'Leave team'}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Next / current team meeting — driven by the team's calendar
                    team-meeting events. Hides itself when there is none. */}
                {isMember && <MeetingWidget teamId={teamId} />}

                {/* Quick links */}
                <div className="grid gap-3 sm:grid-cols-3">
                    {linkCard(LayoutDashboard, 'Task board', `/teams/${teamId}/task-board`, false)}
                    {linkCard(Calendar, 'Calendar', `/teams/${teamId}/calendar`, false)}
                    {isMember
                        ? linkCard(MessageSquare, 'Team chat', null, false, () => setChatOpen(true))
                        : linkCard(MessageSquare, 'Team chat', '#', true)}
                </div>

                {/* Members */}
                <MembersPanel
                    members={team.members}
                    leaderId={team.leader?._id}
                    isOwner={isOwner}
                    busyId={busyId}
                    onRemove={removeMember}
                />

                {/* Owner-only */}
                {isOwner && (
                    <>
                        <JoinRequestsPanel
                            requests={pendingRequests}
                            busyId={busyId}
                            onRespond={respondRequest}
                        />

                        <CandidatesPanel teamId={teamId} />

                        {/* Settings */}
                        <div className="glass-panel border border-white/10 p-6">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                                Settings
                            </label>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                                <div>
                                    <p className="text-sm font-bold">Visibility</p>
                                    <p className="text-xs font-mono text-gray-500">
                                        {team.visibility === 'private'
                                            ? 'Only invited people can find this team.'
                                            : 'Anyone can discover this team.'}
                                    </p>
                                </div>
                                <div className="flex border border-white/10">
                                    {['public', 'private'].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setVisibility(v)}
                                            disabled={action === 'visibility'}
                                            className={[
                                                'px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors',
                                                team.visibility === v
                                                    ? 'bg-primary text-background'
                                                    : 'text-gray-400 hover:text-white',
                                            ].join(' ')}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                                <div>
                                    <p className="text-sm font-bold text-red-400">Delete team</p>
                                    <p className="text-xs font-mono text-gray-500">
                                        Permanently remove this team. Cannot be undone.
                                    </p>
                                </div>
                                <button
                                    onClick={deleteTeam}
                                    disabled={action === 'delete'}
                                    className="flex items-center gap-2 border border-red-500/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" /> {action === 'delete' ? 'Deleting…' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {editOpen && (
                <TeamEditModal
                    team={team}
                    saving={action === 'edit'}
                    onSave={saveEdit}
                    onClose={() => setEditOpen(false)}
                />
            )}

            {joinOpen && (
                <JoinRequestDialog
                    teamName={team.name}
                    submitting={action === 'join'}
                    onSubmit={submitJoin}
                    onClose={() => setJoinOpen(false)}
                />
            )}

            <AnimatePresence>
                {chatOpen && isMember && (
                    <TeamChatPanel
                        teamId={teamId}
                        teamName={team.name}
                        onClose={() => setChatOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
