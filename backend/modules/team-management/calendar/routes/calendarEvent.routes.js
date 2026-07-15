import { Router } from "express";
import { verifyJWT } from "../../../../middlewares/auth.middleware.js";
import {
    createEvent,
    getEvents,
    endMeeting,
    getCurrentMeeting,
    updateEvent,
    deleteEvent
} from "../controllers/calendarEvent.controllers.js";

const router = Router();

router.route("/").post(verifyJWT, createEvent);
router.route("/").get(verifyJWT, getEvents);

// The team's current/next meeting for the dashboard widget. Declared before
// "/:eventId" for clarity — it is a distinct two-segment path, so no clash.
router.route("/meetings/current").get(verifyJWT, getCurrentMeeting);

router.route("/:eventId").patch(verifyJWT, updateEvent);
router.route("/:eventId").delete(verifyJWT, deleteEvent);

// End a running meeting (creator only).
router.route("/:eventId/end").patch(verifyJWT, endMeeting);

export default router;
