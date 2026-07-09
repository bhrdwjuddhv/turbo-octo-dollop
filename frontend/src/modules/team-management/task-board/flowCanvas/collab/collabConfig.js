/**
 * Static configuration for real-time collaboration.
 *
 * Event names + namespace mirror
 * backend/modules/team-management/task-board/sockets/flowboard.events.js
 * — keep the two in sync.
 */

// The API runs on its own origin (vite proxies /api, but websockets need the
// real host). Cookies ignore port, so the httpOnly accessToken still rides along
// when we connect with `withCredentials: true`.
export const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

export const SOCKET_NAMESPACE = '/flowboard';

export const FLOWBOARD_EVENTS = {
    JOIN: 'flowboard:join',
    LEAVE: 'flowboard:leave',
    UPDATE: 'flowboard:update',
    AWARENESS: 'flowboard:awareness',
    SYNC: 'flowboard:sync',
    PEER_LEFT: 'flowboard:peer-left',
    ERROR: 'flowboard:error',
};

/** Yjs transaction origin marking "this change came off the wire" (echo guard). */
export const REMOTE_ORIGIN = 'remote';
/** Yjs transaction origin marking "this change came from our React state". */
export const LOCAL_ORIGIN = 'local';

/** Cursor moves are high-frequency; sample them rather than sending every event. */
export const CURSOR_THROTTLE_MS = 40;
/** While a node is being dragged, write positions into Yjs at most this often. */
export const DRAG_THROTTLE_MS = 60;

/** Presence colours, picked deterministically per user so they stay stable. */
export const PRESENCE_COLORS = [
    '#6366F1',
    '#EC4899',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#EF4444',
    '#14B8A6',
];

export const colorForKey = (key = '') => {
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
    }
    return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length];
};
