import mongoose from "mongoose";
import { Message } from "../models/message.models.js";
import { Team } from "../../../team/team.model.js";
import { asyncHandler } from "../../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../../utils/ApiResponse.js";
import { ApiError } from "../../../../utils/ApiError.js";

const SENDER_FIELDS = "username fullName avatar";
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

// Same membership gate as the rest of team-management (leader or member).
const assertTeamMembership = async (teamId, userId) => {
    if (!teamId || !mongoose.isValidObjectId(teamId)) {
        throw new ApiError(400, "A valid teamId is required");
    }

    const team = await Team.findById(teamId).select("leader members");

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    const uid = userId.toString();
    const isMember =
        team.leader.toString() === uid ||
        team.members.some((m) => m.toString() === uid);

    if (!isMember) {
        throw new ApiError(403, "You are not a member of this team");
    }
};

// GET /api/v1/team-chat?teamId=...&limit=30&before=<ISO createdAt>
// Returns a page of messages oldest->newest (ready to render top-to-bottom).
// `before` is a cursor: pass the oldest loaded message's createdAt to page back
// through older history on scroll-up.
const getMessages = asyncHandler(async (req, res) => {

    const { teamId, before } = req.query;

    await assertTeamMembership(teamId, req.user?._id);

    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT)
    );

    const filter = { teamId };

    if (before) {
        const cursor = new Date(before);
        if (Number.isNaN(cursor.getTime())) {
            throw new ApiError(400, "`before` must be an ISO date");
        }
        filter.createdAt = { $lt: cursor };
    }

    // Grab the newest `limit` before the cursor, then reverse to ascending so
    // the frontend can append/prepend without re-sorting.
    const page = await Message.find(filter)
        .populate("senderId", SENDER_FIELDS)
        .sort({ createdAt: -1 })
        .limit(limit);

    const messages = page.reverse();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                messages,
                hasMore: page.length === limit,
                nextBefore: messages.length ? messages[0].createdAt : null
            },
            "Messages fetched successfully"
        )
    );
});

export { getMessages };
