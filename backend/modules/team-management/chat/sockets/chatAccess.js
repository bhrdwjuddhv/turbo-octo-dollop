import mongoose from "mongoose";
import { Team } from "../../../team/team.model.js";

/*
 * Team-membership check for chat sockets. Same rule as the rest of
 * team-management (leader or member). Throws plain Errors because sockets
 * surface failures as `chat:error` payloads, not HTTP responses — mirrors
 * task-board/sockets/flowboardAccess.js.
 */
export const assertChatAccess = async (teamId, userId) => {
    if (!teamId || !mongoose.isValidObjectId(teamId)) {
        throw new Error("Invalid team id");
    }

    const team = await Team.findById(teamId).select("leader members");

    if (!team) {
        throw new Error("Team not found");
    }

    const uid = userId.toString();

    const isMember =
        team.leader.toString() === uid ||
        team.members.some((member) => member.toString() === uid);

    if (!isMember) {
        throw new Error("You are not a member of this team");
    }

    return team;
};
