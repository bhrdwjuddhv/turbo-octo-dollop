import { Crown, X } from 'lucide-react';

/** Members list. The owner gets a remove control on every non-owner member. */
export default function MembersPanel({ members = [], leaderId, isOwner, busyId, onRemove }) {
    return (
        <div className="glass-panel border border-white/10 p-6">
            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                Members · {members.length}
            </label>

            <div className="mt-4 flex flex-wrap gap-3">
                {members.map((m) => {
                    const owner = m._id === leaderId;
                    return (
                        <div
                            key={m._id}
                            className="flex items-center gap-2 border border-white/10 bg-white/5 py-1 pl-1 pr-2"
                        >
                            <div className="h-6 w-6 overflow-hidden rounded-full border border-white/10 bg-black">
                                {m.avatar && (
                                    <img src={m.avatar} alt="" className="h-full w-full object-cover" />
                                )}
                            </div>
                            <span className="text-xs font-mono">{m.fullName || m.username}</span>
                            {owner && <Crown className="h-3 w-3 text-primary" title="Owner" />}
                            {isOwner && !owner && (
                                <button
                                    onClick={() => onRemove(m._id)}
                                    disabled={busyId === m._id}
                                    title="Remove member"
                                    className="ml-1 text-gray-600 transition-colors hover:text-red-400 disabled:opacity-40"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
