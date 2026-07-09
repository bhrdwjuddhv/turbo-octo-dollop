import { Router } from "express";
import { verifyJWT } from "../../../../middlewares/auth.middleware.js";
import {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent
} from "../controllers/calendarEvent.controllers.js";

const router = Router();

router.route("/").post(verifyJWT, createEvent);
router.route("/").get(verifyJWT, getEvents);

router.route("/:eventId").patch(verifyJWT, updateEvent);
router.route("/:eventId").delete(verifyJWT, deleteEvent);

export default router;
