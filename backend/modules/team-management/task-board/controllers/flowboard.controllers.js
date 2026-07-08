import mongoose from "mongoose";
import { FlowBoard } from "../models/flowboard.models.js";
import { Team } from "../../../team/team.model.js";
import { asyncHandler } from "../../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../../utils/ApiResponse.js";
import { ApiError } from "../../../../utils/ApiError.js";

/*
 * Guardrails that mirror the frontend's client-side bounds
 * (CANVAS_EXTENT in config/canvasConfig.js). Enforced server-side too so a
 * hand-crafted payload can't grow a board past sane limits and blow past DB
 * size limits.
 */
const CANVAS_EXTENT = [
    [-10000, -10000],
    [10000, 10000]
];
const MAX_NODES = 2000;
const MAX_EDGES = 4000;

/*
 * TODO(premium): the Team model has no premium/plan flag yet. When it is added
 * (e.g. `team.plan === "premium"` or `team.isPremium === true`), premium teams
 * will automatically be allowed multiple boards. Until then every team is
 * treated as free, so the 1-board limit below applies to all teams.
 */
const isTeamPremium = (team) =>
    team?.plan === "premium" || team?.isPremium === true;

// The user must be the team leader or a member to touch its boards.
const assertTeamMembership = (team, userId) => {
    const uid = userId.toString();

    const isMember =
        team.leader.toString() === uid ||
        team.members.some((member) => member.toString() === uid);

    if (!isMember) {
        throw new ApiError(
            403,
            "You are not a member of this team"
        );
    }
};

// Reject payloads that break the shape or the canvas bounds.
const validateFlowPayload = ({ nodes, edges }) => {
    if (nodes !== undefined) {
        if (!Array.isArray(nodes)) {
            throw new ApiError(400, "`nodes` must be an array");
        }

        if (nodes.length > MAX_NODES) {
            throw new ApiError(
                400,
                `Too many nodes (max ${MAX_NODES})`
            );
        }

        const [[minX, minY], [maxX, maxY]] = CANVAS_EXTENT;

        for (const node of nodes) {
            const x = node?.position?.x;
            const y = node?.position?.y;

            if (typeof x !== "number" || typeof y !== "number") {
                throw new ApiError(
                    400,
                    "Every node needs a numeric position { x, y }"
                );
            }

            if (x < minX || x > maxX || y < minY || y > maxY) {
                throw new ApiError(
                    400,
                    "Node position is outside the allowed canvas bounds"
                );
            }
        }
    }

    if (edges !== undefined) {
        if (!Array.isArray(edges)) {
            throw new ApiError(400, "`edges` must be an array");
        }

        if (edges.length > MAX_EDGES) {
            throw new ApiError(
                400,
                `Too many edges (max ${MAX_EDGES})`
            );
        }
    }
};

// Loads a board's owning team and asserts the caller belongs to it.
// Returns { board, team }.
const loadBoardForUser = async (boardId, userId) => {
    if (!mongoose.isValidObjectId(boardId)) {
        throw new ApiError(400, "Invalid board id");
    }

    const board = await FlowBoard.findById(boardId);

    if (!board) {
        throw new ApiError(404, "Board not found");
    }

    const team = await Team.findById(board.teamId);

    if (!team) {
        throw new ApiError(404, "Owning team not found");
    }

    assertTeamMembership(team, userId);

    return { board, team };
};

// POST /api/v1/task-boards
const createFlowBoard = asyncHandler(async (req, res) => {

    const {
        teamId,
        title,
        nodes,
        edges,
        viewport
    } = req.body;

    if (!teamId || !mongoose.isValidObjectId(teamId)) {
        throw new ApiError(400, "A valid teamId is required");
    }

    const team = await Team.findById(teamId);

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    assertTeamMembership(team, req.user?._id);

    // Board-limit rule (application-level, NOT a DB unique index):
    // a free team may own at most one board; premium teams are unlimited.
    if (!isTeamPremium(team)) {

        const existingCount = await FlowBoard.countDocuments({ teamId });

        if (existingCount >= 1) {
            throw new ApiError(
                409,
                "Free teams are limited to one board. Upgrade to premium for more."
            );
        }
    }

    validateFlowPayload({ nodes, edges });

    const board = await FlowBoard.create({
        teamId,
        title: title?.trim() || undefined,
        createdBy: req.user?._id,
        viewport: viewport ?? null,
        nodes: nodes ?? [],
        edges: edges ?? []
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            board,
            "Board created successfully"
        )
    );
});

// GET /api/v1/task-boards?teamId=...  (metadata only, no nodes/edges)
const getFlowBoards = asyncHandler(async (req, res) => {

    const { teamId } = req.query;

    if (!teamId || !mongoose.isValidObjectId(teamId)) {
        throw new ApiError(400, "A valid teamId query param is required");
    }

    const team = await Team.findById(teamId);

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    assertTeamMembership(team, req.user?._id);

    const boards = await FlowBoard.find({ teamId })
        .select("-nodes -edges")
        .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            boards,
            "Boards fetched successfully"
        )
    );
});

// GET /api/v1/task-boards/:boardId  (full board with nodes + edges)
const getFlowBoardById = asyncHandler(async (req, res) => {

    const { board } = await loadBoardForUser(
        req.params.boardId,
        req.user?._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            board,
            "Board fetched successfully"
        )
    );
});

// PUT /api/v1/task-boards/:boardId  (full whole-flow replace)
const updateFlowBoard = asyncHandler(async (req, res) => {

    const { board } = await loadBoardForUser(
        req.params.boardId,
        req.user?._id
    );

    const {
        title,
        nodes,
        edges,
        viewport
    } = req.body;

    validateFlowPayload({ nodes, edges });

    // Whole-flow replace. teamId / createdBy are immutable and ignored here.
    if (title !== undefined) {
        board.title = title?.trim() || board.title;
    }
    board.nodes = nodes ?? [];
    board.edges = edges ?? [];
    board.viewport = viewport ?? null;

    await board.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            board,
            "Board saved successfully"
        )
    );
});

// PATCH /api/v1/task-boards/:boardId  (partial update, e.g. rename)
const patchFlowBoard = asyncHandler(async (req, res) => {

    const { board } = await loadBoardForUser(
        req.params.boardId,
        req.user?._id
    );

    const {
        title,
        nodes,
        edges,
        viewport
    } = req.body;

    validateFlowPayload({ nodes, edges });

    if (title !== undefined) {
        board.title = title?.trim() || board.title;
    }
    if (nodes !== undefined) {
        board.nodes = nodes;
    }
    if (edges !== undefined) {
        board.edges = edges;
    }
    if (viewport !== undefined) {
        board.viewport = viewport;
    }

    await board.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            board,
            "Board updated successfully"
        )
    );
});

// DELETE /api/v1/task-boards/:boardId  (embedded nodes/edges cascade with it)
const deleteFlowBoard = asyncHandler(async (req, res) => {

    const { board } = await loadBoardForUser(
        req.params.boardId,
        req.user?._id
    );

    await FlowBoard.findByIdAndDelete(board._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Board deleted successfully"
        )
    );
});

export {
    createFlowBoard,
    getFlowBoards,
    getFlowBoardById,
    updateFlowBoard,
    patchFlowBoard,
    deleteFlowBoard
};
