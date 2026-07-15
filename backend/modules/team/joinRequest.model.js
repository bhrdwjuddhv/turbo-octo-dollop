import mongoose from "mongoose";

/*
 * A pending/answered request from a user to join a team. Membership is granted
 * only when the owner accepts (see team.controller respondToJoinRequest).
 *
 * Duplicate prevention is application-level (controller checks for an existing
 * pending request + existing membership) rather than a unique index, because
 * uniqueness is conditional on status === "pending" — a user may re-request
 * after a rejection, so a plain unique {teamId,userId} would wrongly block that.
 */
const joinRequestSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
            index: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        note: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
            index: true
        }
    },
    { timestamps: true }
);

// Fast "pending requests for this team" lookup on the owner dashboard.
joinRequestSchema.index({ teamId: 1, status: 1 });

const JoinRequest = mongoose.model("JoinRequest", joinRequestSchema);

export { JoinRequest };
