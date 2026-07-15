import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import SocketIOProvider from './socketIOProvider.js';
import {
    LOCAL_ORIGIN,
    CURSOR_THROTTLE_MS,
    DRAG_THROTTLE_MS,
    colorForKey,
} from './collabConfig.js';

/**
 * Two-way binding between a Yjs document and React Flow state.
 *
 * Shared types: `nodes` and `edges` are Y.Maps keyed by element id (never one
 * opaque array), so two users editing different nodes merge cleanly instead of
 * overwriting each other.
 *
 * Loop prevention: writes we make carry the LOCAL_ORIGIN transaction origin and
 * our observers ignore that origin; the provider tags anything from the wire
 * with REMOTE_ORIGIN and skips re-broadcasting it.
 *
 * Throttling: node drags fire dozens of position changes per second. While any
 * node is dragging we coalesce writes to DRAG_THROTTLE_MS, then flush once the
 * drag ends.
 *
 * Passing `boardId: null` disables collaboration entirely — the canvas then
 * behaves exactly as it did before (purely local state).
 */

const deepEqual = (a, b) => {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
        return false;
    }
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => deepEqual(a[k], b[k]));
};

// Only the persisted shape goes into Yjs — `selected`/`dragging`/`measured` are
// local UI state and must never be shared.
const stripNode = (node) => ({
    id: node.id,
    type: node.type,
    position: { x: node.position.x, y: node.position.y },
    width: node.width,
    height: node.height,
    data: node.data ?? {},
});

const stripEdge = (edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? null,
    targetHandle: edge.targetHandle ?? null,
    type: edge.type,
    markerEnd: edge.markerEnd ?? null,
});

