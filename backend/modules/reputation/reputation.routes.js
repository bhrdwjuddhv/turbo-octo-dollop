import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { getReputation } from "./reputation.controller.js";

const router = Router();

router.route("/:userId").get(verifyJWT, getReputation);

export default router;