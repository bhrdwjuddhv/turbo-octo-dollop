import { Router } from "express";
import { verifyJWT } from "../../../../middlewares/auth.middleware.js";
import {
    createFlowBoard,
    getFlowBoards,
    getFlowBoardById,
    updateFlowBoard,
    patchFlowBoard,
    deleteFlowBoard
} from "../controllers/flowboard.controllers.js";

const router = Router();

// Collection: create a board / list a team's boards.
router.route("/").post(verifyJWT, createFlowBoard);
router.route("/").get(verifyJWT, getFlowBoards);

// Single board: read / whole-flow save / partial update / delete.
router.route("/:boardId").get(verifyJWT, getFlowBoardById);
router.route("/:boardId").put(verifyJWT, updateFlowBoard);
router.route("/:boardId").patch(verifyJWT, patchFlowBoard);
router.route("/:boardId").delete(verifyJWT, deleteFlowBoard);

export default router;
