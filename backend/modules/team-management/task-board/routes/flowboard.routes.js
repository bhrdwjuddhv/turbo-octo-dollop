import { Router } from "express";
import { verifyJWT } from "../../../../middlewares/auth.middleware.js";
import {
    createFlowBoard,
    getFlowBoards,
    resolveTeamBoard,
    getFlowBoardById,
    updateFlowBoard,
    patchFlowBoard,
    deleteFlowBoard
} from "../controllers/flowboard.controllers.js";

const router = Router();

// Collection: create a board / list a team's boards.
router.route("/").post(verifyJWT, createFlowBoard);
router.route("/").get(verifyJWT, getFlowBoards);

// Get-or-create this team's board (the "open the team's task board" entry point).
router.route("/team/:teamId").get(verifyJWT, resolveTeamBoard);

// Single board: read / whole-flow save / partial update / delete.
router.route("/:boardId").get(verifyJWT, getFlowBoardById);
router.route("/:boardId").put(verifyJWT, updateFlowBoard);
router.route("/:boardId").patch(verifyJWT, patchFlowBoard);
router.route("/:boardId").delete(verifyJWT, deleteFlowBoard);

export default router;
