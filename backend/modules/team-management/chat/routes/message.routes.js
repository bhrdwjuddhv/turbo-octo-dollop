import { Router } from "express";
import { verifyJWT } from "../../../../middlewares/auth.middleware.js";
import { getMessages } from "../controllers/message.controllers.js";

const router = Router();

// History (live messages come over the /team-chat socket namespace).
router.route("/").get(verifyJWT, getMessages);

export default router;
