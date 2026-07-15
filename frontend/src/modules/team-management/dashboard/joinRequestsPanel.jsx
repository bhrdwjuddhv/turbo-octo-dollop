import { Check, X, UserPlus } from 'lucide-react';

/**
 * Owner-only panel of pending join requests. Each shows the applicant and their
 * note with accept / reject actions (Part 4). Only rendered for the owner; the
 * backend also returns requests only to the owner.
 */
export default function JoinRequestsPanel({ requests = [], busyId, onRespond }) {
    return (
        <div className="glass-panel border border-white/10 p-6">
            <div className="mb-4 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                    Join requests · {requests.length}
                </label>
            </div>

            {requests.length === 0 ? (
                <p className="text-xs font-mono text-gray-600">No pending requests.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {requests.map((req) => {
                        const u = req.userId || {};
                        return (
                            <div
                                key={req._id}
                                className="flex items-start gap-3 border border-white/10 bg-white/5 p-3"
                            >
                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black">
                                    {u.avatar && (
                                        <img src={u.avatar} alt="" className="h-full w-full object-cover" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-bold">{u.fullName || u.username}</div>
                                    {req.note && (
                                        <p className="mt-0.5 break-words text-xs text-gray-400">
                                            “{req.note}”
                                        </p>
                                    )}
                                </div>

                                <div className="flex shrink-0 gap-1.5">
                                    <button
                                        onClick={() => onRespond(req._id, 'accept')}
                                        disabled={busyId === req._id}
                                        title="Accept"
                                        className="flex h-8 w-8 items-center justify-center border border-primary/40 text-primary transition-colors hover:bg-primary hover:text-background disabled:opacity-40"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onRespond(req._id, 'reject')}
                                        disabled={busyId === req._id}
                                        title="Reject"
                                        className="flex h-8 w-8 items-center justify-center border border-red-500/40 text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                                    >
                                        <X className="h-4 w-4" />
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
