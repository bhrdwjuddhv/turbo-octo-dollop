import { ViewportPortal } from '@xyflow/react';
import { MousePointer2 } from 'lucide-react';

/**
 * Live remote cursors. Rendered through <ViewportPortal> so they live in flow
 * coordinate space — they pan and zoom with the canvas without any manual
 * transform maths.
 *
 * Purely presentational: driven by ephemeral Yjs awareness state, never persisted.
 */
export default function CollabCursors({ peers }) {
    return (
        <ViewportPortal>
            {peers
                .filter((peer) => peer.cursor)
                .map((peer) => (
                    <div
                        key={peer.clientId}
                        className="pointer-events-none absolute z-50 select-none"
                        style={{
                            transform: `translate(${peer.cursor.x}px, ${peer.cursor.y}px)`,
                        }}
                    >
                        <MousePointer2
                            className="h-4 w-4 drop-shadow"
                            style={{
                                color: peer.user?.color,
                                fill: peer.user?.color,
                            }}
                        />
                        <span
                            className="ml-3 -mt-1 inline-block whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium text-white shadow-sm"
                            style={{ backgroundColor: peer.user?.color }}
                        >
                            {peer.user?.name}
                        </span>
                    </div>
                ))}
        </ViewportPortal>
    );
}
