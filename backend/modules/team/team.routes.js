import { Router } from "express";
import { createTeam, requestToJoin, leaveTeam, updateTeam, deleteTeam, discoverTeams, getTeamById, getTeamDashboard, respondToJoinRequest, removeMember } from "./team.controller.js";
import { upload } from "../../middlewares/multer.middleware.js"
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router()

router.route("/create").post(

    verifyJWT,

    upload.fields([
        {
            name: "teamAvatar",
            maxCount: 1
        },
        {
            name: "bannerImage",
            maxCount: 1
        }
    ]),

    createTeam
);

router.route("/discover").get(
    verifyJWT,
    discoverTeams
);

router.route("/:teamId").get(
    verifyJWT,
    getTeamById
);

router.route("/:teamId").patch(

    verifyJWT,

    upload.fields([
        {
            name: "teamAvatar",
            maxCount: 1
        },
        {
            name: "bannerImage",
            maxCount: 1
        }
    ]),

    updateTeam
);

router.route("/:teamId").delete(
    verifyJWT,
    deleteTeam
);

router.route("/:teamId/dashboard").get(
    verifyJWT,
    getTeamDashboard
);

router.route("/:teamId/join").post(
    verifyJWT,
    requestToJoin
);

router.route("/:teamId/requests/:requestId/respond").post(
    verifyJWT,
    respondToJoinRequest
);

router.route("/:teamId/members/:userId").delete(
    verifyJWT,
    removeMember
);

router.route("/:teamId/leave").post(
    verifyJWT,
    leaveTeam
);
export default router;