import mongoose from "mongoose";


const InviteSchema = new mongoose.Schema({

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
        index: true
    },

    status: {
        type: String,
        enum: [
            "pending",
            "accepted",
            "rejected"
        ],
        default: "pending",
        index: true
    }

}, {
    timestamps: true
});

const Invite =mongoose.model("Invite", InviteSchema);
export {Invite};