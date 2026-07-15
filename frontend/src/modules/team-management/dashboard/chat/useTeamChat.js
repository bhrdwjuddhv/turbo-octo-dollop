import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL, CHAT_NAMESPACE, CHAT_EVENTS, PAGE_SIZE } from './chatConfig.js';

/**
 * Team chat: REST for history (initial page + older on scroll-up), the shared
 * Socket.io server (/team-chat namespace) for live messages.
 *
 * Messages are kept oldest -> newest. Every insert path (history, older page,
 * live broadcast) dedupes by `_id` through `seenIds`, so the sender seeing its
 * own broadcast — or any double event — never doubles a message.
 *
 * `enabled: false` keeps the hook inert (no fetch, no socket), so it only runs
 * for members with the panel open.
 */
export default function useTeamChat({ teamId, enabled }) {
    const [messages, setMessages] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    const socketRef = useRef(null);
    const seenIds = useRef(new Set());
    const nextBeforeRef = useRef(null);

    // Insert a batch keeping order + dedupe. `where` = 'append' (newer) | 'prepend' (older).
    const insert = useCallback((incoming, where) => {
        const fresh = incoming.filter((m) => !seenIds.current.has(m._id));
        if (fresh.length === 0) return;
        fresh.forEach((m) => seenIds.current.add(m._id));
        setMessages((prev) =>
            where === 'prepend' ? [...fresh, ...prev] : [...prev, ...fresh],
        );
    }, []);

    // --- initial history + live socket --------------------------------------
    useEffect(() => {
        if (!enabled || !teamId) return undefined;

        // Fresh on each mount; teamId is stable for a panel's lifetime, so no
        // synchronous state reset is needed here.
        let cancelled = false;
        seenIds.current = new Set();

        (async () => {
            try {
                const res = await fetch(
                    `/api/v1/team-chat?teamId=${teamId}&limit=${PAGE_SIZE}`,
                );
                const data = await res.json();
                if (cancelled) return;
                if (res.ok) {
                    const list = data.data?.messages ?? [];
                    list.forEach((m) => seenIds.current.add(m._id));
                    setMessages(list);
                    setHasMore(Boolean(data.data?.hasMore));
                    nextBeforeRef.current = data.data?.nextBefore ?? null;
                } else {
                    setError(data.message || 'Could not load messages');
                }
            } catch (err) {
                console.error('Failed to load chat history:', err);
                if (!cancelled) setError('Could not load messages');
            }
        })();

        const socket = io(`${SOCKET_URL}${CHAT_NAMESPACE}`, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            socket.emit(CHAT_EVENTS.JOIN, { teamId });
        });
        socket.on('disconnect', () => setConnected(false));
        socket.on('connect_error', (e) =>
            setError(e?.message || 'Chat connection failed'),
        );
        socket.on(CHAT_EVENTS.MESSAGE, (message) => insert([message], 'append'));
        socket.on(CHAT_EVENTS.ERROR, (payload) =>
            setError(payload?.message || 'Chat error'),
        );

        return () => {
            cancelled = true;
            socket.emit(CHAT_EVENTS.LEAVE, { teamId });
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [teamId, enabled, insert]);

    const sendMessage = useCallback(
        (text) => {
            const body = text.trim();
            if (!body || !socketRef.current) return;
            // Render on broadcast (server echoes to the whole room, sender
            // included) — simplest path with no optimistic/temp-id reconciliation.
            socketRef.current.emit(CHAT_EVENTS.SEND, { teamId, text: body });
        },
        [teamId],
    );

    const loadOlder = useCallback(async () => {
        if (!hasMore || loadingOlder || !nextBeforeRef.current) return;
        setLoadingOlder(true);
        try {
            const res = await fetch(
                `/api/v1/team-chat?teamId=${teamId}&limit=${PAGE_SIZE}` +
                    `&before=${encodeURIComponent(nextBeforeRef.current)}`,
            );
            const data = await res.json();
            if (res.ok) {
                insert(data.data?.messages ?? [], 'prepend');
                setHasMore(Boolean(data.data?.hasMore));
                nextBeforeRef.current = data.data?.nextBefore ?? nextBeforeRef.current;
            }
        } catch (err) {
            console.error('Failed to load older messages:', err);
        } finally {
            setLoadingOlder(false);
        }
    }, [teamId, hasMore, loadingOlder, insert]);

    return { messages, sendMessage, loadOlder, hasMore, loadingOlder, connected, error };
}
