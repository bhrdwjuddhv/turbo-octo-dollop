import mongoose from "mongoose";

/*
 * A persisted team chat message. Unlike the flow-canvas awareness/cursors
 * (ephemeral, never stored), chat history lives in MongoDB and survives reloads.
 */
const messageSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        }
    },
    { timestamps: true }
);

// Ordered-history queries: newest-first page + "older than <createdAt>" cursor.
messageSchema.index({ teamId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export { Message };
