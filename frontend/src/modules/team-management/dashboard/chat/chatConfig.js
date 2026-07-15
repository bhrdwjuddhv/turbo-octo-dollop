/**
 * Team chat client config. Event names + namespace mirror
 * backend/modules/team-management/chat/sockets/chat.events.js — keep in sync.
 *
 * Uses the SAME Socket.io server as the flow-canvas collaboration, just a
 * different namespace (/team-chat). socket.io-client multiplexes namespaces on
 * one underlying manager per host, so this is not a second server connection.
 */

export const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

export const CHAT_NAMESPACE = '/team-chat';

export const CHAT_EVENTS = {
    JOIN: 'chat:join',
    LEAVE: 'chat:leave',
    SEND: 'chat:send',
    MESSAGE: 'chat:message',
    ERROR: 'chat:error',
};

export const PAGE_SIZE = 30;
