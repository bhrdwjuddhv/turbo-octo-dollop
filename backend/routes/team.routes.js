import { Router } from "express";
import { createTeam, joinTeam , leaveTeam, updateTeam , deleteTeam, discoverTeams, getTeamById} from "../controllers/team.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/:teamId/join").post(
    verifyJWT,
    joinTeam
);

router.route("/:teamId/leave").post(
    verifyJWT,
    leaveTeam
);