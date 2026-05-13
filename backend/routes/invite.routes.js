import {Router} from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {
    sendInvite,acceptInvite,rejectInvite,getAllInvites
} from "../controllers/invite.controller.js";

const router = Router();

router.route("/send").post(
    verifyJWT,
    sendInvite
);

router.route("/accept/:inviteId").post(
    verifyJWT,
    acceptInvite
);

router.route("/reject/:inviteId").post(
    verifyJWT,
    rejectInvite
);

router.route("/all").get(
    verifyJWT,
    getAllInvites
);