import * as Y from "yjs";
import { FlowBoard } from "../models/flowboard.models.js";

/*
 * One in-memory Y.Doc per active flowboard ("room").
 *
 * Persistence model (see backendSchema.md §Collaboration): the existing
 * FlowBoard document stays the single source of truth. On first join we seed the
 * Y.Doc from Mongo; clients then collaborate live in Yjs; a debounced writer
 * flushes the merged nodes/edges back into the same JSON shape, so the REST
 * round-trip keeps working and late joiners get current state. The Yjs binary is
 * NOT persisted.
 *
 * Shared types: `nodes` and `edges` are Y.Maps keyed by the client-generated id,
 * so concurrent edits to different nodes/edges merge instead of clobbering.
 */

const PERSIST_DEBOUNCE_MS = 1500;
const PERSIST_MAX_WAIT_MS = 10000;

// Mirrors CANVAS_EXTENT on the frontend and the REST controller's bounds check.
const CANVAS_EXTENT = [
    [-10000, -10000],
    [10000, 10000]
];
const MAX_NODES = 2000;
const MAX_EDGES = 4000;

// boardId -> { doc, sockets:Set<socketId>, clientIds:Map<socketId, awarenessClientId>,
//              persistTimer, firstDirtyAt }
const rooms = new Map();

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Keep only the persisted node shape and force positions inside the canvas
// bounds, so a crafted client can't grow the board past its limits.
const sanitizeNodes = (nodes) => {
    const [[minX, minY], [maxX, maxY]] = CANVAS_EXTENT;

    return nodes
        .filter(
            (node) =>
                node &&
                typeof node.id === "string" &&
                typeof node.type === "string" &&
                typeof node.position?.x === "number" &&
                typeof node.position?.y === "number"
        )
        .slice(0, MAX_NODES)
        .map((node) => ({
            id: node.id,
            type: node.type,
            position: {
                x: clamp(node.position.x, minX, maxX),
                y: clamp(node.position.y, minY, maxY)
            },
            width: node.width,
            height: node.height,
            data: node.data ?? {}
        }));
};

const sanitizeEdges = (edges) =>
    edges
        .filter(
            (edge) =>
                edge &&
                typeof edge.id === "string" &&
                typeof edge.source === "string" &&
                typeof edge.target === "string"
        )
        .slice(0, MAX_EDGES);

// Y.Doc -> the plain { nodes, edges } shape of backendSchema.md.
export const serializeRoom = (doc) => ({
    nodes: sanitizeNodes(Array.from(doc.getMap("nodes").values())),
    edges: sanitizeEdges(Array.from(doc.getMap("edges").values()))
});

const seedDoc = (doc, board) => {
    const plain = board.toObject();

    doc.transact(() => {
        const nodes = doc.getMap("nodes");
        const edges = doc.getMap("edges");

        for (const node of plain.nodes ?? []) {
            nodes.set(node.id, node);
        }

        for (const edge of plain.edges ?? []) {
            edges.set(edge.id, edge);
        }
    }, "seed");
};

const writeToDb = async (boardId) => {
    const room = rooms.get(boardId);

    if (!room) return;

    const { nodes, edges } = serializeRoom(room.doc);

    try {
        // Only nodes/edges — never clobber `viewport`, which the REST save owns.
        await FlowBoard.findByIdAndUpdate(
            boardId,
            { $set: { nodes, edges } },
            { runValidators: true }
        );
    } catch (error) {
        console.error(`Failed to persist flowboard ${boardId}:`, error.message);
    }
};

export const flushRoom = async (boardId) => {
    const room = rooms.get(boardId);

    if (!room) return;

    clearTimeout(room.persistTimer);
    room.persistTimer = null;
    room.firstDirtyAt = null;

    await writeToDb(boardId);
};

// Debounce, but never wait longer than PERSIST_MAX_WAIT_MS during a continuous
// stream of edits (e.g. a long drag) — otherwise a busy board would never save.
export const schedulePersist = (boardId) => {
    const room = rooms.get(boardId);

    if (!room) return;

    if (!room.firstDirtyAt) {
        room.firstDirtyAt = Date.now();
    }

    const elapsed = Date.now() - room.firstDirtyAt;
    const wait = Math.max(0, Math.min(PERSIST_DEBOUNCE_MS, PERSIST_MAX_WAIT_MS - elapsed));

    clearTimeout(room.persistTimer);
    room.persistTimer = setTimeout(() => {
        flushRoom(boardId);
    }, wait);
};

export const getRoom = (boardId) => rooms.get(boardId);

// Creates the room + seeds it from Mongo on first join.
export const joinRoom = async (boardId, board, socketId, clientId) => {
    let room = rooms.get(boardId);

    if (!room) {
        const doc = new Y.Doc();
        seedDoc(doc, board);

        room = {
            doc,
            sockets: new Set(),
            clientIds: new Map(),
            persistTimer: null,
            firstDirtyAt: null
        };

        rooms.set(boardId, room);
    }

    room.sockets.add(socketId);

    if (typeof clientId === "number") {
        room.clientIds.set(socketId, clientId);
    }

    return room;
};

// Returns the awareness clientId of the departing socket (if any) so the caller
// can tell peers to drop its presence. Tears the room down when it empties.
export const leaveRoom = async (boardId, socketId) => {
    const room = rooms.get(boardId);

    if (!room) return null;

    const clientId = room.clientIds.get(socketId) ?? null;

    room.sockets.delete(socketId);
    room.clientIds.delete(socketId);

    if (room.sockets.size === 0) {
        // Last one out: make sure the merged state reaches Mongo, then drop the doc.
        await flushRoom(boardId);
        room.doc.destroy();
        rooms.delete(boardId);
    }

    return clientId;
};
