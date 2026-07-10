/*
 * Socket.io event names + namespace for team chat.
 * Mirrored on the frontend in
 * frontend/src/modules/team-management/dashboard/chat/chatConfig.js
 * — keep the two in sync.
 *
 * Shares the SAME Socket.io server as flowboard collab (see backend/index.js);
 * this is just a separate namespace on it, not a second server.
 */

export const CHAT_NAMESPACE = "/team-chat";

export const CHAT_EVENTS = {
    // client -> server
    JOIN: "chat:join",
    LEAVE: "chat:leave",
    SEND: "chat:send",

    // server -> client
    MESSAGE: "chat:message",
    ERROR: "chat:error"
};

// Socket.io room name for a team's chat.
export const roomName = (teamId) => `chat:${teamId}`;
