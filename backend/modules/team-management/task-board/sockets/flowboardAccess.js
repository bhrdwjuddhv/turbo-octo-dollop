import mongoose from "mongoose";
import { FlowBoard } from "../models/flowboard.models.js";
import { Team } from "../../../team/team.model.js";

/*
 * Board access for socket connections. Applies the same rule as the REST
 * controller (caller must be the owning team's leader or a member), scoping
 * every collaboration room to the board's teamId.
 *
 * Kept separate from flowboard.controllers.js because sockets surface errors as
 * `flowboard:error` payloads rather than HTTP ApiError responses.
 */
export const assertBoardAccess = async (boardId, userId) => {
    if (!boardId || !mongoose.isValidObjectId(boardId)) {
        throw new Error("Invalid board id");
    }

    const board = await FlowBoard.findById(boardId);

    if (!board) {
        throw new Error("Board not found");
    }

    const team = await Team.findById(board.teamId);

    if (!team) {
        throw new Error("Owning team not found");
    }

    const uid = userId.toString();

    const isMember =
        team.leader.toString() === uid ||
        team.members.some((member) => member.toString() === uid);

    if (!isMember) {
        throw new Error("You are not a member of this team");
    }

    return board;
};
