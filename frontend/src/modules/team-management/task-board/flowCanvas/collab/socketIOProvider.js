import { io } from 'socket.io-client';
import * as Y from 'yjs';
import {
    Awareness,
    encodeAwarenessUpdate,
    applyAwarenessUpdate,
    removeAwarenessStates,
} from 'y-protocols/awareness';
import {
    SOCKET_URL,
    SOCKET_NAMESPACE,
    FLOWBOARD_EVENTS,
    REMOTE_ORIGIN,
} from './collabConfig.js';

/**
 * A minimal Yjs provider that uses Socket.io as its transport instead of
 * y-websocket, so collaboration rides the app's single Socket.io connection.
 *
 * Responsibilities:
 *  - join the board's room and complete an initial Yjs sync
 *  - ship local Y.Doc updates to the server, apply remote ones
 *  - relay Yjs awareness (presence) both ways — ephemeral, never persisted
 *
 * Echo prevention: everything applied from the wire uses the REMOTE_ORIGIN
 * transaction origin, and the outbound handlers skip that origin. Without it,
 * an inbound update would immediately be re-broadcast, looping forever.
 */

const toUint8 = (data) => {
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (ArrayBuffer.isView(data)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
    return new Uint8Array(data ?? []);
};

export default class SocketIOProvider {
    constructor(boardId, doc, { url = SOCKET_URL, namespace = SOCKET_NAMESPACE } = {}) {
        this.boardId = boardId;
        this.doc = doc;
        this.awareness = new Awareness(doc);
        this.synced = false;
        this.connected = false;

        this._subscribers = new Map(); // event -> Set<fn>

        this.socket = io(`${url}${namespace}`, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        // --- outbound ------------------------------------------------------

        this._onDocUpdate = (update, origin) => {
            if (origin === REMOTE_ORIGIN) return; // came off the wire
            if (!this.socket.connected) return;
            this.socket.emit(FLOWBOARD_EVENTS.UPDATE, {
                boardId: this.boardId,
                update,
            });
        };

        this._onAwarenessUpdate = ({ added, updated, removed }, origin) => {
            if (origin === REMOTE_ORIGIN) return;
            this._broadcastAwareness(added.concat(updated, removed));
        };

        this.doc.on('update', this._onDocUpdate);
        this.awareness.on('update', this._onAwarenessUpdate);

        // --- inbound -------------------------------------------------------

        this._onConnect = () => {
            this.connected = true;
            this.socket.emit(FLOWBOARD_EVENTS.JOIN, {
                boardId: this.boardId,
                clientId: this.awareness.clientID,
            });
            this._emit('status', { connected: true });
        };

        this._onDisconnect = () => {
            this.connected = false;
            this.synced = false;
            this._emit('status', { connected: false });
        };

        this._onSync = ({ update, stateVector }) => {
            const remote = toUint8(update);
            if (remote.length > 0) {
                Y.applyUpdate(this.doc, remote, REMOTE_ORIGIN);
            }

            // Hand the server anything it is missing from us (reconnects,
            // offline edits). Empty for a fresh client.
            const diff = Y.encodeStateAsUpdate(this.doc, toUint8(stateVector));
            if (diff.length > 0) {
                this.socket.emit(FLOWBOARD_EVENTS.UPDATE, {
                    boardId: this.boardId,
                    update: diff,
                });
            }

            this.synced = true;
            this._emit('synced', true);

            // Publish our presence now that we're actually in the room.
            this._broadcastAwareness([this.awareness.clientID]);
        };

        this._onRemoteUpdate = ({ update }) => {
            Y.applyUpdate(this.doc, toUint8(update), REMOTE_ORIGIN);
        };

        this._onRemoteAwareness = ({ update }) => {
            applyAwarenessUpdate(this.awareness, toUint8(update), REMOTE_ORIGIN);
        };

        this._onPeerLeft = ({ clientId }) => {
            removeAwarenessStates(this.awareness, [clientId], REMOTE_ORIGIN);
        };

        this._onError = (payload) => this._emit('error', payload);

        this.socket.on('connect', this._onConnect);
        this.socket.on('disconnect', this._onDisconnect);
        this.socket.on('connect_error', (err) =>
            this._emit('error', { message: err?.message || 'Connection failed' }),
        );
        this.socket.on(FLOWBOARD_EVENTS.SYNC, this._onSync);
        this.socket.on(FLOWBOARD_EVENTS.UPDATE, this._onRemoteUpdate);
        this.socket.on(FLOWBOARD_EVENTS.AWARENESS, this._onRemoteAwareness);
        this.socket.on(FLOWBOARD_EVENTS.PEER_LEFT, this._onPeerLeft);
        this.socket.on(FLOWBOARD_EVENTS.ERROR, this._onError);
    }

    _broadcastAwareness(clients) {
        if (!this.socket.connected || clients.length === 0) return;
        this.socket.emit(FLOWBOARD_EVENTS.AWARENESS, {
            boardId: this.boardId,
            update: encodeAwarenessUpdate(this.awareness, clients),
        });
    }

    // Tiny event emitter so hooks can observe status/sync/error.
    on(event, fn) {
        if (!this._subscribers.has(event)) this._subscribers.set(event, new Set());
        this._subscribers.get(event).add(fn);
        return () => this._subscribers.get(event)?.delete(fn);
    }

    _emit(event, payload) {
        this._subscribers.get(event)?.forEach((fn) => fn(payload));
    }

    /** Local presence (cursor, selection, user) — ephemeral. */
    setLocalStateField(field, value) {
        this.awareness.setLocalStateField(field, value);
    }

    destroy() {
        this.doc.off('update', this._onDocUpdate);
        this.awareness.off('update', this._onAwarenessUpdate);

        if (this.socket.connected) {
            this.socket.emit(FLOWBOARD_EVENTS.LEAVE, { boardId: this.boardId });
        }

        this.awareness.destroy();
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this._subscribers.clear();
    }
}
