import * as Y from "yjs";
import { authenticateSocket } from "./socketAuth.js";
import { assertBoardAccess } from "./flowboardAccess.js";
import {
    joinRoom,
    leaveRoom,
    getRoom,
    schedulePersist
} from "./flowboardRoom.js";
import {
    FLOWBOARD_NAMESPACE,
    FLOWBOARD_EVENTS,
    roomName
} from "./flowboard.events.js";

/*
 * Real-time collaboration transport for flowboards.
 *
 * Yjs owns the shared state (CRDT); Socket.io is only the transport. We do NOT
 * use y-websocket — Yjs update/awareness binaries ride the app's single
 * Socket.io connection as raw Uint8Array payloads.
 *
 * Scoped to its own `/flowboard` namespace so the auth middleware here can't
 * affect any other socket usage added later.
 */

// Socket.io delivers binary as Buffer on Node; Y.applyUpdate wants a Uint8Array
// (Buffer is one, but normalise defensively for ArrayBuffer too).
const toUint8 = (data) => {
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    return new Uint8Array(data ?? []);
};

const emitError = (socket, message) => {
    socket.emit(FLOWBOARD_EVENTS.ERROR, { success: false, message });
};

export const registerFlowBoardSocket = (io) => {
    const namespace = io.of(FLOWBOARD_NAMESPACE);

    namespace.use(authenticateSocket);

    namespace.on("connection", (socket) => {
        // A socket collaborates on exactly one board at a time.
        socket.data.boardId = null;

        socket.on(FLOWBOARD_EVENTS.JOIN, async ({ boardId, clientId } = {}) => {
            try {
                const board = await assertBoardAccess(boardId, socket.user._id);

                const room = await joinRoom(
                    boardId,
                    board,
                    socket.id,
                    clientId
                );

                socket.join(roomName(boardId));
                socket.data.boardId = boardId;

                // Yjs sync: hand the joiner the full server state plus our state
                // vector, so it can reply with anything we're missing.
                socket.emit(FLOWBOARD_EVENTS.SYNC, {
                    boardId,
                    update: Y.encodeStateAsUpdate(room.doc),
                    stateVector: Y.encodeStateVector(room.doc)
                });
            } catch (error) {
                emitError(socket, error?.message || "Could not join board");
            }
        });

        socket.on(FLOWBOARD_EVENTS.UPDATE, ({ boardId, update } = {}) => {
            // Only relay for a board this socket actually joined.
            if (!boardId || socket.data.boardId !== boardId) return;

            const room = getRoom(boardId);
            if (!room) return;

            const payload = toUint8(update);
            if (payload.length === 0) return;

            // Keep the server doc authoritative (late joiners + persistence),
            // then relay the exact bytes to peers. Relaying the received update
            // rather than re-encoding avoids echoing back to the sender.
            Y.applyUpdate(room.doc, payload, socket.id);

            socket
                .to(roomName(boardId))
                .emit(FLOWBOARD_EVENTS.UPDATE, { boardId, update: payload });

            schedulePersist(boardId);
        });

        // Presence is ephemeral: relayed only, never applied to the server doc
        // and never persisted.
        socket.on(FLOWBOARD_EVENTS.AWARENESS, ({ boardId, update } = {}) => {
            if (!boardId || socket.data.boardId !== boardId) return;

            socket.to(roomName(boardId)).emit(FLOWBOARD_EVENTS.AWARENESS, {
                boardId,
                update: toUint8(update)
            });
        });

        const departBoard = async () => {
            const boardId = socket.data.boardId;

            if (!boardId) return;

            socket.data.boardId = null;
            socket.leave(roomName(boardId));

            const clientId = await leaveRoom(boardId, socket.id);

            if (clientId !== null) {
                // Let peers drop this user's cursor immediately rather than
                // waiting for the awareness timeout.
                socket
                    .to(roomName(boardId))
                    .emit(FLOWBOARD_EVENTS.PEER_LEFT, { boardId, clientId });
            }
        };

        socket.on(FLOWBOARD_EVENTS.LEAVE, departBoard);
        socket.on("disconnect", departBoard);
    });

    return namespace;
};
