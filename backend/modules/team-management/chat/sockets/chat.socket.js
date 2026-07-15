import { Message } from "../models/message.models.js";
import { assertChatAccess } from "./chatAccess.js";
import { CHAT_NAMESPACE, CHAT_EVENTS, roomName } from "./chat.events.js";
// Reuse the flowboard handshake auth — same cookie/JWT/User lookup, no new auth.
import { authenticateSocket } from "../../task-board/sockets/socketAuth.js";

/*
 * Team chat transport, on its OWN namespace (/team-chat) of the EXISTING
 * Socket.io server. One room per team (chat:<teamId>). Messages are persisted
 * (see message.models.js) — this handler validates membership, stores, then
 * broadcasts the saved message to the room.
 */

const SENDER_FIELDS = "username fullName avatar";

const emitError = (socket, message) =>
    socket.emit(CHAT_EVENTS.ERROR, { success: false, message });

export const registerTeamChatSocket = (io) => {
    const namespace = io.of(CHAT_NAMESPACE);

    namespace.use(authenticateSocket);

    namespace.on("connection", (socket) => {
        // A socket is in exactly one team's chat room at a time.
        socket.data.teamId = null;

        socket.on(CHAT_EVENTS.JOIN, async ({ teamId } = {}) => {
            try {
                await assertChatAccess(teamId, socket.user._id);

                socket.join(roomName(teamId));
                socket.data.teamId = teamId;
            } catch (error) {
                emitError(socket, error?.message || "Could not join chat");
            }
        });

        socket.on(CHAT_EVENTS.SEND, async ({ teamId, text } = {}) => {
            try {
                const body = typeof text === "string" ? text.trim() : "";
                if (!body) return;

                // Re-check membership on every send — never trust the client,
                // and membership can change mid-session.
                await assertChatAccess(teamId, socket.user._id);

                const created = await Message.create({
                    teamId,
                    senderId: socket.user._id,
                    text: body.slice(0, 2000)
                });

                const message = await created.populate("senderId", SENDER_FIELDS);

                // Broadcast to the whole room INCLUDING the sender (via the
                // namespace, not `socket.to`), so every client — sender included
                // — renders the same persisted message and dedupes by its _id.
                namespace.to(roomName(teamId)).emit(CHAT_EVENTS.MESSAGE, message);
            } catch (error) {
                emitError(socket, error?.message || "Could not send message");
            }
        });

        const leave = () => {
            if (socket.data.teamId) {
                socket.leave(roomName(socket.data.teamId));
                socket.data.teamId = null;
            }
        };

        socket.on(CHAT_EVENTS.LEAVE, leave);
        socket.on("disconnect", leave);
    });

    return namespace;
};
