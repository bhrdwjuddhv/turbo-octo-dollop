/**
 * "Who's online" pill, top-right of the canvas. Shows an initial-avatar per
 * remote collaborator plus a live connection indicator.
 *
 * Driven entirely by ephemeral Yjs awareness state.
 */
const initials = (name = '?') =>
    name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

export default function PresenceBar({ peers, connected, synced, error }) {
    const status = error
        ? { label: error, color: '#EF4444' }
        : !connected
          ? { label: 'Connecting…', color: '#F59E0B' }
          : !synced
            ? { label: 'Syncing…', color: '#F59E0B' }
            : { label: 'Live', color: '#10B981' };

    return (
        <div className="absolute right-4 top-4 z-10">
            <div className="rf-toolbar flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-2.5 py-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: status.color }}
                    title={status.label}
                />
                <span className="text-xs font-medium text-slate-500">
                    {status.label}
                </span>

                {peers.length > 0 && (
                    <>
                        <span className="mx-0.5 h-5 w-px bg-slate-200" />
                        <div className="flex -space-x-1.5">
                            {peers.slice(0, 5).map((peer) => (
                                <span
                                    key={peer.clientId}
                                    title={peer.user?.name}
                                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
                                    style={{ backgroundColor: peer.user?.color }}
                                >
                                    {initials(peer.user?.name)}
                                </span>
                            ))}
                        </div>
                        {peers.length > 5 && (
                            <span className="text-xs text-slate-500">
                                +{peers.length - 5}
                            </span>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
