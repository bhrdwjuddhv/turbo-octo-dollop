import { useEffect, useState } from 'react';
import { Zap, Send, MapPin } from 'lucide-react';

/**
 * Owner-only AI-recommended candidates + invite, carried over from the previous
 * team page so that feature isn't lost in the dashboard rebuild. Self-contained:
 * uses the existing /matching and /invites endpoints.
 */
export default function CandidatesPanel({ teamId }) {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invited, setInvited] = useState(new Set());
    const [busyId, setBusyId] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/v1/matching/teams/${teamId}/candidates?limit=12`);
                if (res.ok) {
                    const data = await res.json();
                    if (!cancelled) setCandidates(data.data?.matches || []);
                }
            } catch (err) {
                console.error('Failed to fetch candidates:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [teamId]);

    const invite = async (receiverId) => {
        setBusyId(receiverId);
        try {
            const res = await fetch('/api/v1/invites/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId, teamId }),
            });
            const data = await res.json();
            if (res.ok) setInvited((prev) => new Set(prev).add(receiverId));
            else alert(`Error: ${data.message || 'Could not send invite'}`);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="glass-panel border border-white/10 p-6">
            <div className="mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                    AI recommended candidates
                </label>
            </div>

            {loading ? (
                <p className="animate-pulse py-6 text-center text-xs font-mono text-primary">
                    Analyzing network…
                </p>
            ) : candidates.length === 0 ? (
                <p className="text-xs font-mono text-gray-600">No candidates found right now.</p>
            ) : (
                <div className="grid gap-3 md:grid-cols-2">
                    {candidates.map(({ user: c, matchScore }) => {
                        const done = invited.has(c._id);
                        return (
                            <div
                                key={c._id}
                                className="flex items-center justify-between gap-3 border border-white/10 bg-white/5 p-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black">
                                        {c.avatar && (
                                            <img src={c.avatar} alt="" className="h-full w-full object-cover" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-bold">{c.username}</div>
                                        <div className="truncate text-[10px] font-mono uppercase text-gray-500">
                                            {c.team_role || 'Developer'}
                                        </div>
                                        {c.location && (
                                            <div className="mt-0.5 flex items-center gap-1 text-[10px] font-mono text-gray-600">
                                                <MapPin className="h-2.5 w-2.5" /> {c.location}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-2">
                                    <span className="border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                                        {matchScore}%
                                    </span>
                                    <button
                                        onClick={() => invite(c._id)}
                                        disabled={done || busyId === c._id}
                                        className="flex items-center gap-1.5 border border-white/10 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
                                    >
                                        <Send className="h-3 w-3" />
                                        {done ? 'Invited' : busyId === c._id ? 'Sending…' : 'Invite'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
