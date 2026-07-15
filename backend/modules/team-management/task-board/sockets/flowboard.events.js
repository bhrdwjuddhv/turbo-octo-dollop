/*
 * Socket.io event names + namespace for flowboard collaboration.
 * Mirrored on the frontend in
 * frontend/src/modules/team-management/task-board/flowCanvas/collab/collabConfig.js
 * — keep the two in sync.
 */

export const FLOWBOARD_NAMESPACE = "/flowboard";

export const FLOWBOARD_EVENTS = {
    // client -> server
    JOIN: "flowboard:join",
    LEAVE: "flowboard:leave",

    // bidirectional (Yjs document updates, binary)
    UPDATE: "flowboard:update",

    // bidirectional (Yjs awareness / presence, binary, never persisted)
    AWARENESS: "flowboard:awareness",

    // server -> client
    SYNC: "flowboard:sync",
    PEER_LEFT: "flowboard:peer-left",
    ERROR: "flowboard:error"
};

// Socket.io room name for a board.
export const roomName = (boardId) => `flowboard:${boardId}`;