export default function useCollaboration({
    boardId,
    user,
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedIds,
    screenToFlowPosition,
}) {
    const enabled = Boolean(boardId);

    const [synced, setSynced] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);
    const [peers, setPeers] = useState([]);

    // The provider is an external system, so it lives in a ref rather than
    // state — every React update below is driven by one of its callbacks.
    const providerRef = useRef(null);
    const docRef = useRef(null);
    const ynodesRef = useRef(null);
    const yedgesRef = useRef(null);

    const latestNodesRef = useRef(nodes);
    const dragTimerRef = useRef(null);
    const cursorSentAtRef = useRef(0);

    // --- provider + document lifecycle -------------------------------------
    useEffect(() => {
        if (!boardId) return undefined;

        const doc = new Y.Doc();
        const ynodes = doc.getMap('nodes');
        const yedges = doc.getMap('edges');

        docRef.current = doc;
        ynodesRef.current = ynodes;
        yedgesRef.current = yedges;

        // Remote -> React. Preserve local-only flags, and never stomp a node the
        // user is actively dragging.
        const rebuildNodes = () => {
            setNodes((prev) => {
                const prevById = new Map(prev.map((n) => [n.id, n]));
                return Array.from(ynodes.values()).map((n) => {
                    const local = prevById.get(n.id);
                    if (local?.dragging) return local;
                    return {
                        ...n,
                        selected: local?.selected ?? false,
                    };
                });
            });
        };

        const rebuildEdges = () => {
            setEdges((prev) => {
                const prevById = new Map(prev.map((e) => [e.id, e]));
                return Array.from(yedges.values()).map((e) => ({
                    ...e,
                    selected: prevById.get(e.id)?.selected ?? false,
                }));
            });
        };

        const onNodesEvent = (_event, txn) => {
            if (txn.origin === LOCAL_ORIGIN) return;
            rebuildNodes();
        };
        const onEdgesEvent = (_event, txn) => {
            if (txn.origin === LOCAL_ORIGIN) return;
            rebuildEdges();
        };

        // Observers must be attached before the provider connects, otherwise the
        // initial sync's applyUpdate would land before anyone is listening.
        ynodes.observe(onNodesEvent);
        yedges.observe(onEdgesEvent);

        const p = new SocketIOProvider(boardId, doc);
        providerRef.current = p;

        const offSynced = p.on('synced', () => setSynced(true));
        const offStatus = p.on('status', ({ connected: isUp }) => {
            setConnected(isUp);
            if (!isUp) setSynced(false);
        });
        const offError = p.on('error', (payload) =>
            setError(payload?.message || 'Collaboration error'),
        );

        // Presence. Awareness starts empty, so there's nothing to read until it
        // fires — no need for a synchronous priming call here.
        const onAwarenessChange = () => {
            const next = [];
            p.awareness.getStates().forEach((state, clientId) => {
                if (clientId === p.awareness.clientID) return;
                if (!state?.user) return;
                next.push({ clientId, ...state });
            });
            setPeers(next);
        };
        p.awareness.on('change', onAwarenessChange);

        return () => {
            offSynced();
            offStatus();
            offError();
            p.awareness.off('change', onAwarenessChange);
            clearTimeout(dragTimerRef.current);
            dragTimerRef.current = null;
            ynodes.unobserve(onNodesEvent);
            yedges.unobserve(onEdgesEvent);
            p.destroy();
            doc.destroy();
            providerRef.current = null;
            docRef.current = null;
            ynodesRef.current = null;
            yedgesRef.current = null;
        };
    }, [boardId, setNodes, setEdges]);

    // --- local -> Yjs -------------------------------------------------------
    const writeNodes = useCallback((list) => {
        const ynodes = ynodesRef.current;
        const doc = docRef.current;
        if (!ynodes || !doc) return;

        doc.transact(() => {
            const seen = new Set();
            list.forEach((node) => {
                seen.add(node.id);
                const next = stripNode(node);
                const current = ynodes.get(node.id);
                if (!current || !deepEqual(current, next)) {
                    ynodes.set(node.id, next);
                }
            });
            Array.from(ynodes.keys()).forEach((id) => {
                if (!seen.has(id)) ynodes.delete(id);
            });
        }, LOCAL_ORIGIN);
    }, []);

    const writeEdges = useCallback((list) => {
        const yedges = yedgesRef.current;
        const doc = docRef.current;
        if (!yedges || !doc) return;

        doc.transact(() => {
            const seen = new Set();
            list.forEach((edge) => {
                seen.add(edge.id);
                const next = stripEdge(edge);
                const current = yedges.get(edge.id);
                if (!current || !deepEqual(current, next)) {
                    yedges.set(edge.id, next);
                }
            });
            Array.from(yedges.keys()).forEach((id) => {
                if (!seen.has(id)) yedges.delete(id);
            });
        }, LOCAL_ORIGIN);
    }, []);

    // Gated on `synced` so we never push our empty starting state into Yjs and
    // wipe the board before the server's state has arrived.
    useEffect(() => {
        if (!enabled || !synced) return undefined;

        latestNodesRef.current = nodes;

        const isDragging = nodes.some((n) => n.dragging);

        if (!isDragging) {
            clearTimeout(dragTimerRef.current);
            dragTimerRef.current = null;
            writeNodes(nodes);
            return undefined;
        }

        // Coalesce the flood of position changes during a drag.
        if (dragTimerRef.current) return undefined;
        dragTimerRef.current = setTimeout(() => {
            dragTimerRef.current = null;
            writeNodes(latestNodesRef.current);
        }, DRAG_THROTTLE_MS);

        return undefined;
    }, [nodes, enabled, synced, writeNodes]);

    useEffect(() => {
        if (!enabled || !synced) return;
        writeEdges(edges);
    }, [edges, enabled, synced, writeEdges]);

    // --- awareness: identity, selection, cursor ------------------------------
    // These run after the lifecycle effect above, so providerRef is populated.
    useEffect(() => {
        if (!enabled) return;
        const key = String(user?._id ?? user?.username ?? 'anonymous');
        providerRef.current?.setLocalStateField('user', {
            id: user?._id ?? null,
            name: user?.username ?? 'Anonymous',
            color: colorForKey(key),
        });
    }, [enabled, boardId, user]);

    useEffect(() => {
        if (!enabled) return;
        providerRef.current?.setLocalStateField('selection', selectedIds ?? []);
    }, [enabled, boardId, selectedIds]);

    const onPointerMove = useCallback(
        (event) => {
            const p = providerRef.current;
            if (!p || !screenToFlowPosition) return;

            const now = Date.now();
            if (now - cursorSentAtRef.current < CURSOR_THROTTLE_MS) return;
            cursorSentAtRef.current = now;

            const point = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            p.setLocalStateField('cursor', { x: point.x, y: point.y });
        },
        [screenToFlowPosition],
    );

    const onPointerLeave = useCallback(() => {
        providerRef.current?.setLocalStateField('cursor', null);
    }, []);

    // nodeId -> colour of the first remote user selecting it.
    const remoteSelections = useMemo(() => {
        const map = {};
        peers.forEach((peer) => {
            (peer.selection ?? []).forEach((id) => {
                if (!map[id]) map[id] = peer.user?.color;
            });
        });
        return map;
    }, [peers]);

    return {
        enabled,
        synced,
        connected,
        error,
        peers,
        remoteSelections,
        onPointerMove,
        onPointerLeave,
    };
}
